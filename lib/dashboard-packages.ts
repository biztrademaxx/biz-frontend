/**
 * SaaS-style subscription packages shown in Visitor / Exhibitor / Organizer dashboards.
 * Copy and limits follow product spec; payment wiring can hook into these `id` values later.
 */

export type DashboardPackageRole = "VISITOR" | "EXHIBITOR" | "ORGANIZER"

export type PlanFeatureState = boolean | "partial"

export type PlanFeatureRow = {
  label: string
  state: PlanFeatureState
  /** Shown when state is partial */
  detail?: string
}

export type PlanFeatureGroup = {
  title: string
  rows: PlanFeatureRow[]
}

export type DashboardPlanDefinition = {
  id: string
  name: string
  tagline: string
  priceDisplay: string
  /** INR amount for checkout display — 0 for free plans */
  priceInr: number
  billingNote: string
  popular?: boolean
  /** Shown as “current plan” — replace with real subscription when API exists */
  defaultCurrent?: boolean
  topStats: string[]
  groups: PlanFeatureGroup[]
}

const check = (label: string, state: PlanFeatureState = true, detail?: string): PlanFeatureRow => ({
  label,
  state,
  detail,
})

export const VISITOR_PACKAGE_PLANS: DashboardPlanDefinition[] = [
  {
    id: "visitor-free",
    name: "Free Plan",
    tagline: "Best for casual visitors.",
    priceDisplay: "₹0",
    priceInr: 0,
    billingNote: "Lifetime",
    defaultCurrent: true,
    topStats: [
      "Limited event & profile views",
      "Wishlist & basic registrations",
      "Community view-only",
    ],
    groups: [
      {
        title: "Discovery & access",
        rows: [
          check("Event search & filters", true),
          check("Event detail views", "partial", "10 / month"),
          check("Exhibitor / organizer / venue / supplier profile views", "partial", "5 each / month"),
          check("Floor plan PDFs", false),
          check("Early access to new listings", false),
        ],
      },
      {
        title: "Networking & community",
        rows: [
          check("Wishlist", "partial", "10 items lifetime"),
          check("Classified posts", false),
          check("Chat with exhibitors", false),
          check("Global phone reveals", "partial", "Limited"),
        ],
      },
      {
        title: "Registrations & events",
        rows: [
          check("Event registrations", "partial", "3 / month"),
          check("QR check-ins", "partial", "3 / month"),
          check("Orders & payment history", true),
        ],
      },
    ],
  },
  {
    id: "visitor-user",
    name: "User Plan",
    tagline: "Best for active business visitors.",
    priceDisplay: "₹2,000",
    priceInr: 2000,
    billingNote: "One-time",
    popular: true,
    topStats: [
      "Advanced search & filters",
      "Higher view & phone reveal limits",
      "Chat + classifieds",
    ],
    groups: [
      {
        title: "Discovery & access",
        rows: [
          check("Advanced search & filters", true),
          check("Event detail views", "partial", "100 / month + 25 phone reveals"),
          check("Profile views (exhibitor / organizer / venue / supplier)", "partial", "50 / month"),
          check("Floor plan PDFs", true),
          check("Early access", "partial", "7 days"),
        ],
      },
      {
        title: "Networking & community",
        rows: [
          check("Wishlist", "partial", "200 items lifetime"),
          check("Classified posts", "partial", "5 / month"),
          check("Chat access", true),
          check("Global phone view limit", "partial", "100 / month"),
        ],
      },
      {
        title: "Registrations & events",
        rows: [
          check("Event registrations", "partial", "25 / month"),
          check("QR check-ins", "partial", "25 / month"),
          check("Orders & payment history", true),
        ],
      },
    ],
  },
  {
    id: "visitor-premium",
    name: "Premium Plan",
    tagline: "Best for networking professionals.",
    priceDisplay: "₹5,000",
    priceInr: 5000,
    billingNote: "One-time",
    topStats: [
      "Unlimited views & reveals",
      "Unlimited wishlist & community",
      "Priority registrations",
    ],
    groups: [
      {
        title: "Discovery & access",
        rows: [
          check("Advanced+ search", true),
          check("Unlimited event & profile views", true),
          check("Unlimited phone reveals", true),
          check("Floor plan PDFs", true),
          check("Early access", "partial", "14 days"),
        ],
      },
      {
        title: "Networking & community",
        rows: [
          check("Wishlist", true),
          check("Classifieds & community", true),
          check("Chat access", true),
        ],
      },
      {
        title: "Registrations & events",
        rows: [
          check("Priority registrations", true),
          check("QR check-ins", true),
          check("Dedicated networking tools", true),
        ],
      },
    ],
  },
]

