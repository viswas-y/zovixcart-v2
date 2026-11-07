import type { Product } from '@/lib/sanity/types'

export function formatINR(value?: number | null): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0'
  return `₹${value.toLocaleString('en-IN')}`
}

export function getStrikePrice(p: Pick<Product, 'price' | 'compare_at_price' | 'originalPrice'>): number | undefined {
  const candidate = p.compare_at_price ?? p.originalPrice
  return candidate && candidate > p.price ? candidate : undefined
}

