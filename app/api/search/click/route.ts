import { proxyJson } from "@/lib/backend-proxy";

/** Phase 4: forward listing/navbar click beacons to Express. */
export async function POST(req: Request) {
  return proxyJson(req, "/api/search/click", { method: "POST" });
}
