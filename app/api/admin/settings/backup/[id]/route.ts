import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Mock backup details
    const backup = {
      id,
      name: "Full Backup - Dec 2024",
      type: "full",
      status: "completed",
      size: "2.4 GB",
      sizeBytes: 2576980378,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      duration: "32 min",
      storage: "both",
      encryption: true,
      collections: [],
      retentionDays: 30,
    }

    return NextResponse.json(backup)
  } catch (error) {
    console.error("Error fetching backup:", error)
    return NextResponse.json({ error: "Failed to fetch backup" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // In production, this would delete the actual backup files
    console.log(`Deleting backup: ${id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting backup:", error)
    return NextResponse.json({ error: "Failed to delete backup" }, { status: 500 })
  }
}
