import type { PublicBlogListItem, PublicBlogPost } from "@/lib/blog/fetch-blog-server"
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  getOrgLogoAbsoluteUrl,
  getSameAsUrls,
  getSiteUrl,
  truncateMetaDescription,
} from "./site"

const ORG_ID = () => `${getSiteUrl()}/#organization`
const WEBSITE_ID = () => `${getSiteUrl()}/#website`

function publisherNode(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": ORG_ID(),
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: {
      "@type": "ImageObject",
      url: getOrgLogoAbsoluteUrl(),
    },
  }
}

/** Organization — supports entity-style signals (logo, sameAs) used by Google. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    ...publisherNode(),
    description: SITE_DESCRIPTION,
    ...(getSameAsUrls().length ? { sameAs: getSameAsUrls() } : {}),
  }
}

/** WebSite + SearchAction — helps sitelinks search box when Google enables it. */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@id": WEBSITE_ID(),
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORG_ID() },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/event?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/** Blog index: collection + item list of posts. */
export function blogListingJsonLd(posts: PublicBlogListItem[]): Record<string, unknown> {
  const blogUrl = absoluteUrl("/blog")
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${blogUrl}#webpage`,
    name: `Blog & Articles | ${SITE_NAME}`,
    description: "News, guides, and articles for trade fair professionals.",
    url: blogUrl,
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@id": ORG_ID() },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        item: absoluteUrl(`/blog/${encodeURIComponent(p.slug)}`),
      })),
    },
  }
}

export function blogPostingJsonLd(post: PublicBlogPost, canonicalPath: string): Record<string, unknown> {
  const url = absoluteUrl(canonicalPath)
  const desc = truncateMetaDescription(
    post.body.replace(/\s+/g, " ").trim() || post.title,
    160,
  )
  const images: string[] = []
  if (post.coverImageUrl) images.push(post.coverImageUrl)

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: desc,
    ...(images.length ? { image: images } : {}),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: publisherNode(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    ...(post.tag ? { articleSection: post.tag } : {}),
  }
}

export function breadcrumbBlogPostJsonLd(postTitle: string, canonicalPath: string): Record<string, unknown> {
  const postUrl = absoluteUrl(canonicalPath)
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: postTitle, item: postUrl },
    ],
  }
}
