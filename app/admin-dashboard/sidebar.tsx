"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import SuperAdminManagement from "./superadminmanagement"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  Mic,
  MapPin,
  UserCircle,
  DollarSign,
  FileText,
  Megaphone,
  BarChart3,
  Plug,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ArrowLeft,
  Menu,
  Star,
  Inbox,
  Tag,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  X,
} from "lucide-react"

// Import all section components
import DashboardPage from "./dashboard/page"
import EventManagement from "./events/page"
import OrganizerManagement from "./organizers/page"
import ExhibitorManagement from "./exhibitors/page"
import SpeakerManagement from "./speakers/page"
import VenueManagement from "./venues/page"
import SystemSettings from "./system-settings"
import CustomRolesManagement from "./custom-roles-management"
import { CreateEventForm } from "./eventManagement/createEvent/create-event"
import { clearTokens, markLogoutSuccessBanner } from "@/lib/api"
import {
  NAVBAR_LOGO_COMPACT_CLASSNAME,
  NAVBAR_LOGO_HEIGHT,
  NAVBAR_LOGO_WIDTH,
  getNavbarLogoImageProps,
} from "@/lib/brand-logo"
import { Button } from "@/components/ui/button"
import { AdminThemeToggle } from "@/components/admin-theme-toggle"
import CountriesManagement from "./countries-management"
import VisitorManagement from "./visitors/page"
import EventCategories from "./event-categories"
import ImportPage from "./import"
import MainHelpSupport from "./help-support/main-help-support"
import SupportTickets from "./help-support/support-tickets"
import SupportContacts from "./help-support/support-contacts"
import FAQManagement from "./help-support/faq-management"
import AdminNotes from "./help-support/support-notes"
import AddOrganizerForm from "./add-organizer-form"
import OrganizerConnectionsPage from "./organizer/connections"
import OrganizerPromotionsPage from "./organizer/promotions"
import PromotionsDashboard from "./promotions-dashboard"
import OrganizerVenueBookingsPage from "./organizer/venue-bookings"
import OrganizerFeedbackPage from "./organizer/feedback"
import AddExhibitorForm from "./add-exhibitor-form"
import ExhibitorPromotionsPage from "./exhibitors/promotions"
import ExhibitorFollowersPage from "./exhibitors/followers"
import ExhibitorAppointmentsPage from "./exhibitors/appointments"
import ExhibitorFeedbackPage from "./exhibitors/feedback"
import AddSpeaker from "./AddSpeaker"
import SpeakerFollowersPage from "./speaker/followers"
import SpeakerFeedbackPage from "./speaker/feedback"
import AddVenueComponent from "./AddVenue"
import VenuesEventsPage from "./venue/events"
import VenueBookingsPage from "./venue/bookings"
import VisitorEventsPage from "./visitors/events"
import VisitorConnectionsPage from "./visitors/connections"
import VisitorAppointmentsPage from "./visitors/appointments"
import VenueFeedbackPage from "./venue/venue-feedback/page"
import EmailTemplates from "./email-templates"
import EmailCampaigns from "./email-notifications"
import PushNotifications from "./push-notifications"
import PushTemplates from "./push-templates"
import FinancialPaymentsPage from "./financial/payments/page"
import FinancialSubscriptionsPage from "./financial/subscriptions/page"
import FinancialInvoicesPage from "./financial/invoices/page"
import FinancialTransactionsPage from "./financial/transactions/page"
import PaymentIntegrationsPage from "./integrations/page"
import CommunicationIntegrationsPage from "./integrations/communication"
import TravelIntegrationsPage from "./integrations/travel"
import SettingsModulesPage from "./settings/modules"
import SettingsNotificationsPage from "./settings/notifications"
import SettingsSecurityPage from "./settings/security"
import SettingsLanguagePage from "./settings/languages"
import SettingsBackupPage from "./settings/backup"
import AccountDeactivationsPage from "./settings/account-deactivations"
import ReportsAnalyticsPage from "./reports/ReportsAnalyticsPage"
import SearchAnalyticsPanel from "./reports/SearchAnalyticsPanel"
import BannersPage from "./content/banners"
import NewsAnnouncementsPage from "./content/news/page"
import BlogArticlesPage from "./content/blog/page"
import FeaturedEventsPage from "./content/featured-events/page"
import MediaLibraryPage from "./content/media/page"
import PromotionPackagesPage from "./financial/packeges/page"
import EventApprovalDashboard from "./EventApprovalDashboard"
import MarketingTrafficPanel from "./marketing-traffic"
import SeoKeywordsPanel from "./seo-keywords"
import SubAdminAnalyticsPanel from "../sub-admin/SubAdminAnalyticsPanel"
import SubAdminTrackingPage from "./sub-admin-tracking"
import ContactInquiriesPage from "./contact-inquiries-page"
import NewsletterAdminPage from "./newsletter-admin-page"
import ExhibitorApprovals from "./approvals/components/ExhibitorApprovals"
import OrganizerApprovals from "./approvals/components/OrganizerApprovals"
import VenueApprovals from "./approvals/components/VenueApprovals"
import MyPerformance from "./MyPerformance"
import {
  adminAccentText,
  adminNavActive,
  adminNavInactive,
  adminPageBg,
  adminPrimaryBtn,
  adminSidebarSurface,
  adminUpgradeCard,
} from "./admin-dashboard-theme"
import { cn } from "@/lib/utils"

