import Link from 'next/link'
import type { Category } from '@/lib/sanity/types'
import { STORE_NAME, WHATSAPP_NUMBER, STORE_EMAIL, SUPPORT_HOURS } from '@/lib/config'

interface FooterProps {
    categories: Category[]
}

export default function Footer({ categories }: FooterProps) {
    const currentYear = new Date().getFullYear()
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need help with ZovixCart')}`

    return (
        <footer className="mt-auto border-t border-neutral-800 bg-[#0A0A0A] text-white">
            <div className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand line & Value Proposition */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold tracking-tight text-white">{STORE_NAME}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-400 max-w-sm">
                            Everyday utility essentials for Indian homes. Cash on Delivery across India with direct WhatsApp order support.
                        </p>

                        {/* Contact us info with wa.me and mailto links */}
                        <div className="mt-4 text-xs text-neutral-400 space-y-1">
                            <p className="font-semibold text-neutral-300">Contact us:</p>
                            <p>
                                WhatsApp:{' '}
                                <a
                                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white hover:underline focus:outline-none focus-visible:underline"
                                >
                                    +91 97473 62645
                                </a>
                            </p>
                            <p>
                                Email:{' '}
                                <a
                                    href={`mailto:${STORE_EMAIL}`}
                                    className="text-white hover:underline focus:outline-none focus-visible:underline"
                                >
                                    {STORE_EMAIL}
                                </a>
                                <span className="text-neutral-500"> ({SUPPORT_HOURS})</span>
                            </p>
                        </div>
                    </div>

                    {/* Category Links */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            Categories
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="inline-flex min-h-[36px] items-center text-neutral-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                >
                                    All Products
                                </Link>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat._id}>
                                    <Link
                                        href={`/category/${cat.slug.current}`}
                                        className="inline-flex min-h-[36px] items-center text-neutral-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                    >
                                        {cat.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links & WhatsApp Support */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            Help &amp; Orders
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/track"
                                    className="inline-flex min-h-[36px] items-center text-neutral-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                >
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cart"
                                    className="inline-flex min-h-[36px] items-center text-neutral-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                >
                                    View Cart
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="inline-flex min-h-[36px] items-center text-neutral-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-[36px] items-center text-neutral-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                >
                                    WhatsApp Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="mt-12 border-t border-neutral-800 pt-6 text-center text-xs text-neutral-500 sm:flex sm:items-center sm:justify-between">
                    <p>© {currentYear} {STORE_NAME}. All rights reserved.</p>
                    <p className="mt-2 sm:mt-0">Cash on Delivery across India</p>
                </div>
            </div>
        </footer>
    )
}
