import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch statistics for legal documents
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const venueId = searchParams.get("venueId")

    if (!venueId) {
      return NextResponse.json({ error: "venueId is required" }, { status: 400 })
    }

    // Count standard documents
    const standardDocuments = await prisma.legalDocument.count({
      where: {
        venueId,
        type: "STANDARD_DOCUMENT",
        status: "ACTIVE",
      },
    })

    // Count signed contracts
    const signedContracts = await prisma.legalDocument.count({
      where: {
        venueId,
        type: "EVENT_CONTRACT",
        status: "SIGNED",
      },
    })

    // Count expiring soon certificates (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringSoon = await prisma.legalDocument.count({
      where: {
        venueId,
        type: "COMPLIANCE_CERTIFICATE",
        status: "EXPIRING_SOON",
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    })

    // Count expired certificates
    const expired = await prisma.legalDocument.count({
      where: {
        venueId,
        type: "COMPLIANCE_CERTIFICATE",
        status: "EXPIRED",
        expiryDate: {
          lt: new Date(),
        },
      },
    })

    return NextResponse.json(
      {
        standardDocuments,
        signedContracts,
        expiringSoon,
        expired,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[LEGAL_DOCUMENTS_STATS]", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
