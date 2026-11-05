import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import { client } from '@/lib/sanity/client'
import { categoriesQuery } from '@/lib/sanity/queries'
import type { Category } from '@/lib/sanity/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { CartProvider } from '@/components/CartProvider'
import { STORE_NAME } from '@/lib/config'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${STORE_NAME} | Home & Cleaning Essentials`,
  description: 'COD-first online store for Home & Cleaning essentials in India.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const categories = await client.fetch<Category[]>(categoriesQuery).catch(() => [])

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-white text-[#0A0A0A] antialiased font-sans">
        <CartProvider>
          <Header categories={categories} />
          <div className="flex-1">{children}</div>
          <Footer categories={categories} />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  )
}
