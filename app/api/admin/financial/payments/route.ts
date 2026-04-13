import { type NextRequest, NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Fetch all payments with related data
    const payments = await prisma.payment.findMany({
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
          select: {
            id: true,
          },
        },
        venueBookings: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data
    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      userId: payment.userId,
      userName: payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : "Unknown User",
      userEmail: payment.user?.email || "N/A",
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      gateway: payment.gateway,
      gatewayTransactionId: payment.gatewayTransactionId,
      description: payment.description,
      refundAmount: payment.refundAmount,
      refundReason: payment.refundReason,
      refundedAt: payment.refundedAt?.toISOString() || null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      eventRegistrationsCount: payment.eventRegistrations.length,
      venueBookingsCount: payment.venueBookings.length,
    }))

    // Calculate statistics
    const stats = {
      totalPayments: payments.length,
      totalRevenue: payments.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0),
      completedPayments: payments.filter((p) => p.status === "COMPLETED").length,
      pendingPayments: payments.filter((p) => p.status === "PENDING").length,
      failedPayments: payments.filter((p) => p.status === "FAILED").length,
      refundedAmount: payments
        .filter((p) => p.refundAmount !== null)
        .reduce((sum, p) => sum + (p.refundAmount || 0), 0),
    }

    return NextResponse.json({
      payments: transformedPayments,
      stats,
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
