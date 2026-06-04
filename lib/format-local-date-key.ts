/** Calendar day key in local timezone (YYYY-MM-DD). Avoid toISOString() which shifts dates in IST etc. */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function parseLocalDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map((part) => parseInt(part, 10))
  return new Date(y, (m || 1) - 1, d || 1)
}
