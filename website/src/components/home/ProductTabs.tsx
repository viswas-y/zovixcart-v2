'use client'

import { useState, useRef, useMemo } from 'react'
import type { Product } from '@/lib/sanity/types'
import ProductCard from '@/components/ProductCard'

interface ProductTabsProps {
  featuredProducts: Product[]
  allProducts: Product[]
}

type TabId = 'featured' | 'new-arrivals' | 'all'

interface TabConfig {
  id: TabId
  label: string
  products: Product[]
}

export default function ProductTabs({ featuredProducts, allProducts }: ProductTabsProps) {
  const hasFeatured = featuredProducts && featuredProducts.length > 0

  const tabs: TabConfig[] = useMemo(() => {
    const list: TabConfig[] = []
    if (hasFeatured) {
      list.push({
        id: 'featured',
        label: 'Featured',
        products: featuredProducts,
      })
    }
    list.push({
      id: 'new-arrivals',
      label: 'New arrivals',
      products: allProducts.slice(0, 8),
    })
    list.push({
      id: 'all',
      label: 'All products',
      products: allProducts,
    })
    return list
  }, [hasFeatured, featuredProducts, allProducts])

  const [activeTab, setActiveTab] = useState<TabId>(hasFeatured ? 'featured' : 'new-arrivals')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const currentProducts = useMemo(() => {
    const match = tabs.find((t) => t.id === activeTab)
    return match ? match.products : allProducts
  }, [tabs, activeTab, allProducts])

  // Arrow key navigation between tabs per WAI-ARIA
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = index
    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      targetIndex = 0
    } else if (e.key === 'End') {
      targetIndex = tabs.length - 1
    } else {
      return
    }

    e.preventDefault()
    setActiveTab(tabs[targetIndex].id)
    tabRefs.current[targetIndex]?.focus()
  }

  return (
    <section id="products" className="mx-auto max-w-6xl px-4 py-12 scroll-mt-20">
      {/* Tab controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
            Explore essentials
          </h2>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
            Cash on Delivery available on all items
          </p>
        </div>

        {/* Tab list */}
        <div
          role="tablist"
          aria-label="Product categories and highlights"
          className="inline-flex rounded-[12px] border border-neutral-200 bg-neutral-100 p-1"
        >
          {tabs.map((tab, idx) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el
                }}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`inline-flex min-h-[44px] items-center justify-center rounded-[12px] px-4 py-2 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] sm:text-sm ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-[#0A0A0A]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Tab Panel */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="focus:outline-none"
      >
        {currentProducts.length === 0 ? (
          <div className="rounded-[12px] border border-neutral-200 bg-neutral-50 p-12 text-center">
            <p className="text-sm text-neutral-600">No products found in this section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            {currentProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

