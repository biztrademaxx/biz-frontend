import type React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  FaInstagramSquare,
  FaTwitterSquare,
  FaFacebookSquare,
  FaLinkedin,
} from "react-icons/fa"
import FooterChatBot from "@/components/footer-chat-bot"

const linkClass =
  "text-sm text-black transition-colors duration-200 hover:text-blue-800"

const colTitleClass = "mb-4 font-bold text-gray-500"

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gray-100 px-4 py-12 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="mb-4 flex max-w-[300px] items-center sm:max-w-[360px] lg:max-w-[420px]"
            >
              <Image
                src="/images/biztradefairs.png"
                alt="BizTradeFairs.com"
                width={440}
                height={120}
                className="h-14 w-full max-h-14 object-contain object-left sm:h-16 sm:max-h-16 lg:h-[72px] lg:max-h-[72px]"
                sizes="(max-width: 640px) 300px, (max-width: 1024px) 360px, 420px"
              />
            </Link>
            <p className="mb-4 text-sm text-gray-600">Follow us on</p>
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/biztradefair/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center rounded p-1 text-gray-800 transition-colors duration-200 hover:bg-blue-600 hover:text-white"
              >
                <FaFacebookSquare className="h-8 w-8" />
              </a>
              <a
                href="https://www.instagram.com/biztradefairs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center rounded p-1 text-gray-800 transition-colors duration-200 hover:bg-pink-600 hover:text-white"
              >
                <FaInstagramSquare className="h-8 w-8" />
              </a>
              <a
                href="https://x.com/biztradefair"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded text-gray-800 transition-colors duration-200 hover:bg-blue-400 hover:text-white"
              >
                <FaTwitterSquare className="h-8 w-8" />
              </a>
              <a
                href="https://www.linkedin.com/company/biztradefairs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex items-center justify-center rounded p-1 text-gray-800 transition-colors duration-200 hover:bg-blue-700 hover:text-white"
              >
                <FaLinkedin className="h-8 w-8" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h4 className={colTitleClass}>Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/event" className={linkClass}>
                  Find Events
                </Link>
              </li>
              <li>
                <Link href="/venues" className={linkClass}>
                  Book Venues
                </Link>
              </li>
              <li>
                <Link href="/organizers" className={linkClass}>
                  Event Organizers
                </Link>
              </li>
              <li>
                <Link href="/speakers" className={linkClass}>
                  Find Speakers
                </Link>
              </li>
              <li>
                <Link href="/exhibitors" className={linkClass}>
                  Exhibitor Services
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className={colTitleClass}>Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className={linkClass}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className={linkClass}>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className={linkClass}>
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/become-organizer" className={linkClass}>
                  Become Organizer
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className={colTitleClass}>Event Categories</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/event?category=Education" className={linkClass}>
                  Education Training
                </Link>
              </li>
              <li>
                <Link href="/event?category=Medical" className={linkClass}>
                  Medical & Pharma
                </Link>
              </li>
              <li>
                <Link href="/event?category=Technology" className={linkClass}>
                  IT & Technology
                </Link>
              </li>
              <li>
                <Link href="/event?category=Finance" className={linkClass}>
                  Banking & Finance
                </Link>
              </li>
              <li>
                <Link href="/event?category=Business" className={linkClass}>
                  Business Services
                </Link>
              </li>
              <li>
                <Link href="/event?category=Industrial%20Engineering" className={linkClass}>
                  Industrial Engineering
                </Link>
              </li>
              <li>
                <Link href="/event?category=Building%20%26%20Construction" className={linkClass}>
                  Building & Construction
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className={colTitleClass}>Help & Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className={linkClass}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support" className={linkClass}>
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className={linkClass}>
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className={colTitleClass}>More Info</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terms-conditions" className={linkClass}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className={linkClass}>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-400 pt-8">
          <div className="mb-6">
            <h5 className="mb-2 font-semibold text-gray-900">Registered Office:</h5>
            <p className="text-sm leading-relaxed text-gray-600">
              Maxx Business Media Pvt Ltd | # T9, 3rd Floor, Swastik Manandi Arcade, SC Road, Seshadripuram,
              Bengaluru – 560020, India, Support-+91-9148319993 | CIN: U74999KA2019PTC123194
            </p>
          </div>

          <div className="mb-6">
            <p className="text-xs leading-relaxed text-gray-600">
              ** All event names, logos, and brands are property of their respective owners. All company, event and
              service names used in this website are for identification purposes only. Use of these names, logos, and
              brands does not imply endorsement.
            </p>
          </div>

          <div className="border-t border-gray-400 pt-10" />

          <div className="text-sm text-gray-600">
            Copyright © {new Date().getFullYear()} Maxx Business Media Pvt Ltd All rights reserved
          </div>
        </div>
      </div>
      <FooterChatBot />
    </footer>
  )
}

export default Footer
