import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newSchedule = {
      id: `schedule_${Date.now()}`,
      name: body.name,
      type: body.type,
      frequency: body.frequency,
      time: body.time,
      dayOfWeek: body.dayOfWeek,
      dayOfMonth: body.dayOfMonth,
      enabled: true,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      retention: body.retention,
      storage: body.storage,
    }

    return NextResponse.json(newSchedule, { status: 201 })
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}
