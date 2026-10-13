import { proxyUploadToBackend } from "@/lib/proxy-upload-to-backend"

/** Same-origin upload proxy → Express POST /api/upload/brochure (avoids browser CORS). */
export async function POST(req: Request) {
  return proxyUploadToBackend(req, "/api/upload/brochure")
}