interface AdminDashboardProps {
  userRole: "SUPER_ADMIN" | "SUB_ADMIN"
  userPermissions: string[]
}

const MENU_PERMISSIONS = {
  dashboard: "dashboard-overview",
  "my-performance": "my-performance-view",
  events: "events",
  "events-all": "events-all",
  "events-create": "events-create",
  "events-categories": "events-categories",
  "events-approvals": "events-approvals",
  "bulk-data": "bulk-data",
  approvals: "approvals-access",
  "approvals-events": "approvals-events",
  "approvals-venues": "approvals-venues",
  "approvals-organizers": "approvals-organizers",
  "approvals-exhibitors": "approvals-exhibitors",
  organizers: "organizers",
  "organizers-all": "organizers-all",
  "organizers-add": "organizers-add",
  "organizers-bulk-import": "organizers-bulk-import",
  "organizers-connections": "organizers-connections",
  promotions: "promotions",
  "promotions-dashboard": "promotions-dashboard",
  "organizers-bookings": "organizers-bookings",
  "organizers-feedback": "organizers-feedback",
  exhibitors: "exhibitors",
  "exhibitors-all": "exhibitors-all",
  "exhibitors-add": "exhibitors-add",
  "exhibitors-promotions": "exhibitors-promotions",
  "exhibitors-followers": "exhibitors-followers",
  "exhibitors-appointments": "exhibitors-appointments",
  "exhibitors-feedback": "exhibitors-feedback",
  speakers: "speakers",
  "speakers-all": "speakers-all",
  "speakers-add": "speakers-add",
  "speakers-followers": "speakers-followers",
  "speakers-appointments": "speakers-appointments",
  "speakers-feedback": "speakers-feedback",
  venues: "venues",
  "venues-all": "venues-all",
  "venues-add": "venues-add",
  "venues-bulk-import": "venues-bulk-import",
  "venues-events": "venues-events",
  "venues-bookings": "venues-bookings",
  "venues-feedback": "venues-feedback",
  visitors: "visitors",
  "visitors-all": "visitors-all",
  "visitors-events": "visitors-events",
  "visitors-connections": "visitors-connections",
  "visitors-appointments": "visitors-appointments",
  financial: "financial",
  "financial-payments": "financial-payments",
  "financial-subscriptions": "financial-subscriptions",
  "financial-invoices": "financial-invoices",
  "financial-transactions": "financial-transactions",
  "admin-promotions": "admin-promotions",
  content: "content",
  "content-news": "content-news",
  "content-blog": "content-blog",
  "content-banners": "content-banners",
  "content-featured": "content-featured",
  "content-media": "content-media",
  marketing: "marketing",
  "marketing-email": "marketing-email",
  "marketing-notifications": "marketing-notifications",
  "template-email": "template-email",
  "template-notifications": "template-notifications",
  "marketing-traffic": "marketing-traffic",
  "marketing-seo": "marketing-seo",
  reports: "reports",
  "reports-events": "reports-events",
  "reports-engagement": "reports-engagement",
  "reports-revenue": "reports-revenue",
  "reports-system": "reports-system",
  integrations: "integrations",
  "integrations-payment": "integrations-payment",
  "integrations-communication": "integrations-communication",
  "integrations-calendar": "integrations-calendar",
  "integrations-travel": "integrations-travel",
  roles: "roles",
  "roles-superadmin": "roles-superadmin",
  "roles-subadmins": "roles-subadmins",
  "roles-custom-templates": "roles-custom-templates",
  "roles-subadmin-tracking": "roles-subadmin-tracking",
  settings: "settings",
  "settings-modules": "settings-modules",
  "settings-notifications": "settings-notifications",
  "settings-security": "settings-security",
  "settings-language": "settings-language",
  "settings-backup": "settings-backup",
  "settings-deactivations": "settings-deactivations",
  support: "support",
  "support-tickets": "support-tickets",
  "support-contacts": "support-contacts",
  "support-notes": "support-notes",
  "support-faq": "support-faq",
  "visitors-suggestions": "visitors-suggestions",
  "contact-inquiries": "contact-inquiries",
  newsletter: "newsletter",
  locations: "locations",
  countries: "countries",
  states: "states",
  cities: "cities",
}

