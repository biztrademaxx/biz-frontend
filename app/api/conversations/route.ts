import { NextResponse } from "next/server"

/** Placeholder list until venue/organizer messaging is unified on a single API. */
export async function GET() {
  return NextResponse.json({ success: true, conversations: [] as unknown[] })
}
