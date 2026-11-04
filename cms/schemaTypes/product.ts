import { defineArrayMember, defineField, defineType } from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'details', title: 'Product Details', default: true },
    { name: 'pricing', title: 'Pricing & Availability' },
    { name: 'reviewsGroup', title: 'Reviews & Ratings' },
    { name: 'internal', title: 'Internal Operations' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'details',
      validation: (rule) => rule.required().error('Product title is required'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required().error('Product slug is required'),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'details',
      validation: (rule) => rule.required().error('Category reference is required'),
    }),
    defineField({
      name: 'price',
      title: 'Price (INR)',
      type: 'number',
      description: 'Current selling price in INR',
      group: 'pricing',
      validation: (rule) => rule.required().positive().error('Price must be a positive number'),
    }),
    defineField({
      name: 'originalPrice',
      title: 'Original Price (INR)',
      type: 'number',
      description:
        'Original / struck-through price in INR from existing product database.',
      group: 'pricing',
    }),
    defineField({
      name: 'compare_at_price',
      title: 'Compare At Price (INR)',
      type: 'number',
      description:
        'Struck-through price in INR (optional). Note: Struck-through price will only display on the storefront if this field is set.',
      group: 'pricing',
      validation: (rule) =>
        rule.custom((compareAtPrice, context) => {
          if (compareAtPrice === undefined || compareAtPrice === null) return true
          const doc = context.document as { price?: number } | undefined
          if (doc?.price !== undefined && compareAtPrice <= doc.price) {
            return 'Compare-at price must be greater than selling price'
          }
          return true
        }),
    }),
    defineField({
      name: 'discountBadge',
      title: 'Discount Badge',
      type: 'string',
      group: 'pricing',
      description: 'Optional discount badge text (e.g., "27% OFF")',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      group: 'details',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Alternative text for accessibility & SEO (optional)',
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1).error('At least one product image is required'),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      group: 'details',
      description: 'Brief product summary for cards, search, and previews',
    }),
    defineField({
      name: 'keyFeatures',
      title: 'Key Features',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Key product features / bullet points',
    }),
    defineField({
      name: 'bullet_points',
      title: 'Bullet Points',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Key product highlights or specifications (list of strings)',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'details',
      of: [
        defineArrayMember({
          type: 'block',
        }),
      ],
      description: 'Product description and detailed content (portable text blocks)',
    }),
    defineField({
      name: 'delivery_estimate',
      title: 'Delivery Estimate',
      type: 'string',
      group: 'details',
      initialValue: '3-5 business days',
      description: 'Delivery timeframe shown to customers (e.g., 3-5 business days)',
    }),
    defineField({
      name: 'is_active',
      title: 'Is Active',
      type: 'boolean',
      group: 'pricing',
      initialValue: true,
      description: 'Toggle whether this product is visible in the storefront',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      group: 'pricing',
      initialValue: true,
      description: 'Whether this product is currently in stock',
    }),
    defineField({
      name: 'stockCount',
      title: 'Stock Count',
      type: 'number',
      group: 'pricing',
      description: 'Available inventory count',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Is Featured',
      type: 'boolean',
      group: 'details',
      initialValue: false,
      description: 'Feature this product on homepage or highlight sections',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      group: 'reviewsGroup',
      description: 'Product rating (e.g., 5)',
    }),
    defineField({
      name: 'reviews',
      title: 'Reviews',
      type: 'array',
      group: 'reviewsGroup',
      description: 'Customer reviews from the database',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'productReview',
          title: 'Product Review',
          fields: [
            defineField({
              name: 'name',
              title: 'Reviewer Name',
              type: 'string',
            }),
            defineField({
              name: 'rating',
              title: 'Rating',
              type: 'number',
              validation: (rule) => rule.min(1).max(5),
            }),
            defineField({
              name: 'comment',
              title: 'Review Comment',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'date',
              title: 'Date',
              type: 'string',
            }),
            defineField({
              name: 'verified',
              title: 'Verified Buyer',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'comment',
              rating: 'rating',
            },
            prepare({ title, subtitle, rating }) {
              return {
                title: `${title || 'Anonymous'} (${rating ? `${rating} ★` : 'No rating'})`,
                subtitle,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'supplier_name',
      title: 'Supplier Name (Internal)',
      type: 'string',
      group: 'internal',
      description: 'Internal reference: Supplier or sourcing vendor name',
    }),
    defineField({
      name: 'supplier_cost',
      title: 'Supplier Cost (Internal)',
      type: 'number',
      group: 'internal',
      description: 'Internal reference: Wholesale or sourcing cost in INR',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      media: 'images.0',
      isActive: 'is_active',
      inStock: 'inStock',
    },
    prepare({ title, price, media, isActive, inStock }) {
      const stockInfo = inStock === false ? ' · Out of Stock' : ''
      const status = isActive === false ? ' (Inactive)' : ''
      return {
        title: title || 'Untitled Product',
        subtitle: `${price ? `₹${price}` : 'No price set'}${stockInfo}${status}`,
        media,
      }
    },
  },
})
