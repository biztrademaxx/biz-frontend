import { devLog } from "@/lib/dev-log";

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { proxyGetToBackend, proxyPostJsonToBackend } from "@/lib/proxy-backend-request";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exhibitorId = searchParams.get("exhibitorId");
  if (!exhibitorId) {
    return NextResponse.json({ error: "exhibitorId is required" }, { status: 400 });
  }

  const backendPath = `/api/exhibitors/promotions?exhibitorId=${encodeURIComponent(exhibitorId)}`;

  if (prisma) {
    try {
      const promotions = await prisma.promotion.findMany({
        where: { exhibitorId },
        include: {
          event: {
            select: {
              title: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const booths = await prisma.exhibitorBooth.findMany({
        where: { exhibitorId },
        include: { event: true },
        orderBy: { createdAt: "desc" },
      });

      const eventsMap = new Map<string, Record<string, unknown>>();
      booths.forEach((b) => {
        if (b.event?.id && !eventsMap.has(b.event.id)) {
          eventsMap.set(b.event.id, {
            id: b.event.id,
            title: b.event.title,
            date: b.event.startDate,
            location: (b.event as { venueId?: string }).venueId || "N/A",
            status: b.event.status || "Scheduled",
          });
        }
      });

      const formattedPromotions = promotions.map((promotion) => ({
        id: promotion.id,
        eventId: promotion.eventId,
        eventName: promotion.event?.title || "Unknown Event",
        packageType: promotion.packageType,
        status: promotion.status,
        impressions: promotion.impressions || 0,
        clicks: promotion.clicks || 0,
        conversions: promotion.conversions || 0,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        amount: promotion.amount,
        duration: promotion.duration,
        targetCategories: promotion.targetCategories || [],
      }));

      return NextResponse.json(
        {
          promotions: formattedPromotions,
          events: Array.from(eventsMap.values()),
        },
        { status: 200 },
      );
    } catch {
      // fall through to Express
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
    console.error("Error proxying exhibitor promotions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      exhibitorId,
      eventId,
      packageType,
      targetCategories,
      amount,
      duration,
    } = body;

    devLog("[API] Creating promotion with data:", body);

    if (!exhibitorId || !eventId || !packageType || !targetCategories) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (prisma) {
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        const promotion = await prisma.promotion.create({
          data: {
            exhibitorId,
            eventId,
            packageType,
            targetCategories,
            amount,
            duration,
            status: "ACTIVE",
            startDate,
            endDate,
            impressions: 0,
            clicks: 0,
            conversions: 0,
          },
        });

        return NextResponse.json(
          {
            success: true,
            message: "Promotion created successfully",
            promotion,
          },
          { status: 201 },
        );
      } catch {
        // fall through to Express
      }
    }

    const upstream = await proxyPostJsonToBackend(request, "/api/exhibitors/promotions", body);
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[API] Error creating promotion:", error);
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 502 });
  }
}
