import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/client'
import type { Product } from '@/lib/sanity/types'

export function formatINR(value: number) {
    return `₹${value.toLocaleString('en-IN')}`
}

export function getStrikePrice(p: Pick<Product, 'price' | 'compare_at_price' | 'originalPrice'>) {
    const candidate = p.compare_at_price ?? p.originalPrice
    return candidate && candidate > p.price ? candidate : undefined
}

export default function ProductCard({ product }: { product: Product }) {
    const image = product.images?.find((img) => Boolean(img?.asset?._ref || img?.asset?._id))
    const imageUrl = image ? urlForImage(image).width(600).height(600).fit('crop').url() : ''
    const strike = getStrikePrice(product)
    const outOfStock = product.inStock === false

    return (
        <Link
            href={`/product/${product.slug.current}`}
            className="group block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        >
            <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={imageUrl}
                        alt={image?.alt || product.title}
                        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${outOfStock ? 'opacity-50' : ''
                            }`}
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-100 p-4 text-neutral-400">
                        <svg
                            aria-hidden="true"
                            className="h-10 w-10 stroke-neutral-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                        </svg>
                        <span className="mt-1 text-xs text-neutral-400">No image</span>
                    </div>
                )}
                {product.discountBadge && !outOfStock ? (
                    <span className="absolute left-2 top-2 rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white shadow-sm">
                        {product.discountBadge}
                    </span>
                ) : null}
                {outOfStock ? (
                    <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-1 text-xs font-medium text-neutral-900 shadow-sm">
                        Out of stock
                    </span>
                ) : null}
            </div>
            <h3 className="mt-3 line-clamp-2 text-sm font-medium text-neutral-900 group-hover:text-neutral-700">
                {product.title}
            </h3>
            <p className="mt-1 text-sm">
                <span className="font-semibold text-neutral-900">{formatINR(product.price)}</span>
                {strike ? (
                    <span className="ml-2 text-neutral-500 line-through">{formatINR(strike)}</span>
                ) : null}
            </p>
        </Link>
    )
}
