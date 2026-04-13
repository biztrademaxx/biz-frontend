import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock subscription data since subscription model doesn't exist in schema
    const mockSubscription = {
      id: "sub-1",
      planName: "Professional",
      planType: "PRO",
      price: 4999,
      status: "ACTIVE",
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: [
        "Up to 25 events per month",
        "Up to 10,000 attendees per event",
        "Advanced analytics & reports",
        "Priority email & chat support",
        "10GB storage",
        "Advanced promotion tools",
        "Custom branding",
        "Integration support",
      ],
    }

    // Get usage statistics from actual data
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const eventsThisMonth = await prisma.event.count({
      where: {
        organizerId: id,
        createdAt: {
          gte: currentMonth,
        },
      },
    })

    const totalAttendees = await prisma.eventRegistration.count({
      where: {
        event: {
          organizerId: id,
        },
        status: "CONFIRMED",
      },
    })

    // Mock storage and promotions since models don't exist
    const storageUsed = 2.5 // GB
    const promotionsThisMonth = 3

    // Calculate usage based on plan limits
    const planLimits = {
      BASIC: { events: 5, attendees: 1000, storage: 2, promotions: 2 },
      PRO: { events: 25, attendees: 10000, storage: 10, promotions: 10 },
      ENTERPRISE: { events: -1, attendees: -1, storage: 100, promotions: -1 },
    }

    const currentPlanLimits = planLimits[mockSubscription.planType as keyof typeof planLimits] || planLimits.BASIC

    const usage = {
      events: {
        used: eventsThisMonth,
        limit: currentPlanLimits.events,
      },
      attendees: {
        used: totalAttendees,
        limit: currentPlanLimits.attendees,
      },
      storage: {
        used: storageUsed,
        limit: currentPlanLimits.storage,
      },
      promotions: {
        used: promotionsThisMonth,
        limit: currentPlanLimits.promotions,
      },
    }

    return NextResponse.json({
      subscription: mockSubscription,
      usage,
      daysLeft: Math.ceil((new Date(mockSubscription.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planType, planName, price } = body

    // Mock subscription update since subscription model doesn't exist
    const mockUpdatedSubscription = {
      id: "sub-1",
      planName,
      planType,
      price,
      status: "ACTIVE",
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json({
      message: "Subscription updated successfully",
      subscription: mockUpdatedSubscription,
    })
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
