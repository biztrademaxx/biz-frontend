import { proxyJson } from "@/lib/backend-proxy"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  const { id } = await params
  return proxyJson(request, `/api/organizers/${encodeURIComponent(id)}/reviews`, { method: "GET" })
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params
  return proxyJson(request, `/api/organizers/${encodeURIComponent(id)}/reviews`, { method: "POST" })
}
