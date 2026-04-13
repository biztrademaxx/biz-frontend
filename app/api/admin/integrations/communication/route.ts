import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch notification stats from database
    const [totalNotifications, deliveredCount] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: true } }),
    ])

    // Email providers configuration (typically stored in a settings table or env)
    const emailProviders = [
      {
        id: "sendgrid-1",
        name: "SendGrid",
        provider: "SendGrid",
        status: "active" as const,
        type: "both" as const,
        apiKey: process.env.SENDGRID_API_KEY || "SG.xxxxxxxxxxxxxxxxxxxx",
        fromEmail: "noreply@eventplatform.com",
        fromName: "Event Platform",
        dailyLimit: 100000,
        sentToday: Math.floor(Math.random() * 5000),
        totalSent: totalNotifications,
        successRate: totalNotifications > 0 ? (deliveredCount / totalNotifications) * 100 : 98.5,
        lastSync: new Date().toISOString(),
        webhookUrl: "https://api.eventplatform.com/webhooks/sendgrid",
        settings: {
          enableTracking: true,
          enableUnsubscribe: true,
          replyTo: "support@eventplatform.com",
        },
      },
      {
        id: "mailgun-1",
        name: "Mailgun",
        provider: "Mailgun",
        status: "inactive" as const,
        type: "transactional" as const,
        apiKey: "key-xxxxxxxxxxxxxxxxxxxx",
        fromEmail: "notifications@eventplatform.com",
        fromName: "Event Platform Notifications",
        dailyLimit: 50000,
        sentToday: 0,
        totalSent: 0,
        successRate: 99.2,
        lastSync: new Date(Date.now() - 86400000).toISOString(),
        settings: {
          enableTracking: true,
          enableUnsubscribe: true,
        },
      },
      {
        id: "ses-1",
        name: "Amazon SES",
        provider: "AWS SES",
        status: "active" as const,
        type: "marketing" as const,
        apiKey: "AKIA_xxxxxxxxxxxxxxxxxxxx",
        fromEmail: "marketing@eventplatform.com",
        fromName: "Event Platform Marketing",
        dailyLimit: 200000,
        sentToday: Math.floor(Math.random() * 10000),
        totalSent: Math.floor(totalNotifications * 0.3),
        successRate: 97.8,
        lastSync: new Date().toISOString(),
        settings: {
          enableTracking: true,
          enableUnsubscribe: true,
          replyTo: "marketing@eventplatform.com",
        },
      },
    ]

    // SMS providers configuration
    const smsProviders = [
      {
        id: "twilio-1",
        name: "Twilio",
        provider: "Twilio",
        status: "active" as const,
        accountSid: "AC_xxxxxxxxxxxxxxxxxxxx",
        authToken: "auth_xxxxxxxxxxxxxxxxxxxx",
        fromNumber: "+1234567890",
        dailyLimit: 10000,
        sentToday: Math.floor(Math.random() * 500),
        totalSent: Math.floor(totalNotifications * 0.1),
        successRate: 99.1,
        lastSync: new Date().toISOString(),
        settings: {
          enableDeliveryReports: true,
          defaultCountryCode: "+1",
        },
      },
      {
        id: "nexmo-1",
        name: "Vonage (Nexmo)",
        provider: "Nexmo",
        status: "inactive" as const,
        accountSid: "nexmo_xxxxxxxxxxxxxxxxxxxx",
        authToken: "nexmo_auth_xxxxxxxxxxxxxxxxxxxx",
        fromNumber: "+1987654321",
        dailyLimit: 5000,
        sentToday: 0,
        totalSent: 0,
        successRate: 98.5,
        lastSync: new Date(Date.now() - 172800000).toISOString(),
        settings: {
          enableDeliveryReports: true,
          defaultCountryCode: "+1",
        },
      },
    ]

    const stats = {
      totalEmailsSent: emailProviders.reduce((acc, p) => acc + p.totalSent, 0),
      totalSmsSent: smsProviders.reduce((acc, p) => acc + p.totalSent, 0),
      emailSuccessRate:
        emailProviders.filter((p) => p.status === "active").reduce((acc, p) => acc + p.successRate, 0) /
          emailProviders.filter((p) => p.status === "active").length || 0,
      smsSuccessRate:
        smsProviders.filter((p) => p.status === "active").reduce((acc, p) => acc + p.successRate, 0) /
          smsProviders.filter((p) => p.status === "active").length || 0,
      activeEmailProviders: emailProviders.filter((p) => p.status === "active").length,
      activeSmsProviders: smsProviders.filter((p) => p.status === "active").length,
    }

    return NextResponse.json({
      emailProviders,
      smsProviders,
      stats,
    })
  } catch (error) {
    console.error("Error fetching communication integrations:", error)
    return NextResponse.json({ error: "Failed to fetch communication integrations" }, { status: 500 })
  }
}
