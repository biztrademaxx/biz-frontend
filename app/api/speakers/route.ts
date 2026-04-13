import { proxyJson } from "@/lib/backend-proxy"

/** List/create speakers — handled by Express API only (see `biz-backend/src/modules/speakers`). */
export async function GET(req: Request) {
  return proxyJson(req, "/api/speakers")
}

export async function POST(req: Request) {
  return proxyJson(req, "/api/speakers", { method: "POST" })
}
