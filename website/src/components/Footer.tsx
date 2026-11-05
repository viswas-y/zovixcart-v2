import Link from 'next/link'
import type { Category } from '@/lib/sanity/types'

interface FooterProps {
    categories: Category[]
}

export default function Footer({ categories }: FooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 text-neutral-600">
            <div className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Brand line & Value Proposition */}
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-neutral-900">ZovixCart</h2>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                            Your trusted store for home and cleaning essentials across India. Cash on Delivery on all orders with hassle-free doorstep delivery.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-800">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
                            COD-first store for India
                        </div>
                    </div>

                    {/* Category Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                            Categories
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="inline-flex min-h-[36px] items-center text-neutral-600 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                                >
                                    All Products
                                </Link>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat._id}>
                                    <Link
                                        href={`/category/${cat.slug.current}`}
                                        className="inline-flex min-h-[36px] items-center text-neutral-600 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                                    >
                                        {cat.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Assurance */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                            Customer Promise
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                            <li className="flex items-center gap-2">
                                <span className="text-neutral-900 font-bold">✓</span> Cash on Delivery available
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-neutral-900 font-bold">✓</span> Direct WhatsApp order updates
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-neutral-900 font-bold">✓</span> Guest checkout — no account required
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="mt-12 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500 sm:flex sm:items-center sm:justify-between">
                    <p>© {currentYear} ZovixCart. All rights reserved.</p>
                    <p className="mt-2 sm:mt-0">Quality Home & Cleaning Essentials</p>
                </div>
            </div>
        </footer>
    )
}
