/** Home featured speaker tile. */
export interface FeaturedSpeakerTile {
  id: string
  displayName: string
  imageUrl: string
  location?: string | null
  city?: string
  state?: string
  country?: string
  /** Combined city, state, country, legacy location — used for geo matching. */
  locationHay?: string
}
