import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid exhibitor ID" }, { status: 400 })
    }

    // Mock analytics data that matches the component structure
    const analytics = {
      overview: {
        totalProfileViews: 1850,
        brochureDownloads: 456,
        leadsGenerated: 89,
        visitorEngagement: 67.5,
      },
      profileViewsData: [
        { date: "Jan 10", views: 45 },
        { date: "Jan 11", views: 52 },
        { date: "Jan 12", views: 38 },
        { date: "Jan 13", views: 61 },
        { date: "Jan 14", views: 48 },
        { date: "Jan 15", views: 73 },
        { date: "Jan 16", views: 56 },
        { date: "Jan 17", views: 69 },
        { date: "Jan 18", views: 82 },
        { date: "Jan 19", views: 74 },
      ],
      brochureDownloadsData: [
        { name: "AI Platform Brochure", downloads: 156, percentage: 34.2 },
        { name: "Security Suite Overview", downloads: 123, percentage: 27.0 },
        { name: "Mobile App Features", downloads: 89, percentage: 19.5 },
        { name: "Technical Specifications", downloads: 67, percentage: 14.7 },
        { name: "Pricing Guide", downloads: 21, percentage: 4.6 },
      ],
      leadSourceData: [
        { name: "Profile Views", value: 45, color: "#3B82F6" },
        { name: "Brochure Downloads", value: 28, color: "#10B981" },
        { name: "Product Inquiries", value: 16, color: "#F59E0B" },
        { name: "Appointment Requests", value: 11, color: "#EF4444" },
      ],
      engagementData: [
        { metric: "Profile Views", current: 1850, previous: 1420, change: 30.3 },
        { metric: "Brochure Downloads", current: 456, previous: 389, change: 17.2 },
        { metric: "Product Inquiries", current: 89, previous: 76, change: 17.1 },
        { metric: "Appointment Bookings", current: 23, previous: 18, change: 27.8 },
      ],
      eventPerformance: [
        {
          eventId: "event-1",
          eventName: "Tech Conference 2024",
          boothVisits: 156,
          leadsGenerated: 12,
          conversions: 3,
          revenue: 2999.99,
          roi: 185,
        },
        {
          eventId: "event-2",
          eventName: "Innovation Summit",
          boothVisits: 89,
          leadsGenerated: 8,
          conversions: 1,
          revenue: 1499.99,
          roi: 120,
        },
      ],
      productPerformance: [
        {
          productId: "prod-1",
          productName: "Smart Display System",
          views: 156,
          inquiries: 23,
          conversions: 2,
          revenue: 5999.98,
          conversionRate: 8.7,
        },
        {
          productId: "prod-2",
          productName: "Interactive Software Platform",
          views: 89,
          inquiries: 12,
          conversions: 1,
          revenue: 1499.99,
          conversionRate: 13.5,
        },
        {
          productId: "prod-3",
          productName: "Portable Exhibition Booth",
          views: 67,
          inquiries: 8,
          conversions: 0,
          revenue: 0,
          conversionRate: 0,
        },
      ],
      leadAnalytics: {
        totalLeads: 89,
        newLeads: 12,
        contactedLeads: 34,
        qualifiedLeads: 28,
        convertedLeads: 15,
        averageScore: 75.5,
        conversionRate: 16.9,
        sourceBreakdown: {
          "Event Booth": 35,
          Website: 28,
          Referral: 16,
          "Social Media": 10,
        },
      },
      appointmentAnalytics: {
        totalAppointments: 23,
        confirmedAppointments: 18,
        pendingAppointments: 3,
        completedAppointments: 15,
        cancelledAppointments: 2,
        averageDuration: 45,
        showUpRate: 83.3,
        typeBreakdown: {
          PRODUCT_DEMO: 12,
          CONSULTATION: 7,
          FOLLOW_UP: 4,
        },
      },
    }

    return NextResponse.json({
      success: true,
      analytics,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
