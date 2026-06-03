"use client"

import { AppImage } from "@/components/app-image"
import { hasUsableProfileImage } from "@/lib/has-usable-profile-image"
import { cn } from "@/lib/utils"

type AdminTableAvatarSize = "sm" | "md" | "lg"

const sizeConfig: Record<
  AdminTableAvatarSize,
  { dim: string; px: number; text: string }
> = {
  sm: { dim: "h-9 w-9", px: 36, text: "text-xs" },
  md: { dim: "h-14 w-14", px: 56, text: "text-lg" },
  lg: { dim: "h-16 w-16", px: 64, text: "text-xl" },
}

export function getAdminAvatarInitials(label?: string | null): string {
  const parts = String(label ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return "UN"
  return parts
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

interface AdminTableAvatarProps {
  src?: string | null
  name?: string | null
  colorClass: string
  size?: AdminTableAvatarSize
}

export function AdminTableAvatar({
  src,
  name,
  colorClass,
  size = "sm",
}: AdminTableAvatarProps) {
  const { dim, px, text } = sizeConfig[size]
  const initials = getAdminAvatarInitials(name)

  if (hasUsableProfileImage(src)) {
    return (
      <AppImage
        src={src}
        alt={name?.trim() || "Profile"}
        width={px}
        height={px}
        className={cn(dim, "rounded-full object-cover flex-shrink-0")}
      />
    )
  }

  return (
    <div
      className={cn(
        dim,
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0",
        text,
        colorClass,
      )}
    >
      {initials}
    </div>
  )
}
