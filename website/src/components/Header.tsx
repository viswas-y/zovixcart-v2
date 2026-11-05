'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/lib/sanity/types'
import { useCart } from '@/components/CartProvider'
import { STORE_NAME } from '@/lib/config'

function SearchParamsSync({
    pathname,
    setSearchQuery,
}: {
    pathname: string
    setSearchQuery: (q: string) => void
}) {
    const searchParams = useSearchParams()
    useEffect(() => {
        const q = searchParams.get('q') || ''
        if (pathname === '/search') {
            setSearchQuery(q)
        }
    }, [pathname, searchParams, setSearchQuery])
    return null
}

interface HeaderProps {
    categories: Category[]
}

export default function Header({ categories }: HeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { totalCount, isLoaded } = useCart()

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Handle Escape key to close mobile drawer
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && isDrawerOpen) {
                setIsDrawerOpen(false)
            }
        }
        if (isDrawerOpen) {
            window.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isDrawerOpen])

    function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const trimmed = searchQuery.trim()
        if (trimmed) {
            router.push(`/search?q=${encodeURIComponent(trimmed)}`)
        } else {
            router.push('/search')
        }
    }

    return (
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
            <Suspense fallback={null}>
                <SearchParamsSync pathname={pathname} setSearchQuery={setSearchQuery} />
            </Suspense>
            <div className="mx-auto max-w-6xl px-4">
                {/* Top Row: Mobile Menu + Logo + Desktop Search + Actions */}
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Left: Mobile Hamburger & Logo */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={isDrawerOpen}
                            aria-controls="mobile-category-drawer"
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-[#0A0A0A] hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] md:hidden"
                        >
                            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>

                        <Link
                            href="/"
                            className="inline-flex min-h-[44px] items-center text-xl font-bold tracking-tight text-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] sm:text-2xl"
                        >
                            {STORE_NAME}
                        </Link>
                    </div>

                    {/* Middle: Desktop Search Bar */}
                    <div className="hidden flex-1 justify-center md:flex">
                        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md" role="search">
                            <label htmlFor="desktop-search-input" className="sr-only">
                                Search essentials
                            </label>
                            <input
                                id="desktop-search-input"
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search home and cleaning essentials..."
                                className="min-h-[44px] w-full rounded border border-neutral-300 bg-white py-2 pl-10 pr-10 text-sm text-[#0A0A0A] placeholder:text-neutral-500 hover:border-neutral-400 focus:border-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
                            />
                            <button
                                type="submit"
                                aria-label="Submit search"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-[#0A0A0A] focus:outline-none"
                            >
                                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </button>
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Clear search input"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 focus:outline-none"
                                >
                                    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ) : null}
                        </form>
                    </div>

                    {/* Right: Track order & Cart Icon */}
                    <div className="flex items-center gap-1 sm:gap-3">
                        <Link
                            href="/track"
                            className="hidden items-center rounded px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 hover:text-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] sm:inline-flex min-h-[44px]"
                        >
                            Track Order
                        </Link>

                        <Link
                            href="/cart"
                            aria-label={`Shopping cart${totalCount > 0 ? ` with ${totalCount} items` : ' is empty'}`}
                            className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-[#0A0A0A] hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
                        >
                            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                            {isLoaded && totalCount > 0 ? (
                                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0A0A0A] px-1 text-[11px] font-bold text-white shadow-sm">
                                    {totalCount > 99 ? '99+' : totalCount}
                                </span>
                            ) : null}
                        </Link>
                    </div>
                </div>

                {/* Mobile Search Row (Full width row on mobile) */}
                <div className="pb-3 md:hidden">
                    <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
                        <label htmlFor="mobile-search-input" className="sr-only">
                            Search products
                        </label>
                        <input
                            id="mobile-search-input"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search home & cleaning essentials..."
                            className="min-h-[44px] w-full rounded border border-neutral-300 bg-white py-2.5 pl-10 pr-10 text-sm text-[#0A0A0A] placeholder:text-neutral-500 focus:border-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
                        />
                        <button
                            type="submit"
                            aria-label="Submit search"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                        >
                            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                            >
                                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        ) : null}
                    </form>
                </div>

                {/* Desktop Categories Horizontal Navigation */}
                {categories.length > 0 ? (
                    <nav
                        aria-label="Categories navigation"
                        className="hidden border-t border-neutral-100 py-2 md:flex md:items-center md:gap-1 md:overflow-x-auto"
                    >
                        <Link
                            href="/"
                            className={`inline-flex min-h-[40px] items-center rounded px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                                pathname === '/'
                                    ? 'bg-[#0A0A0A] text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-[#0A0A0A]'
                            }`}
                        >
                            All Products
                        </Link>
                        {categories.map((cat) => {
                            const isActive = pathname === `/category/${cat.slug.current}`
                            return (
                                <Link
                                    key={cat._id}
                                    href={`/category/${cat.slug.current}`}
                                    className={`inline-flex min-h-[40px] items-center whitespace-nowrap rounded px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                                        isActive
                                            ? 'bg-[#0A0A0A] text-white'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-[#0A0A0A]'
                                    }`}
                                >
                                    {cat.title}
                                </Link>
                            )
                        })}
                    </nav>
                ) : null}
            </div>

            {/* Mobile Navigation Drawer */}
            {isDrawerOpen ? (
                <div
                    id="mobile-category-drawer"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Categories navigation menu"
                    className="fixed inset-0 z-50 flex md:hidden"
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 transition-opacity"
                        aria-hidden="true"
                        onClick={() => setIsDrawerOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative flex w-full max-w-xs flex-col bg-white shadow-2xl">
                        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
                            <span className="text-lg font-bold text-[#0A0A0A]">{STORE_NAME}</span>
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                aria-label="Close navigation menu"
                                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-neutral-600 hover:bg-neutral-100 hover:text-[#0A0A0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
                            >
                                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-1">
                                <Link
                                    href="/cart"
                                    onClick={() => setIsDrawerOpen(false)}
                                    className={`flex min-h-[44px] items-center justify-between rounded px-3 py-2 text-base font-medium transition ${
                                        pathname === '/cart'
                                            ? 'bg-[#0A0A0A] text-white'
                                            : 'text-[#0A0A0A] hover:bg-neutral-100'
                                    }`}
                                >
                                    <span>My Cart</span>
                                    {isLoaded && totalCount > 0 ? (
                                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                                            pathname === '/cart' ? 'bg-white text-[#0A0A0A]' : 'bg-[#0A0A0A] text-white'
                                        }`}>
                                            {totalCount}
                                        </span>
                                    ) : null}
                                </Link>

                                <Link
                                    href="/track"
                                    onClick={() => setIsDrawerOpen(false)}
                                    className={`flex min-h-[44px] items-center rounded px-3 py-2 text-base font-medium transition ${
                                        pathname === '/track'
                                            ? 'bg-[#0A0A0A] text-white'
                                            : 'text-[#0A0A0A] hover:bg-neutral-100'
                                    }`}
                                >
                                    Track Order
                                </Link>

                                <div className="my-2 border-t border-neutral-100 pt-2">
                                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                        Categories
                                    </p>
                                    <Link
                                        href="/"
                                        onClick={() => setIsDrawerOpen(false)}
                                        className={`flex min-h-[44px] items-center rounded px-3 py-2 text-base font-medium transition ${
                                            pathname === '/'
                                                ? 'bg-[#0A0A0A] text-white'
                                                : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#0A0A0A]'
                                        }`}
                                    >
                                        All Products
                                    </Link>

                                    {categories.map((cat) => {
                                        const isActive = pathname === `/category/${cat.slug.current}`
                                        return (
                                            <Link
                                                key={cat._id}
                                                href={`/category/${cat.slug.current}`}
                                                onClick={() => setIsDrawerOpen(false)}
                                                className={`flex min-h-[44px] items-center rounded px-3 py-2 text-base font-medium transition ${
                                                    isActive
                                                        ? 'bg-[#0A0A0A] text-white'
                                                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#0A0A0A]'
                                                }`}
                                            >
                                                {cat.title}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </nav>

                        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                            <p className="text-xs text-neutral-600">
                                Cash on Delivery available on all orders across India.
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    )
}
