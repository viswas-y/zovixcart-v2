import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiter per IP: max 20 pincode lookups per 60 seconds
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const MAX_LOOKUPS_PER_MINUTE = 20
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || record.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (record.count >= MAX_LOOKUPS_PER_MINUTE) {
    return true
  }

  record.count += 1
  return false
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pin: string }> }
) {
  const { pin } = await context.params

  // 1. Validate that pin is exactly 6 digits
  if (!pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json(
      { error: 'Pincode must be exactly 6 digits' },
      { status: 400 }
    )
  }

  // 2. Simple in-memory rate limit per IP (~20 requests per minute)
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  if (isRateLimited(clientIp)) {
    return NextResponse.json({ found: false }, { status: 200 })
  }

  // 3. Fetch from api.postalpincode.in with 4-second timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache successful result for 24h
      headers: {
        'User-Agent': 'ZovixCart/1.0',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0 || data[0]?.Status !== 'Success') {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    const postOffices = data[0]?.PostOffice
    if (!Array.isArray(postOffices) || postOffices.length === 0) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    const first = postOffices[0]
    const district = first?.District?.trim()
    const state = first?.State?.trim()

    if (!district || !state) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    // Return only { district, state } from the first PostOffice entry
    return NextResponse.json(
      { district, state },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      }
    )
  } catch {
    // If the lookup fails, times out or finds nothing, return { found: false } with status 200
    return NextResponse.json({ found: false }, { status: 200 })
  } finally {
    clearTimeout(timeoutId)
  }
}

