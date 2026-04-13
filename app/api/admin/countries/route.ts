import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

// GET all countries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeCounts = searchParams.get('includeCounts') === 'true'

    const countries = await prisma.country.findMany({
      include: {
        cities: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            cities: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    let countriesWithData = countries

    if (includeCounts) {
      const countriesWithEventCounts = await Promise.all(
        countries.map(async (country) => {
          try {
            // Get all active cities for this country
            const countryCities = await prisma.city.findMany({
              where: { 
                countryId: country.id,
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

            // Also count country-level events (events directly associated with country)
            const countryNewSystemCount = await prisma.eventsOnCountries.count({
              where: { countryId: country.id }
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

            console.log(`Country: ${country.name}, Total Events: ${totalEventCount}, Cities: ${countryCities.length}`)

            return {
              ...country,
              eventCount: totalEventCount,
              cityCount: country._count.cities,
              debug: {
                totalEventCount,
                cityCount: countryCities.length
              }
            }
          } catch (countError) {
            console.error(`Error counting events for country ${country.name}:`, countError)
            return {
              ...country,
              eventCount: 0,
              cityCount: country._count.cities,
            }
          }
        })
      )

      countriesWithData = countriesWithEventCounts
    }

    return NextResponse.json(countriesWithData)
  } catch (error) {
    console.error("Error fetching countries:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET single country
export async function GET_SINGLE(request: NextRequest, { params }: { params: { id: string } }) {
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

// POST create new country
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
      return await handleFormDataRequest(request)
    } else if (contentType.includes('application/json')) {
      // Handle JSON data (without file upload)
      return await handleJsonRequest(request)
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error creating country:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle form data requests (with file upload)
async function handleFormDataRequest(request: NextRequest) {
  const formData = await request.formData()
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const flagFile = formData.get('flag') as File | null
  const currency = formData.get('currency') as string
  const timezone = formData.get('timezone') as string
  const isActive = formData.get('isActive') === 'true'

  if (!name || !code) {
    return NextResponse.json(
      { error: "Country name and code are required" },
      { status: 400 }
    )
  }

  // Check if country already exists
  const existingCountry = await prisma.country.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        { code: { equals: code.toUpperCase(), mode: 'insensitive' } }
      ]
    }
  })

  if (existingCountry) {
    return NextResponse.json(
      { error: "Country with this name or code already exists" },
      { status: 409 }
    )
  }

  let flagUrl = ""
  let flagPublicId = ""

  // Upload flag image to Cloudinary if provided
  if (flagFile && flagFile.size > 0) {
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

  const country = await prisma.country.create({
    data: {
      name,
      code: code.toUpperCase(),
      flag: flagUrl,
      flagPublicId,
      currency,
      timezone,
      isActive: isActive !== undefined ? isActive : true
    }
  })

  return NextResponse.json({
    ...country,
    eventCount: 0,
    cityCount: 0
  }, { status: 201 })
}

// Handle JSON requests (without file upload)
async function handleJsonRequest(request: NextRequest) {
  const jsonData = await request.json()
  const { name, code, flag, currency, timezone, isActive } = jsonData

  if (!name || !code) {
    return NextResponse.json(
      { error: "Country name and code are required" },
      { status: 400 }
    )
  }

  // Check if country already exists
  const existingCountry = await prisma.country.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        { code: { equals: code.toUpperCase(), mode: 'insensitive' } }
      ]
    }
  })

  if (existingCountry) {
    return NextResponse.json(
      { error: "Country with this name or code already exists" },
      { status: 409 }
    )
  }

  const country = await prisma.country.create({
    data: {
      name,
      code: code.toUpperCase(),
      flag: flag || "",
      currency: currency || "USD",
      timezone: timezone || "UTC",
      isActive: isActive !== undefined ? isActive : true
    }
  })

  return NextResponse.json({
    ...country,
    eventCount: 0,
    cityCount: 0
  }, { status: 201 })
}