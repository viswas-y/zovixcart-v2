import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import {
  activeProductsQuery,
  featuredProductsQuery,
  categoriesQuery,
} from '@/lib/sanity/queries'
import type { Category, Product } from '@/lib/sanity/types'
import HeroOrbit from '@/components/home/HeroOrbit'
import TrustStrip from '@/components/home/TrustStrip'
import ShopByCategory from '@/components/home/ShopByCategory'
import ProductTabs from '@/components/home/ProductTabs'
import FAQAccordion from '@/components/FAQAccordion'
import { FAQ_ITEMS } from '@/lib/faq'

export const revalidate = 60

export default async function HomePage() {
  const [featured, products, categories] = await Promise.all([
    client.fetch<Product[]>(featuredProductsQuery).catch(() => []),
    client.fetch<Product[]>(activeProductsQuery).catch(() => []),
    client.fetch<Category[]>(categoriesQuery).catch(() => []),
  ])

  // Combine featured products first, followed by active products
  // De-duplicate by _id for hero ring candidates
  const seenIds = new Set<string>()
  const orbitCandidates: Product[] = []

  for (const p of featured) {
    if (p?._id && !seenIds.has(p._id)) {
      seenIds.add(p._id)
      orbitCandidates.push(p)
    }
  }

  for (const p of products) {
    if (p?._id && !seenIds.has(p._id)) {
      seenIds.add(p._id)
      orbitCandidates.push(p)
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      {/* 1. Hero section with orbit ring carousel */}
      <HeroOrbit products={orbitCandidates} />

      {/* 2. Trust strip directly under hero */}
      <TrustStrip />

      {/* 3. Shop by category horizontal scroll row */}
      <ShopByCategory categories={categories} products={products} />

      {/* 4. Product tabs (Featured, New arrivals, All products) with #products anchor */}
      <ProductTabs featuredProducts={featured} allProducts={products} />

      {/* 5. Frequently Asked Questions above footer */}
      <section aria-label="Frequently Asked Questions" className="border-t border-neutral-200 bg-neutral-50/50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs text-neutral-600 sm:text-sm">
              Quick answers about shipping, cash on delivery, and our service.
            </p>
          </div>

          <FAQAccordion items={FAQ_ITEMS} />

          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex min-h-[44px] items-center text-xs font-semibold text-[#0A0A0A] hover:underline"
            >
              View full FAQ page &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
