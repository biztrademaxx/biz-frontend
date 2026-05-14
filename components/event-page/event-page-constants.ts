export const FEATURED_HOTELS_UI_MOCK = [
  { name: "Katelya Hotel", stars: 2, price: "324", image: "/places/ifal.jpeg" },
  { name: "The Hera Premium Hotels", stars: 4, price: "666.73", image: "/places/OIP.jpeg" },
  { name: "Urban Hotel Bomonti", stars: 2, price: "143.1", image: "/places/th.jpeg" },
  { name: "Avantgarde Urban Taksim", stars: 4, price: "130.5", image: "/places/ifal.jpeg" },
] as const

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  india: "INR",
  china: "CNY",
  japan: "JPY",
  turkey: "TRY",
  uk: "GBP",
  "united kingdom": "GBP",
  usa: "USD",
  "united states": "USD",
  canada: "CAD",
  australia: "AUD",
  singapore: "SGD",
  uae: "AED",
  "saudi arabia": "SAR",
  germany: "EUR",
  france: "EUR",
  italy: "EUR",
  spain: "EUR",
  netherlands: "EUR",
  portugal: "EUR",
}
