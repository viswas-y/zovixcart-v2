import { client } from '@/lib/sanity/client'
import { activeProductsQuery, featuredProductsQuery } from '@/lib/sanity/queries'
import type { Product } from '@/lib/sanity/types'
import ProductCard from '@/components/ProductCard'
import HeroSection from '@/components/HeroSection'

export const revalidate = 60

export default async function HomePage() {
  const [featured, products] = await Promise.all([
    client.fetch<Product[]>(featuredProductsQuery).catch(() => []),
    client.fetch<Product[]>(activeProductsQuery).catch(() => []),
  ])

  // Select 3 products for the hero slider:
  // Use featured products with images first, falling back to newest active products with images
  const heroMap = new Map<string, Product>()
  for (const p of featured) {
    if (
      heroMap.size < 3 &&
      p.images?.some((img) => Boolean(img?.asset?._ref || img?.asset?._id))
    ) {
      heroMap.set(p._id, p)
    }
  }
  for (const p of products) {
    if (
      heroMap.size < 3 &&
      !heroMap.has(p._id) &&
      p.images?.some((img) => Boolean(img?.asset?._ref || img?.asset?._id))
    ) {
      heroMap.set(p._id, p)
    }
  }
  const heroProducts = Array.from(heroMap.values())

  return (
    <main className="min-h-screen text-neutral-800">
      {/* Full-width Hero Section */}
      <HeroSection products={heroProducts} />

      {/* Catalog Products */}
      <div id="products" className="mx-auto max-w-6xl px-4 py-12 scroll-mt-20">
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
      </div>
    </main>
  )
}
