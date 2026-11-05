'use client'

import { WHATSAPP_NUMBER } from '@/lib/config'

export default function FloatingWhatsApp() {
    const message = 'Hi, I need help with ZovixCart'
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

    return (
        <aside aria-label="Customer support">
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp for help with ZovixCart"
                className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex h-14 w-14 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
            >
                <svg
                    aria-hidden="true"
                    className="h-7 w-7 fill-current"
                    viewBox="0 0 24 24"
                >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.173.449.741.964 1.2.662.591 1.221.774 1.394.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.073.045.42-.099.825zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.987-1.396A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.603 0-3.095-.47-4.354-1.278l-.312-.198-2.946.824.84-2.868-.216-.328A8.026 8.026 0 0 1 3.938 12c0-4.445 3.617-8.062 8.062-8.062 4.446 0 8.063 3.617 8.063 8.062 0 4.446-3.617 8.062-8.063 8.062z" />
                </svg>
            </a>
        </aside>
    )
}
