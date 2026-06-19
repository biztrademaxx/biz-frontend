"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import type React from "react"
import Link from "next/link"
import {
  FaInstagramSquare,
  FaTwitterSquare,
  FaFacebookSquare,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa"
import {
  Globe,
  BadgeCheck,
  RefreshCw,
  Headphones,
  ShieldCheck,
  Verified,
  Clock,
} from "lucide-react"

import FooterChatBot from "@/components/footer-chat-bot"
import { usePathname } from "next/navigation"
import { getFooterLogoSrc, isBrandLogoRemoteUrl } from "@/lib/brand-logo"

interface FooterCategory {
  id: string
  name: string
  eventCount: number
}

interface FooterProps {
  categories?: FooterCategory[]
}

const Footer: React.FC<FooterProps> = ({ categories }) => {

  const [showChatBot, setShowChatBot] = useState(false)
  const pathname = usePathname()
  const footerLogoSrc = getFooterLogoSrc()
  const footerLogoUnoptimized = isBrandLogoRemoteUrl(footerLogoSrc)

  const fallbackCategories: FooterCategory[] = [
    { id: "1", name: "Auto & Automotive", eventCount: 1200 },
    { id: "2", name: "Industrial Engineering", eventCount: 1100 },
    { id: "3", name: "Building & Construction", eventCount: 1000 },
    { id: "4", name: "IT & Technology", eventCount: 950 },
  ]


  const topCategories =
    categories && categories.length > 0
      ? [...categories].sort((a, b) => b.eventCount - a.eventCount).slice(0, 5)
      : fallbackCategories

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const pageHeight = document.documentElement.scrollHeight

      // Show chatbot when user is within 800px of footer
      setShowChatBot(scrollPosition >= pageHeight - 800)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check if current page is home page
  const isHomePage = pathname === "/"

  return (
    <>
      {/* ── TOP TRUST BAR ─────────────────────────────────────── */}
      {/* Only render on home page */}
      {isHomePage && (
        <div
          className="relative w-full overflow-hidden border-b border-white/10 px-7 pt-2 pb-4"
          style={{
            background:
              "linear-gradient(180deg, #0A4FA3 0%, #004A96 35%, #003D82 70%, #002C71 100%)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">
              <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
            </div>
          </div>
          <div className="relative z-10 mx-auto max-w-4xl pt-0 pb-0 text-center mt-3">
            <span className="inline-flex rounded-full border border-[#FFD54A]/30 bg-[#FFD54A]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#FFD54A]">
              JOIN 34,500+ LISTED EVENTS
            </span>

            <h2 className="mt-4 text-xl max-w-4xl font-bold leading-tight text-white md:text-4xl">
              Get your event in front of
              the people who matter.
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/65">
              List your event today and reach thousands of industry professionals
              actively searching for exhibitions, conferences and trade fairs.
            </p>
          </div>
          <div className="relative z-10 mx-auto mt-8 h-px max-w-7xl bg-white/15 lg:mt-14" />
          <div
            className="relative z-10 scrollbar-hide mt-10 overflow-x-auto overflow-y-hidden px-4 pb-2 sm:px-6 lg:hidden"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x",
              overscrollBehaviorX: "contain",
            }}
          >
            <div className="flex min-w-max gap-8">

              {/* Trusted */}
              <div className="flex w-[280px] shrink-0 items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                  <Globe className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-xl font-semibold text-white sm:text-[22px]">Global Reach</p>
                  <p className="mt-1 text-[12px] text-white/50">Events in 120+ countries</p>
                </div>
              </div>

              {/* Events */}
              <div className="flex w-[280px] shrink-0 items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                  <Verified className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-xl font-bold text-white sm:text-[22px]">Verified & Trusted</p>
                  <p className="mt-1 text-[12px] text-white/50">Authentic events & organizers</p>
                </div>
              </div>

              {/* Organizers */}
              <div className="flex w-[280px] shrink-0 items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                  <Clock className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-xl font-bold text-white sm:text-[22px]">Always Updated</p>
                  <p className="mt-1 text-[12px] text-white/50">Real-time event information</p>
                </div>
              </div>

              {/* Countries */}
              <div className="flex w-[280px] shrink-0 items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                  <Headphones className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-xl font-bold text-white sm:text-[22px]">Dedicated Support</p>
                  <p className="mt-1 text-[12px] text-white/50">Here to help you anytime</p>
                </div>
              </div>
              <div className="flex w-[280px] shrink-0 items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                  <ShieldCheck className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-xl font-bold text-white sm:text-[22px]">Secure & Reliable</p>
                  <p className="mt-1 text-[12px] text-white/50">Your data is always safe</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 mx-auto mt-10 hidden min-w-max items-center justify-center gap-10 px-8 lg:flex">

            {/* Trusted */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                <Globe className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
              </div>
              <div className="leading-tight">
                <p className="text-[22px] font-semibold text-white">Global Reach</p>
                <p className="mt-1 text-[12px] text-white/50">Events in 120+ countries</p>
              </div>
            </div>

            {/* Events */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                <Verified className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
              </div>
              <div className="leading-tight">
                <p className="text-[22px] font-bold text-white">Verified & Trusted</p>
                <p className="mt-1 text-[12px] text-white/50">Authentic events & organizers</p>
              </div>
            </div>

            {/* Organizers */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                <Clock className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
              </div>
              <div className="leading-tight">
                <p className="text-[22px] font-bold text-white">Always Updated</p>
                <p className="mt-1 text-[12px] text-white/50">Real-time event information</p>
              </div>
            </div>

            {/* Countries */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                <Headphones className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
              </div>
              <div className="leading-tight">
                <p className="text-[22px] font-bold text-white">Dedicated Support</p>
                <p className="mt-1 text-[12px] text-white/50">Here to help you anytime</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
                <ShieldCheck className="h-5 w-5 text-[#6EAAFF]" strokeWidth={1.8} />
              </div>
              <div className="leading-tight">
                <p className="text-[22px] font-bold text-white">Secure & Reliable</p>
                <p className="mt-1 text-[12px] text-white/50">Your data is always safe</p>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">

          
            <p className="max-w-7xl text-[12.5px] leading-6 text-white/45">
              BizTradeFairs.com provides verified information on trade fairs, expos, conferences,
              and industrial events worldwide.Users are advised to confirm event schedules, venue details, participation terms,

              <span className="block pl-80">
                and travel requirements directly with organizers before planning attendance.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── MAIN FOOTER ───────────────────────────────────────── */}
      <footer className="relative overflow-hidden bg-[#0B1628]">

        {/* Thin top accent line */}
        <div className="absolute top-0 left-0 right-0 z-10 h-px bg-white/[0.06]" />

        {/* ── CONTENT ── */}
        <div className="relative z-10">

          {/* NAV SECTION */}
          <div className="mx-auto max-w-7xl px-6 pb-14 pt-16 lg:px-10">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6">

              {/* LOGO COL */}
              <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
                <Link href="/" className="mb-5 inline-flex items-center">
                  <Image
                    src={footerLogoSrc}
                    alt="BizTradeFairs.com"
                    width={190}
                    height={100}
                    unoptimized={footerLogoUnoptimized ? true : undefined}
                    className="h-15 w-auto object-contain object-left"
                  />
                </Link>
                <p className="mb-6 text-[13px] leading-relaxed text-white/55">
                  Your global platform to discover, connect and participate in
                  world-class exhibitions and trade fairs.
                </p>
                <div className="flex items-center gap-2">
                  {[
                    { href: "https://www.facebook.com/biztradefair/", Icon: FaFacebookSquare },
                    { href: "https://www.linkedin.com/company/biztradefairs/", Icon: FaLinkedin },
                    { href: "https://x.com/biztradefair", Icon: FaTwitterSquare },
                    { href: "https://www.instagram.com/biztradefairs/", Icon: FaInstagramSquare },
                    { href: "#", Icon: FaYoutube },
                  ].map(({ href, Icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.05] text-white/55 transition-all duration-200 hover:border-[#6EAAFF]/50 hover:bg-[#6EAAFF]/10 hover:text-white"
                    >
                      <Icon className="h-[13px] w-[13px]" />
                    </a>
                  ))}
                </div>
              </div>

              {/* SERVICES */}
              <div>
                <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Services
                </h4>
                <ul className="space-y-[10px]">
                  {[
                    ["Find Events", "/event"],
                    ["Event Calendar", "/event"],
                    ["For Organizers", "/organizers"],
                    ["Exhibition Venues", "/venues"],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-[13.5px] text-white/70 transition-colors duration-150 hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* COMPANY */}
              <div>
                <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Company
                </h4>
                <ul className="space-y-[10px]">
                  {[
                    ["About Us", "/about-us"],
                    ["Careers", "/careers"],
                    ["Become Organizer", "/become-organizer"],
                    ["Contact Us", "/contact"],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-[13.5px] text-white/70 transition-colors duration-150 hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* EVENT CATEGORIES */}
              <div>
                <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Event Categories
                </h4>
                <ul className="space-y-[10px]">
                  {topCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link href={`/event?category=${encodeURIComponent(cat.name)}`} className="text-[13.5px] text-white/70 transition-colors duration-150 hover:text-white">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* HELP */}
              <div>
                <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Help & Support
                </h4>
                <ul className="space-y-[10px]">
                  {[
                    ["FAQ", "/faq"],
                    ["Contact Us", "/contact"],
                    ["Support Center", "/support"],
                    ["Report an Issue", "/contact#contact-form"]
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-[13.5px] text-white/70 transition-colors duration-150 hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* MORE INFO */}
              <div>
                <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  More Info
                </h4>
                <ul className="space-y-[10px]">
                  {[
                    ["Terms & Conditions", "/terms-conditions"],
                    ["Privacy Policy", "/privacy-policy"],
                    ["Cookie Policy", "/cookie-policy"],
                    ["Refund Policy", "/refund-policy"],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-[13.5px] text-white/70 transition-colors duration-150 hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
          </div>
          {/* ── REGISTERED ADDRESS ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(0,0,0,0.30)" }}>
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
             
            </div>
          </div>

          {/* ── COPYRIGHT ── */}
          <div style={{ backgroundColor: "rgba(0,0,0,0.40)" }}>
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
              <p className="m-0 text-[12px] leading-[1.7] text-white/45">
                <span className="text-[12px] font-semibold text-white/65">Registered Office:</span>{" "}
                Maxx Business Media Pvt Ltd | # T9, 3rd Floor, Swastik Manandi Arcade, SC Road,
                Seshadripuram, Bengaluru – 560020, India, Support-+91-9148319993 | CIN: U74999KA2019PTC123194
              </p>
              <p className="mt-1 text-center text-[12.5px] font-medium text-white/55">
                © {new Date().getFullYear()} BizTradeFairs. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {pathname === "/" && showChatBot && <FooterChatBot />}
      </footer>
    </>
  )
}

export default Footer