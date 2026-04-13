import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {Cloudinary } from "@/lib/cloudinary"

// GET - Fetch single legal document
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const document = await prisma.legalDocument.findUnique({
      where: { id: (await params).id },
      include: {
        venue: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            venueName: true,
            venueEmail: true,
            venuePhone: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Increment download count
    await prisma.legalDocument.update({
      where: { id:(await params).id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    })

    return NextResponse.json({ document }, { status: 200 })
  } catch (error) {
    console.error("[LEGAL_DOCUMENT_GET]", error)
    return NextResponse.json({ error: "Failed to fetch legal document" }, { status: 500 })
  }
}

// PATCH - Update legal document
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    // Get existing document
    const existingDocument = await prisma.legalDocument.findUnique({
      where: { id: (await params).id },
    })

    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const updateData: any = {}

    // Update text fields if provided
    const name = formData.get("name") as string | null
    const description = formData.get("description") as string | null
    const type = formData.get("type") as string | null
    const category = formData.get("category") as string | null
    const version = formData.get("version") as string | null
    const status = formData.get("status") as string | null

    if (name) updateData.name = name
    if (description !== null) updateData.description = description
    if (type) updateData.type = type
    if (category) updateData.category = category
    if (version) updateData.version = version
    if (status) updateData.status = status

    // Handle file upload if new file provided
    if (file) {
      // Delete old file from Cloudinary if exists
      if (existingDocument.fileUrl) {
        try {
          const publicId = existingDocument.fileUrl.split("/").slice(-2).join("/").split(".")[0]
          await Cloudinary.uploader.destroy(publicId)
        } catch (error) {
          console.error("Error deleting old file:", error)
        }
      }

      // Upload new file
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

      updateData.fileUrl = uploadResult.secure_url
      updateData.fileName = file.name
      updateData.fileSize = file.size
      updateData.mimeType = file.type
    }

    // Update event contract fields if provided
    const eventId = formData.get("eventId") as string | null
    const organizerName = formData.get("organizerName") as string | null
    const organizerId = formData.get("organizerId") as string | null
    const contractValue = formData.get("contractValue") as string | null
    const currency = formData.get("currency") as string | null
    const eventDate = formData.get("eventDate") as string | null
    const signedDate = formData.get("signedDate") as string | null

    if (eventId !== null) updateData.eventId = eventId
    if (organizerName !== null) updateData.organizerName = organizerName
    if (organizerId !== null) updateData.organizerId = organizerId
    if (contractValue !== null) updateData.contractValue = Number.parseFloat(contractValue)
    if (currency !== null) updateData.currency = currency
    if (eventDate !== null) updateData.eventDate = new Date(eventDate)
    if (signedDate !== null) updateData.signedDate = new Date(signedDate)

    // Update compliance fields if provided
    const issuingAuthority = formData.get("issuingAuthority") as string | null
    const certificateNumber = formData.get("certificateNumber") as string | null
    const issueDate = formData.get("issueDate") as string | null
    const expiryDate = formData.get("expiryDate") as string | null

    if (issuingAuthority !== null) updateData.issuingAuthority = issuingAuthority
    if (certificateNumber !== null) updateData.certificateNumber = certificateNumber
    if (issueDate !== null) updateData.issueDate = new Date(issueDate)
    if (expiryDate !== null) updateData.expiryDate = new Date(expiryDate)

    const document = await prisma.legalDocument.update({
      where: { id: (await params).id },
      data: updateData,
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

    return NextResponse.json({ document }, { status: 200 })
  } catch (error) {
    console.error("[LEGAL_DOCUMENT_PATCH]", error)
    return NextResponse.json({ error: "Failed to update legal document" }, { status: 500 })
  }
}

// DELETE - Delete legal document
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const document = await prisma.legalDocument.findUnique({
      where: { id:(await params).id },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete file from Cloudinary if exists
    if (document.fileUrl) {
      try {
        const publicId = document.fileUrl.split("/").slice(-2).join("/").split(".")[0]
        await Cloudinary.uploader.destroy(publicId)
      } catch (error) {
        console.error("Error deleting file from Cloudinary:", error)
      }
    }

    // Delete document from database
    await prisma.legalDocument.delete({
      where: { id:(await params).id },
    })

    return NextResponse.json({ message: "Document deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[LEGAL_DOCUMENT_DELETE]", error)
    return NextResponse.json({ error: "Failed to delete legal document" }, { status: 500 })
  }
}
