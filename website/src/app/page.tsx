import { client } from '@/lib/sanity/client'
import { activeProductsQuery, featuredProductsQuery } from '@/lib/sanity/queries'
import type { Product } from '@/lib/sanity/types'
import ProductCard from '@/components/ProductCard'

export const revalidate = 60

export default async function HomePage() {
  const [featured, products] = await Promise.all([
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
          Everyday utility finds for Indian homes. Cash on Delivery on all orders.
        </p>
      </header>

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
