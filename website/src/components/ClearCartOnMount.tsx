'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/components/CartProvider'

interface ClearCartOnMountProps {
  orderNumber: string
}

export default function ClearCartOnMount({ orderNumber }: ClearCartOnMountProps) {
  const { clearCart } = useCart()
  const hasClearedRef = useRef(false)

  useEffect(() => {
    if (hasClearedRef.current) return
    hasClearedRef.current = true

    if (typeof window === 'undefined') return

    try {
      const flagKey = `just_ordered_${orderNumber}`
      const isJustOrdered = sessionStorage.getItem(flagKey) === 'true'

      if (isJustOrdered) {
        clearCart()
        sessionStorage.removeItem(flagKey)
      }
    } catch {
      // Storage access blocked or unavailable - fallback to harmless clear
      clearCart()
    }
  }, [clearCart, orderNumber])

  return null
}

