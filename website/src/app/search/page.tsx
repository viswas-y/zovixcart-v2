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

export const revalidate = 60

type PageProps = {
    searchParams: Promise<{ q?: string; sort?: string; inStock?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const { q } = await searchParams
    const query = q?.trim()

    if (!query) {
        return {
            title: 'Search Home & Cleaning Products | ZovixCart',
            description: 'Search quality home and cleaning essentials with Cash on Delivery at ZovixCart.',
        }
    }

    return {
        title: `Search: "${query}" | ZovixCart`,
        description: `Explore search results for "${query}" on ZovixCart. Fast shipping with Cash on Delivery in India.`,
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
        // Build wildcard term for GROQ match (e.g. "dish*" or "microfiber* duster*")
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
        <main className="mx-auto max-w-6xl px-4 py-8 text-neutral-800">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500">
                <ol className="flex items-center space-x-2">
                    <li>
                        <Link
                            href="/"
                            className="inline-flex min-h-[36px] items-center text-neutral-600 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                        >
                            Home
                        </Link>
                    </li>
                    <li aria-hidden="true" className="text-neutral-400">/</li>
                    <li className="font-medium text-neutral-900" aria-current="page">
                        Search
                    </li>
                </ol>
            </nav>

            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    {query ? (
                        <>
                            Results for <span className="text-neutral-600">&ldquo;{query}&rdquo;</span>
                        </>
                    ) : (
                        'Search Products'
                    )}
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                    Find cleaning brushes, organizers, and home utility essentials.
                </p>
            </header>

            {/* If no query is entered */}
            {!query ? (
                <div className="my-12 rounded-lg border border-dashed border-neutral-300 p-8 text-center sm:p-12">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                        <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                    <p className="text-base font-semibold text-neutral-900">What are you looking for?</p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
                        Type a product name, category, or keyword in the search bar above to browse our catalog.
                    </p>

                    {categories.length > 0 ? (
                        <div className="mt-8">
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                Popular Categories
                            </p>
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                {categories.map((c) => (
                                    <Link
                                        key={c._id}
                                        href={`/category/${c.slug.current}`}
                                        className="inline-flex min-h-[44px] items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                                    >
                                        {c.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : (
                <>
                    {/* Controls: Count, In-Stock Filter & Sort */}
                    <SortAndFilter totalCount={products.length} label={products.length === 1 ? 'result' : 'results'} />

                    {/* Products Grid or Empty Results State */}
                    {products.length === 0 ? (
                        <div className="my-16 rounded-lg border border-dashed border-neutral-300 p-8 text-center sm:p-12">
                            <p className="text-base font-semibold text-neutral-900">
                                No products found for &ldquo;{query}&rdquo;
                            </p>
                            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
                                {inStockOnly
                                    ? 'No in-stock items match your search. Try unchecking the "In stock only" filter.'
                                    : 'Please check your spelling, try fewer keywords, or browse our categories below.'}
                            </p>

                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                {inStockOnly ? (
                                    <Link
                                        href={`/search?q=${encodeURIComponent(query)}`}
                                        className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                                    >
                                        Turn off stock filter
                                    </Link>
                                ) : null}
                                <Link
                                    href="/"
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                                >
                                    Browse all products
                                </Link>
                            </div>

                            {categories.length > 0 ? (
                                <div className="mt-10 border-t border-neutral-200 pt-6">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        Or Explore Categories
                                    </p>
                                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                                        {categories.map((c) => (
                                            <Link
                                                key={c._id}
                                                href={`/category/${c.slug.current}`}
                                                className="inline-flex min-h-[44px] items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                                            >
                                                {c.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
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
