import Image from "next/image"

interface NameBannerProps {
  name: string
  designation: string
  /** When true, name and role align to the right (visitor dashboard). */
  alignRight?: boolean
}

export function NameBanner({ name, designation, alignRight }: NameBannerProps) {
  return (
    <div className="relative w-full h-12 md:h-14 lg:h-16">
      {/* Background banner */}
      <Image
        src="/dashboard_image.png" // ✅ put your uploaded image in /public
        alt="Banner"
        fill
        className="object-cover rounded-b-2xl"
        priority
      />

      {/* Overlay content */}
      <div
        className={
          alignRight
            ? "absolute inset-0 bg-black/20 flex flex-col justify-center items-end text-right px-4 md:px-8"
            : "absolute inset-0 bg-black/20 flex flex-col justify-center px-2 md:px-4"
        }
      >
        <h1 className="text-sm md:text-lg font-bold text-white drop-shadow-lg">
          {name}
        </h1>
        <p className="text-[10px] md:text-xs text-gray-100">{designation}</p>
      </div>
    </div>
  )
}