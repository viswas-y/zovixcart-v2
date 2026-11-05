'use client'

import { useState } from 'react'
import Link from 'next/link'
import { urlForImage, hasImageAsset } from '@/lib/sanity/client'
import type { Product } from '@/lib/sanity/types'
import { useCart } from '@/components/CartProvider'

export function formatINR(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

export function getStrikePrice(p: Pick<Product, 'price' | 'compare_at_price' | 'originalPrice'>) {
  const candidate = p.compare_at_price ?? p.originalPrice
  return candidate && candidate > p.price ? candidate : undefined
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  // Find all valid images
  const validImages = (product.images || []).filter((img) => hasImageAsset(img))
  const firstImage = validImages[0]
  const secondImage = validImages[1]

  const firstImageUrl = firstImage
    ? urlForImage(firstImage).width(600).height(600).fit('crop').quality(85).url()
    : ''
  const secondImageUrl = secondImage
    ? urlForImage(secondImage).width(600).height(600).fit('crop').quality(85).url()
    : ''

  const strike = getStrikePrice(product)
  const outOfStock = product.inStock === false

  // Calculate percent off or fall back to discountBadge
  let discountPct: number | null = null
  if (strike && strike > product.price) {
    discountPct = Math.round(((strike - product.price) / strike) * 100)
  }
  const badgeText = discountPct ? `${discountPct}% OFF` : product.discountBadge

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return

    addItem(
      {
        productId: product._id,
        slug: product.slug.current,
        title: product.title,
        price: product.price,
        imageUrl: firstImageUrl || '',
      },
      1
    )

    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
    }, 1800)
  }

  return (
    <div className="group flex flex-col justify-between rounded-[12px] bg-white transition">
      <Link
        href={`/product/${product.slug.current}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 rounded-[12px]"
      >
        {/* Square Image container */}
        <div className="relative aspect-square overflow-hidden rounded-[12px] border border-neutral-200 bg-neutral-100">
          {firstImageUrl ? (
            <>
              {/* Primary Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={firstImageUrl}
                alt={firstImage?.alt || product.title}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  secondImageUrl ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                } ${outOfStock ? 'opacity-50' : ''}`}
              />
              {/* Secondary Image on hover (desktop) */}
              {secondImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={secondImageUrl}
                  alt={secondImage?.alt || product.title}
                  className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                    outOfStock ? 'opacity-50' : ''
                  }`}
                />
              )}
            </>
          ) : (
            /* Missing image placeholder block */
            <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-100 p-4 text-neutral-400">
              <svg
                aria-hidden="true"
                className="h-8 w-8 stroke-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <span className="mt-1 text-xs text-neutral-400">No image</span>
            </div>
          )}

          {/* Multiple images dot indicators */}
          {validImages.length > 1 && (
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
              <span className="h-1.5 w-3 rounded-full bg-white shadow-sm transition-all group-hover:w-1.5 group-hover:bg-white/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/60 shadow-sm transition-all group-hover:w-3 group-hover:bg-white" />
              {validImages.slice(2).map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/60 shadow-sm" />
              ))}
            </div>
          )}

          {/* Discount badge */}
          {badgeText && !outOfStock ? (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-[12px] bg-[#0A0A0A] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              {badgeText}
            </span>
          ) : null}

          {/* Out of stock pill */}
          {outOfStock ? (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-[12px] border border-neutral-300 bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-neutral-900 shadow-sm">
              Out of stock
            </span>
          ) : null}
        </div>

        {/* Title: max 2 lines */}
        <h3 className="mt-3 line-clamp-2 text-sm font-medium text-[#0A0A0A] transition-colors group-hover:text-neutral-600">
          {product.title}
        </h3>

        {/* Price & compare-at price */}
        <p className="mt-1 flex items-baseline gap-2 text-sm">
          <span className="font-bold text-[#0A0A0A]">{formatINR(product.price)}</span>
          {strike ? (
            <span className="text-xs text-neutral-500 line-through">{formatINR(strike)}</span>
          ) : null}
        </p>
      </Link>

      {/* Quick Add to Cart Button (does not trigger link) */}
      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={outOfStock}
        aria-label={
          outOfStock
            ? `${product.title} is out of stock`
            : `Add ${product.title} to cart`
        }
        className={`mt-3 flex min-h-[44px] w-full items-center justify-center rounded-[12px] px-3 py-2 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 ${
          outOfStock
            ? 'cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400'
            : justAdded
            ? 'bg-neutral-800 text-white'
            : 'bg-[#0A0A0A] text-white hover:bg-neutral-800 active:scale-[0.98]'
        }`}
      >
        {outOfStock ? (
          'Out of stock'
        ) : justAdded ? (
          <span className="flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Added!
          </span>
        ) : (
          'Add to cart'
        )}
      </button>
    </div>
  )
}
