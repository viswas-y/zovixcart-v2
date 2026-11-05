import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                404 Not Found
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Page not found
            </h1>
            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
                Sorry, the page you are looking for doesn&apos;t exist or may have been moved.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                    href="/"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                >
                    Back to Home
                </Link>
                <Link
                    href="/search"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                >
                    Search Products
                </Link>
            </div>
        </main>
    )
}
