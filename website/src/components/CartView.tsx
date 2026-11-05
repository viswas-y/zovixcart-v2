'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { formatINR } from '@/components/ProductCard'
import { DELIVERY_FEE, STORE_NAME } from '@/lib/config'

export default function CartView() {
  const { items, totalCount, subtotal, isLoaded, updateQuantity, removeItem } = useCart()

  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-8 w-48 rounded-[12px] bg-neutral-200 animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-24 w-full rounded-[12px] bg-neutral-100 animate-pulse" />
          <div className="h-24 w-full rounded-[12px] bg-neutral-100 animate-pulse" />
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-[#0A0A0A]">
          <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A]">
          Your cart is empty
        </h1>
        <p className="mt-2 text-xs text-neutral-600 sm:text-sm">
          Looks like you haven&apos;t added any items to your cart yet.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#0A0A0A] px-7 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
          >
            Explore Products
          </Link>
        </div>
      </main>
    )
  }

  const estimatedTotal = subtotal + DELIVERY_FEE

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-[#0A0A0A]">
      <header className="mb-8 border-b border-neutral-200 pb-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
          Shopping Cart
        </h1>
        <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
          {totalCount} {totalCount === 1 ? 'item' : 'items'} in your cart · Cash on Delivery across India
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Cart Items List */}
        <div className="lg:col-span-8">
          <ul className="divide-y divide-neutral-200 border-b border-neutral-200">
            {items.map((item) => (
              <li key={item.productId} className="py-4 sm:py-6 flex gap-4">
                {/* Thumbnail */}
                <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-[12px] border border-neutral-200 bg-neutral-100">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Item Info & Controls */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-medium text-[#0A0A0A] hover:text-neutral-600 text-sm sm:text-base line-clamp-2 focus:outline-none focus-visible:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="font-bold text-[#0A0A0A] text-sm sm:text-base whitespace-nowrap">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>

                  <p className="text-xs text-neutral-500">
                    {formatINR(item.price)} each
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity Stepper (min 44px tap targets) */}
                    <div className="flex items-center rounded-[12px] border border-neutral-300 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.title}`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[#0A0A0A] transition hover:bg-neutral-100 rounded-l-[12px]"
                      >
                        <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#0A0A0A]" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.title}`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[#0A0A0A] transition hover:bg-neutral-100 rounded-r-[12px]"
                      >
                        <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="inline-flex min-h-[44px] items-center text-xs font-semibold text-neutral-500 hover:text-red-600 focus:outline-none focus-visible:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center text-xs font-semibold text-neutral-600 hover:text-[#0A0A0A] focus:outline-none focus-visible:underline"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Checkout CTA */}
        <div className="lg:col-span-4">
          <div className="rounded-[12px] border border-neutral-200 bg-neutral-50/70 p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-[#0A0A0A]">Order Summary</h2>

            <div className="mt-4 space-y-3 text-sm border-b border-neutral-200 pb-4">
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
              <div className="flex justify-between text-neutral-600">
                <span>Payment Method</span>
                <span className="font-semibold text-[#0A0A0A]">Cash on Delivery</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-base font-extrabold text-[#0A0A0A]">
              <span>Estimated Total</span>
              <span>{formatINR(estimatedTotal)}</span>
            </div>

            <p className="mt-2 text-xs text-neutral-500">
              Pay with cash or UPI when your order arrives. Free returns within return window.
            </p>

            <div className="mt-6">
              <Link
                href="/checkout"
                className="flex min-h-[48px] w-full items-center justify-center rounded-[12px] bg-[#0A0A0A] px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] shadow-md"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
