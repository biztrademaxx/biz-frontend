import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Build where clause
    const where: any = {}

    if (status && status !== "all") {
      // Map invoice status to payment status
      const statusMap: Record<string, any> = {
        paid: "COMPLETED",
        pending: "PENDING",
        cancelled: "CANCELLED",
      }
      if (statusMap[status]) {
        where.status = statusMap[status]
      }
    }

    // Fetch payments to generate invoices
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
                // price: true,
              },
            },
          },
        },
        venueBookings: {
          include: {
            venue: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform payments into invoices
    const invoices = payments.map((payment, index) => {
      // Generate invoice number
      const invoiceNumber = `INV-${new Date(payment.createdAt).getFullYear()}-${String(index + 1).padStart(5, "0")}`

      // Calculate invoice status
      let invoiceStatus = "pending"
      if (payment.status === "COMPLETED") {
        invoiceStatus = "paid"
      } else if (payment.status === "CANCELLED") {
        invoiceStatus = "cancelled"
      } else if (payment.status === "PENDING") {
        const dueDate = new Date(payment.createdAt)
        dueDate.setDate(dueDate.getDate() + 30)
        if (new Date() > dueDate) {
          invoiceStatus = "overdue"
        }
      }

      // Generate invoice items
      const items = []

      // Add event registrations as line items
      for (const registration of payment.eventRegistrations) {
        items.push({
          description: `Event Registration - ${registration.event.title}`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        })
      }

      // Add venue bookings as line items
      for (const booking of payment.venueBookings) {
        items.push({
          description: `Venue Booking - ${booking.venue.firstName} ${booking.venue.lastName}`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        })
      }

      // If no specific items, add general item
      if (items.length === 0) {
        items.push({
          description: payment.description || "Service Payment",
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        })
      }

      const subtotal = payment.amount
      const tax = subtotal * 0.1 // 10% tax
      const total = subtotal + tax

      return {
        id: payment.id,
        invoiceNumber,
        userId: payment.userId,
        userName: `${payment.user.firstName} ${payment.user.lastName}`,
        userEmail: payment.user.email,
        amount: payment.amount,
        currency: payment.currency,
        status: invoiceStatus,
        invoiceDate: payment.createdAt.toISOString(),
        dueDate: new Date(new Date(payment.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: payment.status === "COMPLETED" ? payment.updatedAt.toISOString() : null,
        paymentMethod: payment.gateway,
        description: payment.description || "Payment invoice",
        items,
        subtotal,
        tax,
        total,
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}
