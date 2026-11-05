import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import {
    buildCategoryProductsQuery,
    categoryBySlugQuery,
} from '@/lib/sanity/queries'
import type { Category, Product } from '@/lib/sanity/types'
import ProductCard from '@/components/ProductCard'
import SortAndFilter from '@/components/SortAndFilter'

export const revalidate = 60

type PageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ sort?: string; inStock?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const category = await client.fetch<Category | null>(categoryBySlugQuery, { slug })

    if (!category) {
        return {
            title: 'Category Not Found | ZovixCart',
        }
    }

    return {
        title: `${category.title} | ZovixCart`,
        description: `Explore quality ${category.title} essentials at ZovixCart. Cash on Delivery available across India.`,
    }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { slug } = await params
    const { sort, inStock } = await searchParams

    const inStockOnly = inStock === '1'

    const [category, products] = await Promise.all([
        client.fetch<Category | null>(categoryBySlugQuery, { slug }),
        client.fetch<Product[]>(buildCategoryProductsQuery(sort, inStockOnly), { slug }),
    ])

    if (!category) {
        notFound()
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
                        {category.title}
                    </li>
                </ol>
            </nav>

            {/* Category Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    {category.title}
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                    Quality everyday essentials for Indian homes. Cash on delivery on all items.
                </p>
            </header>

            {/* Controls: Product Count, In-Stock Filter & Sort Dropdown */}
            <SortAndFilter totalCount={products.length} label={products.length === 1 ? 'product' : 'products'} />

            {/* Products Grid or Empty State */}
            {products.length === 0 ? (
                <div className="my-16 rounded-lg border border-dashed border-neutral-300 p-8 text-center sm:p-12">
                    <p className="text-base font-medium text-neutral-900">
                        No products found in this category
                    </p>
                    <p className="mt-2 text-sm text-neutral-600">
                        {inStockOnly
                            ? 'There are currently no items in stock matching your filter. Try turning off "In stock only".'
                            : 'We have no active products listed under this category right now.'}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        {inStockOnly ? (
                            <Link
                                href={`/category/${category.slug.current}`}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                            >
                                Reset stock filter
                            </Link>
                        ) : null}
                        <Link
                            href="/"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                        >
                            Browse all products
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </main>
    )
}
