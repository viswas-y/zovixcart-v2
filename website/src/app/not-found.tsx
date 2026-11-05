import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center text-[#0A0A0A]">
      <span className="rounded-[12px] border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-600">
        404 Not Found
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#0A0A0A] sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md">
        Sorry, the page you are looking for doesn&apos;t exist, is out of stock, or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#0A0A0A] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 shadow-md"
        >
          Back to Home
        </Link>
        <Link
          href="/search"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-neutral-300 bg-white px-6 py-2.5 text-xs font-bold text-[#0A0A0A] transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 shadow-sm"
        >
          Search Products
        </Link>
      </div>
    </main>
  )
}
