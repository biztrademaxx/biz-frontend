import { NextResponse } from "next/server"

/** Placeholder until per-conversation history is wired for venue dashboard. */
export async function GET() {
  return NextResponse.json({ success: true, messages: [] as unknown[] })
}
