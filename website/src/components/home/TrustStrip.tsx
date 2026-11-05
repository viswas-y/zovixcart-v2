import { TRUST_POINTS } from '@/lib/config'

export default function TrustStrip() {
    return (
        <section aria-label="Store guarantees" className="w-full bg-white border-b border-neutral-200 py-6 sm:py-8">
            <div className="mx-auto max-w-6xl px-4">
                <div className="grid grid-cols-1 divide-y divide-neutral-200 rounded-[12px] border border-neutral-200 bg-white sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                    {/* 1. Cash on Delivery */}
                    <div className="flex items-center gap-3.5 p-4 sm:p-5">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] border border-neutral-200 bg-neutral-50 text-[#0A0A0A]">
                            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6H2.25m0 0v8.25m0 0h.75A.75.75 0 0 1 3.75 15v.75m0 0v.75A.75.75 0 0 1 3 17.25H2.25m0 0v1.5c0 .414.336.75.75.75H6m12-15h.75a.75.75 0 0 1 .75.75V6m0 0h.75A.75.75 0 0 1 21 6.75v8.25m0 0h-.75A.75.75 0 0 1 19.5 15v.75m0 0v.75A.75.75 0 0 1 18.75 17.25H18m0 0v1.5a.75.75 0 0 1-.75.75H15M6 4.5h12m-12 15h12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#0A0A0A]">{TRUST_POINTS[0]}</p>
                            <p className="text-xs text-neutral-500">Pay cash or UPI at your doorstep</p>
                        </div>
                    </div>

                    {/* 2. WhatsApp order updates */}
                    <div className="flex items-center gap-3.5 p-4 sm:p-5">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] border border-neutral-200 bg-neutral-50 text-[#0A0A0A]">
                            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-.974-.948l.78-2.342A7.94 7.94 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#0A0A0A]">{TRUST_POINTS[1]}</p>
                            <p className="text-xs text-neutral-500">Instant confirmation &amp; dispatch tracking</p>
                        </div>
                    </div>

                    {/* 3. Delivery across India */}
                    <div className="flex items-center gap-3.5 p-4 sm:p-5">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] border border-neutral-200 bg-neutral-50 text-[#0A0A0A]">
                            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.375c0-.621-.504-1.125-1.125-1.125h-9.75C2.625 2.25 2.121 2.754 2.121 3.375v10.875m12 0h-12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#0A0A0A]">{TRUST_POINTS[2]}</p>
                            <p className="text-xs text-neutral-500">Reliable pan-India courier network</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

