"use client"

import Image from "next/image"
import type React from "react"
import { AppImage } from "@/components/app-image"
import Link from "next/link"
import {
  FaInstagramSquare,
  FaTwitterSquare,
  FaFacebookSquare,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa"

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
    { id: "5", name: "Healthcare & Pharma", eventCount: 900 },
  ]

  const topCategories =
    categories && categories.length > 0
      ? [...categories].sort((a, b) => b.eventCount - a.eventCount).slice(0, 5)
      : fallbackCategories

  return (
<<<<<<< HEAD
    <footer className={footerShellClass}>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <AppImage
          src="/world.svg"
          alt=""
          width={2000}
          height={857}
          className="absolute -bottom-6 right-0 h-[clamp(220px,42vw,520px)] w-auto max-w-[min(95vw,920px)] object-contain object-right-bottom opacity-25 sm:-bottom-10 lg:h-[min(55vh,560px)]"
        />
        <div className={footerMapGradientClass} />
=======
    <>
      {/* TOP TRUST BAR */}
      <div className="w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
              <svg className="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-gray-900">Trusted by Organizers</p>
              <p className="text-[13px] text-gray-500">Worldwide</p>
            </div>
          </div>
          <div className="hidden h-10 w-px bg-gray-200 lg:block" />
          <div className="flex items-center gap-3">
            <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              <p className="text-[20px] font-bold leading-tight text-blue-600">10,000+</p>
              <p className="text-[12px] text-gray-500">Events Listed</p>
            </div>
          </div>
          <div className="hidden h-10 w-px bg-gray-200 lg:block" />
          <div className="flex items-center gap-3">
            <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
              <rect x="2" y="2" width="9" height="9" rx="1" /><rect x="13" y="2" width="9" height="9" rx="1" /><rect x="2" y="13" width="9" height="9" rx="1" /><rect x="13" y="13" width="9" height="9" rx="1" />
            </svg>
            <div>
              <p className="text-[20px] font-bold leading-tight text-blue-600">5,000+</p>
              <p className="text-[12px] text-gray-500">Verified Organizers</p>
            </div>
          </div>
          <div className="hidden h-10 w-px bg-gray-200 lg:block" />
          <div className="flex items-center gap-3">
            <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" />
            </svg>
            <div>
              <p className="text-[20px] font-bold leading-tight text-blue-600">120+</p>
              <p className="text-[12px] text-gray-500">Countries Covered</p>
            </div>
          </div>
        </div>
>>>>>>> 13f278a4e449034cbe373006f8c2d39357dc091b
      </div>

      {/* ══════════════════════════════════════════
          MAIN FOOTER
          Structure (top to bottom):
          [1] Nav columns  — image behind, light dark overlay
          [2] Trust strip  — semi-dark band
          [3] PURE GAP     — zero overlay, raw image shows
          [4] Registered   — solid dark band
          [5] Copyright    — solid dark band
      ══════════════════════════════════════════ */}
      <footer style={{ backgroundColor: "#02122b", position: "relative", overflow: "hidden" }}>

        {/* IMAGE — absolute, full footer, no gradient at all */}
        <img
          src="/Organizers/max3.png"
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            opacity: 1,
            zIndex: 0,
          }}
        />

        {/* SECTION 1 OVERLAY — only covers the nav columns area, not the gap */}
        {/* We use a div that is position:absolute but only covers top portion */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "460px", /* roughly height of nav columns section */
            background: "rgba(0,9,26,0.62)",
            zIndex: 1,
          }}
        />

        {/* All content sits above both layers */}
        <div style={{ position: "relative", zIndex: 2 }}>

          {/* ── [1] NAV COLUMNS ── */}
          <div className="mx-auto max-w-7xl px-6 pt-12 pb-12 lg:px-10">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

              {/* LOGO */}
              <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-1">
                <Link href="/" className="mb-4 inline-flex items-center">
                  <Image
                    src={footerLogoSrc}
                    alt="BizTradeFairs.com"
                    width={190}
                    height={50}
                    unoptimized={footerLogoUnoptimized ? true : undefined}
                    className="h-10 w-auto object-contain object-left"
                  />
                </Link>
                <p className="mb-5 text-[12.5px] leading-relaxed text-white/90">
                  Your global platform to discover, connect and participate in world-class exhibitions and trade fairs.
                </p>
                <div className="flex items-center gap-2">
                  {[
                    { href: "https://www.facebook.com/biztradefair/", Icon: FaFacebookSquare },
                    { href: "https://www.linkedin.com/company/biztradefairs/", Icon: FaLinkedin },
                    { href: "https://x.com/biztradefair", Icon: FaTwitterSquare },
                    { href: "https://www.instagram.com/biztradefairs/", Icon: FaInstagramSquare },
                    { href: "#", Icon: FaYoutube },
                  ].map(({ href, Icon }) => (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/80 transition hover:border-white hover:text-white">
                      <Icon className="h-[13px] w-[13px]" />
                    </a>
                  ))}
                </div>
              </div>

              {/* SERVICES */}
              <div>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Services</h4>
                <ul className="space-y-[9px]">
                  {[["Find Events", "/event"], ["Event Calendar", "/event"], ["Add Event", "/add-event"], ["For Organizers", "/organizers"], ["For Sponsors", "/sponsors"], ["Exhibition Venues", "/venues"]].map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-[12.5px] text-white/80 transition hover:text-white">{label}</Link></li>
                  ))}
                </ul>
              </div>

              {/* COMPANY */}
              <div>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Company</h4>
                <ul className="space-y-[9px]">
                  {[["About Us", "/about-us"], ["Careers", "/careers"], ["Blogs", "/blog"], ["Press & Media", "/press"], ["Become Organizer", "/become-organizer"], ["Contact Us", "/contact"]].map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-[12.5px] text-white/80 transition hover:text-white">{label}</Link></li>
                  ))}
                </ul>
              </div>

              {/* EVENT CATEGORIES */}
              <div>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Event Categories</h4>
                <ul className="space-y-[9px]">
                  {topCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link href={`/event?category=${encodeURIComponent(cat.name)}`} className="text-[12.5px] text-white/80 transition hover:text-white">{cat.name}</Link>
                    </li>
                  ))}
                  <li><Link href="/event" className="text-[12.5px] text-white/80 transition hover:text-white">View All Categories</Link></li>
                </ul>
              </div>

              {/* HELP & SUPPORT */}
              <div>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Help & Support</h4>
                <ul className="space-y-[9px]">
                  {[["FAQ", "/faq"], ["Contact Us", "/contact"], ["Support Center", "/support"], ["How It Works", "/how-it-works"], ["Terms & Conditions", "/terms-conditions"], ["Privacy Policy", "/privacy-policy"]].map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-[12.5px] text-white/80 transition hover:text-white">{label}</Link></li>
                  ))}
                </ul>
              </div>

              {/* MORE INFO */}
              <div>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white">More Info</h4>
                <ul className="space-y-[9px]">
                  {[["Terms & Conditions", "/terms-conditions"], ["Privacy Policy", "/privacy-policy"], ["Cookie Policy", "/cookie-policy"], ["Refund Policy", "/refund-policy"]].map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-[12.5px] text-white/80 transition hover:text-white">{label}</Link></li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* ── [2] TRUST STRIP — semi-dark band, no blur ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.18)", borderBottom: "1px solid rgba(255,255,255,0.18)", backgroundColor: "rgba(0,9,26,0.68)" }}>
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch" }}>
                {[
                  { title: "Global Reach", sub: "Events in 120+ countries", icon: <svg style={{ width: 28, height: 28, flexShrink: 0, color: "rgba(255,255,255,0.85)" }} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" /></svg> },
                  { title: "Verified & Trusted", sub: "Authentic events & organizers", icon: <svg style={{ width: 28, height: 28, flexShrink: 0, color: "rgba(255,255,255,0.85)" }} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg> },
                  { title: "Always Updated", sub: "Real-time event information", icon: <svg style={{ width: 28, height: 28, flexShrink: 0, color: "rgba(255,255,255,0.85)" }} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
                  { title: "Dedicated Support", sub: "Here to help you anytime", icon: <svg style={{ width: 28, height: 28, flexShrink: 0, color: "rgba(255,255,255,0.85)" }} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
                  { title: "Secure & Reliable", sub: "Your data is always safe", icon: <svg style={{ width: 28, height: 28, flexShrink: 0, color: "rgba(255,255,255,0.85)" }} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg> },
                ].map((item, i, arr) => (
                  <div key={item.title} style={{ flex: 1, minWidth: 150, display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                    {item.icon}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{item.title}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", margin: 0, lineHeight: 1.4 }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── [3] PURE GAP — raw image shows, zero overlay, zero bg ── */}
          <div style={{ height: "160px" }} />

          {/* ── [4] REGISTERED OFFICE ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(0,9,26,0.88)" }}>
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
              <p style={{ fontSize: 11.5, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", margin: 0 }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>Registered Office:</span>{" "}
                Maxx Business Media Pvt Ltd | # T9, 3rd Floor, Swastik Manandi Arcade, SC Road,
                Seshadripuram, Bengaluru – 560020, India, Support-+91-9148319993 | CIN: U74999KA2019PTC123194
              </p>
            </div>
          </div>

          {/* ── [5] COPYRIGHT ── */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", backgroundColor: "rgba(0,9,26,0.92)" }}>
            <div className="mx-auto max-w-7xl px-6 py-3 lg:px-10">
              <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.50)", margin: 0 }}>
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