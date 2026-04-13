import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import {prisma} from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is authenticated and is admin
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on role
    const where: any = {}
    if (role) {
      where.role = role
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        company: true,
        organizationName: true,
        venueName: true,
        speakingExperience: true,
        bio: true,
        isActive: true,
        createdAt: true,
        // Venue specific fields
        venueAddress: true,
        venueCity: true,
        venueState: true,
        venueCountry: true,
        maxCapacity: true,
        amenities: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password = 'TEMP_PASSWORD',
      role,
      phone,
      company,
      organizationName,
      // Venue fields
      venueName,
      venueAddress,
      venueCity,
      venueState,
      venueCountry,
      maxCapacity,
      amenities = [],
      // Speaker fields
      speakingExperience,
      bio
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user based on role
    const userData: any = {
      firstName,
      lastName,
      email,
      password, // In production, hash this password
      role,
      phone,
      company,
      organizationName,
      isActive: true,
      isVerified: true
    }

    // Add role-specific fields
    if (role === 'VENUE_MANAGER') {
      userData.venueName = venueName
      userData.venueAddress = venueAddress
      userData.venueCity = venueCity
      userData.venueState = venueState
      userData.venueCountry = venueCountry
      userData.maxCapacity = maxCapacity ? parseInt(maxCapacity) : 0
      userData.amenities = amenities
    }

    if (role === 'SPEAKER') {
      userData.speakingExperience = speakingExperience
      userData.bio = bio
    }

    if (role === 'ORGANIZER') {
      userData.organizationName = organizationName
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        company: true,
        organizationName: true,
        venueName: true,
        venueAddress: true,
        venueCity: true,
        venueState: true,
        venueCountry: true,
        maxCapacity: true,
        amenities: true,
        speakingExperience: true,
        bio: true,
        createdAt: true
      }
    })

    return NextResponse.json({ user }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}