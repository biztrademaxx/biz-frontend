import { absolutizeMediaUrl } from "@/lib/home-trending/media-absolute"

function strField(v: unknown): string {
  if (v == null) return ""
  if (typeof v === "string") return v.trim()
  if (typeof v === "number" && Number.isFinite(v)) return String(v)
  return ""
}

/**
 * Resolve a user/profile image URL from common API shapes (camelCase + snake_case).
 * Relative paths are prefixed with `NEXT_PUBLIC_API_URL` when set.
 */
export function avatarUrlFromRecord(u: Record<string, unknown>): string | null {
  const raw =
    u.avatar ??
    u.profileImage ??
    u.profile_image ??
    u.image ??
    u.photo ??
    u.picture ??
    u.avatarUrl ??
    u.avatar_url ??
    u.profilePicture ??
    u.profile_picture ??
    u.photoURL ??
    u.photoUrl
  const s = strField(raw)
  if (!s) return null
  return absolutizeMediaUrl(s)
}
