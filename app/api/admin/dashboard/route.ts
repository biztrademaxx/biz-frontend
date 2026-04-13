import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET() {
  try {
    // 🧠 Fetch data from MongoDB via Prisma
    const totalUsers = await prisma.user.count()
    const activeEvents = await prisma.event.count({ where: { status: "PUBLISHED" } })
    const eventOrganizers = await prisma.user.count({ where: { role: "ORGANIZER" } })

    // 🧮 Optional: Calculate platform revenue
    const totalRevenueAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    })
    const totalRevenue = totalRevenueAgg._sum.amount || 0

    // 📊 Combine all results
    const stats = [
      {
        title: "Total Users",
        value: totalUsers.toLocaleString(),
        change: "+12%",
        trend: "up",
        icon: "Users",
        color: "blue",
      },
      {
        title: "Active Events",
        value: activeEvents.toLocaleString(),
        change: "+8%",
        trend: "up",
        icon: "Calendar",
        color: "green",
      },
      {
        title: "Event Organizers",
        value: eventOrganizers.toLocaleString(),
        change: "+15%",
        trend: "up",
        icon: "Building2",
        color: "purple",
      },
      {
        title: "Platform Revenue",
        value: `₹${(totalRevenue / 10000000).toFixed(2)}Cr`,
        change: "+25%",
        trend: "up",
        icon: "DollarSign",
        color: "yellow",
      },
    ]

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 })
  }
}
