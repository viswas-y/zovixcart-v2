import ProductCardSkeleton from '@/components/ProductCardSkeleton'

export default function SearchLoading() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-8 text-neutral-800 animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="mb-6 flex items-center space-x-2">
                <div className="h-4 w-12 rounded bg-neutral-200" />
                <span className="text-neutral-300">/</span>
                <div className="h-4 w-16 rounded bg-neutral-200" />
            </div>

            {/* Title & Subtitle Skeleton */}
            <div className="mb-6">
                <div className="h-8 w-64 rounded bg-neutral-200" />
                <div className="mt-2 h-4 w-80 rounded bg-neutral-200" />
            </div>

            {/* Filter Bar Skeleton */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 pt-2">
                <div className="h-4 w-28 rounded bg-neutral-200" />
                <div className="flex gap-4">
                    <div className="h-8 w-24 rounded bg-neutral-200" />
                    <div className="h-8 w-32 rounded bg-neutral-200" />
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </main>
    )
}

