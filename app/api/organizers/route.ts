import { proxyJson } from "@/lib/backend-proxy";

export async function GET(req: Request) {
  return proxyJson(req, "/api/organizers", undefined, { revalidateSeconds: 120 });
}

export async function POST(req: Request) {
  // Organizer creation is handled by admin backend
  return proxyJson(req, "/api/admin/organizers", { method: "POST" });
}