export const EXHIBITOR_PACKAGE_PLANS: DashboardPlanDefinition[] = [
  {
    id: "exhibitor-basic",
    name: "Basic Plan",
    tagline: "Best for small businesses getting started.",
    priceDisplay: "₹0",
    priceInr: 0,
    billingNote: "Free",
    defaultCurrent: true,
    topStats: ["3 images", "5 products", "2 services", "3 enquiries / yr"],
    groups: [
      {
        title: "Profile & branding",
        rows: [
          check("Company profile & contact details", true),
          check("Banner, logo & image gallery", true),
          check("Social links & government proof", false),
          check("Portfolio & video gallery", false),
          check("Verification badge", false),
        ],
      },
      {
        title: "Events & visibility",
        rows: [
          check("Event participation & enquiries", true),
          check("Products & services listing", true),
          check("Classified ads & visibility boost", false),
          check("Standard listing priority", true),
        ],
      },
      {
        title: "Leads & communication",
        rows: [
          check("Organizer / visitor / supplier chat", false),
          check("Phone reveal & RFQs", false),
          check("WhatsApp integration", false),
          check("Google Analytics", false),
        ],
      },
    ],
  },
  {
    id: "exhibitor-standard",
    name: "Standard Plan",
    tagline: "Best for growing exhibitors.",
    priceDisplay: "₹10,000",
    priceInr: 10000,
    billingNote: "per year",
    popular: true,
    topStats: ["15 images", "3 videos", "30 products", "15 services", "15 enquiries / yr"],
    groups: [
      {
        title: "Profile & branding",
        rows: [
          check("Everything in Basic", true),
          check("Social links & government proof", true),
          check("Portfolio & phone reveal", true),
          check("Video gallery & verification badge", true),
        ],
      },
      {
        title: "Events & visibility",
        rows: [
          check("Classified ads & ad boost", true),
          check("Priority lead routing", true),
        ],
      },
      {
        title: "Leads & communication",
        rows: [
          check("Chat with organizers, visitors & suppliers", true),
          check("RFQs & direct visitor enquiries", true),
          check("Lead filtering & notifications", true),
          check("WhatsApp integration", true),
          check("Enhanced lead insights", false),
          check("Google Analytics", false),
        ],
      },
    ],
  },
  {
    id: "exhibitor-premium",
    name: "Premium Plan",
    tagline: "Best for large exhibitors and brands.",
    priceDisplay: "₹12,999",
    priceInr: 12999,
    billingNote: "per year",
    topStats: ["Unlimited media & listings", "Top featured placement", "Unlimited enquiries"],
    groups: [
      {
        title: "Profile & branding",
        rows: [
          check("Unlimited images, videos, products & services", true),
          check("Premium branding & verification", true),
        ],
      },
      {
        title: "Events & visibility",
        rows: [
          check("Top featured listing & premium search boost", true),
        ],
      },
      {
        title: "Leads & analytics",
        rows: [
          check("Everything in Standard", true),
          check("Enhanced lead insights", true),
          check("Google Analytics", true),
          check("Dedicated success options (add-on)", "partial", "Contact sales"),
        ],
      },
    ],
  },
]

