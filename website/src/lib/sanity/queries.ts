import { groq } from 'next-sanity'

// Fetch all active products for the storefront
export const activeProductsQuery = groq`
  *[_type == "product" && is_active == true] | order(_createdAt desc) {
    _id,
    _type,
    title,
    slug,
    price,
    compare_at_price,
    images,
    bullet_points,
    delivery_estimate,
    is_active,
    category->{
      _id,
      title,
      slug
    }
  }
`

// Fetch single product by slug
export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    price,
    compare_at_price,
    images,
    bullet_points,
    description,
    delivery_estimate,
    is_active,
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

