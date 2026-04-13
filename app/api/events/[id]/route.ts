import { NextRequest, NextResponse } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const params = await Promise.resolve(ctx.params);
  return proxyJson(req, `/api/events/${params.id}`);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  const params = await Promise.resolve(ctx.params);
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Event id required" }, { status: 400 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
    };
    const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Error proxying event PATCH:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}