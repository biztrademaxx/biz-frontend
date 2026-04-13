import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

// GET all cities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeCounts = searchParams.get('includeCounts') === 'true'
    const countryId = searchParams.get('countryId')

    const whereClause: any = {}
    if (countryId) {
      whereClause.countryId = countryId
    }

    const cities = await prisma.city.findMany({
      where: whereClause,
      include: {
        country: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    let citiesWithData = cities

    if (includeCounts) {
      // Get event counts from both systems
      const citiesWithEventCounts = await Promise.all(
        cities.map(async (city) => {
          // Count from new system (EventsOnCities)
          const newSystemCount = await prisma.eventsOnCities.count({
            where: {
              cityId: city.id
            }
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

          const totalEventCount = newSystemCount + oldSystemCount
          
          return {
            ...city,
            eventCount: totalEventCount
          }
        })
      )

      citiesWithData = citiesWithEventCounts
    }

    return NextResponse.json(citiesWithData)
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST create new city
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check content type
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle form data with file upload
      return await handleCityFormDataRequest(request)
    } else if (contentType.includes('application/json')) {
      // Handle JSON data (without file upload)
      return await handleCityJsonRequest(request)
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error creating city:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle form data requests (with file upload)
async function handleCityFormDataRequest(request: NextRequest) {
  const formData = await request.formData()
  const name = formData.get('name') as string
  const countryId = formData.get('countryId') as string
  const latitude = formData.get('latitude') as string
  const longitude = formData.get('longitude') as string
  const timezone = formData.get('timezone') as string
  const imageFile = formData.get('image') as File | null
  const isActive = formData.get('isActive') === 'true'

  if (!name || !countryId) {
    return NextResponse.json(
      { error: "City name and country are required" },
      { status: 400 }
    )
  }

  // Check if country exists
  const country = await prisma.country.findUnique({
    where: { id: countryId }
  })

  if (!country) {
    return NextResponse.json(
      { error: "Country not found" },
      { status: 404 }
    )
  }

  // Check if city already exists in this country
  const existingCity = await prisma.city.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      countryId: countryId
    }
  })

  if (existingCity) {
    return NextResponse.json(
      { error: "City with this name already exists in the selected country" },
      { status: 409 }
    )
  }

  let imageUrl = ""
  let imagePublicId = ""

  // Upload city image to Cloudinary if provided
  if (imageFile && imageFile.size > 0) {
    try {
      const uploadResult = await uploadToCloudinary(imageFile, "cities")
      imageUrl = uploadResult.secure_url
      imagePublicId = uploadResult.public_id
    } catch (uploadError) {
      console.error("Error uploading city image:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload city image" },
        { status: 500 }
      )
    }
  }

  const city = await prisma.city.create({
    data: {
      name,
      countryId,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      timezone,
      image: imageUrl,
      imagePublicId,
      isActive
    },
    include: {
      country: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    }
  })

  return NextResponse.json({
    ...city,
    eventCount: 0
  }, { status: 201 })
}

// Handle JSON requests (without file upload)
async function handleCityJsonRequest(request: NextRequest) {
  const jsonData = await request.json()
  const { name, countryId, latitude, longitude, timezone, image, isActive } = jsonData

  if (!name || !countryId) {
    return NextResponse.json(
      { error: "City name and country are required" },
      { status: 400 }
    )
  }

  // Check if country exists
  const country = await prisma.country.findUnique({
    where: { id: countryId }
  })

  if (!country) {
    return NextResponse.json(
      { error: "Country not found" },
      { status: 404 }
    )
  }

  // Check if city already exists in this country
  const existingCity = await prisma.city.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      countryId: countryId
    }
  })

  if (existingCity) {
    return NextResponse.json(
      { error: "City with this name already exists in the selected country" },
      { status: 409 }
    )
  }

  const city = await prisma.city.create({
    data: {
      name,
      countryId,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      timezone: timezone || "UTC",
      image: image || "",
      isActive: isActive !== undefined ? isActive : true
    },
    include: {
      country: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    }
  })

  return NextResponse.json({
    ...city,
    eventCount: 0
  }, { status: 201 })
}