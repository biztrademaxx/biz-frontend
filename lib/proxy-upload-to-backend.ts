import { NextResponse } from "next/server"
import { getBackendApiBaseUrl } from "@/lib/api"
import { maybeCompressImageServer } from "@/lib/compress-image-server"

/**
 * Forward multipart uploads from the browser to Express (server-to-server, no CORS).
 * Requires `Authorization: Bearer <JWT>` from the client.
 */
export async function proxyUploadToBackend(
  request: Request,
  backendPath: string,
): Promise<NextResponse> {
  const auth = request.headers.get("authorization")
  if (!auth?.trim()) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ success: false, message: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ success: false, message: "File is required" }, { status: 400 })
  }

  const filename =
    file instanceof File && file.name.trim() ? file.name.trim() : "upload.bin"

  let uploadBlob: Blob = file
  const isImageRoute =
    backendPath.includes("cloudinary") || backendPath.endsWith("/upload/image")
  if (isImageRoute && file instanceof File) {
    try {
      uploadBlob = await maybeCompressImageServer(file)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image is too large"
      return NextResponse.json({ success: false, message }, { status: 413 })
    }
  }

  // Re-append with filename so Express/multer can validate extension + MIME (Node fetch drops these otherwise).
  const forward = new FormData()
  forward.append(
    "file",
    uploadBlob,
    uploadBlob instanceof File && uploadBlob.name ? uploadBlob.name : filename,
  )

  const target = `${getBackendApiBaseUrl()}${backendPath}`
  const upstream = await fetch(target, {
    method: "POST",
    headers: { Authorization: auth },
    body: forward,
    cache: "no-store",
  })

  const raw = await upstream.text()
  let data: unknown = {}
  if (raw.trim()) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = { success: false, message: raw.trim().slice(0, 500) }
    }
  }

  return NextResponse.json(data, { status: upstream.status })
}
