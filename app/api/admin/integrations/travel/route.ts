import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock travel partners data
    const partners = [
      {
        id: "1",
        name: "Marriott International",
        type: "hotel",
        logo: "/generic-hotel-logo.png",
        website: "https://marriott.com",
        email: "partners@marriott.com",
        phone: "+1 301 380 3000",
        apiKey: "mk_live_xxxxx",
        apiEndpoint: "https://api.marriott.com/v1",
        isActive: true,
        isVerified: true,
        commissionRate: 12,
        rating: 4.8,
        totalBookings: 1250,
        totalRevenue: 325000,
        locations: ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas"],
        description: "Global leader in hospitality with over 7,000 properties worldwide.",
        contactPerson: "Sarah Johnson",
        contractStartDate: "2024-01-01",
        contractEndDate: "2025-12-31",
        lastSyncAt: new Date().toISOString(),
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Hilton Hotels",
        type: "hotel",
        logo: "/hilton-logo.jpg",
        website: "https://hilton.com",
        email: "business@hilton.com",
        phone: "+1 703 883 1000",
        apiKey: "hk_live_xxxxx",
        apiEndpoint: "https://api.hilton.com/v2",
        isActive: true,
        isVerified: true,
        commissionRate: 10,
        rating: 4.7,
        totalBookings: 980,
        totalRevenue: 245000,
        locations: ["London", "Paris", "Tokyo", "Sydney", "Dubai"],
        description: "Award-winning global hospitality company.",
        contactPerson: "Michael Chen",
        contractStartDate: "2024-02-15",
        contractEndDate: "2025-02-14",
        lastSyncAt: new Date().toISOString(),
        createdAt: "2024-02-15T00:00:00Z",
      },
      {
        id: "3",
        name: "Emirates Airlines",
        type: "airline",
        logo: "/generic-airline-logo.png",
        website: "https://emirates.com",
        email: "partners@emirates.com",
        phone: "+971 4 214 4444",
        apiKey: "ek_live_xxxxx",
        apiEndpoint: "https://api.emirates.com/v1",
        isActive: true,
        isVerified: true,
        commissionRate: 8,
        rating: 4.9,
        totalBookings: 560,
        totalRevenue: 890000,
        locations: ["Dubai", "London", "New York", "Singapore", "Sydney"],
        description: "Award-winning airline known for luxury travel.",
        contactPerson: "Ahmed Al-Maktoum",
        contractStartDate: "2024-03-01",
        contractEndDate: "2025-03-01",
        lastSyncAt: new Date().toISOString(),
        createdAt: "2024-03-01T00:00:00Z",
      },
      {
        id: "4",
        name: "Hertz Car Rental",
        type: "car_rental",
        logo: "/hertz-logo.png",
        website: "https://hertz.com",
        email: "corporate@hertz.com",
        phone: "+1 800 654 3131",
        apiKey: "hz_live_xxxxx",
        apiEndpoint: "https://api.hertz.com/v1",
        isActive: true,
        isVerified: true,
        commissionRate: 15,
        rating: 4.5,
        totalBookings: 420,
        totalRevenue: 84000,
        locations: ["USA", "Europe", "Australia", "Canada", "Mexico"],
        description: "Leading car rental company with global presence.",
        contactPerson: "Jennifer Williams",
        contractStartDate: "2024-01-15",
        contractEndDate: "2024-12-31",
        lastSyncAt: new Date().toISOString(),
        createdAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "5",
        name: "Expedia Travel",
        type: "travel_agency",
        logo: "/expedia-logo-generic.png",
        website: "https://expedia.com",
        email: "partners@expedia.com",
        phone: "+1 425 679 7200",
        apiKey: "ex_live_xxxxx",
        apiEndpoint: "https://api.expedia.com/v3",
        isActive: false,
        isVerified: true,
        commissionRate: 18,
        rating: 4.6,
        totalBookings: 890,
        totalRevenue: 156000,
        locations: ["Worldwide"],
        description: "Full-service online travel agency.",
        contactPerson: "David Thompson",
        contractStartDate: "2023-06-01",
        contractEndDate: "2024-05-31",
        lastSyncAt: null,
        createdAt: "2023-06-01T00:00:00Z",
      },
    ]

    return NextResponse.json({ partners })
  } catch (error) {
    console.error("Error fetching travel partners:", error)
    return NextResponse.json({ error: "Failed to fetch travel partners" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create new partner
    const newPartner = {
      id: Date.now().toString(),
      ...body,
      isActive: true,
      isVerified: false,
      totalBookings: 0,
      totalRevenue: 0,
      rating: 0,
      lastSyncAt: null,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ partner: newPartner })
  } catch (error) {
    console.error("Error creating travel partner:", error)
    return NextResponse.json({ error: "Failed to create travel partner" }, { status: 500 })
  }
}
