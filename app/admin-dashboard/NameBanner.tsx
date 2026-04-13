import Image from "next/image"

interface NameBannerProps {
  name: string
  designation: string
  bannerImage?: string
  className?: string
}

export function NameBanner({ 
  name, 
  designation, 
//   bannerImage = "/dashboard_image.png",
  className = ""
}: NameBannerProps) {
  return (
    <div className={`relative w-full h-48 md:h-60 lg:h-72 ${className}`}>
      {/* Background banner */}
      <Image
        src="/dashboard_image.png" // ✅ put your uploaded image in /public
        alt="Banner"
        fill
        className="object-cover"
        priority
      />

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20 " />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg mb-2">
          {name}
        </h1>
        <p className="text-lg md:text-xl text-gray-100 drop-shadow-md">
          {designation}
        </p>
      </div>
    </div>
  )
}
