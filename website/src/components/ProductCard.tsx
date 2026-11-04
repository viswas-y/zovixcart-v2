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
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
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
                ) : null}
                {product.discountBadge && !outOfStock ? (
                    <span className="absolute left-2 top-2 rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white">
                        {product.discountBadge}
                    </span>
                ) : null}
                {outOfStock ? (
                    <span className="absolute left-2 top-2 rounded bg-white px-2 py-1 text-xs font-medium text-neutral-900">
                        Out of stock
                    </span>
                ) : null}
            </div>
            <h3 className="mt-3 line-clamp-2 text-sm font-medium text-neutral-900">{product.title}</h3>
            <p className="mt-1 text-sm">
                <span className="font-semibold text-neutral-900">{formatINR(product.price)}</span>
                {strike ? (
                    <span className="ml-2 text-neutral-500 line-through">{formatINR(strike)}</span>
                ) : null}
            </p>
        </Link>
    )
}
