import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {Cloudinary} from "@/lib/cloudinary"

function mapCategoryToType(category: string): string | undefined {
  const categoryMap: Record<string, string> = {
    standard: "STANDARD_DOCUMENT",
    contract: "EVENT_CONTRACT",
    compliance: "COMPLIANCE_CERTIFICATE",
  }
  return categoryMap[category]
}

// GET - Fetch all legal documents with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const venueId = searchParams.get("venueId")
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    const where: any = {}

    if (venueId) where.venueId = venueId
    if (type) where.type = type
    if (category) {
      const mappedType = mapCategoryToType(category)
      if (mappedType) {
        where.type = mappedType
      }
    }
    if (status) where.status = status

    const documents = await prisma.legalDocument.findMany({
      where,
      include: {
        venue: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            venueName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ documents }, { status: 200 })
  } catch (error) {
    console.error("[LEGAL_DOCUMENTS_GET]", error)
    return NextResponse.json({ error: "Failed to fetch legal documents" }, { status: 500 })
  }
}

// POST - Create new legal document with file upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    // Extract document data
    const name = formData.get("name") as string
    const description = formData.get("description") as string | null
    const type = formData.get("type") as string
    const category = formData.get("category") as string
    const venueId = formData.get("venueId") as string
    const version = formData.get("version") as string | null
    const status = formData.get("status") as string | null

    // Event contract specific fields
    const eventId = formData.get("eventId") as string | null
    const organizerName = formData.get("organizerName") as string | null
    const organizerId = formData.get("organizerId") as string | null
    const contractValue = formData.get("contractValue") as string | null
    const currency = formData.get("currency") as string | null
    const eventDate = formData.get("eventDate") as string | null
    const signedDate = formData.get("signedDate") as string | null

    // Compliance specific fields
    const issuingAuthority = formData.get("issuingAuthority") as string | null
    const certificateNumber = formData.get("certificateNumber") as string | null
    const issueDate = formData.get("issueDate") as string | null
    const expiryDate = formData.get("expiryDate") as string | null

    let fileUrl: string | null = null
    let fileName: string | null = null
    let fileSize: number | null = null
    let mimeType: string | null = null

    // Upload file to Cloudinary if provided
    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = Cloudinary.uploader.upload_stream(
          {
            folder: "legal-documents",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        uploadStream.end(buffer)
      })

      fileUrl = uploadResult.secure_url
      fileName = file.name
      fileSize = file.size
      mimeType = file.type
    }

    const documentType = mapCategoryToType(category) || type

    // Create document in database
    const document = await prisma.legalDocument.create({
      data: {
        name,
        description,
        type: documentType as any,
        category: "OTHER" as any, // Use a default category enum value
        venueId,
        version: version || "1.0",
        status: (status as any) || "ACTIVE",
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        // Event contract fields
        eventId,
        organizerName,
        organizerId,
        contractValue: contractValue ? Number.parseFloat(contractValue) : null,
        currency,
        eventDate: eventDate ? new Date(eventDate) : null,
        signedDate: signedDate ? new Date(signedDate) : null,
        // Compliance fields
        issuingAuthority,
        certificateNumber,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
      include: {
        venue: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            venueName: true,
          },
        },
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error("[LEGAL_DOCUMENTS_POST]", error)
    return NextResponse.json({ error: "Failed to create legal document" }, { status: 500 })
  }
}
