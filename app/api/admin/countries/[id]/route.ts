import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

interface RouteParams {
  params: {
    id: string
  }
}

// GET single country
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const country = await prisma.country.findUnique({
      where: { id: params.id },
      include: {
        cities: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { events: true }
            }
          }
        }
      }
    })

    if (!country) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      )
    }

    // Get all active cities for this country
    const countryCities = await prisma.city.findMany({
      where: { 
        countryId: params.id,
        isActive: true 
      },
      select: { id: true, name: true }
    })

    let totalEventCount = 0

    // Count events for each city in this country
    for (const city of countryCities) {
      // Count from new system (EventsOnCities)
      const newSystemCount = await prisma.eventsOnCities.count({
        where: { cityId: city.id }
      })

      // Count from old system (events with venue in this city)
      const oldSystemCount = await prisma.event.count({
        where: {
          venue: {
            venueCity: city.name
          },
          isPublic: true
        }
      })

      totalEventCount += newSystemCount + oldSystemCount
    }

    // Also count country-level events
    const countryNewSystemCount = await prisma.eventsOnCountries.count({
      where: { countryId: params.id }
    })

    const countryOldSystemCount = await prisma.event.count({
      where: {
        OR: [
          { venue: { venueCountry: country.name } },
          { venue: { venueCountry: { contains: country.name, mode: 'insensitive' } } },
          { venue: { venueCountry: { contains: country.code, mode: 'insensitive' } } }
        ],
        isPublic: true
      }
    })

    totalEventCount += countryNewSystemCount + countryOldSystemCount

    return NextResponse.json({
      ...country,
      eventCount: totalEventCount,
      cities: country.cities.map(city => ({
        ...city,
        eventCount: city._count.events
      })),
      debug: {
        totalEventCount,
        cityCount: countryCities.length,
        countryLevelEvents: countryNewSystemCount + countryOldSystemCount
      }
    })
  } catch (error) {
    console.error("Error fetching country:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT update country
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check content type
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle form data with file upload
      return await handleFormDataRequest(request, params.id)
    } else if (contentType.includes('application/json')) {
      // Handle JSON data (without file upload)
      return await handleJsonRequest(request, params.id)
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error updating country:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle form data requests (with file upload)
async function handleFormDataRequest(request: NextRequest, countryId: string) {
  const formData = await request.formData()
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const flagFile = formData.get('flag') as File | null
  const removeFlag = formData.get('removeFlag') === 'true'
  const currency = formData.get('currency') as string
  const timezone = formData.get('timezone') as string
  const isActive = formData.get('isActive') === 'true'
  const isPermitted = formData.get('isPermitted') === 'true'

  // Check if country exists
  const existingCountry = await prisma.country.findUnique({
    where: { id: countryId }
  })

  if (!existingCountry) {
    return NextResponse.json(
      { error: "Country not found" },
      { status: 404 }
    )
  }

  // Check for duplicates
  if ((name && name !== existingCountry.name) || (code && code !== existingCountry.code)) {
    const duplicateCountry = await prisma.country.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { code: { equals: code?.toUpperCase(), mode: 'insensitive' } }
        ],
        id: { not: countryId }
      }
    })

    if (duplicateCountry) {
      return NextResponse.json(
        { error: "Country with this name or code already exists" },
        { status: 409 }
      )
    }
  }

  let flagUrl = existingCountry.flag
  let flagPublicId = existingCountry.flagPublicId

  // Handle flag removal
  if (removeFlag && existingCountry.flagPublicId) {
    try {
      await deleteFromCloudinary(existingCountry.flagPublicId)
      flagUrl = ""
      flagPublicId = ""
    } catch (error) {
      console.error("Error deleting flag from Cloudinary:", error)
    }
  }

  // Handle new flag upload
  if (flagFile && flagFile.size > 0) {
    // Delete old flag if exists
    if (existingCountry.flagPublicId) {
      try {
        await deleteFromCloudinary(existingCountry.flagPublicId)
      } catch (error) {
        console.error("Error deleting old flag:", error)
      }
    }

    // Upload new flag
    try {
      const uploadResult = await uploadToCloudinary(flagFile, "flags")
      flagUrl = uploadResult.secure_url
      flagPublicId = uploadResult.public_id
    } catch (uploadError) {
      console.error("Error uploading flag:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload flag image" },
        { status: 500 }
      )
    }
  }

  const updatedCountry = await prisma.country.update({
    where: { id: countryId },
    data: {
      name: name || existingCountry.name,
      code: code ? code.toUpperCase() : existingCountry.code,
      flag: flagUrl,
      flagPublicId,
      currency: currency || existingCountry.currency,
      timezone: timezone || existingCountry.timezone,
      isActive: isActive !== undefined ? isActive : existingCountry.isActive,
      isPermitted: isPermitted !== undefined ? isPermitted : existingCountry.isPermitted
    },
    include: {
      cities: {
        where: { isActive: true },
        include: {
          _count: {
            select: { events: true }
          }
        }
      }
    }
  })

  // Get updated event count
  const newSystemCount = await prisma.eventsOnCountries.count({
    where: { countryId: countryId }
  })

  const oldSystemCount = await prisma.event.count({
    where: {
      OR: [
        { venue: { venueCountry: updatedCountry.name } },
        { venue: { venueCountry: { contains: updatedCountry.name, mode: 'insensitive' } } },
        { venue: { venueCountry: { contains: updatedCountry.code, mode: 'insensitive' } } }
      ],
      isPublic: true
    }
  })

  return NextResponse.json({
    ...updatedCountry,
    eventCount: newSystemCount + oldSystemCount,
    cities: updatedCountry.cities.map(city => ({
      ...city,
      eventCount: city._count.events
    }))
  })
}

