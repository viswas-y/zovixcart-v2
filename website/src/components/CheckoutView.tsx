'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { formatINR } from '@/components/ProductCard'
import { DELIVERY_FEE } from '@/lib/config'
import type { ValidationErrors } from '@/lib/validation'

export default function CheckoutView() {
    const router = useRouter()
    const { items, subtotal, isLoaded, clearCart } = useCart()

    const [form, setForm] = useState({
        customerName: '',
        phone: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        notes: '',
        honeypot: '', // anti-spam field
    })

    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    if (!isLoaded) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-12">
                <div className="h-8 w-48 rounded bg-neutral-200 animate-pulse mb-6" />
                <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-7 h-96 rounded-md bg-neutral-100 animate-pulse" />
                    <div className="lg:col-span-5 h-80 rounded-md bg-neutral-100 animate-pulse" />
                </div>
            </main>
        )
    }

    if (items.length === 0) {
        return (
            <main className="mx-auto max-w-xl px-4 py-16 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Your cart is empty</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Add products to your cart before proceeding to checkout.
                </p>
                <div className="mt-6">
                    <Link
                        href="/"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                        Browse Products
                    </Link>
                </div>
            </main>
        )
    }

    const total = subtotal + DELIVERY_FEE

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        // Clear specific field error as user types
        if (errors[name as keyof ValidationErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    function validateClientSide(): boolean {
        const errs: ValidationErrors = {}

        if (!form.customerName.trim() || form.customerName.trim().length < 2) {
            errs.customerName = 'Please enter your full name (at least 2 letters)'
        }

        const phoneClean = form.phone.trim().replace(/\D/g, '')
        if (!/^[6-9]\d{9}$/.test(phoneClean)) {
            errs.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
        }

        if (!form.address.trim() || form.address.trim().length < 6) {
            errs.address = 'Please enter your complete delivery address (house/flat, street, area)'
        }

        const pinClean = form.pincode.trim().replace(/\s/g, '')
        if (!/^\d{6}$/.test(pinClean)) {
            errs.pincode = 'Please enter a valid 6-digit postal pincode'
        }

        if (!form.city.trim() || form.city.trim().length < 2) {
            errs.city = 'Please enter your city/town'
        }

        if (!form.state.trim() || form.state.trim().length < 2) {
            errs.state = 'Please enter your state'
        }

        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSubmitError(null)

        if (!validateClientSide()) {
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: form.customerName,
                    phone: form.phone,
                    address: form.address,
                    pincode: form.pincode,
                    city: form.city,
                    state: form.state,
                    notes: form.notes,
                    honeypot: form.honeypot,
                    items: items.map((i) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                    })),
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                if (data.errors) {
                    setErrors(data.errors)
                }
                setSubmitError(data.message || 'Failed to place order. Please check your details.')
                setIsSubmitting(false)
                return
            }

            // Save order summary to sessionStorage for immediate WhatsApp prefill & confirmation rendering
            try {
                sessionStorage.setItem(
                    `order_${data.orderNumber}`,
                    JSON.stringify({
                        orderNumber: data.orderNumber,
                        customerName: data.customerName,
                        phone: data.phone,
                        address: data.address,
                        total: data.total,
                        items: data.items,
                        createdAt: new Date().toISOString(),
                    })
                )
            } catch {
                // Ignore session storage errors
            }

            // Clear the cart on successful order
            clearCart()

            // Navigate to order confirmation page
            router.push(`/order/${data.orderNumber}`)
        } catch {
            setSubmitError('Network error. Please check your internet connection and try again.')
            setIsSubmitting(false)
        }
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 text-neutral-800">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500">
                <ol className="flex items-center space-x-2">
                    <li>
                        <Link href="/cart" className="hover:text-neutral-900">
                            Cart
                        </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li className="font-medium text-neutral-900" aria-current="page">
                        Checkout
                    </li>
                </ol>
            </nav>

            <header className="mb-8 border-b border-neutral-200 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    Cash on Delivery Checkout
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                    No upfront payment needed. Pay in cash or UPI when your order is delivered to your door.
                </p>
            </header>

            {submitError ? (
                <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200" role="alert">
                    <p className="font-semibold">Unable to place order</p>
                    <p className="mt-1">{submitError}</p>
                </div>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Checkout Delivery Form */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        {/* Hidden Honeypot Anti-Spam Field */}
                        <div className="hidden" aria-hidden="true">
                            <label htmlFor="company-honeypot">Company</label>
                            <input
                                id="company-honeypot"
                                type="text"
                                name="honeypot"
                                tabIndex={-1}
                                autoComplete="off"
                                value={form.honeypot}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Full Name */}
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-neutral-900">
                                Full Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                id="customerName"
                                name="customerName"
                                type="text"
                                required
                                value={form.customerName}
                                onChange={handleChange}
                                placeholder="e.g. Rahul Sharma"
                                className={`mt-1 block min-h-[44px] w-full rounded-md border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                                    errors.customerName ? 'border-red-500 bg-red-50/50' : 'border-neutral-300 bg-white'
                                }`}
                            />
                            {errors.customerName ? (
                                <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>
                            ) : null}
                        </div>

                        {/* Mobile Phone Number */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-neutral-900">
                                Mobile Number (10 Digits) <span className="text-red-600">*</span>
                            </label>
                            <div className="relative mt-1 flex rounded-md">
                                <span className="inline-flex min-h-[44px] items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-100 px-3 text-sm text-neutral-600 select-none">
                                    +91
                                </span>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    required
                                    maxLength={10}
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    className={`block min-h-[44px] w-full rounded-r-md border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                                        errors.phone ? 'border-red-500 bg-red-50/50' : 'border-neutral-300 bg-white'
                                    }`}
                                />
                            </div>
                            {errors.phone ? (
                                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                            ) : (
                                <p className="mt-1 text-xs text-neutral-500">
                                    We will send order confirmation and dispatch updates via WhatsApp / SMS.
                                </p>
                            )}
                        </div>

                        {/* Delivery Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-neutral-900">
                                Delivery Address <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                rows={3}
                                required
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Flat / House No., Apartment, Street, Landmark"
                                className={`mt-1 block w-full rounded-md border p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                                    errors.address ? 'border-red-500 bg-red-50/50' : 'border-neutral-300 bg-white'
                                }`}
                            />
                            {errors.address ? (
                                <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                            ) : null}
                        </div>

                        {/* Pincode, City, State Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="pincode" className="block text-sm font-medium text-neutral-900">
                                    Pincode <span className="text-red-600">*</span>
                                </label>
                                <input
                                    id="pincode"
                                    name="pincode"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    required
                                    value={form.pincode}
                                    onChange={handleChange}
                                    placeholder="e.g. 682001"
                                    className={`mt-1 block min-h-[44px] w-full rounded-md border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                                        errors.pincode ? 'border-red-500 bg-red-50/50' : 'border-neutral-300 bg-white'
                                    }`}
                                />
                                {errors.pincode ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-neutral-900">
                                    City / Town <span className="text-red-600">*</span>
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    required
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="e.g. Kochi"
                                    className={`mt-1 block min-h-[44px] w-full rounded-md border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                                        errors.city ? 'border-red-500 bg-red-50/50' : 'border-neutral-300 bg-white'
                                    }`}
                                />
                                {errors.city ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-neutral-900">
                                    State <span className="text-red-600">*</span>
                                </label>
                                <input
                                    id="state"
                                    name="state"
                                    type="text"
                                    required
                                    value={form.state}
                                    onChange={handleChange}
                                    placeholder="e.g. Kerala"
                                    className={`mt-1 block min-h-[44px] w-full rounded-md border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                                        errors.state ? 'border-red-500 bg-red-50/50' : 'border-neutral-300 bg-white'
                                    }`}
                                />
                                {errors.state ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                                ) : null}
                            </div>
                        </div>

                        {/* Optional Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-neutral-900">
                                Delivery Notes <span className="text-xs text-neutral-500">(Optional)</span>
                            </label>
                            <input
                                id="notes"
                                name="notes"
                                type="text"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Near landmark, gate code, or preferred delivery timing"
                                className="mt-1 block min-h-[44px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-md bg-neutral-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg aria-hidden="true" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Placing your order...
                                    </span>
                                ) : (
                                    `Place Cash on Delivery Order • ${formatINR(total)}`
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary Beside/Below Form */}
                <div className="lg:col-span-5">
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                        <h2 className="text-base font-semibold text-neutral-900">Order Summary</h2>

                        {/* Items List */}
                        <ul className="mt-4 max-h-72 overflow-y-auto divide-y divide-neutral-200 border-b border-neutral-200 pr-1">
                            {items.map((item) => (
                                <li key={item.productId} className="flex items-center gap-3 py-3">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                                        {item.imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                                                No img
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-neutral-900 line-clamp-1">
                                            {item.title}
                                        </p>
                                        <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-xs font-semibold text-neutral-900 whitespace-nowrap">
                                        {formatINR(item.price * item.quantity)}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        {/* Charges breakdown */}
                        <div className="mt-4 space-y-2 text-sm border-b border-neutral-200 pb-4">
                            <div className="flex justify-between text-neutral-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-neutral-900">{formatINR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-600">
                                <span>Delivery Fee</span>
                                <span className="font-medium text-neutral-900">
                                    {DELIVERY_FEE === 0 ? (
                                        <span className="text-emerald-700">FREE</span>
                                    ) : (
                                        formatINR(DELIVERY_FEE)
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mt-4 flex justify-between text-base font-bold text-neutral-900">
                            <span>Amount to Pay</span>
                            <span>{formatINR(total)}</span>
                        </div>

                        {/* Payment Method Notice */}
                        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
                            <div className="flex items-center gap-2 font-semibold text-emerald-800">
                                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                Payment Method: Cash on Delivery
                            </div>
                            <p className="mt-1 text-emerald-800 leading-relaxed">
                                Pay ₹{total.toLocaleString('en-IN')} with cash or any UPI app when the courier delivers your package.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
