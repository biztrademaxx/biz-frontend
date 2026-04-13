export interface SpaceCost {
  type: string
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

export interface ExhibitorBooth {
  exhibitorId: string
  boothNumber: string
  // boothSize: string
  spaceType: string
  // specialRequirements: string[]
  // notes?: string
  totalCost: number
}

export interface EventFormData {
  // Basic Info
  title: string
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
  address: string
  registrationStart: string
  registrationEnd: string

  // Pricing
  currency: string
  generalPrice: number
  studentPrice: number
  vipPrice: number
  groupPrice: number

  // Event Details
  highlights: string[]
  tags: string[]
  dressCode: string
  ageLimit: string
  featured: boolean
  vip: boolean

  // Space Costs
  spaceCosts: SpaceCost[]
  ticketTypes: TicketType[]

  // Media
  images: string[]
  brochure: string
  layoutPlan: string

  // Features
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

  // Additional Fields
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

  // Exhibitors
  exhibitorBooths?: ExhibitorBooth[]
}

export interface ValidationErrors {
  title?: string
  slug?: string
  description?: string
  eventType?: string
  startDate?: string
  endDate?: string
  tags?: string
}

export interface Venue {
  name: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  capacity: number
}