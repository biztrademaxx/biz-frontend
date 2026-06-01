"use client"

import Image from "next/image"
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
} from "lucide-react"

import FooterChatBot from "@/components/footer-chat-bot"
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

  return (
    <>
      {/* ── TOP TRUST BAR ─────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden border-b border-white/10 px-7 py-12"
        style={{
          background:
            "linear-gradient(180deg, #0A4FA3 0%, #004A96 35%, #003D82 70%, #002C71 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[300px] -translate-x-1/2 bg-white/5 blur-[120px]" />

          <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
        </div>
        <div className="mx-auto max-w-4xl text-center pb-14">
          <span className="inline-flex rounded-full border border-[#FFD54A]/30 bg-[#FFD54A]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#FFD54A]">
            JOIN 34,500+ LISTED EVENTS
          </span>

          <h2 className="mt-5 text-4xl font-bold leading-tight text-white md:text-5xl">
            Get your event in front of
            <br />
            the people who matter.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            List your event today and reach thousands of industry professionals
            actively searching for exhibitions, conferences and trade fairs.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/organizer-signup"
              className="rounded-md bg-[#FFC107] px-6 py-3 text-sm font-semibold text-[#001B44] transition hover:bg-[#FFD54A]"
            >
              List Your Event Free →
            </Link>

            <Link
              href="/pricing"
              className="rounded-md border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Premium Plans
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-14 h-px max-w-5xl bg-white/15" />
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-10 px-8 md:grid-cols-4">
          

          {/* Trusted */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
              <svg className="h-5 w-5 text-[#6EAAFF]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-semibold text-white">Trusted by Organizers</p>
              <p className="mt-1 text-[12px] text-white/50">Worldwide</p>
            </div>
          </div>

          {/* <div className="hidden h-9 w-px bg-white/[0.08] lg:block" /> */}

          {/* Events */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
              <svg className="h-5 w-5 text-[#6EAAFF]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-[22px] font-bold text-[#6EAAFF]">10,000+</p>
              <p className="mt-1 text-[12px] text-white/50">Events Listed</p>
            </div>
          </div>

          {/* <div className="hidden h-9 w-px bg-white/[0.08] lg:block" /> */}

          {/* Organizers */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
              <svg className="h-5 w-5 text-[#6EAAFF]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M22 20V7" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-[22px] font-bold text-[#6EAAFF]">5,000+</p>
              <p className="mt-1 text-[12px] text-white/50">Verified Organizers</p>
            </div>
          </div>

          {/* <div className="hidden h-9 w-px bg-white/[0.08] lg:block" /> */}

          {/* Countries */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12]">
              <svg className="h-5 w-5 text-[#6EAAFF]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c3 3 3 15 0 18" />
                <path d="M12 3c-3 3-3 15 0 18" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-[22px] font-bold text-[#6EAAFF]">120+</p>
              <p className="mt-1 text-[12px] text-white/50">Countries Covered</p>
            </div>
          </div>
        </div>
      </div>

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
                    ["Report an Issue", "/contact"],
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

          {/* ── TRUST STRIP ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(0,0,0,0.25)" }}>
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="flex flex-wrap items-stretch">
                {[
                  { title: "Global Reach", sub: "Events in 120+ countries", icon: Globe },
                  { title: "Verified & Trusted", sub: "Authentic events & organizers", icon: BadgeCheck },
                  { title: "Always Updated", sub: "Real-time event information", icon: RefreshCw },
                  { title: "Dedicated Support", sub: "Here to help you anytime", icon: Headphones },
                  { title: "Secure & Reliable", sub: "Your data is always safe", icon: ShieldCheck },
                ].map((item, i, arr) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="group"
                      style={{
                        flex: 1,
                        minWidth: 200,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "18px 20px",
                        borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      }}
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.05] transition-all duration-200 group-hover:bg-white/[0.10]">
                        <Icon className="h-4 w-4 text-white/75" strokeWidth={1.7} />
                      </div>
                      <div>
                        <p className="m-0 text-[12.5px] font-semibold text-white">{item.title}</p>
                        <p className="m-0 mt-0.5 text-[11px] leading-[1.4] text-white/45">{item.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── REGISTERED ADDRESS ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(0,0,0,0.30)" }}>
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
              <p className="m-0 text-[11.5px] leading-[1.7] text-white/45">
                <span className="font-medium text-white/65">Registered Office:</span>{" "}
                Maxx Business Media Pvt Ltd | # T9, 3rd Floor, Swastik Manandi Arcade, SC Road,
                Seshadripuram, Bengaluru – 560020, India, Support-+91-9148319993 | CIN: U74999KA2019PTC123194
              </p>
            </div>
          </div>

          {/* ── COPYRIGHT ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(0,0,0,0.40)" }}>
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
              <p className="text-[12.5px] text-white/45">
                BizTradeFairs.com provides verified information on trade fairs, expos, conferences, and industrial events worldwide.
                Users are advised to confirm event schedules, venue details, participation terms, and travel requirements directly
                with organizers before planning attendance.
              </p>
              <p className="mt-1 text-center text-[12.5px] font-medium text-white/55">
                © {new Date().getFullYear()} BizTradeFairs. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        <FooterChatBot />
      </footer>
    </>
  )
}

export default Footer