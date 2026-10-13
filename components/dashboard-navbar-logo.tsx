import Image from "next/image"
import Link from "next/link"
import {
  NAVBAR_LOGO_LINK_CLASSNAME,
  getNavbarLogoImageProps,
} from "@/lib/brand-logo"

/** Dashboard top nav wordmark — same size caps as the public homepage navbar. */
export function DashboardNavbarLogo({
  linkClassName = NAVBAR_LOGO_LINK_CLASSNAME,
}: {
  linkClassName?: string
}) {
  const logo = getNavbarLogoImageProps()
  return (
    <Link href="/" className={linkClassName}>
      <Image {...logo} alt="BizTradeFairs.com" priority />
    </Link>
  )
}
