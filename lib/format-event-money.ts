const SYMBOL_TO_CODE: Record<string, string> = {
  "₹": "INR",
  "€": "EUR",
  "£": "GBP",
  $: "USD",
}

/** Map stored event/space currency (symbol or ISO) to an ISO code for Intl. */
export function toCurrencyCode(raw?: string | null): string {
  const c = String(raw ?? "USD").trim()
  if (!c) return "USD"
  if (SYMBOL_TO_CODE[c]) return SYMBOL_TO_CODE[c]
  if (/^[A-Za-z]{3}$/.test(c)) return c.toUpperCase()
  return "USD"
}

export function formatEventMoney(amount: number, currencyRaw?: string | null): string {
  const code = toCurrencyCode(currencyRaw)
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currencyRaw ?? code} ${amount.toLocaleString()}`
  }
}

export function exhibitionSpaceTypeLabel(spaceType: string): string {
  if (spaceType === "SHELL_SPACE") return "Shell Space (Standard Booth)"
  if (spaceType === "RAW_SPACE") return "Raw Space"
  return spaceType.replace(/_/g, " ")
}
