import { UserRole, DashboardType, TicketPriority, TicketStatus } from "@prisma/client"

// types/support.ts
export interface HelpSupportContent {
  id: string
  userRole: UserRole
  pageTitle: string
  pageDescription: string
  contactTitle?: string
  contactDescription?: string
  supportEmail: string
  supportPhone: string
  officeAddress: string
  corporateName: string
  liveChatHours: string
  emailTitle?: string
  emailDescription?: string
  phoneTitle?: string
  phoneDescription?: string
  officeTitle?: string
  officeDescription?: string
  liveChatTitle?: string
  liveChatDescription?: string
  faqTitle?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category?: string
  userRoles: UserRole[]
  dashboardTypes: DashboardType[]
  order: number
  isActive: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export interface SupportTicket {
  id: string
  name: string
  title: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
    role: UserRole
  }
  userRole: UserRole
  assignedToId?: string
  assignedTo?: {
    firstName: string
    lastName: string
    email: string
    role: UserRole
  }
  replies: SupportTicketReply[]
  createdAt: string
  updatedAt: string
  closedAt?: string
}

export interface SupportTicketReply {
  id: string
  ticketId: string
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
    role: UserRole
  }
  content: string
  isInternal: boolean
  attachments: string[]
  createdAt: string
}