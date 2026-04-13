import type { MetadataRoute } from "next"
import { fetchPublishedBlogs } from "@/lib/blog/fetch-blog-server"
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site"

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const blogs = await fetchPublishedBlogs()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ]

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((p) => ({
    url: absoluteUrl(`/blog/${encodeURIComponent(p.slug)}`),
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }))

  return [...staticRoutes, ...blogRoutes]
}
