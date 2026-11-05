import { groq } from 'next-sanity'

// Common projection fields for product cards and listings
const productCardFields = groq`
  _id,
  _type,
  title,
  slug,
  price,
  originalPrice,
  compare_at_price,
  discountBadge,
  images,
  shortDescription,
  bullet_points,
  keyFeatures,
  delivery_estimate,
  is_active,
  inStock,
  isFeatured,
  rating,
  category->{
    _id,
    title,
    slug
  }
`

// Fetch all active products for the storefront (list / cards)
export const activeProductsQuery = groq`
  *[_type == "product" && is_active != false] | order(_createdAt desc) {
    ${productCardFields}
  }
`

// Fetch featured products (homepage / highlight sections)
export const featuredProductsQuery = groq`
  *[_type == "product" && is_active != false && isFeatured == true] | order(_createdAt desc) {
    ${productCardFields}
  }
`

// Fetch single product by slug (product detail page)
export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    price,
    originalPrice,
    compare_at_price,
    discountBadge,
    images,
    shortDescription,
    keyFeatures,
    bullet_points,
    body,
    delivery_estimate,
    is_active,
    inStock,
    stockCount,
    isFeatured,
    rating,
    reviews,
    category->{
      _id,
      title,
      slug
    }
  }
`

// Fetch all categories
export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    _type,
    title,
    slug
  }
`

// Fetch single category by slug
export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug
  }
`

/**
 * Builds a dynamic query for products by category with sorting and stock filter.
 * Uses `is_active != false` per project rules.
 */
export function buildCategoryProductsQuery(sort?: string, inStockOnly?: boolean) {
  const stockFilter = inStockOnly ? ' && inStock != false' : ''
  let orderClause = 'order(_createdAt desc)'
  if (sort === 'price-asc') {
    orderClause = 'order(price asc)'
  } else if (sort === 'price-desc') {
    orderClause = 'order(price desc)'
  }

  return groq`
    *[_type == "product" && is_active != false && category->slug.current == $slug${stockFilter}] | ${orderClause} {
      ${productCardFields}
    }
  `
}

/**
 * Builds a dynamic search query across title, shortDescription, and category title.
 * Uses trailing wildcard match with `is_active != false`.
 */
export function buildSearchProductsQuery(sort?: string, inStockOnly?: boolean) {
  const stockFilter = inStockOnly ? ' && inStock != false' : ''
  let orderClause = 'order(_createdAt desc)'
  if (sort === 'price-asc') {
    orderClause = 'order(price asc)'
  } else if (sort === 'price-desc') {
    orderClause = 'order(price desc)'
  }

  return groq`
    *[_type == "product" && is_active != false && [title, shortDescription, category->title] match $term${stockFilter}] | ${orderClause} {
      ${productCardFields}
    }
  `
}
