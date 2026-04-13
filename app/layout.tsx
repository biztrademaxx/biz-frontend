import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientLayout } from "./client-layout"
import ConditionalLayout from "./conditional-layout"
import { ReactQueryProvider } from "@/components/react-query-provider"
import { Roboto } from "next/font/google"
import JsonLd from "@/components/seo/JsonLd"
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/schemas"
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  generator: SITE_NAME,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
}
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className} suppressHydrationWarning>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <ClientLayout>
          <ConditionalLayout><ReactQueryProvider>{children}</ReactQueryProvider></ConditionalLayout>
        </ClientLayout>
      </body>
    </html>
  )
}
