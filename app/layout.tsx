import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { ReactQueryProvider } from "@/components/react-query-provider";
import ClientLayout from "./client-layout";
import ConditionalLayout from "./conditional-layout";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/schemas";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
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
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap", // ✅ important for performance
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {/* SEO Structured Data */}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

        {/* Global Providers */}
        <ReactQueryProvider>
          <ClientLayout>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ClientLayout>
        </ReactQueryProvider>
      </body>
    </html>
  );
}