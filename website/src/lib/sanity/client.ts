import { createClient } from 'next-sanity'
import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImage } from './types'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})

const imageBuilder = createImageUrlBuilder({ projectId, dataset })

export function hasImageAsset(
  source: unknown
): source is SanityImage & { asset: { _ref: string } } {
  if (!source || typeof source !== 'object') return false
  const s = source as Record<string, unknown>
  const asset = s.asset as Record<string, unknown> | undefined
  return typeof asset?._ref === 'string' || typeof asset?._id === 'string'
}

export function urlForImage(source?: SanityImage | null) {
  if (!hasImageAsset(source)) {
    // Return a chainable fallback to prevent runtime crashes if an image is missing asset data
    const dummy: any = {
      width: () => dummy,
      height: () => dummy,
      fit: () => dummy,
      crop: () => dummy,
      quality: () => dummy,
      auto: () => dummy,
      url: () => '',
    }
    return dummy
  }
  return imageBuilder.image(source)
}

