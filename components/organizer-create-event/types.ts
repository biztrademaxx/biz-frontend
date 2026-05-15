export interface SpaceCost {
  type: string
  hallName?: string
  description: string
  pricePerSqm?: number
  minArea?: number
  pricePerUnit?: number
  unit?: string
  isFixed: boolean
}

export interface TicketType {
  name: string
  price: number
  currency?: string
}

export interface EventFormData {
  title: string
  subTitle?: string
  slug: string
  description: string
  eventType: string
  categories: string[]
  edition: number
  startDate: string
  endDate: string
  dailyStart: string
  dailyEnd: string
  timezone: string
  venueId: string
  venue: string
  city: string
  state: string
  country: string
  address: string
  currency: string
  generalPrice: number
  studentPrice: number
  vipPrice: number
  groupPrice: number
  highlights: string[]
  tags: string[]
  dressCode: string
  ageLimit: string
  featured: boolean
  vip: boolean
  spaceCosts: SpaceCost[]
  ticketTypes: TicketType[]
  images: string[]
  brochure: string
  layoutPlan: string
  featuredHotels: Array<{
    name: string
    category: string
    rating: number
    image: string
  }>
  travelPartners: Array<{
    name: string
    category: string
    rating: number
    image: string
    description: string
  }>
  touristAttractions: Array<{
    name: string
    category: string
    rating: number
    image: string
    description: string
  }>
  ageRestriction: string
  accessibility: string
  parking: string
  publicTransport: string
  foodBeverage: string
  wifi: string
  photography: string
  recording: string
  liveStreaming: string
  socialMedia: string
  networking: string
  certificates: string
  materials: string
  followUp: string
}

export interface ValidationErrors {
  title?: string
  slug?: string
  description?: string
  eventType?: string
  startDate?: string
  endDate?: string
  venue?: string
  venueId?: string
  tags?: string
  spaceCosts?: string
}
