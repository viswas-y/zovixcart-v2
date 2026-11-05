import type { Metadata } from 'next'
import CartView from '@/components/CartView'

export const metadata: Metadata = {
    title: 'Shopping Cart | ZovixCart',
    description: 'Review your selected items and proceed to Cash on Delivery checkout.',
}

export default function CartPage() {
    return <CartView />
}
