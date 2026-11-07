import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { orderByNumberQuery } from '@/lib/sanity/queries'
import OrderSuccessView from '@/components/OrderSuccessView'
import ClearCartOnMount from '@/components/ClearCartOnMount'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
    params: Promise<{ orderNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { orderNumber } = await params
    const decoded = decodeURIComponent(orderNumber || '').trim().replace(/\s+/g, '-')
    return {
        title: `Order #${decoded} | ZovixCart`,
        description: `Track your order #${decoded}. Live order status, Cash on Delivery details, and delivery updates.`,
    }
}

export default async function OrderConfirmationPage({ params }: PageProps) {
    const { orderNumber } = await params
    const decoded = decodeURIComponent(orderNumber || '').trim()
    const normalized = decoded.replace(/\s+/g, '-')

    // Fetch live directly from Sanity (bypassing CDN and Next.js cache) so status changes in Studio reflect immediately
    const order = await client
        .fetch(
            orderByNumberQuery,
            { orderNumber: normalized, rawOrderNumber: decoded },
            { useCdn: false, cache: 'no-store' }
        )
        .catch(() => null)

    const finalOrderNumber = order?.orderNumber || normalized || decoded

    return (
        <>
            <ClearCartOnMount orderNumber={finalOrderNumber} />
            <OrderSuccessView orderNumber={finalOrderNumber} initialOrder={order} />
        </>
    )
}
