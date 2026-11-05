/**
 * Server and Client Form Validation for ZovixCart COD Orders
 * Enforces rules from AGENTS.md:
 * - Indian phone: 10 digits starting with 6-9
 * - Pincode: 6 digits
 * - Basic anti-spam: honeypot verification
 */

export interface OrderInput {
    customerName: string
    phone: string
    address: string
    pincode: string
    city: string
    state: string
    notes?: string
    honeypot?: string
    items: Array<{
        productId: string
        quantity: number
    }>
}

export interface ValidationErrors {
    customerName?: string
    phone?: string
    address?: string
    pincode?: string
    city?: string
    state?: string
    items?: string
    form?: string
}

export function validateOrderInput(data: unknown): {
    isValid: boolean
    errors: ValidationErrors
    sanitized?: OrderInput
} {
    const errors: ValidationErrors = {}

    if (!data || typeof data !== 'object') {
        return { isValid: false, errors: { form: 'Invalid request payload' } }
    }

    const input = data as Record<string, unknown>

    // Anti-spam honeypot: hidden field must be strictly empty
    if (typeof input.honeypot === 'string' && input.honeypot.trim().length > 0) {
        return { isValid: false, errors: { form: 'Submission rejected as spam' } }
    }

    // Customer Name
    const customerName = typeof input.customerName === 'string' ? input.customerName.trim() : ''
    if (!customerName || customerName.length < 2) {
        errors.customerName = 'Please enter your full name (at least 2 characters)'
    } else if (customerName.length > 80) {
        errors.customerName = 'Name cannot exceed 80 characters'
    }

    // Indian Phone Number: 10 digits starting with 6-9
    const phone = typeof input.phone === 'string' ? input.phone.trim().replace(/\D/g, '') : ''
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phone) {
        errors.phone = 'Please enter your mobile phone number'
    } else if (!phoneRegex.test(phone)) {
        errors.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
    }

    // Address
    const address = typeof input.address === 'string' ? input.address.trim() : ''
    if (!address || address.length < 6) {
        errors.address = 'Please enter your complete delivery address (house/flat, street, area)'
    } else if (address.length > 300) {
        errors.address = 'Address cannot exceed 300 characters'
    }

    // Indian Pincode: 6 digits
    const pincode = typeof input.pincode === 'string' ? input.pincode.trim().replace(/\s/g, '') : ''
    const pincodeRegex = /^\d{6}$/
    if (!pincode) {
        errors.pincode = 'Please enter your 6-digit postal pincode'
    } else if (!pincodeRegex.test(pincode)) {
        errors.pincode = 'Pincode must be exactly 6 digits (e.g. 682001)'
    }

    // City
    const city = typeof input.city === 'string' ? input.city.trim() : ''
    if (!city || city.length < 2) {
        errors.city = 'Please enter your city or town'
    }

    // State
    const state = typeof input.state === 'string' ? input.state.trim() : ''
    if (!state || state.length < 2) {
        errors.state = 'Please enter your state'
    }

    // Optional Notes
    const notes = typeof input.notes === 'string' ? input.notes.trim().slice(0, 300) : ''

    // Ordered Items
    const rawItems = Array.isArray(input.items) ? input.items : []
    const items: Array<{ productId: string; quantity: number }> = []

    for (const raw of rawItems) {
        if (raw && typeof raw === 'object') {
            const p = raw as Record<string, unknown>
            if (typeof p.productId === 'string' && p.productId.trim()) {
                const qty = typeof p.quantity === 'number' ? Math.floor(p.quantity) : 1
                if (qty > 0 && qty <= 50) {
                    items.push({ productId: p.productId.trim(), quantity: qty })
                }
            }
        }
    }

    if (items.length === 0) {
        errors.items = 'Your cart contains no valid items'
    }

    const isValid = Object.keys(errors).length === 0

    return {
        isValid,
        errors,
        sanitized: isValid
            ? {
                  customerName,
                  phone,
                  address,
                  pincode,
                  city,
                  state,
                  notes,
                  items,
              }
            : undefined,
    }
}
