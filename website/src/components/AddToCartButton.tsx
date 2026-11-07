'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { formatINR } from '@/lib/pricing'

interface AddToCartButtonProps {
  product: {
    _id: string
    title: string
    slug: { current: string }
    price: number
    inStock?: boolean
    imageUrl?: string
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter()
  const { addItem, setOrAddItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const isOutOfStock = product.inStock === false

  function handleAdd() {
    if (isOutOfStock || isNavigating) return

    addItem(
      {
        productId: product._id,
        slug: product.slug.current,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl || '',
      },
      quantity
    )

    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
    }, 2200)
  }

  function handleBuyNow() {
    if (isOutOfStock || isNavigating) return

    setIsNavigating(true)
    setOrAddItem(
      {
        productId: product._id,
        slug: product.slug.current,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl || '',
      },
      quantity
    )

    router.push('/checkout')
  }

  return (
    <>
      {/* In-page purchase box */}
      <div className="mt-6 flex flex-col gap-3">
        {/* Quantity selector & Action Buttons: side by side on desktop, stacked on mobile */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Quantity Selector */}
          {!isOutOfStock ? (
            <div className="flex items-center self-start rounded-[12px] border border-neutral-300 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isNavigating}
                aria-label="Decrease quantity"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[#0A0A0A] transition hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-l-[12px]"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="w-10 text-center text-sm font-bold text-[#0A0A0A]" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={isNavigating}
                aria-label="Increase quantity"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[#0A0A0A] transition hover:bg-neutral-100 disabled:opacity-30 rounded-r-[12px]"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          ) : null}

          {/* Action Buttons: side by side on desktop, full-width stacked on mobile */}
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row">
            {/* Add to cart (outline style) */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock || isNavigating}
              aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
              className={`inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] border-2 border-[#0A0A0A] px-5 py-2.5 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
                isOutOfStock
                  ? 'cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400'
                  : justAdded
                  ? 'border-neutral-800 bg-neutral-100 text-[#0A0A0A]'
                  : 'bg-white text-[#0A0A0A] hover:bg-neutral-100 active:scale-[0.98]'
              }`}
            >
              {isOutOfStock ? (
                'Out of stock'
              ) : justAdded ? (
                <span className="flex items-center gap-1.5">
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Added to cart!
                </span>
              ) : (
                'Add to cart'
              )}
            </button>

            {/* Buy now (solid black) */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || isNavigating}
              aria-label={isOutOfStock ? 'Out of stock' : 'Buy now with Cash on Delivery'}
              className={`inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
                isOutOfStock
                  ? 'cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400'
                  : isNavigating
                  ? 'bg-neutral-800 text-white cursor-wait opacity-80'
                  : 'bg-[#0A0A0A] text-white hover:bg-neutral-800 active:scale-[0.98]'
              }`}
            >
              {isOutOfStock ? (
                'Out of stock'
              ) : isNavigating ? (
                <span className="flex items-center gap-2">
                  <svg aria-hidden="true" className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Proceeding...
                </span>
              ) : (
                'Buy now'
              )}
            </button>
          </div>
        </div>

        {/* Small confirmation alert when added */}
        {justAdded && (
          <div className="flex items-center justify-between rounded-[12px] border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-xs font-medium text-[#0A0A0A] shadow-sm">
            <span>Item added to your shopping cart.</span>
            <Link
              href="/cart"
              className="font-bold underline hover:text-neutral-600 focus:outline-none focus-visible:underline"
            >
              View Cart &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Sticky Mobile Bottom Bar (hidden on desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-neutral-200 bg-white/95 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
        <div className="flex-shrink-0 min-w-0 pr-1">
          <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Price</p>
          <p className="text-base font-bold text-[#0A0A0A] leading-tight whitespace-nowrap">
            {formatINR(product.price)}
          </p>
        </div>

        <div className="flex flex-1 items-center gap-2">
          {/* Add to cart (outline) */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock || isNavigating}
            aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            className={`flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] border-2 border-[#0A0A0A] px-2 py-2 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
              isOutOfStock
                ? 'cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400'
                : justAdded
                ? 'border-neutral-800 bg-neutral-100 text-[#0A0A0A]'
                : 'bg-white text-[#0A0A0A] active:scale-[0.98]'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : justAdded ? 'Added ✓' : 'Add to cart'}
          </button>

          {/* Buy now (solid black) */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isNavigating}
            aria-label={isOutOfStock ? 'Out of stock' : 'Buy now with Cash on Delivery'}
            className={`flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] bg-[#0A0A0A] px-2 py-2 text-xs font-bold text-white shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
              isOutOfStock
                ? 'cursor-not-allowed bg-neutral-100 text-neutral-400'
                : isNavigating
                ? 'bg-neutral-800 text-white cursor-wait opacity-80'
                : 'bg-[#0A0A0A] text-white active:scale-[0.98]'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : isNavigating ? 'Wait...' : 'Buy now'}
          </button>
        </div>
      </div>
    </>
  )
}
