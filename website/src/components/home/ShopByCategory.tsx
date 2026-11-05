import Link from 'next/link'
import type { Category, Product } from '@/lib/sanity/types'
import { urlForImage, hasImageAsset } from '@/lib/sanity/client'

interface ShopByCategoryProps {
  categories: Category[]
  products: Product[]
}

export default function ShopByCategory({ categories, products }: ShopByCategoryProps) {
  if (!categories || categories.length === 0) return null

  // Find fallback image for a category from products in that category
  const getCategoryImage = (cat: Category) => {
    if (cat.image && hasImageAsset(cat.image)) {
      return urlForImage(cat.image).width(200).height(200).fit('crop').quality(85).url()
    }
    const matchingProduct = products.find(
      (p) => p.category?._id === cat._id || p.category?.slug?.current === cat.slug?.current
    )
    const prodImg = matchingProduct?.images?.find((img) => hasImageAsset(img))
    if (prodImg) {
      return urlForImage(prodImg).width(200).height(200).fit('crop').quality(85).url()
    }
    return ''
  }

  // First product image for "All products" tile
  const firstProdImg = products.flatMap((p) => p.images || []).find((img) => hasImageAsset(img))
  const allProductsImg = firstProdImg
    ? urlForImage(firstProdImg).width(200).height(200).fit('crop').quality(85).url()
    : ''

  return (
    <section
      aria-label="Shop by category"
      className="w-full border-b border-neutral-200 bg-white py-8 sm:py-10"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#0A0A0A] sm:text-2xl">
            Shop by category
          </h2>
          <span className="text-xs text-neutral-500 hidden sm:inline">Scroll to browse &rarr;</span>
        </div>

        {/* Scroll-snap horizontal row */}
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory sm:gap-6">
          {/* 1. "All products" tile */}
          <Link
            href="#products"
            className="group flex flex-shrink-0 flex-col items-center snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] rounded-[12px] p-1.5"
            aria-label="View all products"
          >
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-neutral-100 shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:border-[#0A0A0A]">
              {allProductsImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={allProductsImg}
                  alt="All products"
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  aria-hidden="true"
                  className="h-6 w-6 text-[#0A0A0A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.75"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
              )}
            </div>
            <span className="mt-2 w-[80px] sm:w-[96px] text-center text-xs font-semibold leading-tight text-[#0A0A0A] line-clamp-2 group-hover:text-neutral-600 sm:text-sm">
              All products
            </span>
          </Link>

          {/* 2. Category Tiles */}
          {categories.map((cat) => {
            const imageUrl = getCategoryImage(cat)
            return (
              <Link
                key={cat._id}
                href={`/category/${cat.slug.current}`}
                className="group flex flex-shrink-0 flex-col items-center snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] rounded-[12px] p-1.5"
                aria-label={`Browse ${cat.title}`}
              >
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-neutral-100 shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:border-[#0A0A0A]">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={cat.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      aria-hidden="true"
                      className="h-6 w-6 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
                      />
                    </svg>
                  )}
                </div>
                <span className="mt-2 w-[80px] sm:w-[96px] text-center text-xs font-semibold leading-tight text-[#0A0A0A] line-clamp-2 group-hover:text-neutral-600 sm:text-sm">
                  {cat.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

