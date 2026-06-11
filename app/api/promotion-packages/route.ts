import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { proxyGetToBackend } from "@/lib/proxy-backend-request";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userType = searchParams.get("userType");
  const qs = new URLSearchParams();
  if (userType) qs.set("userType", userType);
  const query = qs.toString();
  const backendPath = `/api/promotion-packages${query ? `?${query}` : ""}`;

  if (prisma) {
    try {
      const where: Record<string, unknown> = { isActive: true };
      if (userType) {
        (where as { OR?: unknown[] }).OR = [{ userType: "BOTH" }, { userType }];
      }
      const canonicalIds = new Set([
        "pkg_starter",
        "pkg_professional",
        "pkg_enterprise",
        "pkg_visitor_reach",
        "pkg_prospector",
        "pkg_leadboost",
      ]);
      const packages = (
        await prisma.promotionPackage.findMany({
          where,
          orderBy: [{ recommended: "desc" }, { order: "asc" }, { price: "asc" }],
        })
      ).filter((p) => canonicalIds.has(p.id));
      return NextResponse.json({ packages });
    } catch {
      // fall through to Express (Postgres) when Mongo/legacy Prisma fails or is misconfigured
    }
  }

  try {
    const upstream = await proxyGetToBackend(request, backendPath);
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Error proxying promotion packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 502 });
  }
}
