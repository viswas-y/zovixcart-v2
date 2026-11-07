'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
    productId: string
    slug: string
    title: string
    price: number
    imageUrl: string
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    totalCount: number
    subtotal: number
    isLoaded: boolean
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
    setOrAddItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'zovixcart_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load cart from localStorage after client mounts to avoid hydration mismatch
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                if (Array.isArray(parsed)) {
                    setItems(parsed)
                }
            }
        } catch {
            // Ignore storage read errors
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Persist cart to localStorage whenever items change
    useEffect(() => {
        if (!isLoaded) return
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        } catch {
            // Ignore storage write errors
        }
    }, [items, isLoaded])

    function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
        if (quantity <= 0) return
        setItems((prev) => {
            const existingIndex = prev.findIndex((i) => i.productId === item.productId)
            if (existingIndex > -1) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity,
                }
                return updated
            }
            return [...prev, { ...item, quantity }]
        })
    }

    function setOrAddItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
        if (quantity <= 0) return
        setItems((prev) => {
            const existingIndex = prev.findIndex((i) => i.productId === item.productId)
            if (existingIndex > -1) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: quantity,
                }
                return updated
            }
            return [...prev, { ...item, quantity }]
        })
    }

    function removeItem(productId: string) {
        setItems((prev) => prev.filter((i) => i.productId !== productId))
    }

    function updateQuantity(productId: string, quantity: number) {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }
        setItems((prev) =>
            prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
        )
    }

    function clearCart() {
        setItems([])
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {
            // Ignore
        }
    }

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                totalCount,
                subtotal,
                isLoaded,
                addItem,
                setOrAddItem,
                removeItem,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

