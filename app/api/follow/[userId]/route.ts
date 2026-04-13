import { proxyJson } from "@/lib/backend-proxy"

// All follow logic lives in the backend now.
// Frontend routes simply proxy to the Express API.

export async function GET(
  req: Request,
  ctx: { params: Promise<{ userId: string }> | { userId: string } },
) {
  const { userId } = await Promise.resolve(ctx.params)
  return proxyJson(req, `/api/follow/${userId}`, { method: "GET" })
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> | { userId: string } },
) {
  const { userId } = await Promise.resolve(ctx.params)
  return proxyJson(req, `/api/follow/${userId}`, { method: "POST" })
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ userId: string }> | { userId: string } },
) {
  const { userId } = await Promise.resolve(ctx.params)
  return proxyJson(req, `/api/follow/${userId}`, { method: "DELETE" })
}
