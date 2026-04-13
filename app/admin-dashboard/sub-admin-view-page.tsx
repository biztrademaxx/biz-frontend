"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Phone, Mail, User, Shield, CheckCircle, XCircle } from "lucide-react"

interface SubAdminViewPageProps {
  subAdmin: {
    id: string
    name: string
    email: string
    phone?: string
    role: string
    roleDisplayName?: string
    permissions: string[]
    isActive: boolean
    createdAt: string
    createdBy: {
      name: string
      email: string
    }
  }
  onCancel?: () => void
}

interface PermissionCategory {
  id: string
  title: string
  subItems: {
    id: string
    title: string
  }[]
}

export default function SubAdminViewPage({ subAdmin, onCancel }: SubAdminViewPageProps) {
  const getRoleDisplay = () =>
    subAdmin.roleDisplayName?.trim() ||
    ({
      SUB_ADMIN: "Sub Admin",
      MODERATOR: "Moderator",
      SUPPORT: "Support Staff",
    }[subAdmin.role] ?? subAdmin.role.replace(/_/g, " "))

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      "SUB_ADMIN": "bg-purple-100 text-purple-800",
      "MODERATOR": "bg-blue-100 text-blue-800",
      "SUPPORT": "bg-orange-100 text-orange-800"
    }
    return colorMap[role] || "bg-gray-100 text-gray-800"
  }

  const permissionCategories: PermissionCategory[] = [
    {
      title: "Dashboard Overview",
      id: "dashboard",
      subItems: [{ title: "Dashboard Overview", id: "dashboard-overview" }],
    },
    {
      title: "Events Management",
      id: "events",
      subItems: [
        { title: "All Events", id: "events-all" },
        { title: "Create New Event", id: "events-create" },
        { title: "Event Categories", id: "events-categories" },
        { title: "Bulk Data", id: "events-approvals" },
      ],
    },
    {
      title: "Organizer Management",
      id: "organizers",
      subItems: [
        { title: "All Organizers", id: "organizers-all" },
        { title: "Add Organizer", id: "organizers-add" },
        { title: "Followers", id: "exhibitors-followers" },
        { title: "Promotions", id: "exhibitors-promotions" },
        { title: "Venue Bookings", id: "organizers-bookings" },
        { title: "Event Feedback", id: "organizers-feedback" },
      ],
    },
    {
      title: "Exhibitor Management",
      id: "exhibitors",
      subItems: [
        { title: "All Exhibitors", id: "exhibitors-all" },
        { title: "Add Exhibitor", id: "exhibitors-add" },
        { title: "Promotions", id: "exhibitors-promotions" },
        { title: "Followers", id: "exhibitors-followers" },
        { title: "Appointments", id: "exhibitors-appointments" },
        { title: "Feedback", id: "exhibitors-feedback" },
      ],
    },
    {
      title: "Speaker Management",
      id: "speakers",
      subItems: [
        { title: "All Speakers", id: "speakers-all" },
        { title: "Add Speaker", id: "speakers-add" },
        { title: "Followers", id: "speakers-followers" },
        { title: "Appointments", id: "speakers-appointments" },
        { title: "Feedback", id: "speakers-feedback" },
      ],
    },
    {
      title: "Venue Management",
      id: "venues",
      subItems: [
        { title: "All Venues", id: "venues-all" },
        { title: "Add Venue", id: "venues-add" },
        { title: "Events by Venue", id: "venues-events" },
        { title: "Booking Enquiries", id: "venues-bookings" },
        { title: "Feedback", id: "venues-feedback" },
      ],
    },
    {
      title: "Visitor Management",
      id: "visitors",
      subItems: [
        { title: "Events by Visitor", id: "visitors-events" },
        { title: "Connections", id: "visitors-connections" },
        { title: "Appointments", id: "visitors-appointments" },
      ],
    },
    {
      title: "Financial & Transactions",
      id: "financial",
      subItems: [
        { title: "Payments Dashboard", id: "financial-payments" },
        { title: "Subscriptions & Plans", id: "financial-subscriptions" },
        { title: "Invoices & Receipts", id: "financial-invoices" },
        { title: "Transaction History", id: "financial-transactions" },
      ],
    },
    {
      title: "Content Management",
      id: "content",
      subItems: [
        { title: "News & Announcements", id: "content-news" },
        { title: "Blog & Articles", id: "content-blog" },
        { title: "Banner & Ads Manager", id: "content-banners" },
        { title: "Featured Events", id: "content-featured" },
        { title: "Media Library", id: "content-media" },
      ],
    },
    {
      title: "Marketing & Communication",
      id: "marketing",
      subItems: [
        { title: "Email Campaigns", id: "marketing-email" },
        { title: "Push Notifications", id: "marketing-notifications" },
        { title: "Traffic Analytics", id: "marketing-traffic" },
        { title: "SEO & Keywords", id: "marketing-seo" },
      ],
    },
    {
      title: "Reports & Analytics",
      id: "reports",
      subItems: [
        { title: "Event Performance", id: "reports-events" },
        { title: "User Engagement", id: "reports-engagement" },
        { title: "Revenue Reports", id: "reports-revenue" },
        { title: "System Health", id: "reports-system" },
      ],
    },
    {
      title: "Integrations",
      id: "integrations",
      subItems: [
        { title: "Payment Gateways", id: "integrations-payment" },
        { title: "Email/SMS Providers", id: "integrations-communication" },
        { title: "Calendar & API", id: "integrations-calendar" },
        { title: "Hotel & Travel Partners", id: "integrations-travel" },
      ],
    },
    {
      title: "User Roles & Permissions",
      id: "roles",
      subItems: [
        { title: "Super Admin", id: "roles-superadmin" },
        { title: "Sub Admins", id: "roles-subadmins" },
      ],
    },
    {
      title: "Settings & Configuration",
      id: "settings",
      subItems: [
        { title: "Module Management", id: "settings-modules" },
        { title: "Notifications", id: "settings-notifications" },
        { title: "Security", id: "settings-security" },
        { title: "Language & Localization", id: "settings-language" },
        { title: "Backup & Restore", id: "settings-backup" },
      ],
    },
    {
      title: "Help & Support",
      id: "support",
      subItems: [
        { title: "Support Tickets", id: "support-tickets" },
        { title: "Contact Logs", id: "support-contacts" },
        { title: "Admin Notes", id: "support-notes" },
      ],
    },
  ]

  const getPermissionsByCategory = () => {
    return permissionCategories.map(category => ({
      ...category,
      subItems: category.subItems.filter(subItem => 
        subAdmin.permissions.includes(subItem.id)
      )
    })).filter(category => category.subItems.length > 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const permissionsByCategory = getPermissionsByCategory()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative flex items-center justify-center w-full mb-6">
          <div className="w-full h-[4px] rounded-full bg-gradient-to-r from-green-300 to-blue-500" />
          <div className="absolute">
            <div className="bg-green-500 text-white font-semibold text-sm px-4 py-2 rounded-md shadow">
              SUB ADMIN DETAILS
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="mt-1 text-lg font-semibold">{subAdmin.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {subAdmin.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {subAdmin.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <p className="mt-1">
                    <Badge className={getRoleColor(subAdmin.role)}>
                      {getRoleDisplay()}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <p className="mt-1">
                    <Badge className={subAdmin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {subAdmin.isActive ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created On</Label>
                  <p className="mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(subAdmin.createdAt)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Created By</Label>
                  <p className="mt-1">
                    {subAdmin.createdBy.name} ({subAdmin.createdBy.email})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permissions ({subAdmin.permissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permissionsByCategory.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{category.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.subItems.map((subItem) => (
                        <div key={subItem.id} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">{subItem.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}