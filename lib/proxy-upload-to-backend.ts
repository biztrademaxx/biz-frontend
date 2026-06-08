import { NextResponse } from "next/server"
import { getBackendApiBaseUrl } from "@/lib/api"

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

  // Re-append with filename so Express/multer can validate extension + MIME (Node fetch drops these otherwise).
  const forward = new FormData()
  const filename =
    file instanceof File && file.name.trim() ? file.name.trim() : "upload.bin"
  forward.append("file", file, filename)

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
