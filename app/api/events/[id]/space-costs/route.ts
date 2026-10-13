import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid event ID format" }, { status: 400 })
    }

    const eventRow = await prisma.event.findUnique({
      where: { id },
      select: { currency: true },
    })
    const eventCurrency = eventRow?.currency?.trim() || "USD"

    // Fetch exhibition spaces for the event (public: Shell + Raw only)
    const exhibitionSpaces = await prisma.exhibitionSpace.findMany({
      where: {
        eventId: id,
        isAvailable: true,
        spaceType: { in: ["SHELL_SPACE", "RAW_SPACE"] },
      },
      select: {
        id: true,
        spaceType: true,
        name: true,
        description: true,
        dimensions: true,
        area: true,
        location: true,
        basePrice: true,
        pricePerSqm: true,
        minArea: true,
        currency: true,
        powerIncluded: true,
        additionalPowerRate: true,
        compressedAirRate: true,
        unit: true,
        pricePerUnit: true,
        isFixed: true,
        maxBooths: true,
        bookedBooths: true,
      },
      orderBy: { basePrice: "asc" }
    })

    const spaceCosts = exhibitionSpaces.map((space) => {
      const pricePerSqm = Number(space.pricePerSqm ?? 0)
      const minArea = Number(space.minArea ?? 0)
      const computedTotal = pricePerSqm > 0 && minArea > 0 ? pricePerSqm * minArea : Number(space.basePrice ?? 0)
      const cur = (space.currency && space.currency.trim()) || eventCurrency
      return {
        id: space.id,
        spaceType: space.spaceType,
        hallName: space.name,
        type: space.spaceType,
        price: computedTotal,
        pricePerSqm,
        minArea: minArea || null,
        totalMinAmount: computedTotal,
        currency: cur,
        unit: space.unit || "sqm",
        description: space.description || "",
        area: space.area,
        dimensions: space.dimensions,
        location: space.location,
        isAvailable: (space.maxBooths || 0) - (space.bookedBooths || 0) > 0,
        availableBooths: (space.maxBooths || 0) - (space.bookedBooths || 0),
        features: [
          space.powerIncluded && "Power Included",
          space.additionalPowerRate && "Additional Power Available",
          space.compressedAirRate && "Compressed Air Available",
        ].filter(Boolean),
      }
    })

    return NextResponse.json({
      success: true,
      spaceCosts,
      totalSpaces: spaceCosts.length,
      availableSpaces: spaceCosts.filter(space => space.isAvailable).length
    })

  } catch (error) {
    console.error("Error fetching space costs:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch space costs",
        spaceCosts: [] 
      }, 
      { status: 500 }
    )
  }
}