/**
 * Site typography — Montserrat (headings, buttons, card titles) + Inter (body, nav, labels).
 * Loaded in app/layout.tsx; tokens in app/globals.css.
 */
export const SITE_FONT_BODY = "Inter"
export const SITE_FONT_DISPLAY = "Montserrat"

/** Hero headings — Montserrat 800 */
export const typeHeroHeading = "font-display font-extrabold"

/** Section headings — Montserrat 700 */
export const typeSectionHeading = "font-display font-bold"

/** Event / card titles — Montserrat 600 */
export const typeEventCardTitle = "font-display font-semibold"

/** Primary navigation — Inter 500 */
export const typeNav = "font-sans font-medium"

/** Body copy — Inter 400 */
export const typeBody = "font-sans font-normal"

/** Small labels, captions — Inter 400 */
export const typeLabel = "font-sans font-normal text-sm"

/** Buttons — Montserrat 600 */
export const typeButton = "font-display font-semibold"

/** Tabular IDs / stats (still Inter, not a third family) */
export const siteTabularClass = "font-sans tabular-nums"
