// app/api/faqs/route.ts - UPDATED
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
    const dashboardType = searchParams.get('dashboardType')
    const category = searchParams.get('category')

    let whereClause: any = { isActive: true }

    if (userRole) {
      whereClause.userRoles = {
        has: userRole
      }
    }

    if (dashboardType) {
      whereClause.dashboardTypes = {
        has: dashboardType
      }
    }

    if (category) {
      whereClause.category = category
    }

    const faqs = await prisma.fAQ.findMany({
      where: whereClause,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
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
    if (!body.question || !body.answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    const newFAQ = await prisma.fAQ.create({
      data: {
        ...body,
        userRoles: body.userRoles || ['ORGANIZER'],
        dashboardTypes: body.dashboardTypes || ['ORGANIZER_DASHBOARD'],
        order: body.order || 0,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json(newFAQ, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    )
  }
}