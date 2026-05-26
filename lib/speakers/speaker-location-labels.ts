import type { FeaturedSpeakerTile } from "./types"

export function getFeaturedSpeakerCityLabel(s: FeaturedSpeakerTile): string {
  return s.city?.trim() || s.locationHay?.trim() || s.location?.trim() || ""
}

export function getFeaturedSpeakerCountryLabel(s: FeaturedSpeakerTile): string {
  return s.country?.trim() || s.locationHay?.trim() || s.location?.trim() || ""
}
