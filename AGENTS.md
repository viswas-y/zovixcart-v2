# ZovixCart project rules

BUSINESS
- COD-first e-commerce store for India. Niche: Home & Cleaning essentials.
- Ordering flow: cart -> checkout form -> order SAVED to database first -> WhatsApp opens with prefilled message containing the order ID.
- No user accounts. Guests only.

CONTENT RULES (strict)
- NEVER invent reviews, ratings, "verified buyer" badges, "Trusted by N customers", sales counts, stock urgency, or timers.
- Reviews section renders only real reviews from the database; if none, hide the section.
- Struck-through compare-at price appears only if the product has compare_at_price set.
- Use placeholders like [BUSINESS NAME] for any fact not provided.

ENGINEERING RULES
- No secrets in client code. Secrets only in .env files; keep .env.example with no real values.
- All database writes happen server-side only.
- Validate all input with zod on the server. Indian phone: 10 digits starting 6-9. Pincode: 6 digits.
- Basic anti-spam on order creation: honeypot field + rate limit per IP.
- Semantic HTML, alt text, metadata per page, min 44px touch targets.
- Small commits. After each task, summarize what changed and how to test it.
- Do not add features I did not ask for. Ask before adding new dependencies.