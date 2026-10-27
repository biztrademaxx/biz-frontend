import Image from "next/image"

interface EventDetailsBannerProps {
  imageUrl?: string | null
  title: string
  className?: string
  aspectRatio?: "square" | "3/1"
}

export function EventDetailsBanner({
  imageUrl,
  title,
  className = "",
  aspectRatio = "square",
}: EventDetailsBannerProps) {
  const src = imageUrl?.trim()
  if (!src || src === "null" || src === "undefined") return null

  const aspectClass = aspectRatio === "square" ? "aspect-square" : "aspect-[3/1]"

  return (
    <div
      className={`relative overflow-hidden rounded-md border border-slate-100 bg-slate-50 ${aspectClass} ${className}`}
    >
      <Image
        src={src}
        alt={`${title} banner`}
        fill
        className="object-contain p-1"
        sizes="(max-width: 767px) 100vw, 400px"
      />
    </div>
  )
}
