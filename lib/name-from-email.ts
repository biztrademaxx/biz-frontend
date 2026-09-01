/** Display name from the email local-part (text before `@`). */
export function nameFromEmailLocalPart(email: string | null | undefined): string {
  const raw = String(email ?? "").trim()
  if (!raw) return ""
  const at = raw.indexOf("@")
  const local = (at >= 0 ? raw.slice(0, at) : raw).trim()
  if (!local) return ""
  const cleaned = local
    .replace(/[._+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  const source = cleaned || local
  return source
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}
