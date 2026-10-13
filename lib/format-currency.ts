/** Format amount for admin financial displays (INR primary, USD fallback). */
export function formatMoney(amount: number, currency = "INR"): string {
  const c = currency.toUpperCase();
  if (c === "INR") {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(amount);
}

/** Sum amounts grouped by currency for stat cards. */
export function sumByCurrency<T extends { amount?: number; total?: number; currency?: string }>(
  items: T[],
  amountKey: "amount" | "total" = "amount",
): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const currency = (item.currency ?? "INR").toUpperCase();
    const value = amountKey === "total" ? (item.total ?? 0) : (item.amount ?? 0);
    acc[currency] = (acc[currency] ?? 0) + value;
    return acc;
  }, {});
}

export function formatMoneyTotals(totals: Record<string, number>): string {
  const entries = Object.entries(totals).filter(([, v]) => v > 0);
  if (entries.length === 0) return formatMoney(0);
  return entries.map(([currency, amount]) => formatMoney(amount, currency)).join(" · ");
}
