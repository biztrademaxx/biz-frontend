/**
 * Compact labels for browse cards: 9411 → "9411", 277400 → "277.4k".
 */
export function formatEventCountDisplay(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0"
  if (n === 0) return "0"
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    const s = v >= 10 ? v.toFixed(0) : v.toFixed(1)
    return `${s.replace(/\.0$/, "")}M`
  }
  if (n >= 10_000) {
    const v = n / 1000
    const s = v.toFixed(1)
    return `${s.replace(/\.0$/, "")}k`
  }
  return String(Math.round(n))
}
