/** Shared permission tree for sub-admin / custom role assignment (ids match sidebar MENU_PERMISSIONS). */

export interface PermissionSubItem {
  id: string
  title: string
}

export interface PermissionCategory {
  id: string
  title: string
  subItems: PermissionSubItem[]
}

export const ADMIN_PERMISSION_CATEGORIES: PermissionCategory[] = [
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
      { title: "Event Approvals", id: "events-approvals" },
      { title: "Bulk Data", id: "bulk-data" },
    ],
  },
  {
    title: "Organizer Management",
    id: "organizers",
    subItems: [
      { title: "All Organizers", id: "organizers-all" },
      { title: "Add Organizer", id: "organizers-add" },
      { title: "Followers", id: "organizers-connections" },
      { title: "Promotions", id: "promotions" },
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
      { title: "All visitors", id: "visitors-all" },
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
      { title: "Promotions (packages)", id: "admin-promotions" },
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
      { title: "Email Templates", id: "template-email" },
      { title: "Push Templates", id: "template-notifications" },
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
      { title: "Hotel & Travel Partners", id: "integrations-travel" },
    ],
  },
  {
    title: "User Roles & Permissions",
    id: "roles",
    subItems: [
      { title: "Super Admin (sub-admin accounts)", id: "roles-superadmin" },
      { title: "Sub Admins", id: "roles-subadmins" },
      { title: "Custom role templates", id: "roles-custom-templates" },
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
      { title: "Account deactivations", id: "settings-deactivations" },
    ],
  },
  {
    title: "Help & Support",
    id: "support",
    subItems: [
      { title: "Support Tickets", id: "support-tickets" },
      { title: "Contact Logs", id: "support-contacts" },
      { title: "FAQ Management", id: "support-faq" },
      { title: "Admin Notes", id: "support-notes" },
    ],
  },
]

export function groupPermissionCategoriesForColumns(
  categories: PermissionCategory[] = ADMIN_PERMISSION_CATEGORIES,
): PermissionCategory[][] {
  return [categories.slice(0, 5), categories.slice(5, 10), categories.slice(10)]
}
