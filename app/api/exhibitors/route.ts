import { type NextRequest } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

// All exhibitor CRUD runs on the backend. This route proxies to the Express API.

export async function GET(req: NextRequest) {
  return proxyJson(req as unknown as Request, "/api/exhibitors", { method: "GET" })
}

export async function POST(req: NextRequest) {
  return proxyJson(req as unknown as Request, "/api/exhibitors", { method: "POST" })
}
