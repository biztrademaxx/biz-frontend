import { proxyJson } from "@/lib/backend-proxy";

export async function GET(req: Request) {
  return proxyJson(req, "/api/events/stats", undefined, { revalidateSeconds: 120 });
}