// Handle JSON requests (without file upload)
async function handleJsonRequest(request: NextRequest, countryId: string) {
  const jsonData = await request.json()
  const { name, code, flag, currency, timezone, isActive, isPermitted } = jsonData

  // Check if country exists
  const existingCountry = await prisma.country.findUnique({
    where: { id: countryId }
  })

  if (!existingCountry) {
    return NextResponse.json(
      { error: "Country not found" },
      { status: 404 }
    )
  }

  // Check for duplicates
  if ((name && name !== existingCountry.name) || (code && code !== existingCountry.code)) {
    const duplicateCountry = await prisma.country.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { code: { equals: code?.toUpperCase(), mode: 'insensitive' } }
        ],
        id: { not: countryId }
      }
    })

    if (duplicateCountry) {
      return NextResponse.json(
        { error: "Country with this name or code already exists" },
        { status: 409 }
      )
    }
  }

  const updatedCountry = await prisma.country.update({
    where: { id: countryId },
    data: {
      name: name || existingCountry.name,
      code: code ? code.toUpperCase() : existingCountry.code,
      flag: flag !== undefined ? flag : existingCountry.flag,
      currency: currency || existingCountry.currency,
      timezone: timezone || existingCountry.timezone,
      isActive: isActive !== undefined ? isActive : existingCountry.isActive,
      isPermitted: isPermitted !== undefined ? isPermitted : existingCountry.isPermitted
    },
    include: {
      cities: {
        where: { isActive: true },
        include: {
          _count: {
            select: { events: true }
          }
        }
      }
    }
  })

  // Get updated event count
  const newSystemCount = await prisma.eventsOnCountries.count({
    where: { countryId: countryId }
  })

  const oldSystemCount = await prisma.event.count({
    where: {
      OR: [
        { venue: { venueCountry: updatedCountry.name } },
        { venue: { venueCountry: { contains: updatedCountry.name, mode: 'insensitive' } } },
        { venue: { venueCountry: { contains: updatedCountry.code, mode: 'insensitive' } } }
      ],
      isPublic: true
    }
  })

  return NextResponse.json({
    ...updatedCountry,
    eventCount: newSystemCount + oldSystemCount,
    cities: updatedCountry.cities.map(city => ({
      ...city,
      eventCount: city._count.events
    }))
  })
}

// DELETE country
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if country exists and has events/cities
    const country = await prisma.country.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            events: true,
            cities: true
          }
        }
      }
    })

    if (!country) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      )
    }

    if (country._count.events > 0 || country._count.cities > 0) {
      return NextResponse.json(
        { error: "Cannot delete country with associated events or cities" },
        { status: 400 }
      )
    }

    // Delete flag from Cloudinary if exists
    if (country.flagPublicId) {
      try {
        await deleteFromCloudinary(country.flagPublicId)
      } catch (error) {
        console.error("Error deleting flag from Cloudinary:", error)
      }
    }

    await prisma.country.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Country deleted successfully" })
  } catch (error) {
    console.error("Error deleting country:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}