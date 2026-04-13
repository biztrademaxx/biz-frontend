import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch all products for an exhibitor
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const exhibitorId =(await params).id

    console.log("[v0] Fetching products for exhibitorId:", exhibitorId)

    if (!exhibitorId) {
      console.log("[v0] Error: Exhibitor ID is missing")
      return NextResponse.json({ error: "Exhibitor ID is required" }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: {
        exhibitorId: exhibitorId,
      },
      orderBy: {
        id: "desc",
      },
    })

    console.log("[v0] Found products:", products.length)
    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Create a new product
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const exhibitorId = (await params).id
    const body = await request.json()

    console.log("[v0] Creating product for exhibitorId:", exhibitorId)
    console.log("[v0] Product data:", body)

    if (!exhibitorId) {
      console.log("[v0] Error: Exhibitor ID is missing")
      return NextResponse.json({ error: "Exhibitor ID is required" }, { status: 400 })
    }

    try {
      const exhibitor = await prisma.user.findUnique({
        where: { id: exhibitorId },
      })

      if (!exhibitor) {
        console.log("[v0] Warning: Exhibitor not found, but proceeding with product creation")
      }
    } catch (verifyError) {
      console.log("[v0] Warning: Could not verify exhibitor, but proceeding:", verifyError)
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category || null,
        description: body.description || null,
        price: body.price || null,
        currency: body.currency || null,
        images: body.images || [],
        brochure: body.brochure || [],
        youtube: Array.isArray(body.youtube) ? body.youtube : [body.youtube],
        exhibitorId: exhibitorId,
      },
    })

    console.log("[v0] Product created successfully:", product.id)
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating product:", error)
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
