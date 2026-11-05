'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface SortAndFilterProps {
  totalCount: number
  label?: string
}

export default function SortAndFilter({ totalCount, label = 'products' }: SortAndFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sort') || 'newest'
  const inStock = searchParams.get('inStock') === '1'

  function updateParams(newSort: string, newInStock: boolean) {
    const params = new URLSearchParams(searchParams.toString())

    if (newSort && newSort !== 'newest') {
      params.set('sort', newSort)
    } else {
      params.delete('sort')
    }

    if (newInStock) {
      params.set('inStock', '1')
    } else {
      params.delete('inStock')
    }

    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-200 pb-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-600">
        Showing <span className="font-bold text-[#0A0A0A]">{totalCount}</span> {label}
      </p>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* In Stock Only Checkbox */}
        <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm font-medium text-[#0A0A0A] select-none">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateParams(currentSort, e.target.checked)}
            className="h-4 w-4 rounded-[4px] border-neutral-300 text-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A] focus:ring-offset-1"
          />
          <span>In stock only</span>
        </label>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-dropdown" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-dropdown"
            value={currentSort}
            onChange={(e) => updateParams(e.target.value, inStock)}
            className="min-h-[44px] rounded-[12px] border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-[#0A0A0A] shadow-sm transition hover:border-neutral-400 focus:border-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  )
}
