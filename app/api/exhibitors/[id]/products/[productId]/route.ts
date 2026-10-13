import { NextResponse } from "next/server"
import { proxyJson } from "@/lib/backend-proxy"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; productId: string }> },
) {
  try {
    const { id, productId } = await params
    return await proxyJson(
      req,
      `/api/exhibitors/${encodeURIComponent(id)}/products/${encodeURIComponent(productId)}`,
    )
  } catch (err) {
    console.error("Proxy GET exhibitor product failed:", err)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; productId: string }> },
) {
  try {
    const { id, productId } = await params
    return await proxyJson(
      req,
      `/api/exhibitors/${encodeURIComponent(id)}/products/${encodeURIComponent(productId)}`,
      { method: "PUT" },
    )
  } catch (err) {
    console.error("Proxy PUT exhibitor product failed:", err)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; productId: string }> },
) {
  try {
    const { id, productId } = await params
    return await proxyJson(
      req,
      `/api/exhibitors/${encodeURIComponent(id)}/products/${encodeURIComponent(productId)}`,
      { method: "DELETE" },
    )
  } catch (err) {
    console.error("Proxy DELETE exhibitor product failed:", err)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
