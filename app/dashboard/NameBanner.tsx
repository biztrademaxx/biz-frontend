import Image from "next/image"

interface NameBannerProps {
  name: string
  designation: string
  /** When true, name and role align to the right (visitor dashboard). */
  alignRight?: boolean
}

export function NameBanner({ name, designation, alignRight }: NameBannerProps) {
  return (
    <div className="relative w-full h-48 md:h-60 lg:h-72">
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
            ? "absolute inset-0 bg-black/20 flex flex-col justify-center items-end text-right px-8 md:px-16"
            : "absolute inset-0 bg-black/20 flex flex-col justify-center px-8 md:px-16"
        }
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
          {name}
        </h1>
        <p className="text-lg md:text-xl text-gray-100">{designation}</p>
      </div>
    </div>
  )
}
