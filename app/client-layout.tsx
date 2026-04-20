"use client";

import type React from "react";
import { Providers } from "./providers";
import { Suspense } from "react";
import AppSuspenseFallback from "@/components/AppSuspenseFallback";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<AppSuspenseFallback />}>
        <Providers>{children}</Providers>
      </Suspense>
    </>
  );
}