import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Calendar, MessageCircle } from "lucide-react"
import { fetchPublishedBlogBySlug } from "@/lib/blog/fetch-blog-server"
import JsonLd from "@/components/seo/JsonLd"
import { blogPostingJsonLd, breadcrumbBlogPostJsonLd } from "@/lib/seo/schemas"
import { SITE_NAME, absoluteUrl, truncateMetaDescription } from "@/lib/seo/site"

interface PageProps {
  params: Promise<{ slug: string }>
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPublishedBlogBySlug(decodeURIComponent(slug))
  if (!post) {
    return { title: `Article | ${SITE_NAME}` }
  }
  const desc = truncateMetaDescription(post.body.replace(/\s+/g, " ").trim() || post.title)
  const path = `/blog/${post.slug}`
  const canonical = absoluteUrl(path)
  const ogImages = post.coverImageUrl
    ? [{ url: post.coverImageUrl, width: 1200, height: 630, alt: post.title }]
    : undefined

  return {
    title: post.title,
    description: desc,
    keywords: post.tag ? [post.tag] : undefined,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: desc,
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: desc,
      ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
    },
  }
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw)
  const post = await fetchPublishedBlogBySlug(slug)
  if (!post) notFound()

  const paragraphs = post.body.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  const canonicalPath = `/blog/${post.slug}`

  return (
    <article className="min-h-screen bg-white">
      <JsonLd data={[blogPostingJsonLd(post, canonicalPath), breadcrumbBlogPostJsonLd(post.title, canonicalPath)]} />
      <header className="relative border-b border-gray-200">
        {post.coverImageUrl ? (
          <div className="relative h-[min(52vh,420px)] w-full overflow-hidden bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element and no-unsafe- and warn-unsafe-inline and inline-style */}
            <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <div className="mx-auto w-full max-w-3xl">
                {post.tag ? (
                  <span className="inline-block rounded bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    {post.tag}
                  </span>
                ) : null}
                <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl">{post.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
                  <span>By {post.author}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" aria-hidden />
                    {formatDate(post.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-white/70">
                    <MessageCircle className="h-4 w-4" aria-hidden />0 Comments
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
            {post.tag ? (
              <span className="inline-block rounded bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {post.tag}
              </span>
            ) : null}
            <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>By {post.author}</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden />
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <Link href="/blog" className="text-sm font-semibold text-[#002C71] hover:underline">
          ← Back to blog
        </Link>

        <div className="prose prose-gray mt-8 max-w-none">
          {paragraphs.length > 0 ? (
            paragraphs.map((block, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "mb-4 whitespace-pre-wrap text-[17px] leading-relaxed text-gray-800 first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-5xl first-letter:font-bold first-letter:text-gray-900"
                    : "mb-4 whitespace-pre-wrap text-[17px] leading-relaxed text-gray-800"
                }
              >
                {block.trim()}
              </p>
            ))
          ) : (
            <p className="text-gray-600">No content yet.</p>
          )}
        </div>
      </div>
    </article>
  )
}
