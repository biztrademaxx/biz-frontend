// app/api/faqs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma as legacyPrisma } from '@/lib/prisma'

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  const routeParams = await params
  const prisma = legacyPrisma
  if (!prisma) return NextResponse.json({ error: "Database is not configured for this legacy endpoint" }, { status: 503 })

  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faq = await prisma.fAQ.findUnique({
      where: { id: routeParams.id }
    })

    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQ' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const routeParams = await params
  const prisma = legacyPrisma
  if (!prisma) return NextResponse.json({ error: "Database is not configured for this legacy endpoint" }, { status: 503 })

  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const updatedFAQ = await prisma.fAQ.update({
      where: { id: routeParams.id },
      data: body
    })

    return NextResponse.json(updatedFAQ)
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const routeParams = await params
  const prisma = legacyPrisma
  if (!prisma) return NextResponse.json({ error: "Database is not configured for this legacy endpoint" }, { status: 503 })

  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.fAQ.delete({
      where: { id: routeParams.id }
    })

    return NextResponse.json({ message: 'FAQ deleted successfully' })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    )
  }
}