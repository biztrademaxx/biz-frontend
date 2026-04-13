import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch a single product
export async function GET(request: NextRequest, { params }: { params: Promise<{ exhibitorId: string; productId: string }> }) {
  try {
    const { exhibitorId, productId } =await params

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        exhibitorId: exhibitorId,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product }, { status: 200 })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ exhibitorId: string; productId: string }> }) {
  try {
    const { exhibitorId, productId } =await params
    const body = await request.json()

    // Verify product exists and belongs to exhibitor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        exhibitorId: exhibitorId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: body.name ?? existingProduct.name,
        category: body.category ?? existingProduct.category,
        description: body.description ?? existingProduct.description,
        price: body.price ?? existingProduct.price,
        currency: body.currency ?? existingProduct.currency,
        images: body.images ?? existingProduct.images,
        brochure: body.brochure ?? existingProduct.brochure,
      },
    })

    return NextResponse.json({ product }, { status: 200 })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ exhibitorId: string; productId: string } >}) {
  try {
    const { exhibitorId, productId } =await params

    // Verify product exists and belongs to exhibitor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        exhibitorId: exhibitorId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    })

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
