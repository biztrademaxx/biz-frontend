/** Public site origin for canonical URLs, OG tags, and JSON-LD. Set in production, e.g. `NEXT_PUBLIC_SITE_URL=https://www.yoursite.com` */
export const SITE_NAME = "Biz Trade Fairs"

export const SITE_DESCRIPTION =
  "Discover global trade fairs, connect with opportunities, and grow your business network."

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) return raw.replace(/\/$/, "")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  return "http://localhost:3000"
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

/** Logo URL for Organization / publisher (absolute). Override with `NEXT_PUBLIC_ORG_LOGO_URL`. */
export function getOrgLogoAbsoluteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ORG_LOGO_URL?.trim()
  if (fromEnv) return fromEnv
  return absoluteUrl("/logo/biztradefairsLOGO.png")
}

/** Comma-separated profile URLs (Wikipedia, social) for Knowledge Graph-style `sameAs`. */
export function getSameAsUrls(): string[] {
  const raw = process.env.NEXT_PUBLIC_ORG_SAME_AS?.trim()
  if (!raw) return []
  return raw.split(",").map((s) => s.trim()).filter(Boolean)
}

export function truncateMetaDescription(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trim()}…`
}
