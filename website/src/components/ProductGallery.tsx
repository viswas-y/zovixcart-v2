'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { SanityImage } from '@/lib/sanity/types'
import { urlForImage, hasImageAsset } from '@/lib/sanity/client'

interface ProductGalleryProps {
  images: SanityImage[]
  title: string
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const validImages = (images || []).filter((img) => hasImageAsset(img))
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Touch swipe handling
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  // Focus trap refs
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const lightboxRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  const total = validImages.length

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total)
  }, [total])

  const openLightbox = () => {
    if (total === 0) return
    triggerRef.current = document.activeElement as HTMLButtonElement
    setIsLightboxOpen(true)
  }

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false)
    // Return focus to the trigger
    setTimeout(() => {
      triggerRef.current?.focus()
    }, 50)
  }, [])

  // Keyboard navigation & Focus trapping in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'Tab') {
        // Focus trap inside lightbox
        const focusable = lightboxRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Focus the close button on open
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLightboxOpen, closeLightbox, handlePrev, handleNext])

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
  }

  if (total === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[12px] border border-neutral-200 bg-neutral-100 text-neutral-400">
        <svg aria-hidden="true" className="h-12 w-12 stroke-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </div>
    )
  }

  const activeImage = validImages[activeIndex]
  const mainImageUrl = urlForImage(activeImage).width(1000).height(1000).fit('crop').quality(90).url()

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails: Row below on mobile, Vertical list at the side on desktop */}
      {total > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none md:flex-col md:overflow-y-auto md:max-h-[520px] md:pb-0">
          {validImages.map((img, idx) => {
            const isSelected = activeIndex === idx
            const thumbUrl = urlForImage(img).width(160).height(160).fit('crop').quality(80).url()
            return (
              <button
                key={img._key || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show image ${idx + 1} of ${total}`}
                aria-current={isSelected ? 'true' : undefined}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[12px] border-2 bg-neutral-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] sm:h-20 sm:w-20 ${
                  isSelected ? 'border-[#0A0A0A] ring-1 ring-[#0A0A0A]' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl}
                  alt={img.alt || `${title} thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      {/* Main Large Image Container */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-[12px] border border-neutral-200 bg-neutral-100">
        <button
          type="button"
          onClick={openLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-label={`Open full screen image ${activeIndex + 1} of ${total}`}
          className="group relative h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImageUrl}
            alt={activeImage.alt || title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {/* Zoom hint icon */}
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[12px] border border-neutral-200 bg-white/90 text-[#0A0A0A] shadow-md backdrop-blur-sm transition-opacity opacity-80 group-hover:opacity-100">
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
          </div>
        </button>

        {/* Counter Badge: "1 / N" */}
        {total > 1 && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-[12px] border border-neutral-700 bg-[#0A0A0A]/90 px-2.5 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-sm">
            {activeIndex + 1} / {total}
          </div>
        )}

        {/* Prev & Next Arrow Buttons on main image */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[12px] border border-neutral-200 bg-white/90 text-[#0A0A0A] shadow-md backdrop-blur-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[12px] border border-neutral-200 bg-white/90 text-[#0A0A0A] shadow-md backdrop-blur-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Full screen image viewer: ${title}`}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-4 text-white backdrop-blur-md"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Top Bar: Counter & Close Button */}
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold tracking-wide text-neutral-300">
              {activeIndex + 1} / {total}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeLightbox}
              aria-label="Close full-screen image (Escape)"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[12px] border border-neutral-700 bg-neutral-900 text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Centered Image */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlForImage(activeImage).width(1600).height(1600).fit('contain').quality(95).url()}
              alt={activeImage.alt || title}
              className="max-h-[82vh] max-w-full rounded-[12px] object-contain shadow-2xl"
            />
          </div>

          {/* Navigation Controls in Lightbox */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous full-screen image"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-[12px] border border-neutral-700 bg-neutral-900/80 text-white shadow-xl transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next full-screen image"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-[12px] border border-neutral-700 bg-neutral-900/80 text-white shadow-xl transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Bottom Title Bar */}
          <div className="pt-2 text-center text-xs text-neutral-400">
            <span className="font-medium text-neutral-200">{title}</span>
            <span className="hidden sm:inline"> — Press Escape to exit</span>
          </div>
        </div>
      )}
    </div>
  )
}

