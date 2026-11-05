import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { activeProductsQuery, categoriesQuery, featuredProductsQuery } from '@/lib/sanity/queries'
import type { Category, Product } from '@/lib/sanity/types'
import ProductCard from '@/components/ProductCard'

export const revalidate = 60

export default async function HomePage() {
  const [categories, featured, products] = await Promise.all([
    client.fetch<Category[]>(categoriesQuery).catch(() => []),
    client.fetch<Product[]>(featuredProductsQuery).catch(() => []),
    client.fetch<Product[]>(activeProductsQuery).catch(() => []),
  ])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-neutral-800">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Home &amp; Cleaning Essentials
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Everyday utility finds for your home. Cash on Delivery available across India.
        </p>
      </header>

      {/* Shop by Category Chips */}
      {categories.length > 0 ? (
        <section aria-labelledby="shop-by-category-heading" className="mb-10">
          <h2 id="shop-by-category-heading" className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Shop by category
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug.current}`}
                className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="mb-14">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">Featured</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">All products</h2>
        {products.length === 0 ? (
          <p className="text-sm text-neutral-600">No products are available right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
