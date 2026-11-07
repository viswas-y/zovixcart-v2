'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatINR } from '@/lib/pricing'
import { WHATSAPP_NUMBER, STORE_EMAIL, SUPPORT_HOURS, STORE_NAME } from '@/lib/config'

interface OrderData {
  _id?: string
  orderNumber: string
  customerName: string
  phone: string
  address: string
  city?: string
  state?: string
  pincode?: string
  notes?: string
  total: number
  status?: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | string
  createdAt?: string
  _createdAt?: string
  _updatedAt?: string
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

function formatOrderDate(isoString?: string): string {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function getStatusBadge(status?: string) {
  const s = (status || 'new').toLowerCase()
  switch (s) {
    case 'confirmed':
      return {
        label: 'Order Confirmed',
        classes: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        dot: 'bg-emerald-600',
      }
    case 'shipped':
      return {
        label: 'Shipped · In Transit',
        classes: 'border-[#0A0A0A] bg-[#0A0A0A] text-white',
        dot: 'bg-white',
      }
    case 'delivered':
      return {
        label: 'Delivered',
        classes: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        dot: 'bg-emerald-600',
      }
    case 'cancelled':
      return {
        label: 'Order Cancelled',
        classes: 'border-neutral-300 bg-neutral-100 text-neutral-700',
        dot: 'bg-neutral-500',
      }
    case 'new':
    default:
      return {
        label: 'Order Placed (Pending Confirmation)',
        classes: 'border-neutral-300 bg-neutral-100 text-[#0A0A0A]',
        dot: 'bg-[#0A0A0A]',
      }
  }
}

export default function OrderSuccessView({
  orderNumber,
  initialOrder,
  order: propOrder,
}: OrderSuccessViewProps) {
  const serverOrder = initialOrder || propOrder || null
  const [order, setOrder] = useState<OrderData | null>(serverOrder)

  // Load cached order details from sessionStorage if not fully passed from server
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`order_${orderNumber}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setOrder((current) => {
            if (!current) return parsed
            // Server data is always authoritative for status, timestamps, and orderNumber
            return {
              ...parsed,
              ...current,
              status: current.status || parsed.status || 'new',
              notes: current.notes || parsed.notes,
              items: current.items && current.items.length > 0 ? current.items : parsed.items,
            }
          })
        }
      } catch {
        // Ignore session storage errors
      }
    }
  }, [orderNumber])

  const customerName = order?.customerName || 'Valued Customer'
  const total = order?.total || 0
  const items = order?.items || []
  const status = (order?.status || 'new').toLowerCase()

  const isCancelled = status === 'cancelled'
  const isConfirmed = status === 'confirmed' || status === 'shipped' || status === 'delivered'
  const isShipped = status === 'shipped' || status === 'delivered'
  const isDelivered = status === 'delivered'

  // Format relevant dates
  const orderedDateStr = formatOrderDate(order?.createdAt || order?._createdAt)
  const updatedDateStr = formatOrderDate(order?._updatedAt)

  const confirmedDateStr = isConfirmed ? (updatedDateStr || orderedDateStr) : ''
  const shippedDateStr = isShipped ? (updatedDateStr || orderedDateStr) : ''
  const deliveredDateStr = isDelivered ? updatedDateStr : ''
  const cancelledDateStr = isCancelled ? (updatedDateStr || orderedDateStr) : ''

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
    `Hello ${STORE_NAME}! I would like an update regarding my Cash on Delivery order:`,
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
    `Current Status: ${status.toUpperCase()}`,
    ``,
    `Thank you!`,
  ].join('\n')

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`
  const statusBadge = getStatusBadge(status)

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-[#0A0A0A]">
      {/* Success Icon & Header */}
      <div className="text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isCancelled ? 'bg-neutral-200 text-neutral-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {isCancelled ? (
            <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
          {isCancelled
            ? 'Order Cancelled'
            : isDelivered
            ? 'Order Delivered!'
            : isShipped
            ? 'Your Order is on the Way!'
            : 'Thank you for your order!'}
        </h1>
        <p className="mt-2 text-xs text-neutral-600 sm:text-sm max-w-md mx-auto">
          {isCancelled
            ? 'This order has been cancelled. Contact support below if you need assistance.'
            : isDelivered
            ? 'Your parcel has been delivered. Thank you for shopping with us!'
            : isShipped
            ? 'Your package has been dispatched and is currently in transit.'
            : 'Your order has been recorded in our system. You only pay with cash or UPI when your parcel arrives.'}
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
          <span className={`inline-flex items-center gap-1.5 rounded-[12px] border px-3 py-1 text-xs font-bold self-start sm:self-center ${statusBadge.classes}`}>
            <span className={`h-2 w-2 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>

        {/* ORDER PROGRESS TIMELINE / STEPPER */}
        <div className="my-6 rounded-[12px] border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                Delivery Progress
              </span>
              <span className="text-[11px] text-neutral-400">· Live Status</span>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[8px] border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] shadow-xs"
              title="Refresh live status"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>

          {!isCancelled ? (
            <div>
              {/* Horizontal Stepper Progress Bar */}
              <div className="relative mx-4 sm:mx-8">
                {/* Background Connecting Line */}
                <div className="absolute left-0 right-0 top-4 -translate-y-1/2 h-[3px] bg-neutral-200" />

                {/* Active Progress Line */}
                <div
                  className="absolute left-0 top-4 -translate-y-1/2 h-[3px] bg-[#0A0A0A] transition-all duration-500"
                  style={{
                    width: isDelivered ? '100%' : isShipped ? '66.6%' : isConfirmed ? '33.3%' : '0%',
                  }}
                />

                {/* 4 Step Indicator Nodes */}
                <div className="relative flex items-center justify-between">
                  {/* Step 1: Ordered */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-white shadow-sm ring-4 ring-white">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Step 2: Confirmed */}
                  <div className="flex flex-col items-center">
                    {isConfirmed ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-white shadow-sm ring-4 ring-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-white ring-4 ring-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#0A0A0A] animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="flex flex-col items-center">
                    {isShipped ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-white shadow-sm ring-4 ring-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    ) : isConfirmed ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-white ring-4 ring-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#0A0A0A] animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 bg-white ring-4 ring-white">
                        <span className="h-2 w-2 rounded-full bg-neutral-300" />
                      </div>
                    )}
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center">
                    {isDelivered ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-white shadow-sm ring-4 ring-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    ) : isShipped ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-white ring-4 ring-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#0A0A0A] animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 bg-white ring-4 ring-white">
                        <span className="h-2 w-2 rounded-full bg-neutral-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Labels */}
              <div className="mt-3.5 grid grid-cols-4 gap-1 text-center">
                {/* Step 1 Label */}
                <div className="px-0.5">
                  <p className="text-xs font-bold text-[#0A0A0A]">Ordered</p>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] text-neutral-500 leading-tight">
                    {orderedDateStr ? `Ordered on ${orderedDateStr}` : 'Order placed'}
                  </p>
                </div>

                {/* Step 2 Label */}
                <div className="px-0.5">
                  <p className={`text-xs font-bold ${isConfirmed ? 'text-[#0A0A0A]' : 'text-neutral-700'}`}>
                    Confirmed
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] text-neutral-500 leading-tight">
                    {isConfirmed
                      ? confirmedDateStr
                        ? `Confirmed on ${confirmedDateStr}`
                        : 'Confirmed'
                      : 'Pending'}
                  </p>
                </div>

                {/* Step 3 Label */}
                <div className="px-0.5">
                  <p className={`text-xs font-bold ${isShipped ? 'text-[#0A0A0A]' : 'text-neutral-700'}`}>
                    Shipped
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] text-neutral-500 leading-tight">
                    {isShipped
                      ? shippedDateStr
                        ? `Shipped on ${shippedDateStr}`
                        : 'In transit'
                      : isConfirmed
                      ? 'Ready to ship'
                      : 'Pending'}
                  </p>
                </div>

                {/* Step 4 Label */}
                <div className="px-0.5">
                  <p className={`text-xs font-bold ${isDelivered ? 'text-[#0A0A0A]' : 'text-neutral-700'}`}>
                    Delivered
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] text-neutral-500 leading-tight">
                    {isDelivered
                      ? deliveredDateStr
                        ? `Delivered on ${deliveredDateStr}`
                        : 'Delivered'
                      : 'Expected in 3-5 days'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Cancelled Order Notice & Stepper */
            <div>
              <div className="rounded-[12px] border border-neutral-300 bg-neutral-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0A0A0A]">This order has been cancelled</h3>
                    <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                      This order was cancelled{cancelledDateStr ? ` on ${cancelledDateStr}` : ''}. If you have questions or wish to place a fresh order, please reach out via WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2-Step Cancelled Timeline */}
              <div className="mt-5 border-t border-neutral-100 pt-4">
                <div className="relative mx-12">
                  <div className="absolute left-0 right-0 top-3.5 -translate-y-1/2 h-[2px] bg-neutral-300" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A0A0A] text-white ring-4 ring-white">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="mt-1.5 text-xs font-bold text-[#0A0A0A]">Ordered</p>
                      <p className="text-[10px] text-neutral-500">{orderedDateStr ? `Ordered on ${orderedDateStr}` : 'Order placed'}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-white ring-4 ring-white">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="mt-1.5 text-xs font-bold text-neutral-800">Cancelled</p>
                      <p className="text-[10px] text-neutral-500">{cancelledDateStr ? `Cancelled on ${cancelledDateStr}` : 'Order cancelled'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            {isCancelled ? 'Contact Support on WhatsApp' : 'Send order details on WhatsApp'}
          </a>
          <p className="mt-2 text-center text-xs text-neutral-500">
            Tap above to message us on WhatsApp with your order details for instant assistance.
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
          {!isCancelled && (
            <div className="mt-3 rounded-[12px] bg-neutral-100 p-3 text-xs text-neutral-800 border border-neutral-200">
              <strong>Payment Notice:</strong> Please keep <strong>{formatINR(total)}</strong> ready to pay via cash or UPI to the delivery courier when your parcel arrives.
            </div>
          )}
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
