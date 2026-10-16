import { proxyJson } from "@/lib/backend-proxy";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyJson(req, `/api/events/${id}/save`, { method: "POST" });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyJson(req, `/api/events/${id}/save`, { method: "DELETE" });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyJson(req, `/api/events/${id}/save`);
}