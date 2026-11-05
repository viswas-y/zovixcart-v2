'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/lib/sanity/types'

interface HeaderProps {
    categories: Category[]
}

export default function Header({ categories }: HeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Keep search input synced with URL when on /search page
    useEffect(() => {
        const q = searchParams.get('q') || ''
        if (pathname === '/search') {
            setSearchQuery(q)
        }
    }, [pathname, searchParams])

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
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
            {/* Top Bar */}
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Left: Mobile Hamburger & Brand Logo */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={isDrawerOpen}
                            aria-controls="mobile-category-drawer"
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 md:hidden"
                        >
                            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>

                        <Link
                            href="/"
                            className="inline-flex min-h-[44px] items-center text-xl font-bold tracking-tight text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 sm:text-2xl"
                        >
                            ZovixCart
                        </Link>
                    </div>

                    {/* Middle: Desktop Search Bar */}
                    <div className="hidden flex-1 justify-center md:flex">
                        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md" role="search">
                            <label htmlFor="desktop-search-input" className="sr-only">
                                Search home essentials, cleaners, products
                            </label>
                            <input
                                id="desktop-search-input"
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search home and cleaning essentials..."
                                className="min-h-[44px] w-full rounded-full border border-neutral-300 bg-neutral-50 py-2 pl-10 pr-10 text-sm text-neutral-900 transition placeholder:text-neutral-500 hover:border-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                            />
                            <button
                                type="submit"
                                aria-label="Submit search"
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 focus:outline-none"
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

                    {/* Right: Cash on delivery trust pill / badge */}
                    <div className="flex items-center">
                        <span className="hidden items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 sm:inline-flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            Cash on Delivery
                        </span>
                    </div>
                </div>

                {/* Mobile Search Row (Always visible, full-width) */}
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
                            className="min-h-[44px] w-full rounded-md border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
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

                {/* Desktop Categories Horizontal Bar */}
                {categories.length > 0 ? (
                    <nav
                        aria-label="Categories navigation"
                        className="hidden border-t border-neutral-100 py-2 md:flex md:items-center md:gap-1 md:overflow-x-auto"
                    >
                        <Link
                            href="/"
                            className={`inline-flex min-h-[40px] items-center rounded-md px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                                pathname === '/'
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
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
                                    className={`inline-flex min-h-[40px] items-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                                        isActive
                                            ? 'bg-neutral-900 text-white'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
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
                        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
                        aria-hidden="true"
                        onClick={() => setIsDrawerOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative flex w-full max-w-xs flex-col bg-white shadow-xl">
                        {/* Drawer Header */}
                        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
                            <span className="text-lg font-bold text-neutral-900">Browse Categories</span>
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                aria-label="Close navigation menu"
                                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                            >
                                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Category List */}
                        <nav aria-label="Mobile categories" className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-1">
                                <Link
                                    href="/"
                                    onClick={() => setIsDrawerOpen(false)}
                                    className={`flex min-h-[44px] items-center rounded-md px-3 py-2 text-base font-medium transition ${
                                        pathname === '/'
                                            ? 'bg-neutral-900 text-white'
                                            : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
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
                                            className={`flex min-h-[44px] items-center rounded-md px-3 py-2 text-base font-medium transition ${
                                                isActive
                                                    ? 'bg-neutral-900 text-white'
                                                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                                            }`}
                                        >
                                            {cat.title}
                                        </Link>
                                    )
                                })}
                            </div>
                        </nav>

                        {/* Drawer Footer Notice */}
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
