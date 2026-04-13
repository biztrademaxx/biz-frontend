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

// GET single city
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const city = await prisma.city.findUnique({
      where: { id: params.id },
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

    if (!city) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      )
    }

    // Get event count
    const newSystemCount = await prisma.eventsOnCities.count({
      where: { cityId: params.id }
    })

    const oldSystemCount = await prisma.event.count({
      where: {
        venue: {
          venueCity: city.name
        },
        isPublic: true
      }
    })

    const totalEventCount = newSystemCount + oldSystemCount

    return NextResponse.json({
      ...city,
      eventCount: totalEventCount
    })
  } catch (error) {
    console.error("Error fetching city:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT update city
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
    console.error("Error updating city:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle form data requests (with file upload)
async function handleFormDataRequest(request: NextRequest, cityId: string) {
  const formData = await request.formData()
  const name = formData.get('name') as string
  const countryId = formData.get('countryId') as string
  const latitude = formData.get('latitude') as string
  const longitude = formData.get('longitude') as string
  const timezone = formData.get('timezone') as string
  const imageFile = formData.get('image') as File | null
  const removeImage = formData.get('removeImage') === 'true'
  const isActive = formData.get('isActive') === 'true'
  const isPermitted = formData.get('isPermitted') === 'true'

  // Check if city exists
  const existingCity = await prisma.city.findUnique({
    where: { id: cityId }
  })

  if (!existingCity) {
    return NextResponse.json(
      { error: "City not found" },
      { status: 404 }
    )
  }

  // Check for duplicates
  if (name && name !== existingCity.name) {
    const duplicateCity = await prisma.city.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        countryId: countryId || existingCity.countryId,
        id: { not: cityId }
      }
    })

    if (duplicateCity) {
      return NextResponse.json(
        { error: "City with this name already exists in the selected country" },
        { status: 409 }
      )
    }
  }

  let imageUrl = existingCity.image
  let imagePublicId = existingCity.imagePublicId

  // Handle image removal
  if (removeImage && existingCity.imagePublicId) {
    try {
      await deleteFromCloudinary(existingCity.imagePublicId)
      imageUrl = ""
      imagePublicId = ""
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error)
    }
  }

  // Handle new image upload
  if (imageFile && imageFile.size > 0) {
    // Delete old image if exists
    if (existingCity.imagePublicId) {
      try {
        await deleteFromCloudinary(existingCity.imagePublicId)
      } catch (error) {
        console.error("Error deleting old image:", error)
      }
    }

    // Upload new image
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

  const updatedCity = await prisma.city.update({
    where: { id: cityId },
    data: {
      name: name || existingCity.name,
      countryId: countryId || existingCity.countryId,
      latitude: latitude ? parseFloat(latitude) : existingCity.latitude,
      longitude: longitude ? parseFloat(longitude) : existingCity.longitude,
      timezone: timezone || existingCity.timezone,
      image: imageUrl,
      imagePublicId,
      isActive: isActive !== undefined ? isActive : existingCity.isActive,
      isPermitted: isPermitted !== undefined ? isPermitted : existingCity.isPermitted
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

  // Get updated event count
  const newSystemCount = await prisma.eventsOnCities.count({
    where: { cityId: cityId }
  })

  const oldSystemCount = await prisma.event.count({
    where: {
      venue: {
        venueCity: updatedCity.name
      },
      isPublic: true
    }
  })

  const totalEventCount = newSystemCount + oldSystemCount

  return NextResponse.json({
    ...updatedCity,
    eventCount: totalEventCount
  })
}

// Handle JSON requests (without file upload)
async function handleJsonRequest(request: NextRequest, cityId: string) {
  const jsonData = await request.json()
  const { name, countryId, latitude, longitude, timezone, image, isActive, isPermitted } = jsonData

  // Check if city exists
  const existingCity = await prisma.city.findUnique({
    where: { id: cityId }
  })

  if (!existingCity) {
    return NextResponse.json(
      { error: "City not found" },
      { status: 404 }
    )
  }

  // Check for duplicates
  if (name && name !== existingCity.name) {
    const duplicateCity = await prisma.city.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        countryId: countryId || existingCity.countryId,
        id: { not: cityId }
      }
    })

    if (duplicateCity) {
      return NextResponse.json(
        { error: "City with this name already exists in the selected country" },
        { status: 409 }
      )
    }
  }

  const updatedCity = await prisma.city.update({
    where: { id: cityId },
    data: {
      name: name || existingCity.name,
      countryId: countryId || existingCity.countryId,
      latitude: latitude ? parseFloat(latitude) : existingCity.latitude,
      longitude: longitude ? parseFloat(longitude) : existingCity.longitude,
      timezone: timezone || existingCity.timezone,
      image: image !== undefined ? image : existingCity.image,
      isActive: isActive !== undefined ? isActive : existingCity.isActive,
      isPermitted: isPermitted !== undefined ? isPermitted : existingCity.isPermitted
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

  // Get updated event count
  const newSystemCount = await prisma.eventsOnCities.count({
    where: { cityId: cityId }
  })

  const oldSystemCount = await prisma.event.count({
    where: {
      venue: {
        venueCity: updatedCity.name
      },
      isPublic: true
    }
  })

  const totalEventCount = newSystemCount + oldSystemCount

  return NextResponse.json({
    ...updatedCity,
    eventCount: totalEventCount
  })
}

// DELETE city
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if city exists and has events
    const city = await prisma.city.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            events: true
          }
        }
      }
    })

    if (!city) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      )
    }

    if (city._count.events > 0) {
      return NextResponse.json(
        { error: "Cannot delete city with associated events" },
        { status: 400 }
      )
    }

    // Delete image from Cloudinary if exists
    if (city.imagePublicId) {
      try {
        await deleteFromCloudinary(city.imagePublicId)
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error)
      }
    }

    await prisma.city.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "City deleted successfully" })
  } catch (error) {
    console.error("Error deleting city:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}