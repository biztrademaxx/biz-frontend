import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Validation schema (if you want to use it later)
const createVenueSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  venueName: z.string().min(1, "Venue name is required"),
  venueDescription: z.string().optional(),
  venueAddress: z.string().optional(),
  venueCity: z.string().optional(),
  venueState: z.string().optional(),
  venueCountry: z.string().optional(),
  venueZipCode: z.string().optional(),
  maxCapacity: z.number().optional(),
  totalHalls: z.number().optional(),
  amenities: z.array(z.string()).default([]),
  role: z.literal("VENUE_MANAGER"),
})

/**
 * GET /api/venues
 * Proxy to Express backend /api/venues (PostgreSQL).
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.search; // includes leading "?" if any

    const res = await fetch(`${API_BASE_URL}/api/venues${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const backend = await res.json().catch(() => ({}));

    const raw = Array.isArray(backend.venues) ? backend.venues : backend.data || [];

    // Normalize to the Venue shape expected by the frontend:
    // - /venues page expects fields: venueName, address, city, state, country, description, etc.
    // - organizer BookVenue page also expects city/country, amenities, meetingSpaces.
    const venues = raw.map((v: any) => {
      const fullName = `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim();
      return {
        id: v.id,
        venueName:
          (v.venueName ?? "").trim() ||
          (v.company ?? "").trim() ||
          fullName ||
          "Unnamed Venue",
        logo: v.avatar ?? "",
        contactPerson: fullName || "Venue Manager",
        email: v.email ?? "",
        mobile: v.phone ?? "",
        address: v.venueAddress ?? "",
        city: v.venueCity ?? "",
        state: v.venueState ?? "",
        country: v.venueCountry ?? "",
        venueAddress: v.venueAddress ?? "",
        venueCity: v.venueCity ?? "",
        venueState: v.venueState ?? "",
        venueCountry: v.venueCountry ?? "",
        website: v.venueWebsite ?? v.website ?? "",
        description: v.venueDescription ?? v.bio ?? "",
        maxCapacity: v.maxCapacity ?? 0,
        totalHalls: v.totalHalls ?? 0,
        totalEvents: v.totalEvents ?? 0,
        activeBookings: v.activeBookings ?? 0,
        averageRating: v.averageRating ?? 0,
        totalReviews: v.totalReviews ?? 0,
        amenities: v.amenities ?? [],
        meetingSpaces: [], // not modeled yet
        isVerified: v.isVerified ?? false,
        venueImages: v.venueImages ?? [],
      };
    });

    return NextResponse.json(
      {
        success: backend.success ?? true,
        venues,
        data: venues,
        pagination: backend.pagination ?? null,
      },
      { status: res.status },
    );
  } catch (error) {
    console.error("Error fetching venues via backend:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch venues" },
      { status: 500 },
    );
  }
}
/**
 * POST /api/venues
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      bio,
      company,
      jobTitle,
      location,
      website,
      linkedin,
      twitter,
      specialties,
      achievements,
      certifications,
      venueName,
      venueDescription,
      venueAddress,
      venueCity,
      venueState,
      venueCountry,
      venueZipCode,
      venuePhone,
      venueEmail,
      venueWebsite,
      maxCapacity,
      totalHalls,
      amenities,
    } = body

    if (!firstName || !lastName || !email || !venueName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      )
    }

    const venueManager = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        bio,
        company,
        jobTitle,
        location,
        website,
        linkedin,
        twitter,
        specialties: specialties || [],
        achievements: achievements || [],
        certifications: certifications || [],
        role: "VENUE_MANAGER",
        password: "temp_password", // ⚠️ hash in production
        isActive: true,
        organizerIdForVenueManager: session.user.id,
        venueName,
        venueDescription,
        venueAddress,
        venueCity,
        venueState,
        venueCountry,
        venueZipCode,
        venuePhone,
        venueEmail,
        venueWebsite,
        maxCapacity,
        totalHalls,
        amenities: amenities || [],
      },
    })

    return NextResponse.json({
      success: true,
      venueManager,
      message: "Venue Manager created successfully",
    })
  } catch (error) {
    console.error("Error creating venue manager:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
