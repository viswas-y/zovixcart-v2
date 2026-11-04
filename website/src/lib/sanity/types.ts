export interface SanityImage {
  _key?: string
  _type: 'image'
  asset?: {
    _ref?: string
    _id?: string
    _type?: 'reference'
  }
  alt?: string
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface Category {
  _id: string
  _type: 'category'
  title: string
  slug: {
    current: string
  }
}

// Minimal Portable Text types (no extra package needed)
export interface PortableTextSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}

export interface PortableTextBlock {
  _type: 'block'
  _key: string
  style?: string
  listItem?: string
  level?: number
  children: PortableTextSpan[]
  markDefs?: Array<{ _key: string; _type: string;[key: string]: unknown }>
}

export interface ProductReview {
  _key: string
  name?: string
  rating?: number
  comment?: string
  date?: string
  verified?: boolean
}

export interface Product {
  _id: string
  _type: 'product'
  title: string
  slug: {
    current: string
  }
  category: Category
  price: number
  originalPrice?: number
  compare_at_price?: number
  discountBadge?: string
  images: SanityImage[]
  shortDescription?: string
  keyFeatures?: string[]
  bullet_points?: string[]
  body?: PortableTextBlock[]
  delivery_estimate?: string
  is_active: boolean
  inStock?: boolean
  stockCount?: number
  isFeatured?: boolean
  rating?: number
  reviews?: ProductReview[]
  supplier_name?: string
  supplier_cost?: number
}