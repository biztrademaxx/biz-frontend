import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cloudinary raw URLs often end with a public id **without** `.pdf` / `.docx`, so browsers
 * save downloads as random-looking names with no extension. Pick a sensible extension
 * when the path has none.
 */
export function inferBrochureExtension(url: string): string {
  const path = url.split("?")[0].split("#")[0].toLowerCase()
  const m = path.match(/\.(pdf|docx?|pptx?|xlsx?|png|jpe?g|gif|webp)(?:\?|#|$)/)
  if (m) return `.${m[1]}`
  return ".pdf"
}

function sanitizeDownloadFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180)
}

/**
 * Suggested local filename for a brochure URL.
 * If `preferredLabel` is set (e.g. event title), uses that + inferred extension; otherwise the URL’s
 * last segment (Cloudinary public id), e.g. `ickyhx0uckiiycpuncto` → `ickyhx0uckiiycpuncto.pdf`.
 */
export function brochureFriendlyFilename(url: string, preferredLabel?: string): string {
  const fallbackStem = "event-brochure"
  const ext = url && typeof url === "string" ? inferBrochureExtension(url) : ".pdf"

  if (preferredLabel?.trim()) {
    const safe = sanitizeDownloadFilename(preferredLabel.trim())
    if (safe) return `${safe}${ext}`
  }

  if (!url || typeof url !== "string") return `${fallbackStem}${ext}`

  try {
    const last = url.split("?")[0].split("/").pop() || ""
    const decoded = decodeURIComponent(last).trim()
    if (!decoded) return `${fallbackStem}${ext}`
    if (/\.[a-z0-9]{2,5}$/i.test(decoded)) return decoded
    return `${decoded}${inferBrochureExtension(url)}`
  } catch {
    return `${fallbackStem}${ext}`
  }
}

/**
 * Save a remote file with a chosen filename. Browsers ignore `<a download>` on cross-origin URLs
 * (e.g. Cloudinary), so the save dialog would use a bare public id with no extension; this path works.
 */
export async function downloadUrlAsFile(url: string, filename: string): Promise<void> {
  const trimmed = filename.trim()
  const finalName = /\.[a-z0-9]{2,5}$/i.test(trimmed)
    ? trimmed
    : `${trimmed}${inferBrochureExtension(url)}`

  const res = await fetch(url.trim(), { mode: "cors", credentials: "omit" })
  if (!res.ok) throw new Error(`Download failed (${res.status})`)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  try {
    const a = document.createElement("a")
    a.href = objectUrl
    a.download = finalName
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * Cloudinary raw delivery: add `fl_attachment` (no custom filename in the URL).
 *
 * **Do not** use `fl_attachment:myfile.pdf` — Cloudinary often returns **HTTP 400** for raw uploads
 * when the transformation value contains dots or certain characters.
 *
 * Pair with {@link downloadUrlAsFile} + {@link brochureFriendlyFilename} for a proper save-as name.
 *
 * @see https://cloudinary.com/documentation/delivery_url_transformation_reference#fl_attachment
 */
export function getBrochureDownloadUrl(url: string, _filenameHint?: string): string {
  if (!url || typeof url !== "string") return url
  try {
    const u = resolveBrochureUrl(url)
    const match = u.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/raw\/upload)\/(v\d+\/.*)$/)
    if (match) {
      const [, base, path] = match
      return `${base}/fl_attachment/${path}`
    }
  } catch {
    // ignore
  }
  return url
}

/**
 * Iframe preview: use the **original** asset URL (no `fl_attachment`), so Cloudinary serves the PDF
 * with inline-friendly headers and we avoid 400s from attachment transforms in the embed.
 */
export function getBrochurePreviewUrl(url: string): string {
  if (!url || typeof url !== "string") return url
  return resolveBrochureUrl(url)
}

/**
 * Normalize brochure references from API/database:
 * - full URL -> unchanged
 * - `/uploads/file.pdf` or `uploads/file.pdf` -> `${NEXT_PUBLIC_API_URL}/uploads/file.pdf`
 * - `file.pdf` (legacy bare filename) -> `${NEXT_PUBLIC_API_URL}/uploads/file.pdf`
 */
export function resolveBrochureUrl(url: string): string {
  if (!url || typeof url !== "string") return url
  const raw = url.trim()
  if (!raw) return raw
  if (/^https?:\/\//i.test(raw)) return raw

  const backendBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "")
  if (raw.startsWith("/uploads/")) return `${backendBase}${raw}`
  if (raw.startsWith("uploads/")) return `${backendBase}/${raw}`

  if (raw.startsWith("/")) return raw

  const pathPart = raw.split("?")[0].split("#")[0]
  const looksLikeFilename = /\.[a-z0-9]{2,5}$/i.test(pathPart)
  if (looksLikeFilename) return `${backendBase}/uploads/${raw.replace(/^\/+/, "")}`

  return raw
}

/**
 * Embed a public document URL in Google’s viewer (same pattern as `viewerng/viewer?url=…`).
 * The file URL must be reachable anonymously (e.g. Cloudinary `raw/upload`).
 */
export function getGoogleDocsViewerUrl(url: string): string {
  if (!url || typeof url !== "string") return url
  const u = resolveBrochureUrl(url)
  return `https://docs.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(u)}`
}
