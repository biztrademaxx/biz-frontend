import { NextResponse } from "next/server";
import { proxyPostJsonToBackend } from "@/lib/proxy-backend-request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const upstream = await proxyPostJsonToBackend(req, "/api/create-order", body);
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("create-order proxy error:", error);
    return NextResponse.json({ message: "Failed to create order" }, { status: 502 });
  }
}
