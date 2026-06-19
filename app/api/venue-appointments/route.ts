import { type NextRequest } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

export async function GET(request: NextRequest) {
  return proxyJson(request as unknown as Request, "/api/venue-appointments", { method: "GET" })
}

export async function POST(request: NextRequest) {
  return proxyJson(request as unknown as Request, "/api/venue-appointments", { method: "POST" })
}

export async function PATCH(request: NextRequest) {
  return proxyJson(request as unknown as Request, "/api/venue-appointments", { method: "PATCH" })
}

export async function PUT(request: NextRequest) {
  return PATCH(request)
}
