"use client";

import type React from "react";
import { Providers } from "./providers";
import { Suspense } from "react";
import AppSuspenseFallback from "@/components/AppSuspenseFallback";
import type { HomeLocationClientSeed } from "@/lib/home-location-seed";

export default function ClientLayout({
  children,
  locationSeed,
}: {
  children: React.ReactNode;
  locationSeed?: HomeLocationClientSeed;
}) {
  return (
    <>
      <Suspense fallback={<AppSuspenseFallback />}>
        <Providers locationSeed={locationSeed}>{children}</Providers>
      </Suspense>
    </>
  );
}