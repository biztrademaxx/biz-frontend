import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.$connect()

    const speaker = await prisma.user.findUnique({
      where: {
        id,
        role: "SPEAKER",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        company: true,
        jobTitle: true,
        location: true,
        website: true,
        linkedin: true,
        twitter: true,
        specialties: true,
        achievements: true,
        certifications: true,
        speakingExperience: true,
        isVerified: true,
        totalEvents: true,
        activeEvents: true,
        totalAttendees: true,
        totalRevenue: true,
        averageRating: true,
        totalReviews: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!speaker) {
      return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 })
    }

    const profile = {
      fullName: `${speaker.firstName} ${speaker.lastName}`,
      designation: speaker.jobTitle || "",
      company: speaker.company || "",
      email: speaker.email,
      phone: speaker.phone || "",
      linkedin: speaker.linkedin || "",
      website: speaker.website || "",
      location: speaker.location || "",
      bio: speaker.bio || "",
      speakingExperience: speaker.speakingExperience || "",
      avatar: speaker.avatar || undefined,
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error("Error fetching speaker:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log("[v0] Received update request for speaker:", id)
    console.log("[v0] Update data:", body)
    console.log("[v0] Avatar in request:", body.avatar)

    await prisma.$connect()

    const existingSpeaker = await prisma.user.findUnique({
      where: { id, role: "SPEAKER" },
    })

    if (!existingSpeaker) {
      return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 })
    }

    const [firstName, ...lastNameParts] = (body.fullName || "").split(" ")
    const lastName = lastNameParts.join(" ")

    const updateData: any = {
      firstName: firstName || existingSpeaker.firstName,
      lastName: lastName || existingSpeaker.lastName,
      email: body.email || existingSpeaker.email,
      phone: body.phone || existingSpeaker.phone,
      bio: body.bio || existingSpeaker.bio,
      company: body.company || existingSpeaker.company,
      jobTitle: body.designation || existingSpeaker.jobTitle,
      location: body.location || existingSpeaker.location,
      website: body.website || existingSpeaker.website,
      linkedin: body.linkedin || existingSpeaker.linkedin,
      speakingExperience: body.speakingExperience || existingSpeaker.speakingExperience,
      avatar: body.avatar !== undefined ? body.avatar : existingSpeaker.avatar,
    }

    console.log("[v0] Update data prepared:", updateData)
    console.log("[v0] Avatar to be saved:", updateData.avatar)

    const updatedSpeaker = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        company: true,
        jobTitle: true,
        location: true,
        website: true,
        linkedin: true,
        speakingExperience: true,
      },
    })

    console.log("[v0] Speaker updated successfully")
    console.log("[v0] Avatar after update:", updatedSpeaker.avatar)

    const profile = {
      fullName: `${updatedSpeaker.firstName} ${updatedSpeaker.lastName}`,
      designation: updatedSpeaker.jobTitle || "",
      company: updatedSpeaker.company || "",
      email: updatedSpeaker.email,
      phone: updatedSpeaker.phone || "",
      linkedin: updatedSpeaker.linkedin || "",
      website: updatedSpeaker.website || "",
      location: updatedSpeaker.location || "",
      bio: updatedSpeaker.bio || "",
      speakingExperience: updatedSpeaker.speakingExperience || "",
      avatar: updatedSpeaker.avatar || "",
    }

    console.log("[v0] Profile response:", profile)
    console.log("[v0] Avatar in response:", profile.avatar)

    return NextResponse.json({
      success: true,
      profile,
      message: "Speaker updated successfully",
    })
  } catch (error) {
    console.error("[v0] Error updating speaker:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
