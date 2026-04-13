import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch all email campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const where = status && status !== "all" ? { status } : {}

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          subject: true,
          content: true,
          status: true,
          priority: true,
          targetAudiences: true,
          scheduledAt: true,
          sentAt: true,
          createdAt: true,
          totalRecipients: true,
          sent: true,
          delivered: true,
          opened: true,
          clicked: true,
          bounced: true,
          unsubscribed: true,
          openRate: true,
          clickRate: true,
          deliveryRate: true,
          bounceRate: true,
          unsubscribeRate: true,
        },
      }),
      prisma.emailCampaign.count({ where }),
    ])

    // Format response to match frontend expectations
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      subject: campaign.subject,
      content: campaign.content,
      status: campaign.status,
      priority: campaign.priority,
      targetAudiences: campaign.targetAudiences,
      scheduledAt: campaign.scheduledAt?.toISOString(),
      sentAt: campaign.sentAt?.toISOString(),
      createdAt: campaign.createdAt.toISOString(),
      stats: {
        totalRecipients: campaign.totalRecipients,
        sent: campaign.sent,
        delivered: campaign.delivered,
        opened: campaign.opened,
        clicked: campaign.clicked,
        bounced: campaign.bounced,
        unsubscribed: campaign.unsubscribed,
      },
      engagement: {
        openRate: campaign.openRate,
        clickRate: campaign.clickRate,
        deliveryRate: campaign.deliveryRate,
        bounceRate: campaign.bounceRate,
        unsubscribeRate: campaign.unsubscribeRate,
      },
    }))

    return NextResponse.json({
      success: true,
      data: formattedCampaigns,
      total,
    })
  } catch (error) {
    console.error("[v0] Error fetching email campaigns:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch email campaigns" }, { status: 500 })
  }
}

// POST - Create new email campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      subject,
      content,
      htmlContent,
      targetAudiences,
      priority = "medium",
      scheduledAt,
      sendImmediately = false,
    } = body

    // Validation
    if (!title || !subject || !content) {
      return NextResponse.json({ success: false, error: "Title, subject, and content are required" }, { status: 400 })
    }

    const newCampaign = await prisma.emailCampaign.create({
      data: {
        title,
        subject,
        content,
        htmlContent,
        targetAudiences: targetAudiences || [],
        status: sendImmediately ? "sending" : "scheduled",
        priority,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: sendImmediately ? new Date() : null,
      },
    })

    // Format response
    const formattedCampaign = {
      id: newCampaign.id,
      title: newCampaign.title,
      subject: newCampaign.subject,
      content: newCampaign.content,
      htmlContent: newCampaign.htmlContent,
      targetAudiences: newCampaign.targetAudiences,
      status: newCampaign.status,
      priority: newCampaign.priority,
      scheduledAt: newCampaign.scheduledAt?.toISOString(),
      createdAt: newCampaign.createdAt.toISOString(),
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
      engagement: {
        openRate: 0,
        clickRate: 0,
        deliveryRate: 0,
      },
    }

    return NextResponse.json({
      success: true,
      data: formattedCampaign,
      message: sendImmediately ? "Campaign is being sent" : "Campaign scheduled successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating email campaign:", error)
    return NextResponse.json({ success: false, error: "Failed to create email campaign" }, { status: 500 })
  }
}
