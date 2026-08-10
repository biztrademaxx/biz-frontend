import { proxyJson } from "@/lib/backend-proxy"

/** Public /event sidebar facet counts. */
export async function GET(req: Request) {
  return proxyJson(req, "/api/events/facets", undefined, { revalidateSeconds: 60 })
}
