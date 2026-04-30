import { proxyJson } from "@/lib/backend-proxy";

/** Public listing; cache at Vercel + Next Data Cache to cut droplet/Neon round-trips. */
export async function GET(req: Request) {
  return proxyJson(req, "/api/events", undefined, { revalidateSeconds: 45 });
}