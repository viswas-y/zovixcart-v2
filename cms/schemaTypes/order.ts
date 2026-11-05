import { defineArrayMember, defineField, defineType } from 'sanity'

export const orderType = defineType({
  name: 'order',
  title: 'Orders',
  type: 'document',
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          { title: 'New (Pending Confirmation)', value: 'new' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number (10 digits)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Delivery Address',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pincode',
      title: 'Pincode (6 digits)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'notes',
      title: 'Order / Delivery Notes',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'items',
      title: 'Ordered Items',
      type: 'array',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'orderItem',
          title: 'Order Item',
          fields: [
            defineField({
              name: 'productRef',
              title: 'Product Reference',
              type: 'reference',
              to: [{ type: 'product' }],
            }),
            defineField({
              name: 'title',
              title: 'Product Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Unit Price (INR)',
              type: 'number',
              validation: (rule) => rule.required().positive(),
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (rule) => rule.required().positive().integer(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              price: 'price',
              quantity: 'quantity',
            },
            prepare({ title, price, quantity }) {
              return {
                title: title || 'Item',
                subtitle: `${quantity || 1} × ₹${price || 0} = ₹${(quantity || 1) * (price || 0)}`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'subtotal',
      title: 'Subtotal (INR)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'deliveryFee',
      title: 'Delivery Fee (INR)',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'total',
      title: 'Total Amount (INR)',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Created Date, Newest',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      customerName: 'customerName',
      total: 'total',
      status: 'status',
      createdAt: 'createdAt',
    },
    prepare({ orderNumber, customerName, total, status, createdAt }) {
      const dateStr = createdAt ? new Date(createdAt).toLocaleDateString('en-IN') : ''
      return {
        title: `${orderNumber || 'Order'} · ₹${total || 0}`,
        subtitle: `${customerName || 'Customer'} · ${status?.toUpperCase() || 'NEW'} · ${dateStr}`,
      }
    },
  },
})
