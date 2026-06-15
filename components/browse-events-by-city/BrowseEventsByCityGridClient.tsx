"use client";

import { AppImage } from "@/components/app-image";
import { useRouter } from "next/navigation";
import type { BrowseByCityServerPayload } from "@/lib/browse-by-city/types";
import { formatEventCountDisplay } from "@/lib/format-event-count";
import { resolvedEventCountForCity } from "./utils/display-event-count";

const browseGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

const dummyImages = [
  "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  "https://images.unsplash.com/photo-1549693578-d683be217e58?w=800&q=80",
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=800&q=80",
];

export interface BrowseEventsByCityGridClientProps {
  displayCities: BrowseByCityServerPayload["displayCities"];
  cityEventCounts: BrowseByCityServerPayload["cityEventCounts"];
}

export default function BrowseEventsByCityGridClient({
  displayCities,
  cityEventCounts,
}: BrowseEventsByCityGridClientProps) {
  const router = useRouter();

  return (
    <>
      {displayCities.length === 0 ? (
        <p className="text-sm text-gray-500">
          No cities available yet.
        </p>
      ) : (
        <div className={browseGridClass}>
          {displayCities.map((city, index) => {
            const count = resolvedEventCountForCity(
              city,
              cityEventCounts
            );

            const countLabel = `${formatEventCountDisplay(
              count
            )} Events`;

            return (
              <button
                key={city.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/event?location=${encodeURIComponent(
                      city.name
                    )}`
                  )
                }
                className="group overflow-hidden rounded-lg border-1 border-blue-500 bg-white text-left shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative m-2 h-[75px] overflow-hidden rounded-sm shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                  <AppImage
                    src={
                      city.image?.trim()
                        ? city.image.trim()
                        : dummyImages[index % dummyImages.length]
                    }
                    alt={city.name}
                    fill
                    sizes="300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="px-3 py-2">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {city.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {countLabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}