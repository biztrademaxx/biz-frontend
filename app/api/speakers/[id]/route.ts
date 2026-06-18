// import { devLog } from "@/lib/dev-log"

// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { formatProfileLocationLine } from "@/lib/location-data"

// const profileSelect = {
//   id: true,
//   firstName: true,
//   lastName: true,
//   email: true,
//   phone: true,
//   avatar: true,
//   bio: true,
//   company: true,
//   jobTitle: true,
//   location: true,
//   profileCity: true,
//   profileState: true,
//   profileCountry: true,
//   website: true,
//   linkedin: true,
//   twitter: true,
//   specialties: true,
//   achievements: true,
//   certifications: true,
//   speakingExperience: true,
//   isVerified: true,
//   totalEvents: true,
//   activeEvents: true,
//   totalAttendees: true,
//   totalRevenue: true,
//   averageRating: true,
//   totalReviews: true,
//   createdAt: true,
//   updatedAt: true,
// } as const

// function toSpeakerProfile(speaker: {
//   firstName: string
//   lastName: string
//   email: string | null
//   phone: string | null
//   jobTitle: string | null
//   company: string | null
//   linkedin: string | null
//   website: string | null
//   location: string | null
//   profileCity: string | null
//   profileState: string | null
//   profileCountry: string | null
//   bio: string | null
//   speakingExperience: string | null
//   avatar: string | null
// }) {
//   return {
//     fullName: `${speaker.firstName} ${speaker.lastName}`.trim(),
//     designation: speaker.jobTitle || "",
//     company: speaker.company || "",
//     email: speaker.email,
//     phone: speaker.phone || "",
//     linkedin: speaker.linkedin || "",
//     website: speaker.website || "",
//     location: formatProfileLocationLine(speaker),
//     country: speaker.profileCountry || "",
//     state: speaker.profileState || "",
//     city: speaker.profileCity || "",
//     bio: speaker.bio || "",
//     speakingExperience: speaker.speakingExperience || "",
//     avatar: speaker.avatar || undefined,
//   }
// }

// export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params

//     await prisma.$connect()

//     const speaker = await prisma.user.findUnique({
//       where: {
//         id,
//         role: "SPEAKER",
//       },
//       select: profileSelect,
//     })

//     if (!speaker) {
//       return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 })
//     }

//     return NextResponse.json({
//       success: true,
//       profile: toSpeakerProfile(speaker),
//     })
//   } catch (error) {
//     console.error("Error fetching speaker:", error)
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params
//     const body = await request.json()

//     devLog("[v0] Received update request for speaker:", id)

//     await prisma.$connect()

//     const existingSpeaker = await prisma.user.findUnique({
//       where: { id, role: "SPEAKER" },
//     })

//     if (!existingSpeaker) {
//       return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 })
//     }

//     const [firstName, ...lastNameParts] = (body.fullName || "").split(" ")
//     const lastName = lastNameParts.join(" ")

//     const profileCity =
//       body.city !== undefined
//         ? String(body.city ?? "").trim() || null
//         : body.profileCity !== undefined
//           ? String(body.profileCity ?? "").trim() || null
//           : existingSpeaker.profileCity
//     const profileState =
//       body.state !== undefined
//         ? String(body.state ?? "").trim() || null
//         : body.profileState !== undefined
//           ? String(body.profileState ?? "").trim() || null
//           : existingSpeaker.profileState
//     const profileCountry =
//       body.country !== undefined
//         ? String(body.country ?? "").trim() || null
//         : body.profileCountry !== undefined
//           ? String(body.profileCountry ?? "").trim() || null
//           : existingSpeaker.profileCountry

//     const locationLine = [profileCity, profileState, profileCountry].filter(Boolean).join(", ")

//     const updateData = {
//       firstName: firstName || existingSpeaker.firstName,
//       lastName: lastName || existingSpeaker.lastName,
//       email: body.email ?? existingSpeaker.email,
//       phone: body.phone ?? existingSpeaker.phone,
//       bio: body.bio ?? existingSpeaker.bio,
//       company: body.company ?? existingSpeaker.company,
//       jobTitle: body.designation ?? existingSpeaker.jobTitle,
//       profileCity,
//       profileState,
//       profileCountry,
//       location: locationLine || body.location || existingSpeaker.location,
//       website: body.website ?? existingSpeaker.website,
//       linkedin: body.linkedin ?? existingSpeaker.linkedin,
//       speakingExperience: body.speakingExperience ?? existingSpeaker.speakingExperience,
//       avatar: body.avatar !== undefined ? body.avatar : existingSpeaker.avatar,
//     }

//     const updatedSpeaker = await prisma.user.update({
//       where: { id },
//       data: updateData,
//       select: profileSelect,
//     })

//     const profile = toSpeakerProfile(updatedSpeaker)

//     return NextResponse.json({
//       success: true,
//       profile,
//       message: "Speaker updated successfully",
//     })
//   } catch (error) {
//     console.error("[v0] Error updating speaker:", error)
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
//   }
// }
