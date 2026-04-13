import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin-dashboard", "/admin-dashboard/", "/sub-admin", "/sub-admin/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
