import type { Metadata } from 'next'
import Link from 'next/link'
import FAQAccordion from '@/components/FAQAccordion'
import { FAQ_ITEMS } from '@/lib/faq'
import { STORE_NAME } from '@/lib/config'

export const metadata: Metadata = {
  title: `Frequently Asked Questions | ${STORE_NAME}`,
  description: 'Find quick answers about ordering, cash on delivery, shipping, tracking, and cancellations.',
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-neutral-500">
            <li>
              <Link href="/" className="hover:text-[#0A0A0A] focus:outline-none focus-visible:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[#0A0A0A]">
              FAQ
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            Everything you need to know about shopping with {STORE_NAME}, cash on delivery, and our policies.
          </p>
        </div>

        {/* FAQ Accordion */}
        <FAQAccordion items={FAQ_ITEMS} />

        {/* Contact fallback block */}
        <div className="mt-10 rounded-[12px] border border-neutral-200 bg-neutral-50 p-6 text-center sm:p-8">
          <h2 className="font-display text-base font-bold text-[#0A0A0A] sm:text-lg">
            Still have questions?
          </h2>
          <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
            Our WhatsApp support is available to assist you with active orders and inquiries.
          </p>
          <div className="mt-4">
            <Link
              href="/track"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-[#0A0A0A] shadow-sm transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
            >
              Track an existing order
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

