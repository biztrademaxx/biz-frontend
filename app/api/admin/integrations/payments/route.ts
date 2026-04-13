import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function GET() {
  try {
    // Get payment statistics from database
    const payments = await prisma.payment.findMany({
      select: {
        gateway: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    })

    // Group payments by gateway
    const gatewayStats: Record<string, { transactions: number; volume: number; successful: number }> = {}

    payments.forEach((payment) => {
      const gateway = payment.gateway || "unknown"
      if (!gatewayStats[gateway]) {
        gatewayStats[gateway] = { transactions: 0, volume: 0, successful: 0 }
      }
      gatewayStats[gateway].transactions++
      gatewayStats[gateway].volume += payment.amount
      if (payment.status === "COMPLETED") {
        gatewayStats[gateway].successful++
      }
    })

    // Define available payment gateways with their stats
    const gateways = [
      {
        id: "stripe",
        name: "Stripe",
        provider: "Stripe, Inc.",
        logo: "/logos/stripe.svg",
        isActive: true,
        isTestMode: true,
        supportedCurrencies: ["USD", "EUR", "GBP", "INR", "AUD", "CAD"],
        supportedCountries: ["US", "UK", "EU", "IN", "AU", "CA"],
        transactionFee: "2.9% + $0.30",
        monthlyFee: 0,
        credentials: {
          publicKey: process.env.STRIPE_PUBLISHABLE_KEY ? "pk_test_•••••••••••" : "",
          secretKey: process.env.STRIPE_SECRET_KEY ? "sk_test_•••••••••••" : "",
          webhookSecret: "",
        },
        lastSyncedAt: new Date().toISOString(),
        totalTransactions: gatewayStats["stripe"]?.transactions || 0,
        totalVolume: gatewayStats["stripe"]?.volume || 0,
        successRate: gatewayStats["stripe"]
          ? Math.round((gatewayStats["stripe"].successful / gatewayStats["stripe"].transactions) * 100)
          : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "paypal",
        name: "PayPal",
        provider: "PayPal Holdings, Inc.",
        logo: "/logos/paypal.svg",
        isActive: false,
        isTestMode: true,
        supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD"],
        supportedCountries: ["US", "UK", "EU", "AU", "CA"],
        transactionFee: "3.49% + $0.49",
        monthlyFee: 0,
        credentials: {},
        lastSyncedAt: null,
        totalTransactions: gatewayStats["paypal"]?.transactions || 0,
        totalVolume: gatewayStats["paypal"]?.volume || 0,
        successRate: gatewayStats["paypal"]
          ? Math.round((gatewayStats["paypal"].successful / gatewayStats["paypal"].transactions) * 100)
          : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "razorpay",
        name: "Razorpay",
        provider: "Razorpay Software Pvt. Ltd.",
        logo: "/logos/razorpay.svg",
        isActive: false,
        isTestMode: true,
        supportedCurrencies: ["INR", "USD"],
        supportedCountries: ["IN"],
        transactionFee: "2% + GST",
        monthlyFee: 0,
        credentials: {},
        lastSyncedAt: null,
        totalTransactions: gatewayStats["razorpay"]?.transactions || 0,
        totalVolume: gatewayStats["razorpay"]?.volume || 0,
        successRate: gatewayStats["razorpay"]
          ? Math.round((gatewayStats["razorpay"].successful / gatewayStats["razorpay"].transactions) * 100)
          : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "square",
        name: "Square",
        provider: "Block, Inc.",
        logo: "/logos/square.svg",
        isActive: false,
        isTestMode: true,
        supportedCurrencies: ["USD", "CAD", "GBP", "AUD", "JPY"],
        supportedCountries: ["US", "CA", "UK", "AU", "JP"],
        transactionFee: "2.6% + $0.10",
        monthlyFee: 0,
        credentials: {},
        lastSyncedAt: null,
        totalTransactions: gatewayStats["square"]?.transactions || 0,
        totalVolume: gatewayStats["square"]?.volume || 0,
        successRate: gatewayStats["square"]
          ? Math.round((gatewayStats["square"].successful / gatewayStats["square"].transactions) * 100)
          : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "braintree",
        name: "Braintree",
        provider: "PayPal Holdings, Inc.",
        logo: "/logos/braintree.svg",
        isActive: false,
        isTestMode: true,
        supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD"],
        supportedCountries: ["US", "UK", "EU", "AU", "CA"],
        transactionFee: "2.59% + $0.49",
        monthlyFee: 0,
        credentials: {},
        lastSyncedAt: null,
        totalTransactions: gatewayStats["braintree"]?.transactions || 0,
        totalVolume: gatewayStats["braintree"]?.volume || 0,
        successRate: gatewayStats["braintree"]
          ? Math.round((gatewayStats["braintree"].successful / gatewayStats["braintree"].transactions) * 100)
          : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "payu",
        name: "PayU",
        provider: "PayU Global B.V.",
        logo: "/logos/payu.svg",
        isActive: false,
        isTestMode: true,
        supportedCurrencies: ["INR", "PLN", "CZK", "TRY", "ZAR"],
        supportedCountries: ["IN", "PL", "CZ", "TR", "ZA"],
        transactionFee: "2% + applicable taxes",
        monthlyFee: 0,
        credentials: {},
        lastSyncedAt: null,
        totalTransactions: gatewayStats["payu"]?.transactions || 0,
        totalVolume: gatewayStats["payu"]?.volume || 0,
        successRate: gatewayStats["payu"]
          ? Math.round((gatewayStats["payu"].successful / gatewayStats["payu"].transactions) * 100)
          : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ gateways })
  } catch (error) {
    console.error("Error fetching payment gateways:", error)
    return NextResponse.json({ error: "Failed to fetch payment gateways" }, { status: 500 })
  }
}
