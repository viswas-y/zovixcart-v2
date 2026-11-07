'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { formatINR } from '@/components/ProductCard'
import { DELIVERY_FEE, WHATSAPP_NUMBER } from '@/lib/config'
import type { ValidationErrors } from '@/lib/validation'

export default function CheckoutView() {
  const router = useRouter()
  const { items, subtotal, isLoaded } = useCart()

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
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isServerError, setIsServerError] = useState(false)
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'success' | 'not_found'>('idle')
  const [lastLookedUpPin, setLastLookedUpPin] = useState('')

  const GENERIC_SERVER_ERROR =
    "We couldn't place your order right now. Please try again in a few minutes, or message us on WhatsApp and we will place it for you."

  function sanitizeErrorMessage(msg?: string): string {
    if (!msg) return GENERIC_SERVER_ERROR
    const lower = msg.toLowerCase()
    if (
      lower.includes('token') ||
      lower.includes('configured') ||
      lower.includes('sanity') ||
      lower.includes('environment') ||
      lower.includes('stack') ||
      lower.includes('error:') ||
      lower.includes('exception') ||
      lower.includes('internal')
    ) {
      return GENERIC_SERVER_ERROR
    }
    return msg
  }

  // Automatic Pincode Lookup (fetches on reaching 6 digits)
  useEffect(() => {
    const pin = form.pincode
    if (pin.length !== 6) {
      setPincodeStatus('idle')
      return
    }

    // Only lookup when the 6-digit pin changes
    if (pin === lastLookedUpPin) return

    let cancelled = false
    const controller = new AbortController()

    async function checkPincode() {
      setPincodeStatus('loading')
      try {
        const res = await fetch(`/api/pincode/${pin}`, {
          signal: controller.signal,
        })
        if (cancelled) return

        if (!res.ok) {
          setPincodeStatus('not_found')
          setLastLookedUpPin(pin)
          return
        }

        const data = await res.json()
        if (cancelled) return

        if (data && data.district && data.state) {
          // Fill City and State; both stay editable and won't be overwritten unless pincode changes
          setForm((prev) => ({
            ...prev,
            city: data.district,
            state: data.state,
          }))
          setErrors((prev) => ({
            ...prev,
            city: undefined,
            state: undefined,
          }))
          setPincodeStatus('success')
          setLastLookedUpPin(pin)
        } else {
          setPincodeStatus('not_found')
          setLastLookedUpPin(pin)
        }
      } catch {
        if (cancelled) return
        setPincodeStatus('not_found')
        setLastLookedUpPin(pin)
      }
    }

    checkPincode()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [form.pincode, lastLookedUpPin])

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

  if (isRedirecting) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center text-[#0A0A0A]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-[#0A0A0A]"
          role="status"
          aria-label="Loading"
        />
        <h1 className="mt-5 font-display text-xl font-bold tracking-tight text-[#0A0A0A] sm:text-2xl">
          Order placed. Taking you to your order summary...
        </h1>
        <p className="mt-2 text-xs text-neutral-600 sm:text-sm">
          Please wait while we prepare your confirmation.
        </p>
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

  function scrollToElement(id: string) {
    if (typeof window === 'undefined') return
    const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if ('focus' in el && typeof (el as HTMLElement).focus === 'function') {
        ;(el as HTMLElement).focus()
      }
    }
  }

  function cleanIndianPhone(val: string): string {
    let digits = val.replace(/\D/g, '')
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2)
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1)
    }
    return digits.slice(0, 10)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target

    if (name === 'phone') {
      const cleanPhone = cleanIndianPhone(value)
      setForm((prev) => ({ ...prev, phone: cleanPhone }))
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: undefined }))
      }
      if (submitError) setSubmitError(null)
      if (isServerError) setIsServerError(false)
      return
    }

    if (name === 'pincode') {
      const cleanPin = value.replace(/\D/g, '').slice(0, 6)
      setForm((prev) => ({ ...prev, pincode: cleanPin }))
      if (errors.pincode) {
        setErrors((prev) => ({ ...prev, pincode: undefined }))
      }
      if (submitError) setSubmitError(null)
      if (isServerError) setIsServerError(false)
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear specific field error as user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (submitError) setSubmitError(null)
    if (isServerError) setIsServerError(false)
  }

  function validateClientSide(): boolean {
    const errs: ValidationErrors = {}

    if (!form.customerName.trim() || form.customerName.trim().length < 2) {
      errs.customerName = 'Please enter your full name (at least 2 letters)'
    }

    const phoneClean = cleanIndianPhone(form.phone)
    if (!phoneClean) {
      errs.phone = 'Please enter your 10-digit mobile number'
    } else if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
    }

    if (!form.address.trim() || form.address.trim().length < 6) {
      errs.address = 'Please enter your complete delivery address (house/flat, street, area)'
    }

    const pinClean = form.pincode.trim().replace(/\D/g, '')
    if (!pinClean) {
      errs.pincode = 'Please enter your 6-digit postal pincode'
    } else if (!/^\d{6}$/.test(pinClean)) {
      errs.pincode = 'Pincode must be exactly 6 digits'
    }

    if (!form.city.trim() || form.city.trim().length < 2) {
      errs.city = 'Please enter your city/town'
    }

    if (!form.state.trim() || form.state.trim().length < 2) {
      errs.state = 'Please enter your state'
    }

    setErrors(errs)

    const firstErrorField = Object.keys(errs)[0]
    if (firstErrorField) {
      scrollToElement(firstErrorField)
      setSubmitError('Please complete the highlighted delivery details above.')
      return false
    }

    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    setIsServerError(false)

    if (!items || items.length === 0) {
      setSubmitError('Your cart is empty. Please add items to your cart before proceeding.')
      return
    }

    if (!validateClientSide()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setIsServerError(false)

    const phonePayload = cleanIndianPhone(form.phone)
    const pinPayload = form.pincode.trim().replace(/\D/g, '')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          phone: phonePayload,
          address: form.address.trim(),
          pincode: pinPayload,
          city: form.city.trim(),
          state: form.state.trim(),
          notes: form.notes?.trim() || undefined,
          honeypot: form.honeypot || '',
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null
      try {
        data = await res.json()
      } catch {
        // Non-JSON response
      }

      if (!res.ok || !data?.success) {
        if (res.status >= 500 || !res.ok) {
          setIsServerError(true)
          setSubmitError(
            sanitizeErrorMessage(data?.message) || GENERIC_SERVER_ERROR
          )
          scrollToElement('submit-banner')
        } else {
          setIsServerError(false)
          if (data?.errors) {
            setErrors(data.errors)
            const firstErr = Object.keys(data.errors)[0]
            if (firstErr) scrollToElement(firstErr)
          }
          setSubmitError(
            sanitizeErrorMessage(data?.message) ||
              'Failed to place order. Please check your details and try again.'
          )
        }
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
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: pinPayload,
            notes: form.notes?.trim() || undefined,
            total: data.total,
            items: data.items,
            createdAt: new Date().toISOString(),
          })
        )
        sessionStorage.setItem(`just_ordered_${data.orderNumber}`, 'true')
      } catch {
        // Ignore session storage errors
      }

      // Immediately show full-width neutral state and do NOT clear cart here
      setIsRedirecting(true)

      // Navigate with router.replace so Back does not return to checkout
      router.replace(`/order/${data.orderNumber}`)
    } catch {
      setIsServerError(true)
      setSubmitError(GENERIC_SERVER_ERROR)
      scrollToElement('submit-banner')
      setIsSubmitting(false)
    }
  }

  const itemsText = items.map((i) => `• ${i.title} (x${i.quantity})`).join('\n')
  const whatsappHelpMessage = [
    `Hi, I tried placing an order on ZovixCart but couldn't complete checkout:`,
    ...(form.customerName.trim() ? [`Name: ${form.customerName.trim()}`] : []),
    ...(form.phone.trim() ? [`Phone: ${form.phone.trim()}`] : []),
    ...(form.address.trim() ? [`Address: ${form.address.trim()}, ${form.city.trim()} ${form.pincode.trim()}`] : []),
    ``,
    `Items in my cart:`,
    itemsText || `My cart items`,
    ``,
    `Could you please help me place this order?`,
  ].join('\n')
  const whatsappHelpUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappHelpMessage)}`

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
        <div className="mb-6 rounded-[12px] bg-red-50 p-4 text-xs sm:text-sm text-red-950 border border-red-200" role="alert">
          <div className="flex items-center gap-2 font-bold text-red-900">
            <svg aria-hidden="true" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            Unable to place order
          </div>
          <p className="mt-1 leading-relaxed text-red-900">{submitError}</p>
          {isServerError && (
            <div className="mt-3.5 pt-3 border-t border-red-200/80">
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#25D366] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#1EBE5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
              >
                <svg aria-hidden="true" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.173.449.741.964 1.2.662.591 1.221.774 1.394.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.073.045.42-.099.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.987-1.396A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.603 0-3.095-.47-4.354-1.278l-.312-.198-2.946.824.84-2.868-.216-.328A8.026 8.026 0 0 1 3.938 12c0-4.445 3.617-8.062 8.062-8.062 4.446 0 8.063 3.617 8.063 8.062 0 4.446-3.617 8.062-8.063 8.062z" />
                </svg>
                Message us on WhatsApp to order
              </a>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Checkout Delivery Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Hidden Honeypot Anti-Spam Field (isolated from browser address autofill) */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                width: '1px',
                height: '1px',
                opacity: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <label htmlFor="zv_bot_check">Leave empty</label>
              <input
                id="zv_bot_check"
                type="text"
                name="honeypot"
                tabIndex={-1}
                autoComplete="off"
                data-lpignore="true"
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
                autoComplete="name"
                required
                value={form.customerName}
                onChange={handleChange}
                placeholder=""
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
                  autoComplete="tel-national"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder=""
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
                autoComplete="street-address"
                required
                value={form.address}
                onChange={handleChange}
                placeholder="House / Flat no., building, street, landmark"
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
                <div className="relative mt-1.5">
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    required
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder=""
                    className={`block min-h-[44px] w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm ${
                      errors.pincode ? 'border-red-500 bg-red-50/40' : 'border-neutral-300 bg-white'
                    }`}
                  />
                  {pincodeStatus === 'success' && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700" title="Pincode verified" aria-hidden="true">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                {errors.pincode ? (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.pincode}</p>
                ) : pincodeStatus === 'loading' ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-600">
                    <svg aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Checking pincode...
                  </p>
                ) : pincodeStatus === 'success' ? (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Pincode verified
                  </p>
                ) : pincodeStatus === 'not_found' ? (
                  <p className="mt-1.5 text-xs text-amber-800">
                    We could not find this pincode. Please enter your city and state yourself.
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  City / Town <span className="text-red-600">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder=""
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
                  autoComplete="address-level1"
                  required
                  value={form.state}
                  onChange={handleChange}
                  placeholder=""
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
                placeholder=""
                className="mt-1.5 block min-h-[44px] w-full rounded-[12px] border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm"
              />
            </div>

            {/* Inline Error Banner above submit button */}
            {submitError && (
              <div
                id="submit-banner"
                className="rounded-[12px] bg-red-50 p-4 text-xs sm:text-sm text-red-950 border border-red-200 shadow-sm"
                role="alert"
              >
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <svg aria-hidden="true" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  Unable to place order
                </div>
                <p className="mt-1.5 leading-relaxed text-red-900">{submitError}</p>
                {isServerError && (
                  <div className="mt-3.5 pt-3 border-t border-red-200/80">
                    <a
                      href={whatsappHelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#25D366] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#1EBE5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                    >
                      <svg aria-hidden="true" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.173.449.741.964 1.2.662.591 1.221.774 1.394.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.073.045.42-.099.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.987-1.396A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.603 0-3.095-.47-4.354-1.278l-.312-.198-2.946.824.84-2.868-.216-.328A8.026 8.026 0 0 1 3.938 12c0-4.445 3.617-8.062 8.062-8.062 4.446 0 8.063 3.617 8.063 8.062 0 4.446-3.617 8.062-8.063 8.062z" />
                        </svg>
                        Message us on WhatsApp to order
                      </a>
                    </div>
                  )}
                </div>
              )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isRedirecting}
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-[12px] bg-[#0A0A0A] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting || isRedirecting ? (
                  <span className="flex items-center gap-2">
                    <svg aria-hidden="true" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {isRedirecting ? 'Taking you to your order summary...' : 'Placing your order...'}
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
