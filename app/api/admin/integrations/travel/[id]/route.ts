import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Return mock partner details
    return NextResponse.json({
      partner: {
        id,
        name: "Partner",
        type: "hotel",
        isActive: true,
      },
    })
  } catch (error) {
    console.error("Error fetching travel partner:", error)
    return NextResponse.json({ error: "Failed to fetch travel partner" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Update partner
    return NextResponse.json({
      success: true,
      partner: { id, ...body },
    })
  } catch (error) {
    console.error("Error updating travel partner:", error)
    return NextResponse.json({ error: "Failed to update travel partner" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Delete partner
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error deleting travel partner:", error)
    return NextResponse.json({ error: "Failed to delete travel partner" }, { status: 500 })
  }
}
