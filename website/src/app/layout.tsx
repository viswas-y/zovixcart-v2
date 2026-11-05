import type { Metadata } from 'next'
import './globals.css'
import { client } from '@/lib/sanity/client'
import { categoriesQuery } from '@/lib/sanity/queries'
import type { Category } from '@/lib/sanity/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/components/CartProvider'

export const metadata: Metadata = {
  title: 'ZovixCart | Home & Cleaning Essentials',
  description: 'COD-first online store for Home & Cleaning essentials in India.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const categories = await client.fetch<Category[]>(categoriesQuery).catch(() => [])

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased">
        <CartProvider>
          <Header categories={categories} />
          <div className="flex-1">{children}</div>
          <Footer categories={categories} />
        </CartProvider>
      </body>
    </html>
  )
}
