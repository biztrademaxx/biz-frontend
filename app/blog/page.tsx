import Link from "next/link"
import type { Metadata } from "next"
import { Calendar } from "lucide-react"
import { fetchPublishedBlogs } from "@/lib/blog/fetch-blog-server"
import JsonLd from "@/components/seo/JsonLd"
import { blogListingJsonLd } from "@/lib/seo/schemas"
import { SITE_NAME, absoluteUrl, truncateMetaDescription } from "@/lib/seo/site"

const BLOG_DESC = "News, guides, and articles for trade fair professionals."

export const metadata: Metadata = {
  title: "Blog & Articles",
  description: BLOG_DESC,
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    title: `Blog & Articles | ${SITE_NAME}`,
    description: BLOG_DESC,
    url: absoluteUrl("/blog"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog & Articles | ${SITE_NAME}`,
    description: truncateMetaDescription(BLOG_DESC),
  },
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export default async function BlogListingPage() {
  const posts = await fetchPublishedBlogs()

  return (
    <div className="min-h-screen bg-[#f3f2f0]">
      <JsonLd data={blogListingJsonLd(posts)} />
      <div className="border-b border-gray-200 bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">Content</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Blog & Articles</h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-300 md:text-base">
            Stories, tips, and updates for organizers, exhibitors, and visitors.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        {posts.length === 0 ? (
          <p className="text-center text-gray-600">
            No published articles yet. Check back soon, or ask an admin to publish posts from the dashboard.
          </p>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="block">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-200">
                      {post.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-sm text-gray-300">
                          Biz Trade Fairs
                        </div>
                      )}
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-[38%] bg-orange-500/90"
                        style={{
                          clipPath: "polygon(0 0, 100% 0, 72% 50%, 100% 100%, 0 100%)",
                        }}
                        aria-hidden
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <h2 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900">{post.title}</h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wide text-gray-500">
                        <span>By {post.author}</span>
                        <span className="inline-flex items-center gap-1 normal-case">
                          <Calendar className="h-3.5 w-3.5" aria-hidden />
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      {post.excerpt ? (
                        <p className="line-clamp-3 text-sm text-gray-600">{post.excerpt}</p>
                      ) : null}
                    </div>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
