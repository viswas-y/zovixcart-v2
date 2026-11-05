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
        <div className="h-8 w-48 rounded-[12px] bg-neutral-200 animate-pulse mb-6" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 h-96 rounded-[12px] bg-neutral-100 animate-pulse" />
          <div className="lg:col-span-5 h-80 rounded-[12px] bg-neutral-100 animate-pulse" />
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center text-[#0A0A0A]">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A]">
          Your cart is empty
        </h1>
        <p className="mt-2 text-xs text-neutral-600 sm:text-sm">
          Add products to your cart before proceeding to checkout.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#0A0A0A] px-7 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
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
      errs.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6-9'
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
    <main className="mx-auto max-w-5xl px-4 py-8 text-[#0A0A0A]">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
          <li>
            <Link href="/cart" className="hover:text-[#0A0A0A] focus:outline-none focus-visible:underline">
              Cart
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li className="font-semibold text-[#0A0A0A]" aria-current="page">
            Checkout
          </li>
        </ol>
      </nav>

      <header className="mb-8 border-b border-neutral-200 pb-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
          Cash on Delivery Checkout
        </h1>
        <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
          No upfront payment required. Pay with cash or UPI when your order is delivered to your door.
        </p>
      </header>

      {submitError && (
        <div className="mb-6 rounded-[12px] bg-red-50 p-4 text-xs sm:text-sm text-red-800 border border-red-200" role="alert">
          <p className="font-bold">Unable to place order</p>
          <p className="mt-1">{submitError}</p>
        </div>
      )}

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
              <label htmlFor="customerName" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
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
                className={`mt-1.5 block min-h-[44px] w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm ${
                  errors.customerName ? 'border-red-500 bg-red-50/40' : 'border-neutral-300 bg-white'
                }`}
              />
              {errors.customerName && (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.customerName}</p>
              )}
            </div>

            {/* Mobile Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Mobile Number (10 Digits) <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1.5 flex rounded-[12px] shadow-sm">
                <span className="inline-flex min-h-[44px] items-center rounded-l-[12px] border border-r-0 border-neutral-300 bg-neutral-100 px-3.5 text-sm font-semibold text-neutral-600 select-none">
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
                  className={`block min-h-[44px] w-full rounded-r-[12px] border px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] ${
                    errors.phone ? 'border-red-500 bg-red-50/40' : 'border-neutral-300 bg-white'
                  }`}
                />
              </div>
              {errors.phone ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.phone}</p>
              ) : (
                <p className="mt-1 text-[11px] text-neutral-500">
                  Order confirmation and delivery tracking will be sent to this number via WhatsApp / SMS.
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div>
              <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Delivery Address <span className="text-red-600">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                required
                value={form.address}
                onChange={handleChange}
                placeholder="House / Flat No., Building name, Street, Landmark"
                className={`mt-1.5 block w-full rounded-[12px] border p-3.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm ${
                  errors.address ? 'border-red-500 bg-red-50/40' : 'border-neutral-300 bg-white'
                }`}
              />
              {errors.address && (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Pincode, City, State Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="pincode" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
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
                  className={`mt-1.5 block min-h-[44px] w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm ${
                    errors.pincode ? 'border-red-500 bg-red-50/40' : 'border-neutral-300 bg-white'
                  }`}
                />
                {errors.pincode && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.pincode}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
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
                  className={`mt-1.5 block min-h-[44px] w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm ${
                    errors.city ? 'border-red-500 bg-red-50/40' : 'border-neutral-300 bg-white'
                  }`}
                />
                {errors.city && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
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
                  className={`mt-1.5 block min-h-[44px] w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm ${
                    errors.state ? 'border-red-500 bg-red-50/40' : 'border-neutral-300 bg-white'
                  }`}
                />
                {errors.state && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.state}</p>
                )}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Delivery Notes <span className="text-[11px] font-normal text-neutral-500">(Optional)</span>
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                value={form.notes}
                onChange={handleChange}
                placeholder="Gate code, landmark, or delivery time preference"
                className="mt-1.5 block min-h-[44px] w-full rounded-[12px] border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-[12px] bg-[#0A0A0A] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="rounded-[12px] border border-neutral-200 bg-neutral-50/70 p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-[#0A0A0A]">Order Summary</h2>

            {/* Items List */}
            <ul className="mt-4 max-h-72 overflow-y-auto divide-y divide-neutral-200 border-b border-neutral-200 pr-1">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-[8px] border border-neutral-200 bg-neutral-100">
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
                    <p className="text-xs font-semibold text-[#0A0A0A] line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-[#0A0A0A] whitespace-nowrap">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Charges breakdown */}
            <div className="mt-4 space-y-2 text-sm border-b border-neutral-200 pb-4">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0A0A0A]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-[#0A0A0A]">
                  {DELIVERY_FEE === 0 ? (
                    <span className="font-bold text-emerald-700">FREE</span>
                  ) : (
                    formatINR(DELIVERY_FEE)
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 flex justify-between text-base font-extrabold text-[#0A0A0A]">
              <span>Amount to Pay</span>
              <span>{formatINR(total)}</span>
            </div>

            {/* Payment Method Notice */}
            <div className="mt-6 rounded-[12px] border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Payment: Cash on Delivery
              </div>
              <p className="mt-1 text-emerald-800 leading-relaxed">
                Pay ₹{total.toLocaleString('en-IN')} with cash or any UPI app upon doorstep delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
