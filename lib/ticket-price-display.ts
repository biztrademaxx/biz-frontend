export type TicketPriceRow = {
  name: string
  price?: number | string | null
  currency?: string
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
