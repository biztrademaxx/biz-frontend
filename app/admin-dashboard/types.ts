export interface Promotion {
  id: string
  type: "push" | "email"
  title: string
  content: string
  targetCategories: string[]
  status: "draft" | "scheduled" | "sent" | "sending"
  priority: "low" | "medium" | "high"
  createdAt: string
  scheduledAt?: string
  sentAt?: string
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced?: number
    unsubscribed?: number
  }
  engagement: {
    openRate: number
    clickRate: number
    deliveryRate: number
  }
}

export interface CampaignTemplate {
  id: string
  name: string
  type: "push" | "email"
  category: string
  title: string
  content: string
  suggestedCategories: string[]
  priority: "low" | "medium" | "high"
  description: string
  icon: string
}