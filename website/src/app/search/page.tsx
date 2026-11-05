import Link from 'next/link'
import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import {
  buildSearchProductsQuery,
  categoriesQuery,
} from '@/lib/sanity/queries'
import type { Category, Product } from '@/lib/sanity/types'
import ProductCard from '@/components/ProductCard'
import SortAndFilter from '@/components/SortAndFilter'
import { STORE_NAME } from '@/lib/config'

export const revalidate = 60

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string; inStock?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams
  const query = q?.trim()

  if (!query) {
    return {
      title: `Search Products | ${STORE_NAME}`,
      description: `Search quality home and cleaning essentials with Cash on Delivery at ${STORE_NAME}.`,
    }
  }

  return {
    title: `Search: "${query}" | ${STORE_NAME}`,
    description: `Explore search results for "${query}" on ${STORE_NAME}. Cash on Delivery across India.`,
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, sort, inStock } = await searchParams
  const query = q?.trim() || ''
  const inStockOnly = inStock === '1'

  // Fetch categories for suggestions
  const categories = await client.fetch<Category[]>(categoriesQuery).catch(() => [])

  let products: Product[] = []
  if (query) {
    // Build wildcard term for GROQ match
    const term = query
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word}*`)
      .join(' ')

    products = await client.fetch<Product[]>(
      buildSearchProductsQuery(sort, inStockOnly),
      { term }
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-[#0A0A0A]">
      {/* Breadcrumb Navigation */}
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
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li className="font-semibold text-[#0A0A0A]" aria-current="page">
            Search
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
          {query ? (
            <>
              Results for <span className="text-neutral-600">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            'Search Products'
          )}
        </h1>
        <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
          Find cleaning brushes, organizers, and home utility essentials.
        </p>
      </header>

      {/* If no query is entered */}
      {!query ? (
        <div className="my-12 rounded-[12px] border border-dashed border-neutral-300 bg-neutral-50/50 p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-[#0A0A0A]">
            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <p className="font-display text-base font-bold text-[#0A0A0A]">What are you looking for?</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-neutral-600 sm:text-sm">
            Type a product name, category, or keyword in the search bar above to browse our catalog.
          </p>

          {categories.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Popular Categories
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/category/${c.slug.current}`}
                    className="inline-flex min-h-[44px] items-center rounded-[12px] border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-[#0A0A0A] shadow-sm transition hover:border-[#0A0A0A] hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Controls: Count, In-Stock Filter & Sort */}
          <SortAndFilter totalCount={products.length} label={products.length === 1 ? 'result' : 'results'} />

          {/* Products Grid or Empty Results State */}
          {products.length === 0 ? (
            <div className="my-16 rounded-[12px] border border-dashed border-neutral-300 bg-neutral-50/50 p-8 text-center sm:p-12">
              <p className="font-display text-base font-bold text-[#0A0A0A]">
                No products found for &ldquo;{query}&rdquo;
              </p>
              <p className="mx-auto mt-2 max-w-md text-xs text-neutral-600 sm:text-sm">
                {inStockOnly
                  ? 'No in-stock items match your search. Try unchecking the "In stock only" filter.'
                  : 'Please check your spelling, try fewer keywords, or browse our categories below.'}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {inStockOnly ? (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-neutral-300 bg-white px-5 py-2.5 text-xs font-bold text-[#0A0A0A] hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
                  >
                    Turn off stock filter
                  </Link>
                ) : null}
                <Link
                  href="/"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#0A0A0A] px-6 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
                >
                  Browse all products
                </Link>
              </div>

              {categories.length > 0 && (
                <div className="mt-10 border-t border-neutral-200 pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Or Explore Categories
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {categories.map((c) => (
                      <Link
                        key={c._id}
                        href={`/category/${c.slug.current}`}
                        className="inline-flex min-h-[44px] items-center rounded-[12px] border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-[#0A0A0A] shadow-sm transition hover:border-[#0A0A0A] hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
