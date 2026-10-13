import { fetchPageBannersServer } from "@/lib/banners/fetch-banners-server"
import { PageBannerClient, type PageBannerClientProps } from "./PageBannerClient"

export type PageBannerSectionProps = Omit<PageBannerClientProps, "initialBanners"> & {
  /** CMS placement: `hero` = Hero Banner (Top), `middle`, `bottom`, `sidebar`. */
  position?: string
  /** If the primary `position` returns no banners, try this placement (e.g. hero → middle on homepage). */
  fallbackPosition?: string
}

export async function PageBannerSection({
  position,
  fallbackPosition,
  ...rest
}: PageBannerSectionProps) {
  let initialBanners = await fetchPageBannersServer(rest.page, position)
  if (initialBanners.length === 0 && fallbackPosition) {
    initialBanners = await fetchPageBannersServer(rest.page, fallbackPosition)
  }
  return <PageBannerClient {...rest} initialBanners={initialBanners} />
}
