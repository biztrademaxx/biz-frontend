# Frontend architecture

This document describes how we structure **production-style** frontend features: clear boundaries between data loading, normalization, and UI, with stable public import paths.

## Goals

- **Predictable folders** so features are easy to find and extend.
- **Typed API boundaries** (`unknown` in, domain types out) without scattering `any`.
- **Server vs client** split: fetch and normalize on the server when possible; reserve `"use client"` for interactivity.
- **Stable barrels** so `app/` and other parents keep short imports (e.g. `@/components/FeaturedEvents`).

## Layering

| Layer | Location | Responsibility |
|--------|-----------|----------------|
| Types | `lib/<domain>/types.ts` | Serializable DTOs used by RSC and client |
| Normalize | `lib/<domain>/normalize-*.ts` | Map `unknown` JSON → typed payload or `null` |
| Server fetch | `lib/<domain>/fetch-*-server.ts` | `fetch` to backend/API, call normalizers, return `[]` or safe defaults on failure |
| Feature UI | `components/<feature>/` | Section (RSC), client grid/list, hooks, utils |
| Public entry | `components/FeatureName.tsx` | Re-export default section + types if consumers need them |

## Feature folder template

```
components/<feature-slug>/
  <Feature>Section.tsx          # async RSC: fetch + layout + heading
  <Feature>GridClient.tsx       # "use client" when needed
  hooks/
  utils/                         # pure functions, no "use client" unless they use browser APIs
  types.ts                       # optional: re-export from @/lib/<domain>/types

lib/<domain>/
  types.ts
  normalize-<thing>.ts
  fetch-<thing>-server.ts
```

## Reference implementations (home)

- Organizers: `components/featured-organizers/`, `lib/organizers/`
- Featured events: `components/featured-events/`, `lib/events/`
- Browse by city: `components/browse-events-by-city/`, `lib/browse-by-city/` (`lib/browse-geo-server.ts` for server geo)
- Browse by country: `components/browse-by-country/`, `lib/browse-by-country/` (barrel: `components/browse-by-country.tsx`)
- Category grid: `components/category-grid/`, `lib/categories/` (barrel: `components/catagories.tsx`)
- Explore venues: `components/explore-venues/`, `lib/venues/`
- Featured speakers: `components/featured-speakers/`, `lib/speakers/`
- Trending events (Event Reviews block): `components/trending-events/`, `lib/home-trending/` (barrel: `components/EventReviews.tsx`)
- Hero slideshow data: `lib/hero/fetch-hero-slideshow-server.ts`, UI: `components/HeroSlideshowClient.tsx`
- Banners: `lib/banners/`, `components/page-banner/`, `components/inline-banner/` (barrels re-export `PageBanner` / `InlineBanner`)
- Same-origin server fetches: `lib/server/internal-origin.ts` (`getInternalAppOrigin`)

## Migration checklist

When moving an existing `*Client.tsx` + inline fetch into this pattern:

1. Add or extend `lib/<domain>/types.ts` for the normalized shape.
2. Implement `normalize*(raw: unknown)` and use it from a single fetch module.
3. Add an async `*Section.tsx` that calls the server fetch and passes props to the client component.
4. Replace the old default export with a one-line re-export from `components/FeatureName.tsx`.
5. Move pure helpers (formatting, slot rotation, label merging) into `utils/` beside the client component.
6. Run the app on the affected route; fix imports with ripgrep for the old filename.
7. Wrap the section in `<Suspense fallback={...}>` on the home page when streaming shell UX matters.

## Cursor rule

Project agents load `.cursor/rules/frontend-feature-architecture.mdc` when working under `app/` and `components/`.
