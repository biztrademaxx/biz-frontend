import { type NextRequest, NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

// Event–exhibitor appointments: proxy to backend. Auth via Authorization header (backend validates JWT).
// Client must send requesterId in body for POST (e.g. from getCurrentUserId()).
export async function GET(request: NextRequest) {
  return proxyJson(request as unknown as Request, "/api/appointments", { method: "GET" })
}

export async function POST(request: NextRequest) {
  return proxyJson(request as unknown as Request, "/api/appointments", { method: "POST" })
}

export async function PUT(request: NextRequest) {
  return proxyJson(request as unknown as Request, "/api/appointments", { method: "PUT" })
}