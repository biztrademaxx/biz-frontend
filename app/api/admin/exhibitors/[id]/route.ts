import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const exhibitor = await prisma.user.findFirst({
      where: {
        id,
        role: "EXHIBITOR",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        company: true,
        jobTitle: true,
        location: true,
        website: true,
        linkedin: true,
        twitter: true,
        businessEmail: true,
        businessPhone: true,
        businessAddress: true,
        taxId: true,
        companyIndustry: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        // Include related data
        exhibitorBooths: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            images: true,
          },
        },
        _count: {
          select: {
            exhibitorBooths: true,
            products: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!exhibitor) {
      return NextResponse.json({ error: "Exhibitor not found" }, { status: 404 })
    }

    return NextResponse.json({ exhibitor })
  } catch (error) {
    console.error("Error fetching exhibitor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const {
      firstName,
      lastName,
      email,
      phone,
      bio,
      company,
      jobTitle,
      location,
      website,
      linkedin,
      twitter,
      businessEmail,
      businessPhone,
      businessAddress,
      taxId,
      companyIndustry,
      isVerified,
      isActive,
    } = body

    // Check if exhibitor exists
    const existingExhibitor = await prisma.user.findFirst({
      where: {
        id,
        role: "EXHIBITOR",
      },
    })

    if (!existingExhibitor) {
      return NextResponse.json({ error: "Exhibitor not found" }, { status: 404 })
    }

    // Check email uniqueness if email is being updated
    if (email && email !== existingExhibitor.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 },
        )
      }
    }

    // Update exhibitor
    const updatedExhibitor = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        bio,
        company,
        jobTitle,
        location,
        website,
        linkedin,
        twitter,
        businessEmail,
        businessPhone,
        businessAddress,
        taxId,
        companyIndustry,
        isVerified,
        isActive,
      },
    })

    // Remove password from response
    const { password: _, ...exhibitorWithoutPassword } = updatedExhibitor

    return NextResponse.json({
      exhibitor: exhibitorWithoutPassword,
      message: "Exhibitor updated successfully",
    })
  } catch (error) {
    console.error("Error updating exhibitor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Check if exhibitor exists
    const existingExhibitor = await prisma.user.findFirst({
      where: {
        id,
        role: "EXHIBITOR",
      },
    })

    if (!existingExhibitor) {
      return NextResponse.json({ error: "Exhibitor not found" }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({
      message: "Exhibitor deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting exhibitor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}