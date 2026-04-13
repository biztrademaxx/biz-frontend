import { NextResponse } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

/**
 * Proxies to Express: GET /api/admin/organizers/venue-bookings (PostgreSQL via backend).
 * Forwards Authorization from the incoming request.
 */
export async function GET(request: Request) {
  try {
    return proxyJson(request, "/api/admin/organizers/venue-bookings");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Proxy failed";
    console.error("venue-bookings proxy:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load venue bookings", error: message },
      { status: 502 },
    );
  }
}
