import type { Metadata } from 'next'
import CheckoutView from '@/components/CheckoutView'

export const metadata: Metadata = {
    title: 'Checkout - Cash on Delivery | ZovixCart',
    description: 'Provide your delivery details to place your Cash on Delivery order.',
}

export default function CheckoutPage() {
    return <CheckoutView />
}

