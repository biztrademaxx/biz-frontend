function publicApiBase(): string {
  const b = process.env.NEXT_PUBLIC_API_URL?.trim()
  return b ? b.replace(/\/$/, "") : ""
}

export function absolutizeMediaUrl(href: string | null | undefined): string | null {
  if (href == null || !String(href).trim()) return null
  const s = String(href).trim()
  if (/^https?:\/\//i.test(s) || s.startsWith("//") || s.startsWith("data:") || s.startsWith("blob:")) {
    return s
  }
  const base = publicApiBase()
  if (!base) return s.startsWith("/") ? s : `/${s}`
  return `${base}${s.startsWith("/") ? "" : "/"}${s}`
}
