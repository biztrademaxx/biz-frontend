import { getAccessToken } from "@/lib/api"

export type UploadProxyKind = "image" | "brochure" | "layout"

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
])
const ALLOWED_IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif|avif|svg)$/i

function assertSupportedImageFile(file: File): void {
  const mimeOk = ALLOWED_IMAGE_MIME_TYPES.has(file.type)
  const extOk = ALLOWED_IMAGE_EXTENSION.test(file.name)
  const looseBinary = (!file.type || file.type === "application/octet-stream") && extOk
  if (!mimeOk && !looseBinary) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, GIF, AVIF, or SVG.")
  }
}

/** Upload via same-origin Next.js proxy → Express (Bearer JWT). Never call the API origin from the browser. */
export async function uploadFileViaProxy(file: File, kind: UploadProxyKind = "image"): Promise<string> {
  return uploadEventFileToBackend(file, kind)
}

/** @deprecated Prefer {@link uploadFileViaProxy} — same implementation. */
export async function uploadEventFileToBackend(file: File, kind: UploadProxyKind): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const useImageRoute = kind === "image" || (kind === "layout" && file.type.startsWith("image/"))
  if (useImageRoute) {
    assertSupportedImageFile(file)
  }
  const path = useImageRoute ? "/api/upload/cloudinary" : "/api/upload/brochure"

  const token = getAccessToken()
  if (!token) {
    throw new Error("Please log in to upload files")
  }

  const response = await fetch(path, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const raw = await response.text()
  let data: { success?: boolean; url?: string; message?: string; error?: string } = {}
  if (raw.trim()) {
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Error(raw.trim().slice(0, 300) || "Failed to upload file")
    }
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Upload failed (${response.status})`)
  }

  const url = data.url
  if (!url) {
    throw new Error(data.message || data.error || "Failed to upload file")
  }
  return url
}
