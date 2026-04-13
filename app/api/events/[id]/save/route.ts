import { proxyJson } from "@/lib/backend-proxy";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  return proxyJson(req, `/api/events/${params.id}/save`, { method: "POST" });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  return proxyJson(req, `/api/events/${params.id}/save`, { method: "DELETE" });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return proxyJson(req, `/api/events/${params.id}/save`);
}