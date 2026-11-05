'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { WHATSAPP_NUMBER } from '@/lib/config'

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
        router.push(`/order/${encodeURIComponent(clean)}`)
    }

    const whatsappHelpUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        'Hello ZovixCart, I need an update regarding my order.'
    )}`

    return (
        <main className="mx-auto max-w-xl px-4 py-16 text-neutral-800">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500">
                <ol className="flex items-center space-x-2">
                    <li>
                        <Link href="/" className="hover:text-neutral-900">
                            Home
                        </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li className="font-medium text-neutral-900" aria-current="page">
                        Track Order
                    </li>
                </ol>
            </nav>

            <header className="mb-8 border-b border-neutral-200 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    Track Your Order
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                    Enter your order number to review order confirmation and delivery details.
                </p>
            </header>

            <form onSubmit={handleTrack} className="space-y-4">
                <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-neutral-900">
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
                        placeholder="e.g. ZVX-20261105-XXXX"
                        className="mt-1 block min-h-[44px] w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 font-mono text-sm uppercase text-neutral-900 placeholder:normal-case placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
                    <p className="mt-1.5 text-xs text-neutral-500">
                        You can find this on your order confirmation screen or WhatsApp message.
                    </p>
                </div>

                <button
                    type="submit"
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                >
                    Track Order Details
                </button>
            </form>

            <div className="mt-10 rounded-lg border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-700">
                <h2 className="font-semibold text-neutral-900">Need quick help?</h2>
                <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                    If you don&apos;t have your order number, message our customer support team directly on WhatsApp with your registered mobile number:
                </p>
                <div className="mt-3">
                    <a
                        href={whatsappHelpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1EBE5D] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                        Contact on WhatsApp &rarr;
                    </a>
                </div>
            </div>
        </main>
    )
}
