import { proxyJson } from "@/lib/backend-proxy";

export async function GET(req: Request) {
  return proxyJson(req, "/api/organizers/facets", undefined, { revalidateSeconds: 300 });
}
