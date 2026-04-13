import { apiFetch } from "./api"

export async function uploadVenueImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "venues")
    // images only; backend upload controller enforces image MIME types
    formData.append("type", "image")

    const result = await apiFetch<{ success?: boolean; secure_url?: string; error?: string }>(
      "/api/admin/upload",
      {
        method: "POST",
        body: formData,
        auth: true,
      }
    )

    if ((result as any)?.success === false || !result.secure_url) {
      throw new Error((result as any)?.error || "Upload failed")
    }

    return result.secure_url
  })

  return Promise.all(uploadPromises)
}

export async function uploadVenueLogo(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", "venues/logos")
  formData.append("type", "image")

  const result = await apiFetch<{ success?: boolean; secure_url?: string; error?: string }>(
    "/api/admin/upload",
    {
      method: "POST",
      body: formData,
      auth: true,
    }
  )

  if ((result as any)?.success === false || !result.secure_url) {
    throw new Error((result as any)?.error || "Upload failed")
  }

  return result.secure_url
}

export async function uploadVenueDocuments(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "venues/documents")
    formData.append("type", "document")

    const result = await apiFetch<{ success?: boolean; secure_url?: string; error?: string }>(
      "/api/admin/upload",
      {
        method: "POST",
        body: formData,
        auth: true,
      }
    )

    if ((result as any)?.success === false || !result.secure_url) {
      throw new Error((result as any)?.error || "Upload failed")
    }

    return result.secure_url
  })

  return Promise.all(uploadPromises)
}