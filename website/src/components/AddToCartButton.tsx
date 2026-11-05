'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'

interface AddToCartButtonProps {
    product: {
        _id: string
        title: string
        slug: { current: string }
        price: number
        inStock?: boolean
        imageUrl?: string
    }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addItem } = useCart()
    const [quantity, setQuantity] = useState(1)
    const [justAdded, setJustAdded] = useState(false)

    const isOutOfStock = product.inStock === false

    function handleAdd() {
        if (isOutOfStock) return

        addItem(
            {
                productId: product._id,
                slug: product.slug.current,
                title: product.title,
                price: product.price,
                imageUrl: product.imageUrl || '',
            },
            quantity
        )

        setJustAdded(true)
        setTimeout(() => {
            setJustAdded(false)
        }, 2200)
    }

    return (
        <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
                {/* Quantity Selector */}
                {!isOutOfStock ? (
                    <div className="flex items-center rounded-md border border-neutral-300 bg-white">
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                            </svg>
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-neutral-900" aria-live="polite">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => q + 1)}
                            aria-label="Increase quantity"
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-neutral-600 transition hover:bg-neutral-100"
                        >
                            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                ) : null}

                {/* Add to Cart Action */}
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`flex-1 inline-flex min-h-[44px] items-center justify-center rounded-md px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${
                        isOutOfStock
                            ? 'cursor-not-allowed bg-neutral-200 text-neutral-500'
                            : justAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                >
                    {isOutOfStock ? (
                        'Out of stock'
                    ) : justAdded ? (
                        <span className="flex items-center gap-1.5">
                            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Added to cart!
                        </span>
                    ) : (
                        'Add to cart'
                    )}
                </button>
            </div>

            {/* Quick action bar shown right after adding */}
            {justAdded ? (
                <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-900 border border-emerald-200 animate-fadeIn">
                    <span>Item added to your shopping cart.</span>
                    <Link
                        href="/cart"
                        className="underline hover:text-emerald-700 font-semibold"
                    >
                        View Cart &rarr;
                    </Link>
                </div>
            ) : null}
        </div>
    )
}
