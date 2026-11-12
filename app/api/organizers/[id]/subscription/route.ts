import { proxyJson } from "@/lib/backend-proxy"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  const { id } = await params
  return proxyJson(request, `/api/organizers/${encodeURIComponent(id)}/subscription`, { method: "GET" })
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params
  return proxyJson(request, `/api/organizers/${encodeURIComponent(id)}/subscription`, { method: "PUT" })
}
