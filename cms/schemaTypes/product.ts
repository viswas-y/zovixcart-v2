import { defineArrayMember, defineField, defineType } from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'details', title: 'Product Details', default: true },
    { name: 'pricing', title: 'Pricing & Availability' },
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
              description: 'Alternative text for accessibility & SEO (required for every image)',
              validation: (rule) =>
                rule.required().error('Alt text is required for every product image'),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1).error('At least one product image is required'),
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
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'details',
      rows: 5,
      description: 'Detailed product description',
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
    },
    prepare({ title, price, media, isActive }) {
      return {
        title: title || 'Untitled Product',
        subtitle: `${price ? `₹${price}` : 'No price set'} ${isActive === false ? '(Inactive)' : ''}`,
        media,
      }
    },
  },
})

