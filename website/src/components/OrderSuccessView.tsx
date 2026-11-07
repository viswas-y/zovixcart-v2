'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatINR } from '@/components/ProductCard'
import { WHATSAPP_NUMBER, STORE_EMAIL, SUPPORT_HOURS, STORE_NAME } from '@/lib/config'

interface OrderData {
  orderNumber: string
  customerName: string
  phone: string
  address: string
  city?: string
  state?: string
  pincode?: string
  notes?: string
  total: number
  items?: Array<{
    productId?: string
    title: string
    price: number
    quantity: number
  }>
}

interface OrderSuccessViewProps {
  orderNumber: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialOrder?: any
  order?: OrderData | null
}

export default function OrderSuccessView({
  orderNumber,
  initialOrder,
  order: propOrder,
}: OrderSuccessViewProps) {
  const serverOrder = initialOrder || propOrder || null
  const [order, setOrder] = useState<OrderData | null>(serverOrder)

  // Try to load cached order details from sessionStorage if not fully passed from server
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`order_${orderNumber}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setOrder((prev) => (prev ? { ...parsed, ...prev, notes: prev.notes || parsed.notes } : parsed))
        }
      } catch {
        // Ignore session storage errors
      }
    }
  }, [orderNumber])

  const customerName = order?.customerName || 'Valued Customer'
  const total = order?.total || 0
  const items = order?.items || []

  // Ensure full address includes pincode
  const addressBase = order?.address || ''
  const hasPinInBase = order?.pincode && addressBase.includes(order.pincode)
  const fullAddress = hasPinInBase
    ? addressBase
    : [addressBase, order?.city, order?.state].filter(Boolean).join(', ') +
      (order?.pincode ? ` - ${order.pincode}` : '')

  const itemsSummary = items
    .map((item) => `• ${item.title} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`)
    .join('\n')

  const notesText = order?.notes?.trim() || ''

  const whatsappMessage = [
    `Hello ${STORE_NAME}! I just placed a Cash on Delivery order:`,
    ``,
    `Order Number: ${orderNumber}`,
    `Customer Name: ${customerName}`,
    `Phone: ${order?.phone ? `+91 ${order.phone}` : ''}`,
    `Delivery Address: ${fullAddress}`,
    ...(notesText ? [`Delivery notes: ${notesText}`] : []),
    ``,
    `Items Ordered:`,
    itemsSummary || `• Items in order ${orderNumber}`,
    ``,
    `Total Amount: ₹${total.toLocaleString('en-IN')} (Cash on Delivery)`,
    ``,
    `Please confirm my order and share dispatch details. Thank you!`,
  ].join('\n')

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-[#0A0A0A]">
      {/* Success Icon & Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
          <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-xs text-neutral-600 sm:text-sm max-w-md mx-auto">
          Your order has been recorded in our system. You only pay with cash or UPI when your parcel arrives.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="mt-8 rounded-[12px] border border-neutral-200 bg-neutral-50/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Order Number
            </span>
            <p className="font-mono text-lg font-extrabold text-[#0A0A0A]">{orderNumber}</p>
          </div>
          <span className="inline-flex items-center rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 self-start sm:self-center">
            COD Order Recorded
          </span>
        </div>

        {/* WhatsApp Action Button */}
        <div className="my-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-[12px] bg-[#25D366] px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition hover:bg-[#1EBE5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            {/* WhatsApp Icon */}
            <svg aria-hidden="true" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.173.449.741.964 1.2.662.591 1.221.774 1.394.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.073.045.42-.099.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.987-1.396A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.603 0-3.095-.47-4.354-1.278l-.312-.198-2.946.824.84-2.868-.216-.328A8.026 8.026 0 0 1 3.938 12c0-4.445 3.617-8.062 8.062-8.062 4.446 0 8.063 3.617 8.063 8.062 0 4.446-3.617 8.062-8.063 8.062z" />
            </svg>
            Send order details on WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-neutral-500">
            Tap above to open WhatsApp with your prefilled order details to speed up confirmation.
          </p>
          <p className="mt-2 text-center text-xs text-neutral-500">
            Need help? Email{' '}
            <a href={`mailto:${STORE_EMAIL}`} className="underline font-semibold text-[#0A0A0A] hover:text-neutral-600">
              {STORE_EMAIL}
            </a>{' '}
            ({SUPPORT_HOURS})
          </p>
        </div>

        {/* Items Summary */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Items Ordered
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {items.map((item, idx) => (
                <li key={idx} className="flex justify-between text-[#0A0A0A]">
                  <span>
                    {item.title} <strong className="text-neutral-500 font-normal">× {item.quantity}</strong>
                  </span>
                  <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delivery Address */}
        <div className="mt-4 border-t border-neutral-200 pt-4 text-xs sm:text-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
            Delivering To
          </h2>
          <p className="font-bold text-[#0A0A0A]">{customerName}</p>
          <p className="text-neutral-600 mt-0.5">{fullAddress}</p>
          {order?.phone ? <p className="text-neutral-600 mt-0.5">Phone: +91 {order.phone}</p> : null}
          {notesText ? (
            <div className="mt-2.5 rounded-[8px] border border-neutral-200 bg-neutral-100 p-2.5 text-xs text-neutral-800">
              <span className="font-semibold text-[#0A0A0A]">Delivery notes: </span>
              <span>{notesText}</span>
            </div>
          ) : null}
        </div>

        {/* Total and Payment Instructions */}
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <div className="flex justify-between text-base font-extrabold text-[#0A0A0A]">
            <span>Total Due on Delivery</span>
            <span>{formatINR(total)}</span>
          </div>
          <div className="mt-3 rounded-[12px] bg-neutral-100 p-3 text-xs text-neutral-800 border border-neutral-200">
            <strong>Payment Notice:</strong> Please keep <strong>{formatINR(total)}</strong> ready to pay via cash or UPI to the delivery courier when your parcel arrives.
          </div>
        </div>
      </div>

      {/* Back Home Link */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-neutral-300 bg-white px-7 py-2.5 text-xs font-bold text-[#0A0A0A] shadow-sm hover:bg-neutral-50"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}
