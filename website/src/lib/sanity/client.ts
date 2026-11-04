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

export function urlForImage(source: SanityImage) {
  return imageBuilder.image(source)
}

