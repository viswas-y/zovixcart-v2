'use client'

import { useState } from 'react'
import type { FAQItem } from '@/lib/faq'
import { STORE_EMAIL, WHATSAPP_NUMBER } from '@/lib/config'

interface FAQAccordionProps {
  items: FAQItem[]
}

function renderAnswer(answer: string) {
  // Turn phone number and email into clickable links
  const pattern = /(\+91\s*97473\s*62645|zovixcart@gmail\.com)/gi
  const parts = answer.split(pattern)

  if (parts.length > 1) {
    return (
      <span>
        {parts.map((part, i) => {
          if (part.replace(/\s+/g, '').includes('9747362645')) {
            return (
              <a
                key={i}
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0A0A0A] underline hover:text-neutral-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0A0A0A]"
              >
                {part}
              </a>
            )
          }
          if (part.toLowerCase() === STORE_EMAIL.toLowerCase()) {
            return (
              <a
                key={i}
                href={`mailto:${STORE_EMAIL}`}
                className="font-medium text-[#0A0A0A] underline hover:text-neutral-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0A0A0A]"
              >
                {part}
              </a>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </span>
    )
  }

  return answer
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  // One open item at a time (null if all closed)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="w-full divide-y divide-neutral-200 rounded-[12px] border border-neutral-200 bg-white">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        const buttonId = `faq-btn-${idx}`
        const panelId = `faq-panel-${idx}`

        return (
          <div key={idx} className="overflow-hidden first:rounded-t-[12px] last:rounded-b-[12px]">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(idx)}
                className="flex min-h-[52px] w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2 sm:p-5"
              >
                <span className="text-sm font-bold text-[#0A0A0A] sm:text-base">
                  {item.question}
                </span>
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] border border-neutral-200 text-[#0A0A0A]">
                  <svg
                    aria-hidden="true"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={`px-4 pb-4 pt-1 text-sm leading-relaxed text-neutral-600 sm:px-5 sm:pb-5 ${
                isOpen ? 'block' : 'hidden'
              }`}
            >
              <p>{renderAnswer(item.answer)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
