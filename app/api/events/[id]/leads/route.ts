import { proxyJson } from "@/lib/backend-proxy"

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await Promise.resolve(ctx.params)
  return proxyJson(req, `/api/events/${id}/leads`, { method: "GET" })
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await Promise.resolve(ctx.params)

  return proxyJson(req, `/api/events/${id}/leads`, {
    method: "POST",
  })
}