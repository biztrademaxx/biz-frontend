import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Roboto, Roboto_Mono } from "next/font/google"
import { ReactQueryProvider } from "@/components/react-query-provider";
import ClientLayout from "./client-layout";
import ConditionalLayout from "./conditional-layout";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/schemas";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site";
import { getHomeLocationClientSeed } from "@/lib/home-location-server";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  manifest: "/site.webmanifest",

  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

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
  display: "swap",
  variable: "--font-roboto",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-roboto-mono",
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locationSeed = { city: null, countryCode: null, countryName: null } as Awaited<
    ReturnType<typeof getHomeLocationClientSeed>
  >;
  try {
    locationSeed = await getHomeLocationClientSeed();
  } catch (err) {
    console.error("[layout] home location seed failed:", err);
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${roboto.variable} ${robotoMono.variable}`}>
      <body className={`${roboto.className} font-sans antialiased`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

        <ReactQueryProvider>
          <ClientLayout locationSeed={locationSeed}>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ClientLayout>
        </ReactQueryProvider>
      </body>
    </html>
  );
}