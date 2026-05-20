import { proxyJson } from "@/lib/backend-proxy";

/**
 * Proxies to Express `POST /api/contact/inquiries` (DB + thank-you email).
 */
export async function POST(req: Request) {
  return proxyJson(req, "/api/contact/inquiries", { method: "POST" });
}
