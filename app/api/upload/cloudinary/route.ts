import { proxyUploadToBackend } from "@/lib/proxy-upload-to-backend"

/** Same-origin upload proxy → Express POST /api/upload/cloudinary (avoids browser CORS). */
export async function POST(req: Request) {
  return proxyUploadToBackend(req, "/api/upload/cloudinary")
}
