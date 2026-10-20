import { NextResponse } from "next/server";
import { proxyGetToBackend } from "@/lib/proxy-backend-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const role = new URL(req.url).searchParams.get("role") ?? "";
    const upstream = await proxyGetToBackend(req, `/api/subscriptions/plans?role=${encodeURIComponent(role)}`);
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Subscription prices proxy:", error);
    return NextResponse.json({ message: "Unable to load plan prices." }, { status: 502 });
  }
}
