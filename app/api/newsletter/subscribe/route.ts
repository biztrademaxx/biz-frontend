import { proxyJson } from "@/lib/backend-proxy";

/** Proxies to Express `POST /api/newsletter/subscribe`. */
export async function POST(req: Request) {
  return proxyJson(req, "/api/newsletter/subscribe", { method: "POST" });
}
