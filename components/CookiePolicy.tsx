"use client"

import { useState } from "react"
import Link from "next/link"
import CookieSettingsButton from "@/components/cookies/CookieSettingsButton"

interface Section {
  id: string
  title: string
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-gray-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function CookiePolicy() {
  const [activeSection, setActiveSection] = useState("introduction")

  const sections: Section[] = [
    { id: "introduction", title: "Introduction" },
    { id: "what-are-cookies", title: "What Are Cookies?" },
    { id: "why-we-use", title: "Why We Use Cookies" },
    { id: "types-of-cookies", title: "Types of Cookies We Use" },
    { id: "third-party", title: "Third-Party Cookies" },
    { id: "session-persistent", title: "Session vs Persistent Cookies" },
    { id: "account-cookies", title: "Cookies Used for User Accounts" },
    { id: "managing-preferences", title: "Managing Your Cookie Preferences" },
    { id: "browser-settings", title: "Browser Settings" },
    { id: "do-not-track", title: "Do Not Track (DNT)" },
    { id: "changes", title: "Changes to This Cookie Policy" },
    { id: "contact", title: "Contact Us" },
  ]

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Cookie Policy</h1>
          <p className="mx-auto max-w-3xl text-base text-gray-600 sm:text-lg">
            Effective Date: July 2026. Learn how BizTradeFairs.com uses cookies and similar technologies.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-1/4">
            <div className="sticky top-8 rounded-lg border bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Table of Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      activeSection === section.id
                        ? "border-l-4 border-blue-600 bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="mb-3 font-semibold text-gray-900">Related Policies</h4>
                <div className="space-y-2">
                  <Link
                    href="/privacy"
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-of-service"
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:w-3/4">
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="border-b border-blue-200 bg-blue-50 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-blue-800">Important Information</h3>
                <p className="mt-2 text-sm text-blue-700 sm:text-base">
                  By continuing to use our website, you agree to our use of cookies in accordance with this Cookie Policy.
                </p>
              </div>

              <div className="space-y-12 p-4 sm:p-8">
                <section id="introduction" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Introduction</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Welcome to BizTradeFairs.com (&quot;BizTradeFairs&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;),
                      operated by Maxx Business Media Private Limited.
                    </p>
                    <p>
                      This Cookie Policy explains how we use cookies and similar technologies when you visit
                      BizTradeFairs.com, what information they collect, and how you can manage your cookie preferences.
                    </p>
                  </div>
                </section>

                <section id="what-are-cookies" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">What Are Cookies?</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Cookies are small text files stored on your computer, smartphone, or tablet when you visit a website.
                      They help websites function efficiently, improve user experience, remember preferences, and provide
                      useful analytics to website owners.
                    </p>
                    <p>
                      Cookies themselves generally do not identify you personally. However, information collected through
                      cookies may be associated with personal information you voluntarily provide while registering,
                      submitting enquiries, subscribing to newsletters, listing exhibitions, or using other services on
                      BizTradeFairs.com.
                    </p>
                  </div>
                </section>

                <section id="why-we-use" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Why We Use Cookies</h2>
                  <p className="mb-4 text-gray-700">BizTradeFairs.com uses cookies to:</p>
                  <BulletList
                    items={[
                      "Ensure the website functions correctly.",
                      "Keep users securely logged in.",
                      "Remember user preferences.",
                      "Improve website speed and performance.",
                      "Analyze visitor behavior.",
                      "Personalize content and recommendations.",
                      "Measure marketing campaign performance.",
                      "Prevent fraudulent or malicious activity.",
                      "Enhance security during account login and registration.",
                    ]}
                  />
                </section>

                <section id="types-of-cookies" className="scroll-mt-20">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>

                  <div className="space-y-8">
                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900">1. Essential Cookies (Always Active)</h3>
                      <p className="mb-4 text-gray-700">
                        These cookies are necessary for the operation of BizTradeFairs.com and cannot be disabled.
                        They are used for:
                      </p>
                      <BulletList
                        items={[
                          "User login and authentication",
                          "Secure account sessions",
                          "Session management",
                          "Form submissions",
                          "Security verification",
                          "CSRF protection",
                          "Load balancing",
                          "Website performance",
                          "Cookie consent preferences",
                        ]}
                      />
                      <p className="mt-4 text-gray-700">
                        Without these cookies, many website features will not function properly.
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900">2. Performance &amp; Analytics Cookies (Optional)</h3>
                      <p className="mb-4 text-gray-700">
                        These cookies help us understand how visitors use BizTradeFairs.com so that we can improve the
                        website. They collect anonymous information such as:
                      </p>
                      <BulletList
                        items={[
                          "Pages visited",
                          "Visitor numbers",
                          "Traffic sources",
                          "Device type",
                          "Browser information",
                          "Geographic region (approximate)",
                          "Time spent on pages",
                          "Navigation paths",
                        ]}
                      />
                      <p className="mt-4 mb-2 text-gray-700">Examples include:</p>
                      <BulletList items={["Google Analytics", "Google Tag Manager", "Event tracking", "Website performance metrics"]} />
                    </div>

                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900">3. Functional Cookies (Optional)</h3>
                      <p className="mb-4 text-gray-700">
                        These cookies improve your browsing experience by remembering your preferences. Examples include:
                      </p>
                      <BulletList
                        items={[
                          "Preferred language",
                          "Theme settings",
                          "Saved exhibitions",
                          "Saved companies",
                          "Favourite events",
                          "Search filters",
                          "Recently viewed listings",
                          "Location preferences",
                          "Chat support settings",
                        ]}
                      />
                    </div>

                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900">4. Marketing &amp; Advertising Cookies (Optional)</h3>
                      <p className="mb-4 text-gray-700">
                        These cookies help us deliver relevant advertisements and measure the effectiveness of promotional
                        campaigns. They may be used to:
                      </p>
                      <BulletList
                        items={[
                          "Show personalized advertisements",
                          "Measure campaign performance",
                          "Display remarketing advertisements",
                          "Promote exhibitions",
                          "Recommend industry events",
                          "Deliver relevant sponsored content",
                        ]}
                      />
                      <p className="mt-4 mb-2 text-gray-700">Examples include:</p>
                      <BulletList
                        items={[
                          "Google Ads",
                          "Meta (Facebook) Pixel",
                          "LinkedIn Insight Tag",
                          "Remarketing cookies",
                          "Conversion tracking",
                        ]}
                      />
                    </div>
                  </div>
                </section>

                <section id="third-party" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
                  <p className="mb-6 text-gray-700">
                    BizTradeFairs.com works with trusted third-party service providers who may place cookies on your device.
                  </p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Service Provider</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Purpose</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Typical Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                        {[
                          ["Google Analytics", "Website analytics", "Up to 2 years"],
                          ["Google Ads", "Advertising & Remarketing", "Up to 540 days"],
                          ["Google Tag Manager", "Website tag management", "Session"],
                          ["Cloudflare", "Security & Performance", "Session"],
                          ["Cloudflare Turnstile", "Spam & Bot Protection", "Session"],
                          ["Meta (Facebook) Pixel", "Advertising Analytics", "Up to 180 days"],
                          ["LinkedIn Insight Tag", "B2B Advertising Analytics", "Up to 180 days"],
                          ["YouTube", "Embedded videos", "As determined by YouTube"],
                        ].map(([provider, purpose, duration]) => (
                          <tr key={provider}>
                            <td className="px-4 py-3 align-top font-medium text-gray-900">{provider}</td>
                            <td className="px-4 py-3 align-top">{purpose}</td>
                            <td className="px-4 py-3 align-top whitespace-nowrap">{duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-gray-700">
                    These third-party providers manage their cookies according to their own privacy policies.
                  </p>
                </section>

                <section id="session-persistent" className="scroll-mt-20">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Session Cookies vs Persistent Cookies</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900">Session Cookies</h3>
                      <p className="mb-4 text-gray-700">
                        Session cookies exist only while you are browsing our website. They are automatically deleted when
                        you close your browser. They are used for:
                      </p>
                      <BulletList
                        items={[
                          "Login sessions",
                          "Secure browsing",
                          "Shopping or enquiry sessions",
                          "Temporary preferences",
                        ]}
                      />
                    </div>
                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900">Persistent Cookies</h3>
                      <p className="mb-4 text-gray-700">
                        Persistent cookies remain on your device for a defined period or until manually deleted. They help
                        us remember:
                      </p>
                      <BulletList
                        items={[
                          "Login preferences",
                          "Saved searches",
                          "Language selection",
                          "Recently viewed exhibitions",
                          "Business interests",
                          "Cookie preferences",
                        ]}
                      />
                      <p className="mt-4 text-gray-700">
                        Depending on their purpose, persistent cookies may remain active for a few days up to two years.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="account-cookies" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Cookies Used for User Accounts</h2>
                  <p className="mb-4 text-gray-700">
                    If you create an account on BizTradeFairs.com, cookies may be used to:
                  </p>
                  <BulletList
                    items={[
                      "Keep you signed in",
                      "Remember your dashboard settings",
                      "Save exhibition preferences",
                      "Store company listing drafts",
                      "Remember subscription choices",
                      "Improve account security",
                    ]}
                  />
                </section>

                <section id="managing-preferences" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Managing Your Cookie Preferences</h2>
                  <p className="mb-4 text-gray-700">You can manage or disable cookies at any time through:</p>
                  <BulletList
                    items={[
                      "Our Cookie Consent Banner",
                      "Your browser settings",
                      "Third-party opt-out tools",
                    ]}
                  />
                  <div className="mt-6">
                    <CookieSettingsButton className="inline-flex items-center rounded-md bg-[#004A96] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#003d7a]">
                      Manage cookie preferences
                    </CookieSettingsButton>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Please note that disabling essential cookies may affect website functionality, including login, account
                    management, enquiry forms, and other services.
                  </p>
                </section>

                <section id="browser-settings" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Browser Settings</h2>
                  <ul className="space-y-3 text-gray-700">
                    <li>
                      <strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and Other Site Data
                    </li>
                    <li>
                      <strong>Mozilla Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data
                    </li>
                    <li>
                      <strong>Microsoft Edge:</strong> Settings → Cookies and Site Permissions
                    </li>
                    <li>
                      <strong>Apple Safari:</strong> Preferences → Privacy → Manage Website Data
                    </li>
                  </ul>
                </section>

                <section id="do-not-track" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Do Not Track (DNT)</h2>
                  <p className="text-gray-700">
                    Some browsers offer a &quot;Do Not Track&quot; feature. Currently, there is no universal standard for
                    responding to DNT signals. Therefore, BizTradeFairs.com may continue to collect information as
                    described in this Cookie Policy unless you adjust your browser or cookie preferences.
                  </p>
                </section>

                <section id="changes" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Changes to This Cookie Policy</h2>
                  <p className="mb-4 text-gray-700">We may update this Cookie Policy periodically to reflect:</p>
                  <BulletList
                    items={[
                      "Changes in applicable laws",
                      "New technologies",
                      "Website improvements",
                      "New services and features",
                      "Changes in our data processing practices",
                    ]}
                  />
                  <p className="mt-4 text-gray-700">
                    The updated version will always be published on this page with the revised &quot;Effective Date.&quot;
                    Your continued use of BizTradeFairs.com after any changes indicates your acceptance of the updated
                    Cookie Policy.
                  </p>
                </section>

                <section id="contact" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Contact Us</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      If you have any questions regarding this Cookie Policy or our use of cookies, please contact us:
                    </p>
                    <div className="rounded-lg border bg-gray-50 p-4 sm:p-6">
                      <p className="font-semibold text-gray-900">Maxx Business Media Private Limited</p>
                      <p className="mt-2">
                        Website:{" "}
                        <a href="https://www.biztradefairs.com" className="break-all text-blue-600 hover:underline">
                          https://www.biztradefairs.com
                        </a>
                      </p>
                      <p className="mt-2">
                        Email:{" "}
                        <a href="mailto:privacy@biztradefairs.com" className="break-all text-blue-600 hover:underline">
                          privacy@biztradefairs.com
                        </a>
                      </p>
                      <p className="mt-2">
                        Support:{" "}
                        <a href="mailto:support@biztradefairs.com" className="break-all text-blue-600 hover:underline">
                          support@biztradefairs.com
                        </a>
                      </p>
                    </div>
                    <p>
                      We will make every reasonable effort to respond to your enquiry as promptly as possible.
                    </p>
                  </div>
                </section>

                <div className="border-t bg-gray-50 pt-8">
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">
                      By using our services, you acknowledge that you have read and understood this Cookie Policy.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                      <Link
                        href="/"
                        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                      >
                        Return to Homepage
                      </Link>
                      <Link
                        href="/privacy"
                        className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        View Privacy Policy
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
