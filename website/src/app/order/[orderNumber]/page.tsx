import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { orderByNumberQuery } from '@/lib/sanity/queries'
import OrderSuccessView from '@/components/OrderSuccessView'

type PageProps = {
    params: Promise<{ orderNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { orderNumber } = await params
    return {
        title: `Order #${orderNumber} Confirmed | ZovixCart`,
        description: `Thank you for your order. Order #${orderNumber} has been received. Cash on Delivery.`,
    }
}

export default async function OrderConfirmationPage({ params }: PageProps) {
    const { orderNumber } = await params

    const order = await client.fetch(orderByNumberQuery, { orderNumber }).catch(() => null)

    return <OrderSuccessView orderNumber={orderNumber} initialOrder={order} />
}
