import { NextResponse } from "next/server";
import { proxyGetToBackend, proxyPostJsonToBackend } from "@/lib/proxy-backend-request";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const role = url.searchParams.get("role") ?? "";
    const upstream = await proxyGetToBackend(req, `/api/subscriptions/current?role=${encodeURIComponent(role)}`);
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("subscriptions/current proxy error:", error);
    return NextResponse.json({ message: "Failed to load subscription" }, { status: 502 });
  }
}
