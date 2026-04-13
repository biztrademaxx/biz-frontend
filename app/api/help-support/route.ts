// app/api/help-support/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('userRole')

    let whereClause: any = {}

    if (userRole) {
      whereClause.userRole = userRole
    }

    const contacts = await prisma.helpSupportContent.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching help support contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch help support contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Add validation
    if (!body.userRole || !body.pageTitle || !body.supportEmail || !body.supportPhone) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    const newContact = await prisma.helpSupportContent.create({
      data: {
        ...body,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json(newContact, { status: 201 })
  } catch (error) {
    console.error('Error creating help support contact:', error)
    return NextResponse.json(
      { error: 'Failed to create help support contact' },
      { status: 500 }
    )
  }
}