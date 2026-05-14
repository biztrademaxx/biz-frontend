export interface TicketType {
  name: string
  price: number
  currency: string
}

export interface SpaceCost {
  id?: string
  spaceType?: string
  hallName?: string
  type?: string
  price: number
  pricePerSqm?: number
  minArea?: number | null
  totalMinAmount?: number
  currency: string
  description?: string
  unit?: string
}

export type EventPageContentProps = {
  event: any
  session: any
  router: any
  toast: any
}

export type ContentBanner = {
  id: string
  title?: string
  imageUrl?: string
  link?: string
  isActive?: boolean
}
