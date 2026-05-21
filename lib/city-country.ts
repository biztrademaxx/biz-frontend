/** Resolve country for navbar / home city picks (not visitor VPN). */

export type CityCountry = {
  countryCode: string
  countryName: string
}

import { countryNameFromCode } from "@/lib/country-data"

function cc(code: string): CityCountry {
  return { countryCode: code, countryName: countryNameFromCode(code) ?? code }
}

/** Lowercase city key → country (geo + venue city fallback). */
const CITY_COUNTRY_MAP: Record<string, CityCountry> = {
  mumbai: cc("IN"),
  delhi: cc("IN"),
  "new delhi": cc("IN"),
  bengaluru: cc("IN"),
  bangalore: cc("IN"),
  hyderabad: cc("IN"),
  chennai: cc("IN"),
  kolkata: cc("IN"),
  calcutta: cc("IN"),
  pune: cc("IN"),
  ahmedabad: cc("IN"),
  dubai: cc("AE"),
  "abu dhabi": cc("AE"),
  sharjah: cc("AE"),
  riyadh: cc("SA"),
  jeddah: cc("SA"),
  doha: cc("QA"),
  muscat: cc("OM"),
  manama: cc("BH"),
  amman: cc("JO"),
  singapore: cc("SG"),
  "kuala lumpur": cc("MY"),
  bangkok: cc("TH"),
  jakarta: cc("ID"),
  manila: cc("PH"),
  hanoi: cc("VN"),
  "ho chi minh city": cc("VN"),
  seoul: cc("KR"),
  tokyo: cc("JP"),
  osaka: cc("JP"),
  beijing: cc("CN"),
  shanghai: cc("CN"),
  "shanghai, china": cc("CN"),
  guangzhou: cc("CN"),
  taipei: cc("TW"),
  karachi: cc("PK"),
  lahore: cc("PK"),
  islamabad: cc("PK"),
  dhaka: cc("BD"),
  colombo: cc("LK"),
  kathmandu: cc("NP"),
  london: cc("GB"),
  paris: cc("FR"),
  berlin: cc("DE"),
  frankfurt: cc("DE"),
  munich: cc("DE"),
  amsterdam: cc("NL"),
  rotterdam: cc("NL"),
  brussels: cc("BE"),
  zurich: cc("CH"),
  geneva: cc("CH"),
  vienna: cc("AT"),
  milan: cc("IT"),
  rome: cc("IT"),
  madrid: cc("ES"),
  barcelona: cc("ES"),
  lisbon: cc("PT"),
  athens: cc("GR"),
  warsaw: cc("PL"),
  prague: cc("CZ"),
  budapest: cc("HU"),
  bucharest: cc("RO"),
  stockholm: cc("SE"),
  oslo: cc("NO"),
  copenhagen: cc("DK"),
  helsinki: cc("FI"),
  kyiv: cc("UA"),
  kiev: cc("UA"),
  moscow: cc("RU"),
  "saint petersburg": cc("RU"),
  istanbul: cc("TR"),
  ankara: cc("TR"),
  sydney: cc("AU"),
  melbourne: cc("AU"),
  brisbane: cc("AU"),
  auckland: cc("NZ"),
  wellington: cc("NZ"),
  johannesburg: cc("ZA"),
  "cape town": cc("ZA"),
  cairo: cc("EG"),
  lagos: cc("NG"),
  abuja: cc("NG"),
  nairobi: cc("KE"),
  casablanca: cc("MA"),
  algiers: cc("DZ"),
  "tel aviv": cc("IL"),
  jerusalem: cc("IL"),
  "new york": cc("US"),
  chicago: cc("US"),
  orlando: cc("US"),
  "las vegas": cc("US"),
  "washington dc": cc("US"),
  toronto: cc("CA"),
  vancouver: cc("CA"),
  montreal: cc("CA"),
  "mexico city": cc("MX"),
  "sao paulo": cc("BR"),
  "rio de janeiro": cc("BR"),
  "buenos aires": cc("AR"),
  santiago: cc("CL"),
  bogota: cc("CO"),
  lima: cc("PE"),
  dublin: cc("IE"),
}

function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, " ")
}

export function resolveCountryForCityName(city: string | null | undefined): CityCountry | null {
  const key = normalizeCityKey(city ?? "")
  if (!key) return null
  return CITY_COUNTRY_MAP[key] ?? null
}

export function homeLocationScopeLabel(
  city: string | null | undefined,
  country: string | null | undefined,
): string {
  const c = city?.trim()
  const co = country?.trim()
  if (c && co) return `${c}, ${co}`
  if (co) return co
  if (c) return c
  return "your region"
}