const LEGACY_PERMISSION_ALIASES: Record<string, string[]> = {
  "bulk-data": ["events-approvals"],
  "events-approvals": ["bulk-data"],
  "financial-subscriptions": ["financial-subscription"],
  "settings-deactivations": ["settings-modules"],
}

// sessionStorage key set by child pages (e.g. OrganizerManagement) right
// before navigating away to a full page route, so we can reopen the same
// section/sub-section when the admin comes back.
const RETURN_SECTION_KEY = "admin:returnSection"

export default function AdminDashboard({ userRole, userPermissions }: AdminDashboardProps) {
  const sidebarLogo = getNavbarLogoImageProps()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [activeSubSection, setActiveSubSection] = useState("")
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(["dashboard"]))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Restore section/sub-section if we're returning from a page we navigated
  // away to (e.g. an organizer's public profile). Runs once on mount.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RETURN_SECTION_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { section?: string; sub?: string }
        if (saved.section) {
          setActiveSection(saved.section)
          setActiveSubSection(saved.sub || "")
          setOpenMenus((prev) => {
            const next = new Set(prev)
            next.add(saved.section!)
            return next
          })
        }
        sessionStorage.removeItem(RETURN_SECTION_KEY)
      }
    } catch {
      /* ignore malformed/blocked storage */
    }
  }, [])

  const hasPermission = (itemId: string): boolean => {
    if (userRole === "SUPER_ADMIN") return true
    const requiredPermission = MENU_PERMISSIONS[itemId as keyof typeof MENU_PERMISSIONS]
    if (!requiredPermission) return false
    const candidates = new Set<string>([
      itemId,
      requiredPermission,
      ...(LEGACY_PERMISSION_ALIASES[itemId] ?? []),
      ...(LEGACY_PERMISSION_ALIASES[requiredPermission] ?? []),
    ])
    return userPermissions.some((p) => candidates.has(p))
  }

  const handleLogout = () => {
    markLogoutSuccessBanner()
    clearTokens()
    router.push("/login")
  }

  const toggleMenu = (menuId: string) => {
    const newOpenMenus = new Set(openMenus)
    if (newOpenMenus.has(menuId)) {
      newOpenMenus.delete(menuId)
    } else {
      newOpenMenus.add(menuId)
    }
    setOpenMenus(newOpenMenus)
  }

  const sidebarItems = [
    {
      title: "Dashboard Overview",
      icon: LayoutDashboard,
      id: "dashboard",
    },
    ...(userRole === "SUB_ADMIN"
      ? [
        {
          title: "My Performance",
          icon: TrendingUp,
          id: "my-performance",
        },
      ]
      : []),
    {
      title: "Events",
      icon: Calendar,
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
      title: "Approvals",
      icon: CheckCircle,
      id: "approvals",
      subItems: [
        { title: "Event Approvals", id: "approvals-events" },
        { title: "Venue Approvals", id: "approvals-venues" },
        { title: "Organizer Approvals", id: "approvals-organizers" },
        { title: "Exhibitor Approvals", id: "approvals-exhibitors" },
      ],
    },
    {
      title: "Locations",
      icon: MapPin,
      id: "locations",
      subItems: [
        { title: "Countries", id: "countries" },
        { title: "States", id: "states" },
        { title: "Cities", id: "cities" },
      ],
    },
    {
      title: "Organizer",
      icon: Users,
      id: "organizers",
      subItems: [
        { title: "All Organizers", id: "organizers-all" },
        { title: "Add Organizer", id: "organizers-add" },
        { title: "Bulk Import", id: "organizers-bulk-import" },
        { title: "Followers", id: "organizers-connections" },
        { title: "Venue Bookings", id: "organizers-bookings" },
      ],
    },
    {
      title: "Exhibitor",
      icon: Building2,
      id: "exhibitors",
      subItems: [
        { title: "All Exhibitors", id: "exhibitors-all" },
        { title: "Add Exhibitor", id: "exhibitors-add" },
        { title: "Appointments", id: "exhibitors-appointments" },
      ],
    },
    {
      title: "Speaker",
      icon: Mic,
      id: "speakers",
      subItems: [
        { title: "All Speakers", id: "speakers-all" },
        { title: "Add Speaker", id: "speakers-add" },
        { title: "Followers", id: "speakers-followers" },
      ],
    },
    {
      title: "Venue",
      icon: MapPin,
      id: "venues",
      subItems: [
        { title: "All Venues", id: "venues-all" },
        { title: "Add Venue", id: "venues-add" },
        { title: "Bulk Import", id: "venues-bulk-import" },
        { title: "Events by Venue", id: "venues-events" },
        { title: "Booking Enquiries", id: "venues-bookings" },
      ],
    },
    {
      title: "Visitor",
      icon: UserCircle,
      id: "visitors",
      subItems: [
        { title: "All visitors", id: "visitors-all" },
        { title: "Events by Visitor", id: "visitors-events" },
        { title: "Connections", id: "visitors-connections" },
        { title: "Appointments", id: "visitors-appointments" },
        { title: "Exhibitor Suggestions", id: "visitors-suggestions" },
      ],
    },
    {
      title: "Inquiries & registrations",
      icon: Inbox,
      id: "inquiries-registrations",
      subItems: [
        { title: "Contact inquiry", id: "contact-inquiries" },
      ],
    },
    {
      title: "Financial & Transactions",
      icon: DollarSign,
      id: "financial",
      subItems: [
        { title: "Payments Dashboard", id: "financial-payments" },
        { title: "Subscriptions & Plans", id: "financial-subscriptions" },
        { title: "Invoices & Receipts", id: "financial-invoices" },
        { title: "Promotions", id: "admin-promotions" },
        { title: "Transaction History", id: "financial-transactions" },
      ],
    },
    {
      title: "Content",
      icon: FileText,
      id: "content",
      subItems: [],
    },
    {
      title: "Promotions",
      icon: Tag,
      id: "promotions",
      subItems: [
        { title: "Promotions Dashboard", id: "promotions-dashboard" },
        { title: "Event Promotions", id: "admin-promotions" },
        { title: "Organizer Promotions", id: "promotions" },
        { title: "ExhibitorPromotions", id: "exhibitors-promotions" },
        { title: "Banner & Ads Manager", id: "content-banners" },
        { title: "Blog & Articles", id: "content-blog" },
        { title: "Newsletter", id: "newsletter" },
      ],
    },
    {
      title: "Marketing & Communication",
      icon: Megaphone,
      id: "marketing",
      subItems: [
        { title: "Email Campaigns", id: "marketing-email" },
        { title: "Push Notifications", id: "marketing-notifications" },
        { title: "Email Templates", id: "template-email" },
        { title: "Push Templates", id: "template-notifications" },
        { title: "News & Announcements", id: "content-news" },
        { title: "SEO & Keywords", id: "marketing-seo" },
      ],
    },
    {
      title: "Reports & Analytics",
      icon: BarChart3,
      id: "reports",
      subItems: [
        { title: "Event Performance", id: "reports-events" },
        { title: "User Engagement", id: "reports-engagement" },
        { title: "Revenue Reports", id: "reports-revenue" },
        { title: "System Health", id: "reports-system" },
        { title: "Search Analytics", id: "reports-search" },
        { title: "Traffic Analytics", id: "marketing-traffic" },
      ],
    },
    {
      title: "Integrations",
      icon: Plug,
      id: "integrations",
      subItems: [
        { title: "Payment Gateways", id: "integrations-payment" },
        { title: "Email/SMS Providers", id: "integrations-communication" },
        { title: "Hotel & Travel Partners", id: "integrations-travel" },
      ],
    },
    {
      title: "User Roles & Permissions",
      icon: Shield,
      id: "roles",
      subItems: [
        { title: "Super Admin", id: "roles-superadmin" },
        { title: "Sub Admins", id: "roles-subadmins" },
        { title: "Custom role templates", id: "roles-custom-templates" },
        { title: "Sub Admin Tracking", id: "roles-subadmin-tracking" },
      ],
    },
    {
      title: "Settings & Configuration",
      icon: Settings,
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
      icon: HelpCircle,
      id: "support",
      subItems: [
        { title: "Support Tickets", id: "support-tickets" },
      ],
    },
    {
      title: "Feedback",
      icon: MessageCircle,
      id: "feedback",
      subItems: [
        { title: "Event Feedback", id: "organizers-feedback" },
        { title: "Exhibitor Feedback", id: "exhibitors-feedback" },
        { title: "Speaker Feedback", id: "speakers-feedback" },
        { title: "Venue Feedback", id: "venues-feedback" },
      ],
    },
  ]

  const filteredSidebarItemsRaw = sidebarItems
    .map((item) => {
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter((subItem) => hasPermission(subItem.id))
        if (filteredSubItems.length === 0) return null
        return { ...item, subItems: filteredSubItems }
      }
      if (!hasPermission(item.id)) return null
      return item
    })
    .filter(Boolean) as typeof sidebarItems

  const filteredSidebarItems =
    userRole === "SUPER_ADMIN"
      ? sidebarItems
      : filteredSidebarItemsRaw

  const navigateFromDashboard = (sectionId: string) => {
    setActiveSection(sectionId)
    if (sectionId === "financial") setActiveSubSection("financial-payments")
    else if (sectionId === "content") setActiveSubSection("content-news")
    else if (sectionId === "integrations") setActiveSubSection("integrations-payment")
    else setActiveSubSection("")
    setOpenMenus((prev) => {
      const next = new Set(prev)
      next.add(sectionId)
      return next
    })
    setSidebarOpen(false)
  }

  const navigateToSubSection = (parentId: string, subId: string) => {
    setActiveSection(parentId)
    setActiveSubSection(subId)
    setOpenMenus((prev) => {
      const next = new Set(prev)
      next.add(parentId)
      return next
    })
    setSidebarOpen(false)
  }

  const navigateToEventPromotions = () => {
    navigateToSubSection("promotions", "admin-promotions")
  }

  const renderContent = () => {
    const section = activeSection
    const subSection = activeSubSection

    if (subSection) {
      switch (subSection) {
        case "roles-superadmin":
          return <SuperAdminManagement />
        case "roles-subadmins":
          return <SuperAdminManagement />
        case "roles-custom-templates":
          return <CustomRolesManagement />
        case "roles-subadmin-tracking":
          return <SubAdminTrackingPage />
        case "events-create":
          return <CreateEventForm />
        case "events-all":
          return <EventManagement onPromote={navigateToEventPromotions} />
        case "events-categories":
          return <EventCategories />
        case "bulk-data":
          return <ImportPage />
        case "countries":
          return <CountriesManagement activeTab="countries" />
        case "states":
          return <CountriesManagement activeTab="states" />
        case "cities":
          return <CountriesManagement activeTab="cities" />
        case "organizers-add":
          return <AddOrganizerForm />
        case "organizers-bulk-import":
          return <OrganizerManagement initialTab="bulk-import" />
        case "organizers-connections":
          return <OrganizerConnectionsPage />
        case "promotions-dashboard":
          return <PromotionsDashboard onNavigate={(subId) => navigateToSubSection("promotions", subId)} />
        case "promotions":
          return <OrganizerPromotionsPage />
        case "organizers-bookings":
          return <OrganizerVenueBookingsPage />
        case "organizers-feedback":
          return <OrganizerFeedbackPage />
        case "exhibitors-add":
          return <AddExhibitorForm />
        case "exhibitors-promotions":
          return <ExhibitorPromotionsPage />
        case "exhibitors-followers":
          return <ExhibitorFollowersPage />
        case "exhibitors-appointments":
          return <ExhibitorAppointmentsPage />
        case "exhibitors-feedback":
          return <ExhibitorFeedbackPage />
        case "speakers-add":
          return <AddSpeaker />
        case "speakers-followers":
          return <SpeakerFollowersPage />
        case "speakers-feedback":
          return <SpeakerFeedbackPage />
        case "venues-add":
          return <AddVenueComponent />
        case "venues-bulk-import":
          return <VenueManagement initialTab="bulk-import" />
        case "venues-events":
          return <VenuesEventsPage />
        case "venues-bookings":
          return <VenueBookingsPage />
        case "venues-feedback":
          return <VenueFeedbackPage />
        case "approvals-events":
          return <EventApprovalDashboard />
        case "approvals-venues":
          return <VenueApprovals />
        case "approvals-organizers":
          return <OrganizerApprovals />
        case "approvals-exhibitors":
          return <ExhibitorApprovals />
        case "visitors-events":
          return <VisitorEventsPage />
        case "visitors-connections":
          return <VisitorConnectionsPage />
        case "visitors-appointments":
          return <VisitorAppointmentsPage />
        case "contact-inquiries":
          return <ContactInquiriesPage />
        case "newsletter":
          return <NewsletterAdminPage />
        case "financial-payments":
          return <FinancialPaymentsPage />
        case "financial-subscriptions":
          return <FinancialSubscriptionsPage />
        case "financial-invoices":
          return <FinancialInvoicesPage />
        case "financial-transactions":
          return <FinancialTransactionsPage />
        case "admin-promotions":
          return <PromotionPackagesPage />
        case "reports-events":
          return <ReportsAnalyticsPage view="events" />
        case "reports-engagement":
          return <ReportsAnalyticsPage view="engagement" />
        case "reports-revenue":
          return <ReportsAnalyticsPage view="revenue" />
        case "reports-system":
          return <ReportsAnalyticsPage view="system" />
        case "reports-search":
          return <SearchAnalyticsPanel />
        case "support-tickets":
          return <SupportTickets />
        case "support-contacts":
          return <SupportContacts />
        case "support-faq":
          return <FAQManagement />
        case "support-notes":
          return <AdminNotes />
        case "marketing-email":
          return <EmailCampaigns />
        case "template-email":
          return <EmailTemplates />
        case "marketing-notifications":
          return <PushNotifications />
        case "template-notifications":
          return <PushTemplates />
        case "marketing-traffic":
          return <MarketingTrafficPanel />
        case "marketing-seo":
          return <SeoKeywordsPanel />
        case "integrations-payment":
          return <PaymentIntegrationsPage />
        case "integrations-communication":
          return <CommunicationIntegrationsPage />
        case "integrations-travel":
          return <TravelIntegrationsPage />
        case "settings-modules":
          return <SettingsModulesPage />
        case "settings-notifications":
          return <SettingsNotificationsPage />
        case "settings-security":
          return <SettingsSecurityPage />
        case "settings-language":
          return <SettingsLanguagePage />
        case "settings-backup":
          return <SettingsBackupPage />
        case "settings-deactivations":
          return <AccountDeactivationsPage />
        case "content-news":
          return <NewsAnnouncementsPage />
        case "content-blog":
          return <BlogArticlesPage />
        case "content-featured":
          return <FeaturedEventsPage />
        case "content-media":
          return <MediaLibraryPage />
        case "content-banners":
          return <BannersPage />
        default:
          break
      }
    }

    switch (section) {
      case "dashboard":
        return userRole === "SUB_ADMIN" ? <SubAdminAnalyticsPanel /> : <DashboardPage onNavigate={navigateFromDashboard} />
      case "my-performance":
        return <MyPerformance />
      case "events":
        return <EventManagement onPromote={navigateToEventPromotions} />
      case "locations":
        return <CountriesManagement activeTab="countries" />
      case "organizers":
        return <OrganizerManagement />
      case "exhibitors":
        return <ExhibitorManagement />
      case "speakers":
        return <SpeakerManagement />
      case "venues":
        return <VenueManagement />
      case "visitors":
        return <VisitorManagement />
      case "financial":
        return <FinancialPaymentsPage />
      case "content":
        return <NewsAnnouncementsPage />
      case "marketing":
        return <EmailCampaigns />
      case "reports":
        return <ReportsAnalyticsPage view="events" />
      case "integrations":
        return <PaymentIntegrationsPage />
      case "roles":
        return <SuperAdminManagement />
      case "settings":
        return <SystemSettings />
      case "support":
        return <MainHelpSupport />
      case "inquiries-registrations":
        return <ContactInquiriesPage />
      default:
        return <DashboardPage onNavigate={navigateFromDashboard} />
    }
  }

  const handleSectionClick = (id: string) => {
    setActiveSection(id)
    setActiveSubSection("")
    setSidebarOpen(false)
  }

  const handleSubSectionClick = (parentId: string, subId: string) => {
    setActiveSection(parentId)
    setActiveSubSection(subId)
    setSidebarOpen(false)
  }

  const getCurrentSectionTitle = () => {
    for (const item of filteredSidebarItems) {
      if (item.subItems?.length) {
        const sub = item.subItems.find((s) => s.id === activeSubSection)
        if (sub) return sub.title
      }
      if (activeSection === item.id && !activeSubSection) return item.title
    }
    return "Dashboard"
  }

  const isMenuOpen = (menuId: string) => openMenus.has(menuId)
  const isActive = (id: string) => activeSection === id
  const isSubActive = (id: string) => activeSubSection === id

  return (
    <div className={cn("relative flex min-h-0 min-w-0 flex-1 overflow-hidden", adminPageBg)}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[min(100vw,272px)] max-w-[85vw] shrink-0 flex-col shadow-[4px_0_24px_-12px_rgba(15,23,42,0.06)] transition-transform duration-300 ease-in-out lg:static lg:max-w-none lg:w-[272px] lg:min-w-[272px] lg:translate-x-0",
          adminSidebarSurface,
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden items-center gap-3 border-b border-border px-4 py-4 lg:flex">
          <div className="flex min-w-0 items-center gap-2">
            <Image
              src={sidebarLogo.src}
              alt="BizTradeFairs"
              width={NAVBAR_LOGO_WIDTH}
              height={NAVBAR_LOGO_HEIGHT}
              className={`${NAVBAR_LOGO_COMPACT_CLASSNAME} dark:brightness-110 dark:contrast-95`}
              unoptimized={sidebarLogo.unoptimized}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-0.5 p-3">
            {filteredSidebarItems.map((item) => (
              <div key={item.id} className="mb-0.5">
                {item.subItems && item.subItems.length > 0 ? (
                  <div className="rounded-2xl">
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2.5 text-left transition-all",
                        isActive(item.id) ? adminNavActive : adminNavInactive,
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <item.icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            isActive(item.id) ? "text-white" : "text-slate-500",
                          )}
                        />
                        <span className="truncate text-sm">{item.title}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isMenuOpen(item.id) ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {isMenuOpen(item.id) && (
                      <div className="ml-2 mt-1 space-y-0.5 border-l border-slate-200 py-1 pl-3">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            type="button"
                            onClick={() => handleSubSectionClick(item.id, subItem.id)}
                            className={cn(
                              "block w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                              isSubActive(subItem.id)
                                ? "bg-[#004A96]/10 font-semibold text-[#004A96] ring-1 ring-[#004A96]/20"
                                : "text-slate-600 hover:bg-slate-100 hover:text-[#004A96]",
                            )}
                          >
                            {subItem.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSectionClick(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all",
                      isActive(item.id) ? adminNavActive : adminNavInactive,
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive(item.id) ? "text-white" : "text-slate-500",
                      )}
                    />
                    <span className="text-sm font-medium">{item.title}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 space-y-3 border-t border-border p-3">
          <div className={cn("rounded-2xl p-4", adminUpgradeCard)}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-blue-100">
                <Star className={cn("h-5 w-5", adminAccentText)} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">Pro Plan</p>
                <Button
                  type="button"
                  className={cn("mt-2 h-8 w-full rounded-xl text-xs font-semibold shadow-sm", adminPrimaryBtn)}
                  variant="default"
                >
                  Manage Plan
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AdminThemeToggle className="h-10 w-full flex-1 rounded-xl border border-border bg-muted/30 justify-center" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-3 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground">
            {getCurrentSectionTitle()}
          </span>
          <div className="h-9 w-9 shrink-0" aria-hidden />
        </div>

        <main className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-8", adminPageBg)}>
          <div className="min-h-0 w-full min-w-0 max-w-full">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}