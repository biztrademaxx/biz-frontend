// import { NextResponse } from "next/server"
// import {prisma} from "@/lib/prisma"

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const status = searchParams.get("status")
//     const planType = searchParams.get("planType")

    // Build where clause
    const where: any = {}

//     if (status && status !== "all") {
//       where.status = status
//     }

//     if (planType && planType !== "all") {
//       where.planType = planType
//     }

//     // Fetch payments with subscription data
//     // Since there's no separate Subscription model, we'll use Payment model
//     // and filter for recurring/subscription payments
//     const payments = await prisma.payment.findMany({
//       where: {
//         ...where,
//         // Filter for subscription-type payments
//         OR: [{ gateway: { contains: "subscription" } }, { method: { contains: "subscription" } }],
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//             role: true,
//           },
//         },
//         eventRegistration: {
//           include: {
//             event: {
//               select: {
//                 title: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     })

//     // Transform payments into subscription format
//     const subscriptions = payments.map((payment) => {
//       const planType = payment.metadata?.planType || "MONTHLY"
//       const startDate = payment.createdAt
//       const endDate = new Date(startDate)

//       // Calculate end date based on plan type
//       if (planType === "MONTHLY") {
//         endDate.setMonth(endDate.getMonth() + 1)
//       } else if (planType === "QUARTERLY") {
//         endDate.setMonth(endDate.getMonth() + 3)
//       } else if (planType === "YEARLY") {
//         endDate.setFullYear(endDate.getFullYear() + 1)
//       }

//       const nextBillingDate = payment.status === "COMPLETED" ? endDate : null

//       return {
//         id: payment.id,
//         userId: payment.userId,
//         userName: `${payment.user.firstName} ${payment.user.lastName}`,
//         userEmail: payment.user.email || "N/A",
//         userRole: payment.user.role,
//         planName: payment.eventRegistration?.event.title || payment.metadata?.planName || "Standard Plan",
//         planType: planType,
//         amount: payment.amount,
//         currency: payment.currency,
//         status: payment.status === "COMPLETED" ? "ACTIVE" : payment.status === "FAILED" ? "CANCELLED" : "PENDING",
//         startDate: startDate.toISOString(),
//         endDate: endDate.toISOString(),
//         nextBillingDate: nextBillingDate ? nextBillingDate.toISOString() : null,
//         autoRenew: payment.metadata?.autoRenew !== false,
//         paymentMethod: payment.method,
//         transactionId: payment.transactionId || payment.id,
//         features: payment.metadata?.features || ["Basic Support", "Event Access", "Networking"],
//         cancelledAt: payment.refundedAt || null,
//         cancellationReason: payment.refundReason || null,
//         createdAt: payment.createdAt.toISOString(),
//       }
//     })

//     return NextResponse.json({
//       success: true,
//       subscriptions,
//       total: subscriptions.length,
//     })
//   } catch (error) {
//     console.error("Error fetching subscriptions:", error)
//     return NextResponse.json({ success: false, error: "Failed to fetch subscriptions" }, { status: 500 })
//   }
// }
