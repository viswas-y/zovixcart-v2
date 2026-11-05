import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion, client } from '@/lib/sanity/client'
import { validateOrderInput } from '@/lib/validation'
import { DELIVERY_FEE } from '@/lib/config'

// Basic in-memory rate limiter per IP: max 5 order submissions per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const MAX_ORDERS_PER_WINDOW = 5
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>()

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record || record.expiresAt < now) {
        rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS })
        return false
    }

    if (record.count >= MAX_ORDERS_PER_WINDOW) {
        return true
    }

    record.count += 1
    return false
}

function generateOrderNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    // 4 random uppercase alphanumeric characters
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    let rand = ''
    for (let i = 0; i < 4; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `ZVX-${year}${month}${day}-${rand}`
}

export async function POST(request: NextRequest) {
    try {
        // 1. Rate Limiting Check
        const clientIp =
            request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1'

        if (isRateLimited(clientIp)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Too many order attempts. Please wait a few minutes before trying again.',
                },
                { status: 429 }
            )
        }

        // 2. Parse & Validate Input Payload
        const body = await request.json().catch(() => null)
        const validation = validateOrderInput(body)

        if (!validation.isValid || !validation.sanitized) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Please check your form for errors.',
                    errors: validation.errors,
                },
                { status: 400 }
            )
        }

        const data = validation.sanitized

        // 3. Re-fetch current product details from Sanity (NEVER trust client-provided prices or stock status)
        const productIds = data.items.map((i) => i.productId)
        interface ProductDbRecord {
            _id: string
            title: string
            price: number
            is_active?: boolean
            inStock?: boolean
        }

        const dbProducts = await client.fetch<ProductDbRecord[]>(
            `*[_type == "product" && _id in $productIds] {
                _id,
                title,
                price,
                is_active,
                inStock
            }`,
            { productIds }
        )

        const productMap = new Map(dbProducts.map((p) => [p._id, p]))

        let subtotal = 0
        const orderItems = []

        for (const item of data.items) {
            const product = productMap.get(item.productId)

            if (!product) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'One or more items in your cart are no longer available. Please review your cart.',
                    },
                    { status: 400 }
                )
            }

            if (product.is_active === false) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `"${product.title}" is currently unavailable. Please remove it from your cart.`,
                    },
                    { status: 400 }
                )
            }

            if (product.inStock === false) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `"${product.title}" is currently out of stock. Please remove it from your cart.`,
                    },
                    { status: 400 }
                )
            }

            const itemTotal = product.price * item.quantity
            subtotal += itemTotal

            orderItems.push({
                _key: `item-${item.productId}-${Math.random().toString(36).slice(2, 7)}`,
                productRef: {
                    _type: 'reference',
                    _ref: product._id,
                },
                title: product.title,
                price: product.price,
                quantity: item.quantity,
            })
        }

        const total = subtotal + DELIVERY_FEE
        const orderNumber = generateOrderNumber()

        // 4. Check for Sanity Write Token
        const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim()
        if (!writeToken) {
            console.error('SANITY_API_WRITE_TOKEN is missing in server environment variables.')
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'The store is currently updating its payment & order processor (API token not configured). Please try again shortly.',
                },
                { status: 500 }
            )
        }

        // 5. Create Order Document in Sanity using Write Client
        const writeClient = createClient({
            projectId,
            dataset,
            apiVersion,
            token: writeToken,
            useCdn: false,
        })

        const orderDoc = {
            _type: 'order',
            orderNumber,
            status: 'new',
            customerName: data.customerName,
            phone: data.phone,
            address: data.address,
            pincode: data.pincode,
            city: data.city,
            state: data.state,
            notes: data.notes || '',
            items: orderItems,
            subtotal,
            deliveryFee: DELIVERY_FEE,
            total,
            createdAt: new Date().toISOString(),
        }

        await writeClient.create(orderDoc)

        // 6. Return Success Response with Order Summary
        return NextResponse.json({
            success: true,
            orderNumber,
            customerName: data.customerName,
            phone: data.phone,
            address: `${data.address}, ${data.city}, ${data.state} - ${data.pincode}`,
            total,
            items: orderItems.map((i) => ({
                title: i.title,
                price: i.price,
                quantity: i.quantity,
            })),
        })
    } catch (err: unknown) {
        console.error('Failed to create order in Sanity:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown server error'
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to place order. Please try again.',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
            },
            { status: 500 }
        )
    }
}
