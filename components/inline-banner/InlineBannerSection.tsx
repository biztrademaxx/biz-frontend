import { fetchInlineBannersServer } from "@/lib/banners/fetch-banners-server"
import { InlineBannerClient, type InlineBannerClientProps } from "./InlineBannerClient"

type SectionProps = Omit<InlineBannerClientProps, "initialBanners">

export async function InlineBannerSection(props: SectionProps) {
  if (props.demoBanner) {
    return <InlineBannerClient {...props} initialBanners={[]} />
  }
  const initialBanners = await fetchInlineBannersServer(props.page, props.maxBanners ?? 3)
  return <InlineBannerClient {...props} initialBanners={initialBanners} />
}
