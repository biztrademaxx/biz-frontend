import { proxyJson } from "@/lib/backend-proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyJson(req, `/api/users/${id}/connections`);
}

// For now we don't support creating connections via backend;
// gracefully reject with 501 so UI doesn't crash.
export async function POST() {
  return new Response(
    JSON.stringify({ error: "Connections creation is not yet supported in the new backend" }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" },
    }
  );
}
