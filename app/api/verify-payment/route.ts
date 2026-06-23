import { NextResponse } from "next/server";
import { proxyPostJsonToBackend } from "@/lib/proxy-backend-request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const upstream = await proxyPostJsonToBackend(req, "/api/verify-payment", body);
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("verify-payment proxy error:", error);
    return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 502 });
  }
}
