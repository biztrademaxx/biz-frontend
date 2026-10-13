/** Compact counts for filter sidebar (e.g. 41700 → 41.7k). */
export function formatFacetCount(count: number): string {
  if (count >= 1_000_000) {
    const v = count / 1_000_000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 1000) {
    const v = count / 1000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k`
  }
  return String(count)
}
