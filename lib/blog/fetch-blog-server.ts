function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "")
}

export type PublicBlogListItem = {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string | null
  /** Cloudinary `public_id` when stored (optional). */
  coverImagePublicId?: string
  author: string
  tag: string | null
  createdAt: string
  updatedAt: string
}

export type PublicBlogPost = PublicBlogListItem & {
  body: string
}

export async function fetchPublishedBlogs(): Promise<PublicBlogListItem[]> {
  const res = await fetch(`${apiBase()}/api/content/blog`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  const json: { data?: PublicBlogListItem[] } = await res.json()
  return Array.isArray(json.data) ? json.data : []
}

export async function fetchPublishedBlogBySlug(slug: string): Promise<PublicBlogPost | null> {
  const s = encodeURIComponent(slug.trim())
  if (!s) return null
  const res = await fetch(`${apiBase()}/api/content/blog/${s}`, {
    next: { revalidate: 60 },
  })
  if (res.status === 404) return null
  if (!res.ok) return null
  const json: { data?: PublicBlogPost } = await res.json()
  return json.data ?? null
}
