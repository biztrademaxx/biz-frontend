"use client";

import type React from "react";
import { Providers } from "./providers";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import AppSuspenseFallback from "@/components/AppSuspenseFallback";
import CookieConsentBanner from "@/components/cookies/CookieConsentBanner";
import CookieScripts from "@/components/cookies/CookieScripts";
import HomeScrollSignupRedirect from "@/components/home-scroll-signup-redirect";
import { CookieConsentProvider } from "@/contexts/cookie-consent-context";
import type { HomeLocationClientSeed } from "@/lib/home-location-seed";

export default function ClientLayout({
  children,
  locationSeed,
}: {
  children: React.ReactNode;
  locationSeed?: HomeLocationClientSeed;
}) {
  const isComingSoonPage = usePathname() === "/";

  // Keep the coming-soon homepage free of cookie and signup overlays.
  if (isComingSoonPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={<AppSuspenseFallback />}>
        <CookieConsentProvider>
          <Providers locationSeed={locationSeed}>
            <HomeScrollSignupRedirect />
            {children}
            <CookieConsentBanner />
            <CookieScripts />
          </Providers>
        </CookieConsentProvider>
      </Suspense>
    </>
  );
}