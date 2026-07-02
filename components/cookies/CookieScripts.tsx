"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import { useCookieConsent } from "@/contexts/cookie-consent-context"
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  readStoredCookieConsent,
  type StoredCookieConsent,
} from "@/lib/cookie-consent"

function useConsentSnapshot() {
  const { hasConsented, preferences } = useCookieConsent()
  const [snapshot, setSnapshot] = useState<StoredCookieConsent | null>(null)

  useEffect(() => {
    setSnapshot(readStoredCookieConsent())
  }, [hasConsented, preferences])

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<StoredCookieConsent>).detail
      if (detail) setSnapshot(detail)
    }
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onUpdated)
  }, [])

  return snapshot
}

export default function CookieScripts() {
  const consent = useConsentSnapshot()
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const linkedInPartnerId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID

  if (!consent) return null

  const { analytics, marketing } = consent.preferences
  const loadAnalytics = analytics && Boolean(gaId || gtmId)
  const loadMarketing = marketing && Boolean(metaPixelId || linkedInPartnerId)

  return (
    <>
      {loadAnalytics && gtmId ? (
        <>
          <Script id="gtm-init" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}</Script>
        </>
      ) : null}

      {loadAnalytics && gaId && !gtmId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { anonymize_ip: true });
          `}</Script>
        </>
      ) : null}

      {loadMarketing && metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixelId}');
          fbq('track', 'PageView');
        `}</Script>
      ) : null}

      {loadMarketing && linkedInPartnerId ? (
        <Script id="linkedin-insight" strategy="afterInteractive">{`
          _linkedin_partner_id = "${linkedInPartnerId}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `}</Script>
      ) : null}
    </>
  )
}
