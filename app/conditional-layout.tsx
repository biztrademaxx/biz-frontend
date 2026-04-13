"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/Footer"

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Hide Navbar/Footer on dashboard routes
  const hideLayout =
    pathname.startsWith("/organizer-dashboard") ||
    pathname.startsWith("/event-dashboard") ||
    pathname.startsWith("/dashboard")||
    pathname.startsWith("/exhibitor-dashboard")||
    pathname.startsWith("/speaker-dashboard")||
    pathname.startsWith("/venue-dashboard")||
    pathname.startsWith("/admin-dashboard")||
    pathname.startsWith("/sub-admin")

    

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  )
}
