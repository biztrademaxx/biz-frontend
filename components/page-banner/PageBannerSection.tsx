import { fetchPageBannersServer } from "@/lib/banners/fetch-banners-server"
import { PageBannerClient, type PageBannerClientProps } from "./PageBannerClient"

type SectionProps = Omit<PageBannerClientProps, "initialBanners">

export async function PageBannerSection(props: SectionProps) {
  const initialBanners = await fetchPageBannersServer(props.page)
  return <PageBannerClient {...props} initialBanners={initialBanners} />
}
