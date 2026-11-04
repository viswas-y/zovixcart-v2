import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { client, urlForImage } from '@/lib/sanity/client'
import { productBySlugQuery } from '@/lib/sanity/queries'
import type { Product } from '@/lib/sanity/types'
import { formatINR, getStrikePrice } from '@/components/ProductCard'

export const revalidate = 60

type PageProps = { params: Promise<{ slug: string }> }

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
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 text-neutral-800">
            <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
                ← All products
            </Link>

            <div className="mt-6 grid gap-8 md:grid-cols-2">
                <div>
                    {mainImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={urlForImage(mainImage).width(900).height(900).fit('crop').url()}
                            alt={mainImage.alt || product.title}
                            className="aspect-square w-full rounded-md bg-neutral-100 object-cover"
                        />
                    ) : (
                        <div className="aspect-square w-full rounded-md bg-neutral-100 flex items-center justify-center text-sm text-neutral-400">
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
                    <p className="text-sm text-neutral-500">{product.category?.title}</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{product.title}</h1>

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
                        <p className="mt-5 text-neutral-700">{product.shortDescription}</p>
                    ) : null}

                    {highlights?.length ? (
                        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                            {highlights.map((point, i) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                    ) : null}

                    {product.delivery_estimate ? (
                        <p className="mt-5 text-sm text-neutral-600">Delivery: {product.delivery_estimate}</p>
                    ) : null}
                </div>
            </div>

            {product.body?.length ? (
                <section className="mt-12 max-w-2xl">
                    <h2 className="mb-3 text-xl font-semibold text-neutral-900">Description</h2>
                    <div className="space-y-4 text-neutral-700">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <PortableText value={product.body as any} />
                    </div>
                </section>
            ) : null}
        </main>
    )
}
