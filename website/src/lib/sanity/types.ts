export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
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

export interface Product {
  _id: string
  _type: 'product'
  title: string
  slug: {
    current: string
  }
  category: Category
  price: number
  compare_at_price?: number
  images: SanityImage[]
  bullet_points?: string[]
  description?: string
  delivery_estimate?: string
  is_active: boolean
  supplier_name?: string
  supplier_cost?: number
}

