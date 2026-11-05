import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { client, urlForImage } from '@/lib/sanity/client'
import { productBySlugQuery } from '@/lib/sanity/queries'
import type { Product } from '@/lib/sanity/types'
import { formatINR, getStrikePrice } from '@/components/ProductCard'

export const revalidate = 60

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const product = await client.fetch<Product | null>(productBySlugQuery, { slug })

    if (!product || product.is_active === false) {
        return {
            title: 'Product Not Found | ZovixCart',
        }
    }

    return {
        title: `${product.title} | ZovixCart`,
        description:
            product.shortDescription ||
            `Buy ${product.title} online at ZovixCart with Cash on Delivery in India.`,
    }
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params
    const product = await client.fetch<Product | null>(productBySlugQuery, { slug })

    if (!product || product.is_active === false) notFound()

    const strike = getStrikePrice(product)
    const outOfStock = product.inStock === false
    const lowStock =
        !outOfStock && typeof product.stockCount === 'number' && product.stockCount > 0 && product.stockCount <= 5
    const highlights = product.bullet_points?.length ? product.bullet_points : product.keyFeatures
    const validImages =
        product.images?.filter((img) => Boolean(img?.asset?._ref || img?.asset?._id)) ?? []
    const mainImage = validImages[0]
    const thumbnails = validImages.slice(1)

    return (
        <main className="mx-auto max-w-6xl px-4 py-8 text-neutral-800">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500">
                <ol className="flex items-center space-x-2">
                    <li>
                        <Link
                            href="/"
                            className="inline-flex min-h-[36px] items-center text-neutral-600 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                        >
                            Home
                        </Link>
                    </li>
                    {product.category?.slug?.current ? (
                        <>
                            <li aria-hidden="true" className="text-neutral-400">/</li>
                            <li>
                                <Link
                                    href={`/category/${product.category.slug.current}`}
                                    className="inline-flex min-h-[36px] items-center text-neutral-600 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                                >
                                    {product.category.title}
                                </Link>
                            </li>
                        </>
                    ) : null}
                    <li aria-hidden="true" className="text-neutral-400">/</li>
                    <li className="line-clamp-1 font-medium text-neutral-900" aria-current="page">
                        {product.title}
                    </li>
                </ol>
            </nav>

            <div className="mt-4 grid gap-8 md:grid-cols-2">
                <div>
                    {mainImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={urlForImage(mainImage).width(900).height(900).fit('crop').url()}
                            alt={mainImage.alt || product.title}
                            className="aspect-square w-full rounded-md bg-neutral-100 object-cover"
                        />
                    ) : (
                        <div className="flex aspect-square w-full items-center justify-center rounded-md bg-neutral-100 text-sm text-neutral-400">
                            No image available
                        </div>
                    )}
                    {thumbnails.length > 0 ? (
                        <div className="mt-3 grid grid-cols-4 gap-3">
                            {thumbnails.map((img, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={img._key || i}
                                    src={urlForImage(img).width(300).height(300).fit('crop').url()}
                                    alt={img.alt || `${product.title} ${i + 2}`}
                                    className="aspect-square w-full rounded bg-neutral-100 object-cover"
                                />
                            ))}
                        </div>
                    ) : null}
                </div>

                <div>
                    {product.category?.slug?.current ? (
                        <Link
                            href={`/category/${product.category.slug.current}`}
                            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                        >
                            {product.category.title}
                        </Link>
                    ) : null}
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                        {product.title}
                    </h1>

                    <p className="mt-4 flex items-baseline gap-3">
                        <span className="text-3xl font-semibold text-neutral-900">{formatINR(product.price)}</span>
                        {strike ? <span className="text-neutral-500 line-through">{formatINR(strike)}</span> : null}
                        {product.discountBadge ? (
                            <span className="rounded bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                                {product.discountBadge}
                            </span>
                        ) : null}
                    </p>

                    <p
                        className={`mt-4 inline-block rounded-full border px-3 py-1 text-sm font-medium ${outOfStock
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }`}
                    >
                        {outOfStock ? 'Out of stock' : lowStock ? `Only ${product.stockCount} left` : 'In stock'}
                    </p>

                    {product.shortDescription ? (
                        <p className="mt-5 text-neutral-700 leading-relaxed">{product.shortDescription}</p>
                    ) : null}

                    {highlights?.length ? (
                        <div className="mt-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                                Key Features
                            </h2>
                            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-neutral-700">
                                {highlights.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {product.delivery_estimate ? (
                        <div className="mt-6 flex items-center gap-2 rounded-md bg-neutral-50 p-3 text-sm text-neutral-700 border border-neutral-200">
                            <svg aria-hidden="true" className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.375c0-.621-.504-1.125-1.125-1.125h-9.75C2.625 2.25 2.121 2.754 2.121 3.375v10.875m12 0h-12" />
                            </svg>
                            <span>Estimated Delivery: <strong className="font-semibold text-neutral-900">{product.delivery_estimate}</strong></span>
                        </div>
                    ) : null}
                </div>
            </div>

            {product.body?.length ? (
                <section className="mt-14 max-w-2xl border-t border-neutral-200 pt-8">
                    <h2 className="mb-4 text-xl font-semibold text-neutral-900">Product Details</h2>
                    <div className="space-y-4 text-neutral-700 leading-relaxed">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <PortableText value={product.body as any} />
                    </div>
                </section>
            ) : null}
        </main>
    )
}
