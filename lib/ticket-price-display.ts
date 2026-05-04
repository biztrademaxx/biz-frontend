export type TicketPriceRow = {
  name: string
  price?: number | string | null
  currency?: string
  earlyBirdPrice?: number | string | null
  earlyBirdEnd?: string | Date | null
  isActive?: boolean
}

/** True when absent/empty or every finite price is <= 0 */
export function areAllTicketPricesFree(ticketTypes?: TicketPriceRow[] | null): boolean {
  if (!ticketTypes?.length) return true
  return ticketTypes.every((t) => {
    const p = Number(t.price)
    return !Number.isFinite(p) || p <= 0
  })
}

/** Hero / detail row: "Free" or joined priced lines */
export function formatPublicTicketPriceLine(ticketTypes?: TicketPriceRow[] | null): string {
  if (!ticketTypes?.length || areAllTicketPricesFree(ticketTypes)) return "Free"
  return ticketTypes
    .map((ticket) => `${ticket.name}: ${ticket.currency ?? "₹"}${ticket.price}`)
    .join(" | ")
}

/** Format a numeric amount using event currency (ISO code like USD/INR or symbol like ₹). */
export function formatMoneyWithEventCurrency(amount: number, currencyRaw?: string | null): string {
  const raw = String(currencyRaw ?? "").trim()
  if (!Number.isFinite(amount)) return ""

  if (!raw) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  if (/^[A-Za-z]{3}$/.test(raw)) {
    const code = raw.toUpperCase()
    const locale = code === "INR" ? "en-IN" : "en-US"
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${code} ${amount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    }
  }

  const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${raw}${formatted}`
}

/**
 * Single "entry fee" from ticket rows: cheapest active price (early bird when applicable),
 * using event-level currency when ticket rows have no per-ticket currency.
 */
export function formatEventEntryFeeDisplay(
  ticketTypes: TicketPriceRow[] | null | undefined,
  eventCurrency?: string | null,
): string {
  if (!ticketTypes || ticketTypes.length === 0) return "Free"

  const allPricesZero = ticketTypes.every(
    (t) => !Number.isFinite(Number(t.price)) || Number(t.price) <= 0,
  )
  if (allPricesZero) return "Free"

  const activeTickets = ticketTypes.filter((ticket) => ticket.isActive !== false)
  if (activeTickets.length === 0) return "N/A"

  const now = Date.now()
  const effectivePrice = (ticket: TicketPriceRow): number | null => {
    const eb = ticket.earlyBirdPrice
    const ebEnd = ticket.earlyBirdEnd ? new Date(ticket.earlyBirdEnd).getTime() : NaN
    const useEarlyBird =
      eb != null && Number.isFinite(Number(eb)) && Number(eb) > 0 && Number.isFinite(ebEnd) && ebEnd > now
    const p = Number(useEarlyBird ? eb : ticket.price)
    return Number.isFinite(p) && p > 0 ? p : null
  }

  let best: number | null = null
  let bestCurrency: string | undefined
  for (const ticket of activeTickets) {
    const p = effectivePrice(ticket)
    if (p == null) continue
    if (best == null || p < best) {
      best = p
      bestCurrency = ticket.currency
    }
  }

  if (best == null) return "Free"

  const currency = bestCurrency?.trim() || eventCurrency
  return formatMoneyWithEventCurrency(best, currency)
}
