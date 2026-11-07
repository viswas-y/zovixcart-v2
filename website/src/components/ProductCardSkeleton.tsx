export default function ProductCardSkeleton() {
    return (
        <div className="animate-pulse" aria-hidden="true">
            <div className="aspect-square w-full rounded-[12px] bg-neutral-200" />
            <div className="mt-3 h-4 w-3/4 rounded-[8px] bg-neutral-200" />
            <div className="mt-2 h-4 w-1/3 rounded-[8px] bg-neutral-200" />
            <div className="mt-3 flex flex-col gap-2">
                <div className="h-11 w-full rounded-[12px] bg-neutral-200" />
                <div className="h-11 w-full rounded-[12px] bg-neutral-200" />
            </div>
        </div>
    )
}
