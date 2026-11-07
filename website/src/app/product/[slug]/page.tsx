import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { client, urlForImage, hasImageAsset } from '@/lib/sanity/client'
import { productBySlugQuery } from '@/lib/sanity/queries'
import type { Product } from '@/lib/sanity/types'
import { formatINR, getStrikePrice } from '@/lib/pricing'
import ProductGallery from '@/components/ProductGallery'
import AddToCartButton from '@/components/AddToCartButton'
import { TRUST_POINTS, STORE_NAME } from '@/lib/config'

export const revalidate = 60

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await client.fetch<Product | null>(productBySlugQuery, { slug })

  if (!product || product.is_active === false) {
    return {
      title: `Product Not Found | ${STORE_NAME}`,
    }
  }

  return {
    title: `${product.title} | ${STORE_NAME}`,
    description:
      product.shortDescription ||
      `Buy ${product.title} online at ${STORE_NAME} with Cash on Delivery across India.`,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await client.fetch<Product | null>(productBySlugQuery, { slug })

  if (!product || product.is_active === false) notFound()

  const strike = getStrikePrice(product)
  const outOfStock = product.inStock === false
  const highlights = product.bullet_points?.length ? product.bullet_points : product.keyFeatures

  // Calculate discount percentage if original price exists
  let discountPct: number | null = null
  if (strike && strike > product.price) {
    discountPct = Math.round(((strike - product.price) / strike) * 100)
  }
  const badgeText = discountPct ? `${discountPct}% OFF` : product.discountBadge

  // Valid first image for cart payload
  const firstImage = product.images?.find((img) => hasImageAsset(img))
  const firstImageUrl = firstImage
    ? urlForImage(firstImage).width(400).height(400).fit('crop').url()
    : ''

  // Only render reviews if real reviews exist in database (strict AGENTS.md rule)
  const realReviews = (product.reviews || []).filter((r) => r.comment || r.rating)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 text-[#0A0A0A] md:pb-16">
      {/* 1. Accessible Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-[36px] items-center text-neutral-600 hover:text-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] rounded-[8px]"
            >
              Home
            </Link>
          </li>
          {product.category?.slug?.current ? (
            <>
              <li aria-hidden="true" className="text-neutral-300">/</li>
              <li>
                <Link
                  href={`/category/${product.category.slug.current}`}
                  className="inline-flex min-h-[36px] items-center text-neutral-600 hover:text-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] rounded-[8px]"
                >
                  {product.category.title}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li className="line-clamp-1 font-semibold text-[#0A0A0A]" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* 2. Main Product Section (Gallery + Info) */}
      <div className="grid gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
        {/* Left: Gallery with thumbnails and lightbox */}
        <div>
          <ProductGallery images={product.images || []} title={product.title} />
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="flex flex-col">
          {product.category?.slug?.current && (
            <Link
              href={`/category/${product.category.slug.current}`}
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#0A0A0A]"
            >
              {product.category.title}
            </Link>
          )}

          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl lg:text-4xl">
            {product.title}
          </h1>

          {/* Price Block */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#0A0A0A] sm:text-4xl">
              {formatINR(product.price)}
            </span>
            {strike ? (
              <span className="text-base text-neutral-500 line-through sm:text-lg">
                {formatINR(strike)}
              </span>
            ) : null}
            {badgeText && !outOfStock ? (
              <span className="rounded-[12px] bg-[#0A0A0A] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                {badgeText}
              </span>
            ) : null}
          </div>

          {/* Stock Status Badge */}
          <div className="mt-4">
            {outOfStock ? (
              <span className="inline-flex items-center rounded-[12px] border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                In stock
              </span>
            )}
          </div>

          {/* Quantity Selector, Add to Cart button, and Mobile Sticky Bar */}
          <AddToCartButton
            product={{
              _id: product._id,
              title: product.title || '',
              slug: product.slug || { current: slug },
              price: product.price || 0,
              inStock: product.inStock,
              imageUrl: firstImageUrl,
            }}
          />

          {/* Delivery estimate note */}
          {product.delivery_estimate && (
            <div className="mt-6 flex items-center gap-3 rounded-[12px] border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-700 sm:text-sm">
              <svg aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.375c0-.621-.504-1.125-1.125-1.125h-9.75C2.625 2.25 2.121 2.754 2.121 3.375v10.875m12 0h-12" />
              </svg>
              <span>
                Estimated Delivery:{' '}
                <strong className="font-bold text-[#0A0A0A]">{product.delivery_estimate}</strong>
              </span>
            </div>
          )}

          {/* "Why buy from us" Box using TRUST_POINTS */}
          <div className="mt-6 rounded-[12px] border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
              Why shop with {STORE_NAME}
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-neutral-700">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[#0A0A0A] text-xs font-bold">✓</span>
                <span>{TRUST_POINTS[0]} (Pay at your doorstep)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[#0A0A0A] text-xs font-bold">✓</span>
                <span>{TRUST_POINTS[1]} (Direct updates on your phone)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[#0A0A0A] text-xs font-bold">✓</span>
                <span>{TRUST_POINTS[2]} (Safe pan-India courier delivery)</span>
              </li>
            </ul>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <div className="mt-6">
              <p className="max-w-[65ch] text-sm leading-relaxed text-neutral-600 sm:text-base">
                {product.shortDescription}
              </p>
            </div>
          )}

          {/* Key Features Bullet Points */}
          {highlights && highlights.length > 0 && (
            <div className="mt-6 border-t border-neutral-200 pt-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#0A0A0A]">
                Key Highlights
              </h2>
              <ul className="mt-3 max-w-[65ch] space-y-2 text-sm text-neutral-700">
                {highlights.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0A0A0A]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 3. Detailed Portable Text Content (Readable max width 65ch) */}
      {product.body && product.body.length > 0 && (
        <section aria-label="Product Specifications" className="mt-16 border-t border-neutral-200 pt-10">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#0A0A0A] sm:text-2xl">
            Product Details &amp; Specifications
          </h2>
          <div className="mt-4 max-w-[65ch] space-y-4 text-sm leading-relaxed text-neutral-700 sm:text-base">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <PortableText value={product.body as any} />
          </div>
        </section>
      )}

      {/* 4. Customer Reviews (Strict AGENTS.md rule: Only render if real reviews exist) */}
      {realReviews.length > 0 && (
        <section aria-label="Customer Reviews" className="mt-16 border-t border-neutral-200 pt-10">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#0A0A0A] sm:text-2xl">
            Customer Reviews ({realReviews.length})
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {realReviews.map((rev, idx) => (
              <div key={rev._key || idx} className="rounded-[12px] border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0A0A0A] text-sm">{rev.name || 'Customer'}</span>
                  {rev.rating && (
                    <span className="text-xs font-bold text-amber-600">
                      {'★'.repeat(rev.rating)}
                    </span>
                  )}
                </div>
                {rev.comment && <p className="mt-2 text-xs text-neutral-600 sm:text-sm">{rev.comment}</p>}
                {rev.date && <p className="mt-2 text-[11px] text-neutral-400">{rev.date}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
