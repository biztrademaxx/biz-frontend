import { NextResponse } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

export async function GET(req: Request) {
  try {
    return await proxyJson(req, "/api/events/speakers");
  } catch (err) {
    console.error("Proxy GET /api/events/speakers failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch speaker sessions", sessions: [] },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    return await proxyJson(req, "/api/events/speakers", { method: "POST" });
  } catch (err) {
    console.error("Proxy POST /api/events/speakers failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create speaker session" },
      { status: 500 },
    );
  }
}
