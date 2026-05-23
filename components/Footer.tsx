import Image from "next/image"
import type React from "react"
import { AppImage } from "@/components/app-image"
import Link from "next/link"
import {
  FaInstagramSquare,
  FaTwitterSquare,
  FaFacebookSquare,
  FaLinkedin,
} from "react-icons/fa"
import FooterChatBot from "@/components/footer-chat-bot"
import { NewsletterFooterSignup } from "@/components/newsletter-footer-signup"
import { getFooterLogoSrc, isBrandLogoRemoteUrl } from "@/lib/brand-logo"
import {
  footerDividerClass,
  footerHeadingClass,
  footerLinkClass,
  footerMapGradientClass,
  footerMutedTextClass,
  footerShellClass,
  footerSubtleTextClass,
} from "@/lib/brand-shell-theme"

interface FooterCategory {
  id: string
  name: string
  eventCount: number
}

interface FooterProps {
  categories?: FooterCategory[]
}

const Footer: React.FC<FooterProps> = ({ categories }) => {  const footerLogoSrc = getFooterLogoSrc()
  const footerLogoUnoptimized = isBrandLogoRemoteUrl(footerLogoSrc)


  const fallbackCategories: FooterCategory[] = [
    { id: "1", name: "Auto & Automotive", eventCount: 1200 },
    { id: "2", name: "Miscellaneous", eventCount: 1100 },
    { id: "3", name: "Packing & Packaging", eventCount: 1000 },
    { id: "4", name: "Agriculture & Forestry", eventCount: 950 },
    // { id: "5", name: "Building & Construction", eventCount: 900 },
  ]

  const topCategories = (
    categories && categories.length > 0
      ? [...categories]
        .sort(
          (a: FooterCategory, b: FooterCategory) =>
            b.eventCount - a.eventCount
        )
        .slice(0, 4)
      : fallbackCategories
  )

  return (
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
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="mb-4 flex max-w-[300px] items-center sm:max-w-[360px] lg:max-w-[420px]"
            >
              <Image
                src={footerLogoSrc}
                alt="BizTradeFairs.com"
                width={440}
                height={120}
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 360px, 300px"
                unoptimized={footerLogoUnoptimized ? true : undefined}
                className="block h-14 w-auto max-h-14 max-w-[min(100%,440px)] shrink-0 object-contain object-left sm:h-16 sm:max-h-16 lg:h-[72px] lg:max-h-[72px]"
              />
            </Link>
            <p className={`mb-4 text-sm ${footerMutedTextClass}`}>Follow us on</p>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.facebook.com/biztradefair/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/15"
              >
                <FaFacebookSquare className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/biztradefairs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/15"
              >
                <FaInstagramSquare className="h-6 w-6" />
              </a>
              <a
                href="https://x.com/biztradefair"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/15"
              >
                <FaTwitterSquare className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/company/biztradefairs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/15"
              >
                <FaLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h4 className={footerHeadingClass}>Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/event" className={footerLinkClass}>
                  Find Events
                </Link>
              </li>
              <li>
                <Link href="/venues" className={footerLinkClass}>
                  Book Venues
                </Link>
              </li>
              <li>
                <Link href="/organizers" className={footerLinkClass}>
                  Event Organizers
                </Link>
              </li>
              <li>
                <Link href="/speakers" className={footerLinkClass}>
                  Find Speakers
                </Link>
              </li>
          
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className={footerHeadingClass}>Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className={footerLinkClass}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className={footerLinkClass}>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className={footerLinkClass}>
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/become-organizer" className={footerLinkClass}>
                  Become Organizer
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className={footerHeadingClass}>Event Categories</h4>
            <ul className="space-y-3">
              {topCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/event?category=${encodeURIComponent(category.name)}`}
                    className={footerLinkClass}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className={footerHeadingClass}>Help & Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className={footerLinkClass}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className={footerLinkClass}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support" className={footerLinkClass}>
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className={footerLinkClass}>
                  Refund an Issue
                </Link>
              </li>
            
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className={footerHeadingClass}>More Info</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terms-conditions" className={footerLinkClass}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className={footerLinkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className={footerLinkClass}>
                  Cookie Policy
                </Link>
              </li>
              
              <li>
                <Link href="/refund-policy" className={footerLinkClass}>
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={`border-t ${footerDividerClass} pt-8`}>
          <div className="mb-6">
            <h5 className="mb-2 font-semibold text-white">Registered Office:</h5>
            <p className={`text-sm leading-relaxed ${footerMutedTextClass}`}>
              Maxx Business Media Pvt Ltd | # T9, 3rd Floor, Swastik Manandi Arcade, SC Road, Seshadripuram,
              Bengaluru – 560020, India, Support-+91-9148319993 | CIN: U74999KA2019PTC123194
            </p>
          </div>
          <div className={`border-t ${footerDividerClass} pt-6 max-w-10xl`}>
            <div className="flex flex-col gap-3 text-xs leading-relaxed md:flex-row md:items-center md:justify-between">
              <p className={` ${footerSubtleTextClass}`}>
                ** All event names, logos, and brands are property of their respective owners. All company,
                event and service names used in this website are for identification purposes only.
                Use of these names, logos, and brands does not imply endorsement.
              </p>

              <div className={`shrink-0  ${footerSubtleTextClass}`}>
                Copyright © {new Date().getFullYear()} Maxx Business Media Pvt Ltd
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterChatBot />
    </footer>
  )
}

export default Footer