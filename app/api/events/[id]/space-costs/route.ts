import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id || id.length !== 24) {
      return NextResponse.json({ error: "Invalid event ID format" }, { status: 400 })
    }

    // Fetch exhibition spaces for the event
    const exhibitionSpaces = await prisma.exhibitionSpace.findMany({
      where: { 
        eventId: id,
        isAvailable: true 
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

    // Transform the data into space costs format
    const spaceCosts = exhibitionSpaces.map(space => ({
      id: space.id,
      type: space.name || space.spaceType,
      price: space.basePrice,
      currency: space.currency || "₹",
      description: space.description || `${space.area} sqm ${space.spaceType?.toLowerCase().replace('_', ' ')}`,
      area: space.area,
      dimensions: space.dimensions,
      location: space.location,
      isAvailable: (space.maxBooths || 0) - (space.bookedBooths || 0) > 0,
      availableBooths: (space.maxBooths || 0) - (space.bookedBooths || 0),
      features: [
        space.powerIncluded && "Power Included",
        space.additionalPowerRate && "Additional Power Available",
        space.compressedAirRate && "Compressed Air Available"
      ].filter(Boolean)
    }))

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