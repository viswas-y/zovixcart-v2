'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { WHATSAPP_NUMBER, STORE_NAME } from '@/lib/config'

export default function TrackOrderPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')

  function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    const clean = orderNumber.trim().toUpperCase()
    if (!clean) {
      setError('Please enter your order number')
      return
    }
    const normalized = clean.replace(/\s+/g, '-')
    router.push(`/order/${encodeURIComponent(normalized)}`)
  }

  const whatsappHelpUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello ${STORE_NAME}, I need an update regarding my order.`
  )}`

  return (
    <main className="mx-auto max-w-xl px-4 py-12 text-[#0A0A0A]">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
          <li>
            <Link href="/" className="hover:text-[#0A0A0A] focus:outline-none focus-visible:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li className="font-semibold text-[#0A0A0A]" aria-current="page">
            Track Order
          </li>
        </ol>
      </nav>

      <header className="mb-8 border-b border-neutral-200 pb-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
          Track Your Order
        </h1>
        <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
          Enter your order number to review order confirmation and delivery status.
        </p>
      </header>

      <form onSubmit={handleTrack} className="space-y-4">
        <div>
          <label htmlFor="orderNumber" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
            Order Number
          </label>
          <input
            id="orderNumber"
            type="text"
            required
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value)
              if (error) setError('')
            }}
            placeholder="ZVX-20261105-XXXX"
            className="mt-1.5 block min-h-[44px] w-full rounded-[12px] border border-neutral-300 bg-white px-3.5 py-2.5 font-mono text-sm uppercase text-[#0A0A0A] placeholder:normal-case placeholder:text-neutral-400 focus:border-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm"
          />
          {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
          <p className="mt-1.5 text-[11px] text-neutral-500">
            You can find this on your order confirmation screen or WhatsApp message.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[12px] bg-[#0A0A0A] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2"
        >
          Track Order Details
        </button>
      </form>

      <div className="mt-10 rounded-[12px] border border-neutral-200 bg-neutral-50/70 p-5 text-xs sm:text-sm text-neutral-700 shadow-sm">
        <h2 className="font-bold text-[#0A0A0A]">Need quick help?</h2>
        <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
          If you don&apos;t have your order number, message our customer support team directly on WhatsApp with your mobile number:
        </p>
        <div className="mt-3">
          <a
            href={whatsappHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-[#25D366] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#1EBE5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            Contact on WhatsApp &rarr;
          </a>
        </div>
      </div>
    </main>
  )
}
