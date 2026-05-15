"use client"

import Image from "next/image"
import type { MutableRefObject } from "react"
import type { KeenSliderInstance } from "keen-slider/react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BRAND_IMAGE_BOTTOM_FADE } from "@/lib/brand-image-gradients"
import { FEATURED_HOTELS_UI_MOCK } from "./event-page-constants"
import type { ContentBanner } from "./event-page-types"

type Props = {
  event: any
  hotelCurrency: string
  sidebarBanners: ContentBanner[]
  sidebarBannerSlide: number
  sidebarBannerSliderRef: (node: HTMLDivElement | null) => void
  sidebarBannerSliderInstanceRef: MutableRefObject<KeenSliderInstance | null>
}

export function EventPageSidebar({
  event,
  hotelCurrency,
  sidebarBanners,
  sidebarBannerSlide,
  sidebarBannerSliderRef,
  sidebarBannerSliderInstanceRef,
}: Props) {
  return (
    <div className="w-full lg:w-80 xl:w-96 space-y-6 flex-shrink-0">
      <Card className="gap-0 p-0 overflow-hidden rounded-sm border border-gray-200 shadow-sm">
        {sidebarBanners.length > 0 ? (
          <div className="relative h-52 w-full">
            <div ref={sidebarBannerSliderRef} className="keen-slider h-full w-full">
              {sidebarBanners.map((banner, index) => {
                const href = banner.link?.trim()
                const titleBottom = sidebarBanners.length > 1 ? "bottom-9" : "bottom-3"
                const imageBlock = (
                  <>
                    <Image
                      src={banner.imageUrl!}
                      alt={banner.title || "Event sidebar banner"}
                      fill
                      sizes="(max-width: 1024px) 90vw, 480px"
                      className="object-cover p-2 rounded-lg"
                      priority={index === 0}
                    />
                    {banner.title?.trim() ? (
                      <>
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 top-[28%]"
                          style={{ backgroundImage: BRAND_IMAGE_BOTTOM_FADE }}
                          aria-hidden
                        />
                        <div className={`absolute left-3 right-3 ${titleBottom}`}>
                          <p
                            className="line-clamp-2 text-sm font-semibold leading-snug text-white"
                            style={{
                              textShadow:
                                "0 1px 2px rgba(0,0,0,0.75), 0 2px 12px rgba(0,26,72,0.6), 0 0 1px rgba(0,0,0,0.9)",
                            }}
                          >
                            {banner.title.trim()}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </>
                )
                return (
                  <div key={banner.id ?? `banner-${index}`} className="keen-slider__slide relative h-52 w-full overflow-hidden bg-white">
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : "_self"}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="relative block h-full w-full"
                      >
                        {imageBlock}
                      </a>
                    ) : (
                      <div className="relative h-full w-full">{imageBlock}</div>
                    )}
                  </div>
                )
              })}
            </div>
            {sidebarBanners.length > 1 ? (
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {sidebarBanners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to promo ${idx + 1} of ${sidebarBanners.length}`}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      idx === sidebarBannerSlide ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => sidebarBannerSliderInstanceRef.current?.moveToIdx(idx)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="relative h-52 w-full overflow-hidden bg-white">
            <Image
              src="/banners/banner1.jpg"
              alt="Event sidebar banner"
              fill
              sizes="(max-width: 1024px) 90vw, 480px"
              className="object-container p-2 rounded-lg"
            />
          </div>
        )}
      </Card>

      <Card className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Featured Hotels in {event.city || "this city"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {FEATURED_HOTELS_UI_MOCK.map((hotel) => (
            <div key={hotel.name} className="bg-gray-100 p-3">
              <div className="flex gap-4">
                <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden">
                  <Image src={hotel.image} alt={hotel.name} fill sizes="74px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[15px] font-normal text-[#0f5a8d]">{hotel.name}</p>
                  <div className="-mt-1 flex items-center gap-1">
                    {Array.from({ length: hotel.stars }).map((_, index) => (
                      <Star key={`${hotel.name}-${index}`} className="h-3.5 w-3.5 fill-[#e64700] text-[#e64700]" />
                    ))}
                    <span className="ml-1 text-[15px] text-[#4f5963]">
                      from {hotelCurrency} {hotel.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button className="h-10 rounded-md bg-[#5b79ac] px-6 text-[14px] font-semibold text-white hover:bg-[#4f6fa8]">
            More Hotels
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