export const ORGANIZER_PACKAGE_PLANS: DashboardPlanDefinition[] = [
  {
    id: "organizer-free",
    name: "Free Plan",
    tagline: "Best for small / local events.",
    priceDisplay: "Free",
    priceInr: 0,
    billingNote: "",
    defaultCurrent: true,
    topStats: ["1 event", "100 exhibitors", "500 visitors / event", "1 staff", "2 days / event"],
    groups: [
      {
        title: "Event stats",
        rows: [
          check("Events per year", "partial", "1"),
          check("Storage", "partial", "1 GB"),
          check("Booth & floor plan tools", false),
        ],
      },
      {
        title: "Lead generation & marketing",
        rows: [
          check("Basic event listing", true),
          check("Lead dashboards & enquiries", "partial", "Limited"),
          check("WhatsApp & email campaigns", false),
          check("Featured homepage placement", false),
        ],
      },
      {
        title: "Analytics & support",
        rows: [
          check("Visitor / exhibitor reports", false),
          check("Exports & advanced analytics", false),
          check("Support", "partial", "Email"),
        ],
      },
    ],
  },
  {
    id: "organizer-silver",
    name: "Silver Plan",
    tagline: "Best for medium-scale organizers.",
    priceDisplay: "₹25,000",
    priceInr: 25000,
    billingNote: "per year",
    popular: true,
    topStats: ["2 events", "200 exhibitors", "1k visitors / event", "5 staff", "5 days / event"],
    groups: [
      {
        title: "Event stats",
        rows: [
          check("Higher caps on events, exhibitors & visitors", true),
          check("Storage", "partial", "10 GB"),
          check("Booth management & floor plans", true),
        ],
      },
      {
        title: "Lead generation & marketing",
        rows: [
          check("Lead generation tools", true),
          check("SEO & featured listings", true),
          check("Email campaigns", true),
          check("WhatsApp integration", "partial", "Add-on"),
        ],
      },
      {
        title: "Analytics & support",
        rows: [
          check("Analytics dashboard", true),
          check("Export visitor & exhibitor reports", true),
          check("Support", "partial", "Priority email"),
        ],
      },
    ],
  },
  {
    id: "organizer-gold",
    name: "Gold Plan",
    tagline: "Best for enterprise organizers.",
    priceDisplay: "₹50,000",
    priceInr: 50000,
    billingNote: "per year",
    topStats: ["10 events", "500 exhibitors", "10k visitors / event", "20 staff", "10 days / event"],
    groups: [
      {
        title: "Event stats",
        rows: [
          check("Large-scale caps & 50 GB storage", true),
          check("Full booth, floor plan & brochure tooling", true),
        ],
      },
      {
        title: "Lead generation & marketing",
        rows: [
          check("Premium homepage & SEO visibility", true),
          check("WhatsApp & email campaigns", true),
          check("Sponsor & supplier modules", true),
        ],
      },
      {
        title: "Analytics & support",
        rows: [
          check("Advanced analytics & revenue views", true),
          check("Full exports & API-ready data", true),
          check("Dedicated account manager", true),
        ],
      },
    ],
  },
]

export function isFreeDashboardPlan(plan: DashboardPlanDefinition): boolean {
  return plan.priceInr <= 0
}

export type PlanBadgeTier = "free" | "standard" | "premium"

/** Visual tier for subscription badges (navbar, profile, etc.). */
export function getPlanBadgeTier(planSlug: string): PlanBadgeTier {
  const slug = planSlug.toLowerCase()
  if (slug.includes("premium") || slug.includes("gold")) return "premium"
  if (slug.includes("free") || slug.includes("basic")) return "free"
  return "standard"
}

export type CurrentDashboardPlan = {
  planSlug: string
  planName: string
  billingNote?: string | null
  amountInr?: number
  status?: string
  isDefault?: boolean
  startedAt?: string | null
  expiresAt?: string | null
  paymentTransactionId?: string | null
  razorpayPaymentId?: string | null
}

export function getDashboardPlansForRole(role: DashboardPackageRole): DashboardPlanDefinition[] {
  switch (role) {
    case "VISITOR":
      return VISITOR_PACKAGE_PLANS
    case "EXHIBITOR":
      return EXHIBITOR_PACKAGE_PLANS
    case "ORGANIZER":
      return ORGANIZER_PACKAGE_PLANS
    default:
      return VISITOR_PACKAGE_PLANS
  }
}

export function dashboardPlansPageTitle(role: DashboardPackageRole): string {
  switch (role) {
    case "VISITOR":
      return "Upgrade your plan"
    case "EXHIBITOR":
      return "Pricing plans"
    case "ORGANIZER":
      return "Pricing & plans"
    default:
      return "Plans"
  }
}

export function dashboardPlansPageSubtitle(role: DashboardPackageRole): string {
  switch (role) {
    case "VISITOR":
      return "Choose a plan to unlock more views, contact reveals, chat, and registrations."
    case "EXHIBITOR":
      return "Grow leads and visibility with the right exhibitor package."
    case "ORGANIZER":
      return "Scale your trade fairs with higher caps, marketing tools, and analytics."
    default:
      return ""
  }
}
