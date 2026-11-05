'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/client'
import { formatINR } from '@/components/ProductCard'

interface HeroSectionProps {
    products: Product[]
}

export default function HeroSection({ products }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)

    // Detect prefers-reduced-motion setting
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mediaQuery.matches)

        function handleChange(e: MediaQueryListEvent) {
            setPrefersReducedMotion(e.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    // Auto-advance every 5 seconds unless paused or reduced motion is preferred
    useEffect(() => {
        if (isPaused || prefersReducedMotion || products.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length)
        }, 5000)

        return () => clearInterval(timer)
    }, [isPaused, prefersReducedMotion, products.length])

    function prevSlide() {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
    }

    function nextSlide() {
        setCurrentIndex((prev) => (prev + 1) % products.length)
    }

    function handleTouchStart(e: React.TouchEvent) {
        setIsPaused(true)
        touchStartX.current = e.targetTouches[0].clientX
    }

    function handleTouchMove(e: React.TouchEvent) {
        touchEndX.current = e.targetTouches[0].clientX
    }

    function handleTouchEnd() {
        setIsPaused(false)
        if (touchStartX.current === null || touchEndX.current === null) return
        const distance = touchStartX.current - touchEndX.current
        if (distance > 50) {
            nextSlide()
        } else if (distance < -50) {
            prevSlide()
        }
        touchStartX.current = null
        touchEndX.current = null
    }

    function scrollToProducts() {
        const el = document.getElementById('products')
        if (el) {
            el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
        }
    }

    return (
        <section
            aria-label="Welcome to ZovixCart"
            className="w-full bg-[#0A0A0A] text-white min-h-[80vh] md:min-h-[70vh] flex flex-col justify-between"
        >
            {/* Main Hero Content */}
            <div className="mx-auto max-w-6xl w-full px-4 py-10 sm:py-14 md:py-16 flex-1 flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
                    {/* Left: Headlines & Call to Actions */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/80 px-3.5 py-1 text-xs font-medium text-neutral-300 mb-5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            COD-first online store
                        </span>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                            Everyday essentials, delivered to your door
                        </h1>

                        <p className="mt-4 text-base sm:text-lg text-neutral-300 font-normal">
                            Cash on Delivery across India
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3.5">
                            <a
                                href="#products"
                                onClick={(e) => {
                                    e.preventDefault()
                                    scrollToProducts()
                                }}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                            >
                                Shop now
                            </a>

                            <Link
                                href="/track"
                                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-neutral-700 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900 hover:border-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                            >
                                Track order
                            </Link>
                        </div>
                    </div>

                    {/* Right: Product Slideshow */}
                    {products.length > 0 ? (
                        <div
                            className="lg:col-span-5 w-full max-w-md mx-auto"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
                                {/* Slides Carousel Track */}
                                <div
                                    className={`flex ${
                                        prefersReducedMotion ? '' : 'transition-transform duration-500 ease-out'
                                    }`}
                                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                                >
                                    {products.map((p, idx) => {
                                        const imgObj = p.images?.find((img) =>
                                            Boolean(img?.asset?._ref || img?.asset?._id)
                                        )
                                        const imgUrl = imgObj
                                            ? urlForImage(imgObj).width(700).height(700).fit('crop').url()
                                            : ''

                                        return (
                                            <div
                                                key={p._id}
                                                className="w-full flex-shrink-0 relative aspect-square bg-neutral-950"
                                                aria-hidden={currentIndex !== idx}
                                            >
                                                {imgUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={imgUrl}
                                                        alt={imgObj?.alt || p.title}
                                                        className="h-full w-full object-cover"
                                                        loading={idx === 0 ? 'eager' : 'lazy'}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                                                        No image
                                                    </div>
                                                )}

                                                {/* Slide Caption Overlay */}
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 sm:p-5">
                                                    <div className="flex items-end justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                                                                Featured Find
                                                            </span>
                                                            <h2 className="text-sm sm:text-base font-semibold text-white line-clamp-1 mt-0.5">
                                                                {p.title}
                                                            </h2>
                                                            <p className="text-sm font-bold text-white mt-1">
                                                                {formatINR(p.price)}
                                                            </p>
                                                        </div>

                                                        <Link
                                                            href={`/product/${p.slug.current}`}
                                                            className="inline-flex min-h-[44px] items-center rounded-md bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-neutral-900 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap"
                                                        >
                                                            View product &rarr;
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Previous / Next Buttons */}
                                {products.length > 1 ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={prevSlide}
                                            aria-label="Previous slide"
                                            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                        >
                                            <svg
                                                aria-hidden="true"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="2"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextSlide}
                                            aria-label="Next slide"
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                        >
                                            <svg
                                                aria-hidden="true"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="2"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </button>
                                    </>
                                ) : null}
                            </div>

                            {/* Dots Navigation */}
                            {products.length > 1 ? (
                                <div
                                    className="mt-3 flex items-center justify-center gap-1"
                                    role="tablist"
                                    aria-label="Slides navigation"
                                >
                                    {products.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            role="tab"
                                            aria-selected={currentIndex === i}
                                            aria-label={`Go to slide ${i + 1}`}
                                            onClick={() => setCurrentIndex(i)}
                                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                                        >
                                            <span
                                                className={`block h-1.5 rounded-full transition-all duration-300 ${
                                                    currentIndex === i
                                                        ? 'w-6 bg-white'
                                                        : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Bottom "Scroll to shop" Cue */}
            <div className="pb-4 pt-2 text-center">
                <button
                    type="button"
                    onClick={scrollToProducts}
                    aria-label="Scroll to products section"
                    className="group inline-flex min-h-[44px] items-center gap-2 text-xs font-medium text-neutral-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-3 py-1"
                >
                    <span>Scroll to shop</span>
                    <svg
                        aria-hidden="true"
                        className="h-4 w-4 animate-bounce text-neutral-400 group-hover:text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>
        </section>
    )
}
