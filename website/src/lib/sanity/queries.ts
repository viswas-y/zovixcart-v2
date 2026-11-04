import { groq } from 'next-sanity'

// Fetch all active products for the storefront (list / cards)
export const activeProductsQuery = groq`
  *[_type == "product" && is_active != false] | order(_createdAt desc) {
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
  }
`

// Fetch featured products (homepage / highlight sections)
export const featuredProductsQuery = groq`
  *[_type == "product" && is_active != false && isFeatured == true] | order(_createdAt desc) {
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
    inStock,
    isFeatured,
    rating,
    category->{
      _id,
      title,
      slug
    }
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