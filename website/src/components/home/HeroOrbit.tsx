'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/sanity/types'
import { urlForImage, hasImageAsset } from '@/lib/sanity/client'
import { HERO_HEADLINE, HERO_SUBLINE } from '@/lib/config'

interface HeroOrbitProps {
  products: Product[]
}

interface OrbitItem {
  id: string
  title: string
  slug: string
  price: number
  imageUrl: string
}

export default function HeroOrbit({ products }: HeroOrbitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([])
  const overlaysRef = useRef<(HTMLDivElement | null)[]>([])
  const angleRef = useRef<number>(0)
  const isPausedRef = useRef<boolean>(false)
  const isDraggingRef = useRef<boolean>(false)
  const lastTouchXRef = useRef<number>(0)
  const lastTouchTimeRef = useRef<number>(0)
  const velocityRef = useRef<number>(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  // 1. Prepare at least 14 cards (repeating products without consecutive duplicates)
  const ringItems: OrbitItem[] = useMemo(() => {
    const valid = products
      .filter((p) => p && p.slug?.current)
      .map((p) => {
        const image = p.images?.find((img) => hasImageAsset(img)) || p.images?.[0]
        const imageUrl =
          image && hasImageAsset(image)
            ? urlForImage(image).width(360).height(480).fit('crop').quality(85).url()
            : ''
        return {
          id: p._id,
          title: p.title || 'Product',
          slug: p.slug.current,
          price: p.price || 0,
          imageUrl,
        }
      })
      .filter((item) => Boolean(item.imageUrl))

    if (valid.length === 0) return []

    const targetCount = Math.max(14, valid.length)
    const result: OrbitItem[] = []

    let i = 0
    while (result.length < targetCount) {
      const nextItem = valid[i % valid.length]
      result.push({
        ...nextItem,
        id: `${nextItem.id}-${result.length}`,
      })
      i++
    }

    // Ensure last card and first card are not the same product across circular boundary
    if (result.length > 2 && valid.length > 1) {
      if (result[result.length - 1].slug === result[0].slug) {
        const alt =
          valid.find(
            (v) =>
              v.slug !== result[0].slug &&
              v.slug !== result[result.length - 2].slug
          ) || valid[1]
        result.push({
          ...alt,
          id: `${alt.id}-${result.length}`,
        })
      }
    }

    return result
  }, [products])

  // 2. Prefers-reduced-motion listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // 3. Animation loop with RAF and hardware-accelerated transforms
  useEffect(() => {
    if (reducedMotion || ringItems.length === 0) return

    let animationFrameId: number
    const total = ringItems.length

    const updatePositions = () => {
      // Rotation & inertia handling
      if (isDraggingRef.current) {
        // Dragging manually
      } else if (Math.abs(velocityRef.current) > 0.00005) {
        // Apply inertia decay
        angleRef.current += velocityRef.current * 16
        velocityRef.current *= 0.92
        if (Math.abs(velocityRef.current) <= 0.00005) {
          velocityRef.current = 0
          isPausedRef.current = false
        }
      } else if (!isPausedRef.current) {
        // Continuous slow rotation: one full turn in ~50 seconds (0.0021 rad/frame at 60fps)
        angleRef.current += 0.0021
        if (angleRef.current >= Math.PI * 2) {
          angleRef.current -= Math.PI * 2
        }
      }

      const container = containerRef.current
      if (container) {
        const width = container.clientWidth
        const height = container.clientHeight
        const isMobile = width < 768

        // Ellipse center = center of the text block
        const centerX = width / 2
        const centerY = height / 2

        // Dimensions and radii
        let radiusX: number
        let radiusY: number
        let halfW: number
        let halfH: number
        const PEAK = isMobile ? 1.7 : 1.5
        const SIGMA = 0.55

        if (isMobile) {
          // Mobile: base card 96x128px, Rx ~ 0.65 x width, Ry ~ 270px
          halfW = 48
          halfH = 64
          radiusX = width * 0.65
          radiusY = Math.min(height * 0.4, 270)
        } else {
          // Desktop: base card 150x200px, Rx at least half text width (~340) + 200 = 540px+
          halfW = 75
          halfH = 100
          radiusX = Math.max(540, Math.min(width * 0.48, 680))
          radiusY = Math.min(height * 0.36, 250)
        }

        for (let i = 0; i < total; i++) {
          const el = itemsRef.current[i]
          const overlay = overlaysRef.current[i]
          if (!el) continue

          // Space cards evenly by angle (360 / number of cards)
          // Front of the ring is bottom center (theta = 0 rad)
          // With x = centerX + Rx * sin(theta) and y = centerY + Ry * cos(theta),
          // increasing theta moves cards from left to right across the front.
          const itemAngle = angleRef.current + (i * 2 * Math.PI) / total
          const x = centerX + radiusX * Math.sin(itemAngle)
          const y = centerY + radiusY * Math.cos(itemAngle)

          // Shortest angular distance from the front position (0 rad)
          let d = itemAngle % (2 * Math.PI)
          if (d > Math.PI) d -= 2 * Math.PI
          if (d < -Math.PI) d += 2 * Math.PI

          // Gaussian scale formula: scale = 1 + (PEAK - 1) * exp(-(d / SIGMA)^2)
          const scale = 1 + (PEAK - 1) * Math.exp(-Math.pow(d / SIGMA, 2))

          // Z-index from scale: enlarged card cleanly overlaps its neighbours (10 to 24)
          // Strictly below text layer (z-30)
          const zIndex = Math.round(10 + (scale - 1) * 20)

          // Update card transform
          el.style.transform = `translate3d(${x - halfW}px, ${y - halfH}px, 0px) scale(${scale.toFixed(3)})`
          el.style.zIndex = `${zIndex}`

          // Front card bottom overlay: fades in smoothly when scale > 1.35
          if (overlay) {
            if (scale > 1.35) {
              const overlayOpacity = Math.min(
                1,
                Math.max(0, (scale - 1.35) / (PEAK - 1.35))
              )
              overlay.style.opacity = overlayOpacity.toFixed(2)
            } else {
              overlay.style.opacity = '0'
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(updatePositions)
    }

    animationFrameId = requestAnimationFrame(updatePositions)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [reducedMotion, ringItems.length])

  // 4. Touch drag with inertia
  const handleTouchStart = (e: React.TouchEvent) => {
    isPausedRef.current = true
    isDraggingRef.current = true
    lastTouchXRef.current = e.touches[0].clientX
    lastTouchTimeRef.current = performance.now()
    velocityRef.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    const currentX = e.touches[0].clientX
    const now = performance.now()
    const dx = currentX - lastTouchXRef.current
    const dt = Math.max(1, now - lastTouchTimeRef.current)

    // Dragging rightwards rotates clockwise
    angleRef.current += dx * 0.005
    velocityRef.current = (dx / dt) * 0.005

    lastTouchXRef.current = currentX
    lastTouchTimeRef.current = now
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
    // Inertia will gradually decay in RAF loop and then resume auto-rotation
  }

  return (
    <section
      aria-label="Featured essentials showcase"
      className="relative w-full overflow-hidden bg-[#0A0A0A] text-white select-none h-[680px] min-h-[680px] md:h-[75vh] md:min-h-[620px] md:max-h-[880px]"
      onMouseEnter={() => {
        isPausedRef.current = true
      }}
      onMouseLeave={() => {
        isPausedRef.current = false
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={containerRef} className="relative h-full w-full">
        {/* Center Content: Headline, Subline, Action Buttons.
            Text layer is always above all images (z-30) */}
        <div className="relative z-30 flex h-full w-full flex-col items-center justify-center px-4 text-center pointer-events-none">
          <div className="mx-auto max-w-2xl pointer-events-auto">
            <h1 className="font-display font-extrabold tracking-tight text-white text-[clamp(2rem,9vw,2.75rem)] md:text-6xl sm:leading-[1.15]">
              {HERO_HEADLINE}
            </h1>
            <p className="mt-3 text-sm font-normal text-neutral-400 sm:mt-5 sm:text-lg md:text-xl">
              {HERO_SUBLINE}
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5 sm:mt-8">
              <a
                href="#products"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-white px-7 py-3 text-sm font-bold text-[#0A0A0A] shadow-md transition-colors hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Shop now
              </a>
              <Link
                href="/track"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-neutral-700 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-neutral-400 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Track order
              </Link>
            </div>
          </div>
        </div>

        {/* Orbit Ring: Rendered if reduced-motion is FALSE */}
        {!reducedMotion && ringItems.length > 0 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {ringItems.map((item, idx) => (
              <Link
                key={item.id}
                ref={(el) => {
                  itemsRef.current[idx] = el
                }}
                href={`/product/${item.slug}`}
                aria-label={`View ${item.title} - ₹${item.price}`}
                className="group absolute top-0 left-0 flex flex-col items-center pointer-events-auto will-change-transform focus:outline-none"
                style={{
                  transform: 'translate3d(-1000px, -1000px, 0px)',
                  opacity: 1,
                }}
                onFocus={() => {
                  isPausedRef.current = true
                }}
                onBlur={() => {
                  isPausedRef.current = false
                }}
              >
                {/* 3:4 portrait card with thin white frame and single radius (12px) */}
                <div className="relative flex h-[128px] w-[96px] flex-col overflow-hidden rounded-[12px] border border-white/80 bg-white p-1 shadow-xl transition-shadow group-hover:ring-2 group-hover:ring-white group-focus-visible:ring-2 group-focus-visible:ring-white md:h-[200px] md:w-[150px] md:p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading={idx < 3 ? 'eager' : 'lazy'}
                    className="h-full w-full rounded-[8px] object-cover"
                  />

                  {/* Front card overlay: Dark gradient fading in with scale > 1.35 */}
                  <div
                    ref={(el) => {
                      overlaysRef.current[idx] = el
                    }}
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end rounded-b-[11px] bg-gradient-to-t from-black/95 via-black/75 to-transparent p-2 text-white transition-opacity duration-150 sm:p-2.5"
                    style={{ opacity: 0 }}
                  >
                    <p className="truncate text-[11px] font-semibold text-white sm:text-xs">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between text-[11px] sm:text-xs">
                      <span className="font-bold text-white">₹{item.price}</span>
                      <span className="text-[10px] font-medium text-neutral-300">
                        View &gt;
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Fallback for prefers-reduced-motion: Static horizontally scrollable row */}
        {reducedMotion && ringItems.length > 0 && (
          <div className="absolute right-0 bottom-14 left-0 z-20 px-4">
            <div className="mx-auto flex max-w-5xl gap-4 overflow-x-auto pb-4 pt-2 scrollbar-none">
              {ringItems.map((item, idx) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="group flex-shrink-0 focus:outline-none"
                  aria-label={`View ${item.title} - ₹${item.price}`}
                >
                  <div className="flex h-[128px] w-[96px] items-center justify-center overflow-hidden rounded-[12px] border border-white/80 bg-white p-1 shadow-md sm:h-[160px] sm:w-[120px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading={idx < 3 ? 'eager' : 'lazy'}
                      className="h-full w-full rounded-[8px] object-cover"
                    />
                  </div>
                  <p className="mt-1.5 max-w-[96px] truncate text-center text-xs text-neutral-300 group-hover:text-white sm:max-w-[120px]">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* "Scroll to shop" cue at bottom */}
        <div className="absolute right-0 bottom-3 left-0 z-30 flex justify-center">
          <a
            href="#products"
            className="group flex min-h-[44px] flex-col items-center justify-center gap-1 text-xs font-medium text-neutral-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded-[12px] px-3"
            aria-label="Scroll down to browse products"
          >
            <span>Scroll to shop</span>
            <svg
              className="h-4 w-4 animate-bounce text-neutral-400 transition-colors group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
