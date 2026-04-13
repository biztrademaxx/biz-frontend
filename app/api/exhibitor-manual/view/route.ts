// app/api/exhibitor-manual/view/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return new NextResponse('Missing URL', { status: 400 })
  }

  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    return new NextResponse('Failed to fetch PDF', { status: 500 })
  }
}