import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const gateway = searchParams.get("gateway")

    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (gateway && gateway !== "all") {
      where.gateway = gateway
    }

    // Fetch all payments (transactions) with related data
    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        eventRegistrations: {
          include: {
            event: {
              select: {
                title: true,
              },
            },
          },
        },
        venueBookings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform payments into transaction format
    const transactions = payments.map((payment) => {
      // Determine transaction type
      let type = "general"
      let description = payment.description

      if (payment.eventRegistrations.length > 0) {
        type = "event_registration"
        const eventTitles = payment.eventRegistrations
          .map((reg) => reg.event?.title)
          .filter(Boolean)
          .join(", ")
        description = description || `Event registration: ${eventTitles}`
      } else if (payment.venueBookings.length > 0) {
        type = "venue_booking"
        description = description || "Venue booking payment"
      }

      return {
        id: payment.id,
        transactionId: payment.id.slice(-8).toUpperCase(),
        userId: payment.userId,
        userName: `${payment.user.firstName} ${payment.user.lastName}`,
        userEmail: payment.user.email,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        gateway: payment.gateway,
        gatewayTransactionId: payment.gatewayTransactionId,
        description,
        type,
        createdAt: payment.createdAt.toISOString(),
        refundAmount: payment.refundAmount,
        refundReason: payment.refundReason,
        refundedAt: payment.refundedAt?.toISOString(),
      }
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
