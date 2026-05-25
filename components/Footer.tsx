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
} from "lucide-react";

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
    // { id: "5", name: "Healthcare & Pharma", eventCount: 900 },
  ]

  const topCategories =
    categories && categories.length > 0
      ? [...categories]
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 5)
      : fallbackCategories

  return (
    <>
      {/* TOP TRUST BAR */}
      <div className="w-full bg-white px-3 py-5">
        <div className="mx-auto flex min-h-[120px] max-w-7xl flex-wrap items-center justify-between gap-8 rounded-2xl border border-gray-200 bg-white px-8 py-7 shadow-sm">

          {/* Trusted */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F7FF]">
              <svg
                className="h-6 w-6 text-[#1E63E9]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>

            <div className="leading-tight">
              <p className="text-[15px] font-semibold text-[#1A1A1A]">
                Trusted by Organizers
              </p>

              <p className="mt-1 text-[14px] text-[#5F6B7A]">
                Worldwide
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-14 w-px bg-gray-200 lg:block" />

          {/* Events */}
          <div className="flex items-center gap-4">
            <svg
              className="h-8 w-8 text-[#1E63E9]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>

            <div className="leading-tight">
              <p className="text-[28px] font-bold text-[#1E63E9]">
                10,000+
              </p>

              <p className="mt-1 text-[14px] text-[#5F6B7A]">
                Events Listed
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-14 w-px bg-gray-200 lg:block" />

          {/* Organizers */}
          <div className="flex items-center gap-4">
            <svg
              className="h-8 w-8 text-[#1E63E9]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path d="M4 20V10" />
              <path d="M10 20V4" />
              <path d="M16 20v-8" />
              <path d="M22 20V7" />
            </svg>

            <div className="leading-tight">
              <p className="text-[28px] font-bold text-[#1E63E9]">
                5,000+
              </p>

              <p className="mt-1 text-[14px] text-[#5F6B7A]">
                Verified Organizers
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-14 w-px bg-gray-200 lg:block" />

          {/* Countries */}
          <div className="flex items-center gap-4">
            <svg
              className="h-8 w-8 text-[#1E63E9]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3c3 3 3 15 0 18" />
              <path d="M12 3c-3 3-3 15 0 18" />
            </svg>

            <div className="leading-tight">
              <p className="text-[28px] font-bold text-[#1E63E9]">
                120+
              </p>

              <p className="mt-1 text-[14px] text-[#5F6B7A]">
                Countries Covered
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <footer
        style={{
          backgroundColor: "#02122b",
          position: "relative",
          overflow: "hidden",
        }}
      >

        {/* IMAGE — absolute, full footer, no gradient at all */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <Image
            src="/Organizers/max3.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>


        {/* SINGLE CLEAN OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(2,18,43,0.72)",
            zIndex: 1,
          }}
        />

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 2 }}>

          {/* NAV SECTION */}
          <div className="mx-auto max-w-7xl px-6 pt-14 pb-14 lg:px-10">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

              {/* LOGO */}
              <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-1">
                <Link href="/" className="mb-4 inline-flex items-center">
                  <Image
                    src={footerLogoSrc}
                    alt="BizTradeFairs.com"
                    width={190}
                    height={100}
                    unoptimized={
                      footerLogoUnoptimized ? true : undefined
                    }
                    className="h-15 w-auto object-contain object-left"
                  />
                </Link>

                <p className="mb-5 text-[14px] leading-relaxed text-white">
                  Your global platform to discover, connect and participate in
                  world-class exhibitions and trade fairs.
                </p>

                <div className="flex items-center gap-2">
                  {[
                    {
                      href: "https://www.facebook.com/biztradefair/",
                      Icon: FaFacebookSquare,
                    },
                    {
                      href: "https://www.linkedin.com/company/biztradefairs/",
                      Icon: FaLinkedin,
                    },
                    {
                      href: "https://x.com/biztradefair",
                      Icon: FaTwitterSquare,
                    },
                    {
                      href: "https://www.instagram.com/biztradefairs/",
                      Icon: FaInstagramSquare,
                    },
                    {
                      href: "#",
                      Icon: FaYoutube,
                    },
                  ].map(({ href, Icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/80 transition hover:border-white hover:text-white"
                    >
                      <Icon className="h-[13px] w-[13px]" />
                    </a>
                  ))}
                </div>
              </div>

              {/* SERVICES */}
              <div>
                <h4 className="mb-4 text-[14px] font-bold uppercase tracking-[0.14em] text-white">
                  Services
                </h4>

                <ul className="space-y-[9px]">
                  {[
                    ["Find Events", "/event"],
                    ["Event Calendar", "/event"],
                    // ["Add Event", "/add-event"],
                    ["For Organizers", "/organizers"],
                    // ["For Sponsors", "/sponsors"],
                    ["Exhibition Venues", "/venues"],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[14px] text-white transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* COMPANY */}
              <div>
                <h4 className="mb-4 text-[14px] font-bold uppercase tracking-[0.14em] text-white">
                  Company
                </h4>

                <ul className="space-y-[9px]">
                  {[
                    ["About Us", "/about-us"],
                    ["Careers", "/careers"],
                    // ["Blogs", "/blog"],
                    // ["Press & Media", "/press"],
                    ["Become Organizer", "/become-organizer"],
                    ["Contact Us", "/contact"],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[14px] text-white transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* EVENT CATEGORIES */}
              <div>
                <h4 className="mb-4 text-[14px] font-bold uppercase tracking-[0.14em] text-white">
                  Event Categories
                </h4>

                <ul className="space-y-[9px]">
                  {topCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/event?category=${encodeURIComponent(cat.name)}`}
                        className="text-[14px] text-white transition hover:text-white"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
{/* 
                  <li>
                    <Link
                      href="/event"
                      className="text-[14px] text-white transition hover:text-white"
                    >
                      View All Categories
                    </Link>
                  </li> */}
                </ul>
              </div>

              {/* HELP */}
              <div>
                <h4 className="mb-4 text-[14px] font-bold uppercase tracking-[0.14em] text-white">
                  Help & Support
                </h4>

                <ul className="space-y-[9px]">
                  {[
                    ["FAQ", "/faq"],
                    ["Contact Us", "/contact"],
                    ["Support Center", "/support"],
                    ["Report an Issue", "/contact"],
                    // ["Terms & Conditions", "/terms-conditions"],
                    // ["Privacy Policy", "/privacy-policy"],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[14px] text-white transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* MORE INFO */}
              <div>
                <h4 className="mb-4 text-[14px] font-bold uppercase tracking-[0.14em] text-white">
                  More Info
                </h4>

                <ul className="space-y-[9px]">
                  {[
                    ["Terms & Conditions", "/terms-conditions"],
                    ["Privacy Policy", "/privacy-policy"],
                    ["Cookie Policy", "/cookie-policy"],
                    ["Refund Policy", "/refund-policy"],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[14px] text-white transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* TRUST STRIP */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.12)",
              borderBottom: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="flex flex-wrap items-stretch">
                {[
                  {
                    title: "Global Reach",
                    sub: "Events in 120+ countries",
                    icon: Globe,
                  },
                  {
                    title: "Verified & Trusted",
                    sub: "Authentic events & organizers",
                    icon: BadgeCheck,
                  },
                  {
                    title: "Always Updated",
                    sub: "Real-time event information",
                    icon: RefreshCw,
                  },
                  {
                    title: "Dedicated Support",
                    sub: "Here to help you anytime",
                    icon: Headphones,
                  },
                  {
                    title: "Secure & Reliable",
                    sub: "Your data is always safe",
                    icon: ShieldCheck,
                  },
                ].map((item, i, arr) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      style={{
                        flex: 1,
                        minWidth: 220,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "18px 20px",
                        borderRight:
                          i < arr.length - 1
                            ? "1px solid rgba(255,255,255,0.10)"
                            : "none",
                      }}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-sm">
                        <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                      </div>

                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#fff",
                            margin: 0,
                          }}
                        >
                          {item.title}
                        </p>

                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.65)",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* REGISTERED */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.10)",
              backgroundColor: "rgba(2,18,43,0.92)",
            }}
          >
            <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
              <p
                style={{
                  fontSize: 11.5,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.75)",
                  margin: 0,
                }}
              >
                <span style={{ fontWeight: 600, color: "#fff" }}>
                  Registered Office:
                </span>{" "}
                Maxx Business Media Pvt Ltd | # T9, 3rd Floor,
                Swastik Manandi Arcade, SC Road, Seshadripuram,
                Bengaluru – 560020, India,
                Support-+91-9148319993 |
                CIN: U74999KA2019PTC123194
              </p>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.10)",
              backgroundColor: "rgba(2,18,43,0.98)",
            }}
          >
            <div className="mx-auto max-w-7xl px-6 py-3 lg:px-10">
              <p
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.50)",
                  margin: 0,
                }}
              >
                © {new Date().getFullYear()} BizTradeFairs.
                All rights reserved.
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