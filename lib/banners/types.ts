export interface PageBannerRecord {
  id: string
  page: string
  title: string
  imageUrl: string
  link?: string
  order: number
  isActive: boolean
}

export interface InlineBannerRecord extends PageBannerRecord {
  dateRange?: string
  location?: string
  description?: string
  buttonText?: string
}
