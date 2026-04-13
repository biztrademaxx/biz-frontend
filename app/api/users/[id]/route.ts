import { proxyJson } from "@/lib/backend-proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyJson(req, `/api/users/${id}`);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyJson(req, `/api/users/${id}`, { method: "PUT" });
}