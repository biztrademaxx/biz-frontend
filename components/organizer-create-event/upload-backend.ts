import { apiFetch } from "@/lib/api"

/** Upload via Express backend (Bearer JWT from apiFetch) — not Next.js /api (NextAuth-only). */
export async function uploadEventFileToBackend(file: File, kind: "image" | "brochure" | "layout"): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const useImageRoute = kind === "image" || (kind === "layout" && file.type.startsWith("image/"))

  const path = useImageRoute ? "/api/upload/cloudinary" : "/api/upload/brochure"

  const data = await apiFetch<{ success?: boolean; url?: string; message?: string; error?: string }>(path, {
    method: "POST",
    body: formData,
    auth: true,
  })

  const url = data.url
  if (!url) {
    throw new Error(data.message || data.error || "Failed to upload file")
  }
  return url
}
