import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZovixCart | Home & Cleaning Essentials',
  description: 'COD-first online store for Home & Cleaning essentials in India.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

