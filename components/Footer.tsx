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
      <div className="w-full bg-gradient-to-b from-white to-[#f0f5ff] px-7 py-10">
        <div className="mx-auto flex min-h-[120px] max-w-7xl flex-wrap items-center justify-between gap-8 rounded-2xl border border-[#2563EB]/15 bg-white px-8 py-7 shadow-[0_4px_32px_-4px_rgba(37,99,235,0.13)]">

          {/* Trusted */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#EEF4FF] to-[#dbeafe] shadow-inner">
              <svg className="h-6 w-6 text-[#1E63E9]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold text-[#1A1A1A]">Trusted by Organizers</p>
              <p className="mt-1 text-[14px] text-[#5F6B7A]">Worldwide</p>
            </div>
          </div>

          <div className="hidden h-14 w-px bg-gradient-to-b from-transparent via-[#2563EB]/20 to-transparent lg:block" />

          {/* Events */}
          <div className="flex items-center gap-4">
            <svg className="h-8 w-8 text-[#1E63E9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="leading-tight">
              <p className="text-[28px] font-bold text-[#1E63E9]">10,000+</p>
              <p className="mt-1 text-[14px] text-[#5F6B7A]">Events Listed</p>
            </div>
          </div>

          <div className="hidden h-14 w-px bg-gradient-to-b from-transparent via-[#2563EB]/20 to-transparent lg:block" />

          {/* Organizers */}
          <div className="flex items-center gap-4">
            <svg className="h-8 w-8 text-[#1E63E9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M22 20V7" />
            </svg>
            <div className="leading-tight">
              <p className="text-[28px] font-bold text-[#1E63E9]">5,000+</p>
              <p className="mt-1 text-[14px] text-[#5F6B7A]">Verified Organizers</p>
            </div>
          </div>

          <div className="hidden h-14 w-px bg-gradient-to-b from-transparent via-[#2563EB]/20 to-transparent lg:block" />

          {/* Countries */}
          <div className="flex items-center gap-4">
            <svg className="h-8 w-8 text-[#1E63E9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3c3 3 3 15 0 18" />
              <path d="M12 3c-3 3-3 15 0 18" />
            </svg>
            <div className="leading-tight">
              <p className="text-[28px] font-bold text-[#1E63E9]">120+</p>
              <p className="mt-1 text-[14px] text-[#5F6B7A]">Countries Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER ───────────────────────────────────────── */}
      <footer className="relative overflow-hidden" style={{ backgroundColor: "#004A96" }}>

        {/* Rich layered background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 10% 0%, rgba(255,255,255,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 90% 100%, rgba(0,30,80,0.55) 0%, transparent 60%),
              linear-gradient(160deg, #0057B0 0%, #004A96 30%, #003578 65%, #002050 100%)
            `,
          }}
        />



        {/* Thin top accent line */}
        <div className="absolute top-0 left-0 right-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

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
                <p className="mb-6 text-[14px] leading-relaxed text-white/90">
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
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition-all duration-200 hover:border-white/60 hover:bg-white/15 hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                    >
                      <Icon className="h-[13px] w-[13px]" />
                    </a>
                  ))}
                </div>
              </div>

              {/* SERVICES */}
              <div>
                <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
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
                      <Link href={href} className="text-[14px] text-white/90 transition-colors duration-150 hover:text-white hover:underline underline-offset-2">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* COMPANY */}
              <div>
                <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
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
                      <Link href={href} className="text-[14px] text-white/90 transition-colors duration-150 hover:text-white hover:underline underline-offset-2">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* EVENT CATEGORIES */}
              <div>
                <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                  Event Categories
                </h4>
                <ul className="space-y-[10px]">
                  {topCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link href={`/event?category=${encodeURIComponent(cat.name)}`} className="text-[14px] text-white/90 transition-colors duration-150 hover:text-white hover:underline underline-offset-2">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* HELP */}
              <div>
                <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
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
                      <Link href={href} className="text-[14px] text-white/90 transition-colors duration-150 hover:text-white hover:underline underline-offset-2">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* MORE INFO */}
              <div>
                <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
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
                      <Link href={href} className="text-[14px] text-white/90 transition-colors duration-150 hover:text-white hover:underline underline-offset-2">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── TRUST STRIP ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", backgroundColor: "rgba(0,0,0,0.18)", backdropFilter: "blur(4px)" }}>
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
                        gap: 14,
                        padding: "20px 20px",
                        borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                        transition: "background 0.2s",
                      }}
                    >
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-200 group-hover:bg-white/20 group-hover:shadow-[0_0_16px_rgba(255,255,255,0.12)]">
                        <Icon className="h-5 w-5 text-white" strokeWidth={1.6} />
                      </div>
                      <div>
                        <p className="m-0 text-[13px] font-semibold text-white">{item.title}</p>
                        <p className="m-0 mt-0.5 text-[11px] leading-[1.4] text-white/80">{item.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── REGISTERED ADDRESS ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(0,10,30,0.55)" }}>
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
              <p className="m-0 text-[11.5px] leading-[1.7] text-white/85">
                <span className="font-semibold text-white">Registered Office:</span>{" "}
                Maxx Business Media Pvt Ltd | # T9, 3rd Floor, Swastik Manandi Arcade, SC Road,
                Seshadripuram, Bengaluru – 560020, India, Support-+91-9148319993 | CIN: U74999KA2019PTC123194
              </p>
            </div>
          </div>

          {/* ── COPYRIGHT ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(0,8,22,0.75)" }}>
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
              <p className="text-sm text-white/85">
                BizTradeFairs.com provides verified information on trade fairs, expos, conferences, and industrial events worldwide.
                Users are advised to confirm event schedules, venue details, participation terms, and travel requirements directly
                with organizers before planning attendance.
              </p>
              <p className="mt-1 text-center text-sm font-medium text-white">
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