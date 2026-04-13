import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface Params {
  id: string
}

// GET /api/events/exhibitors/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> } // params is a Promise
) {
  try {
    const { id: exhibitorId } = await context.params

    if (!exhibitorId) {
      return NextResponse.json(
        { success: false, message: "Exhibitor ID is required" },
        { status: 400 }
      )
    }

    const booths = await prisma.exhibitorBooth.findMany({
      where: { exhibitorId },
      include: {
        exhibitor: true, // make sure exhibitor is included
        event: {
          include: {
            organizer: true,
            venue: true,
            
          },
        },
      },
    })

    // Return booths directly so frontend can access email, booth, status, etc.
    return NextResponse.json(
      {
        success: true,
        booths, 
        status:true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching exhibitor events:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch exhibitor events" },
      { status: 500 }
    )
  }
}
