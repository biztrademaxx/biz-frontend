import { proxyJson } from "@/lib/backend-proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return Response.json({ success: false, error: "Speaker ID required" }, { status: 400 });
  }
  return proxyJson(req, `/api/speakers/${id}/sessions`);
}
