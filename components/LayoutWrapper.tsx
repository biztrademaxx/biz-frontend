"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/navbar"
import Footer from "@/components/Footer"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideLayout = pathname.startsWith("/dashboard") || pathname.startsWith("/register") ||
    pathname.startsWith("/organizerdashboard") || pathname.startsWith("/reset-password") || pathname.startsWith("/verify-email") ||
    pathname.startsWith("/organizer-dashboard") || pathname.startsWith("/admin-dashboard") || pathname.startsWith("/exhibitor-dashboard") ||
    pathname.startsWith("/speaker-dashboard") || pathname.startsWith("/venue-dashboard")

  return (
    <>
      {!hideLayout && <Header />}
      {children}
      {!hideLayout && <Footer />}
    </>
  )
}
