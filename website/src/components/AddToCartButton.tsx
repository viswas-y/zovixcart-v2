'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { formatINR } from '@/components/ProductCard'

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
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const isOutOfStock = product.inStock === false

  function handleAdd() {
    if (isOutOfStock) return

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

  return (
    <>
      {/* In-page purchase box */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quantity Selector */}
          {!isOutOfStock ? (
            <div className="flex items-center rounded-[12px] border border-neutral-300 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
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
                aria-label="Increase quantity"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[#0A0A0A] transition hover:bg-neutral-100 rounded-r-[12px]"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          ) : null}

          {/* Add to Cart Action */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex-1 inline-flex min-h-[44px] items-center justify-center rounded-[12px] px-6 py-3 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 shadow-sm ${
              isOutOfStock
                ? 'cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400'
                : justAdded
                ? 'bg-neutral-800 text-white'
                : 'bg-[#0A0A0A] text-white hover:bg-neutral-800 active:scale-[0.98]'
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
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
        <div>
          <p className="text-[11px] font-medium text-neutral-500">Price</p>
          <p className="text-lg font-bold text-[#0A0A0A] leading-tight">
            {formatINR(product.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] px-6 py-2.5 text-sm font-bold shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
            isOutOfStock
              ? 'cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400'
              : justAdded
              ? 'bg-neutral-800 text-white'
              : 'bg-[#0A0A0A] text-white hover:bg-neutral-800 active:scale-[0.98]'
          }`}
        >
          {isOutOfStock ? 'Out of stock' : justAdded ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </>
  )
}
