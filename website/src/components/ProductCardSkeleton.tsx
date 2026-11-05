export default function ProductCardSkeleton() {
    return (
        <div className="animate-pulse" aria-hidden="true">
            <div className="aspect-square w-full rounded-md bg-neutral-200" />
            <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
            <div className="mt-2 h-4 w-1/3 rounded bg-neutral-200" />
        </div>
    )
}
