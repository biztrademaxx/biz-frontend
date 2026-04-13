# Authentication Audit Report

**Project:** Biz (Next.js frontend + Express backend)  
**Scope:** Full codebase (frontend and backend)  
**Goal:** Identify all authentication mechanisms to support future standardization on JWT.

---

## 1. AUTHENTICATION SYSTEMS FOUND

### 1.1 JWT (jsonwebtoken)

| Aspect | Details |
|--------|---------|
| **Files** | **Backend:** `backend/src/services/auth.service.ts`, `backend/src/middleware/auth.middleware.ts`, `backend/src/routes/auth.ts`. **Frontend/Next.js:** `lib/auth-utils.ts`, `lib/auth-sub-admin.ts`, `lib/auth-super-admin.ts`, `app/api/auth/super-admin/signin/route.ts`, `app/api/auth/super-admin/verify-token/route.ts`, `app/api/auth/sub-admin/login/route.ts`, `app/api/auth/permissions/route.ts`, `app/api/auth/super-admin/middleware.ts`. |
| **Purpose** | **Backend:** Primary auth for API: issue/verify access and refresh tokens (User, SuperAdmin, SubAdmin), protect routes via `requireUser` / `requireAdmin` / `requireSuperAdmin`. **Frontend:** Sub-admin/Super-admin custom JWTs (separate from backend JWT), token generation/verification for admin routes, and generic `auth-utils` sign/verify with `JWT_SECRET`. |
| **Flow** | **Backend:** Email/password → `POST /api/auth/login` → `AuthService.authenticateWithCredentials` → JWT access + refresh; `POST /api/auth/refresh` refreshes tokens. Middleware reads `Authorization: Bearer <token>`, verifies with `AuthService.verifyAccessToken`, sets `req.auth`. **Frontend (admin):** Super-admin sign-in uses Next.js Prisma + `jwt.sign` with `NEXTAUTH_SECRET`; sub-admin login uses `JWT_SECRET`; some routes verify token from cookie `superAdminToken` or header. |

---

### 1.2 NextAuth

| Aspect | Details |
|--------|---------|
| **Files** | `lib/auth-options.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/providers.tsx`, `components/LayoutWrapper.tsx`, and 40+ files using `getServerSession(authOptions)`, `useSession()`, `signIn()`, `signOut()` (see list below). |
| **Purpose** | Session-based auth for the main app: credentials provider (delegates to backend login), Google/LinkedIn OAuth, JWT session strategy, role/adminType in session. Used for protecting Next.js API routes and for UI (nav, dashboards, “logged-in” state). |
| **Flow** | **Credentials:** `authorize()` calls backend `POST /api/auth/login`; maps backend user to NextAuth user (no backend tokens stored in NextAuth). **OAuth:** Google/LinkedIn → NextAuth handles OAuth; `signIn` callback creates/updates user in Next.js Prisma (MongoDB). **Session:** `strategy: "jwt"`; callbacks enrich JWT/session from DB (SuperAdmin, SubAdmin, User). **Endpoints:** All NextAuth handlers at `GET/POST /api/auth/[...nextauth]`. **SessionProvider** wraps app in `app/providers.tsx` and `LayoutWrapper.tsx`. |

**NextAuth usage – API routes (getServerSession):**  
`app/api/admin/events/approved/route.ts`, `app/api/users/[id]/saved-events/route.ts`, `app/api/admin/events/[id]/verify/route.ts`, `app/api/admin-notes/route.ts`, `app/api/notifications/[id]/route.ts`, `app/api/organizers/[id]/revenue/route.ts`, `app/api/organizers/speakerByEvent/route.ts`, `app/api/admin/events/[id]/status/route.ts`, `app/api/organizers/[id]/events/[eventId]/route.ts`, `app/api/notifications/mark-all-read/route.ts`, `app/api/user/notifications/route.ts`, `app/api/dashboard-content/route.ts`, `app/api/events/[id]/organizer-check/route.ts`, `app/api/exhibitors/[id]/leads/route.ts`, `app/api/events/[id]/reviews/route.ts`, `app/api/admin/venues/[id]/route.ts`, `app/api/faqs/[id]/route.ts`, `app/api/users/[id]/messages/route.ts`, `app/api/users/[id]/interested-events/route.ts`, `app/api/admin/events/[id]/route.ts`, `app/api/appointments/route.ts`, and many other API routes under `app/api/`.

**NextAuth usage – UI (useSession / signIn / signOut):**  
`app/admin-dashboard/page.tsx`, `app/admin-dashboard/superadminmanagement.tsx`, `app/speaker-dashboard/FeedbackReplyManagement.tsx`, `app/sign-in/page.tsx`, `app/venue-dashboard/venue-layout.tsx`, `app/event-dashboard/navbar.tsx`, `app/dashboard/navbar.tsx`, `app/event/events-page-content.tsx`, `app/dashboard/user-dashboard.tsx`, `app/speaker-dashboard/speaker-dashboard.tsx`, `app/event/[id]/register/page.tsx`, `components/ScheduleMeetingButton.tsx`, `app/event-dashboard/exhibitors-tab.tsx`, `app/event/[id]/exhibitors-tab.tsx`, `components/AddOrganizerReview.tsx`, `app/login/page.tsx`, `components/AddReviewCard.tsx`, etc.

---

### 1.3 Google OAuth / Google Identity

| Aspect | Details |
|--------|---------|
| **Files** | `lib/auth-options.ts` (GoogleProvider), `app/login/page.tsx` (handleGoogleLogin → `signIn("google")`), `app/signup/page.tsx` (handleGoogleSignup → `signIn("google")`), `app/auth/page.tsx` (handleSocialLogin("google")). |
| **Purpose** | Social login/signup via NextAuth; no direct Google Identity SDK. User created/updated in Next.js Prisma (MongoDB) in `signIn` callback; no backend JWT issued for OAuth users at sign-in. |
| **Flow** | User clicks “Google” → `signIn("google", { callbackUrl: "/" })` → NextAuth OAuth flow → callback creates/updates user in MongoDB (safePrisma) → NextAuth JWT session. Subsequent API calls use NextAuth session (cookie), not backend JWT. |

---

### 1.4 LinkedIn OAuth

| Aspect | Details |
|--------|---------|
| **Files** | `lib/auth-options.ts` (LinkedInProvider); same `signIn` callback as Google for create/update user. |
| **Purpose** | Social login via NextAuth; same pattern as Google. |
| **Flow** | Same as Google OAuth, with `account?.provider === "linkedin"` in callback. |

---

### 1.5 Session-based auth (NextAuth session / cookies)

| Aspect | Details |
|--------|---------|
| **Files** | All places using `getServerSession(authOptions)` or `useSession()` (see NextAuth section). Session is stored as encrypted JWT in cookie (NextAuth default). |
| **Purpose** | Identify current user on Next.js API routes and in React (nav, dashboards, conditional UI). No separate “session store”; NextAuth uses JWT strategy. |
| **Flow** | Cookie sent to Next.js → getServerSession decrypts/validates → returns session with user id, role, etc. Used for authorization in Next.js API routes; not sent to backend as Bearer token unless client explicitly uses `apiFetch` with stored backend JWT. |

---

### 1.6 Backend JWT (accessToken / refreshToken in localStorage)

| Aspect | Details |
|--------|---------|
| **Files** | `lib/api.ts` (getAccessToken, getRefreshToken, setTokens, clearTokens, refreshAccessToken, apiFetch with `Authorization: Bearer`, loginWithEmailPassword). |
| **Purpose** | Store backend-issued JWTs in browser for direct API calls to Express. Used when frontend calls `apiFetch(..., { auth: true })` (e.g. speaker profile, exhibitors, events, organizers). |
| **Flow** | Email/password login on `/login` or `/sign-in` → `loginWithEmailPassword()` calls backend `POST /api/auth/login` → backend returns accessToken + refreshToken → `setTokens()` saves to localStorage. Later, `apiFetch` adds `Authorization: Bearer <accessToken>`; on 401, calls backend `POST /api/auth/refresh` and retries. |

---

### 1.7 Internal API secret (server-to-backend)

| Aspect | Details |
|--------|---------|
| **Files** | **Backend:** `backend/src/middleware/auth.middleware.ts` (`requireUserOrInternal` checks `X-Internal-Secret`). **Next.js:** `app/api/events/[id]/route.ts`, `app/api/events/[id]/layout/route.ts`, `app/api/events/[id]/brochure/route.ts` (send `X-Internal-Secret` when proxying to backend). |
| **Purpose** | Let Next.js server call backend without a user JWT (e.g. PATCH event when user is authenticated via NextAuth only; backend accepts either Bearer JWT or internal secret). |
| **Flow** | Next.js API route adds `X-Internal-Secret: INTERNAL_API_SECRET` to outbound request to backend; backend `requireUserOrInternal` treats it as authenticated “internal” identity. |

---

### 1.8 Super-admin / Sub-admin custom auth (Next.js-only)

| Aspect | Details |
|--------|---------|
| **Files** | `app/api/auth/super-admin/signin/route.ts`, `app/api/auth/super-admin/verify-token/route.ts`, `app/api/auth/super-admin/middleware.ts`, `app/api/auth/sub-admin/login/route.ts`, `app/api/auth/permissions/route.ts`, `lib/auth-super-admin.ts`, `lib/auth-sub-admin.ts`. |
| **Purpose** | Separate admin sign-in and token verification in Next.js: SuperAdmin/SubAdmin use Next.js Prisma (MongoDB) and JWTs signed with `NEXTAUTH_SECRET` (super-admin) or `JWT_SECRET` (sub-admin). Middleware protects `/admin-dashboard` by cookie `superAdminToken` or Bearer token. |
| **Flow** | Super-admin: sign-in → JWT in body/cookie → middleware verifies with NEXTAUTH_SECRET. Sub-admin: login → JWT with JWT_SECRET. These tokens are independent of backend `/api/auth/login` JWTs. |

---

### 1.9 Passport

| Aspect | Details |
|--------|---------|
| **Finding** | **Not used.** No Passport or passport-* dependencies or imports in the project. |

---

## 2. BACKEND AUTHENTICATION (DETAILED)

### 2.1 `backend/src/middleware/auth.middleware.ts`

- **extractTokenFromHeader:** Reads `Authorization: Bearer <token>`.
- **requireUser:** Verifies token via `AuthService.verifyAccessToken(token)`, sets `req.auth` (AuthTokenPayload). Returns 401 if missing/invalid.
- **requireAdmin:** Same as requireUser, then checks `domain === "ADMIN"` and `role` SUPER_ADMIN or SUB_ADMIN; 403 otherwise.
- **requireSuperAdmin:** Same, then requires `domain === "ADMIN"` and `role === "SUPER_ADMIN"`.
- **requireUserOrInternal:** If `X-Internal-Secret` equals `INTERNAL_API_SECRET`, sets `req.auth` to internal identity and skips JWT; otherwise calls `requireUser`.
- **requirePermission(permissionName):** Used after requireAdmin; SUPER_ADMIN bypasses; SUB_ADMIN must have permission in `req.auth.permissions`.

### 2.2 `backend/src/services/auth.service.ts`

- **authenticateWithCredentials(email, password):** Tries SuperAdmin, SubAdmin, then User (Prisma); bcrypt compare; builds AuthTokenPayload; returns user + tokens.
- **issueTokens(payload):** `jwt.sign` access (15 min) and refresh (7 days) with JWT_SECRET / JWT_REFRESH_SECRET.
- **verifyAccessToken / verifyRefreshToken:** Standard verify; returns payload.
- **refreshTokens(refreshToken):** Verify refresh, re-load user/admin from DB, issue new tokens.

### 2.3 `backend/src/routes/auth.ts` (mounted at `/api/auth`)

- **POST /login:** Body email/password → AuthService.authenticateWithCredentials → JSON { user, accessToken, refreshToken }.
- **POST /refresh:** Body refreshToken → AuthService.refreshTokens → new access + refresh.
- **POST /send-otp,** **POST /verify-otp:** OTP for registration (backend only).
- **POST /register:** Full user registration (backend Prisma).
- **POST /bootstrap-superadmin:** One-time SuperAdmin creation with secret.

No Passport; no session store; auth is stateless JWT.

### 2.4 Backend routes using auth middleware

- **requireUser:**  
  `backend/src/modules/events/events.routes.ts` (e.g. POST/events/speakers, PUT/DELETE layout, save/unsave, promotions),  
  `backend/src/modules/speakers/speakers.routes.ts` (POST/PUT speakers),  
  `backend/src/routes/user-by-id.ts` (PUT /users/:id).
- **requireAdmin / requirePermission:**  
  `backend/src/modules/admin/admin.routes.ts` (events, dashboard, approve/reject, etc.; sub-routes may add more checks).

Backend does **not** use NextAuth, cookies, or session storage; it uses only JWT (and optionally X-Internal-Secret).

---

## 3. FRONTEND AUTHENTICATION (DETAILED)

### 3.1 NextAuth configuration (`lib/auth-options.ts`)

- **Providers:** Credentials (backend login), Google, LinkedIn (if env set).
- **Credentials authorize:** `POST` to `NEXT_PUBLIC_API_URL/api/auth/login`, maps backend user to NextAuth user (id, name, email, role, domain, adminType, permissions). Does **not** store backend access/refresh tokens.
- **Pages:** signIn: `/login`.
- **Session:** strategy `jwt`.
- **Callbacks:** signIn (OAuth user create/update in MongoDB); jwt (enrich from SuperAdmin/SubAdmin/User in Prisma); session (expose id, role, adminType, permissions, name, avatar).

### 3.2 Google OAuth login

- **Login page:** `app/login/page.tsx` – `handleGoogleLogin` → `signIn("google", { callbackUrl: "/" })`.
- **Signup page:** `app/signup/page.tsx` – `handleGoogleSignup` → same.
- **Auth page:** `app/auth/page.tsx` – `handleSocialLogin("google")`.
- No backend JWT issued for OAuth; only NextAuth session.

### 3.3 Session handling

- **SessionProvider:** `app/providers.tsx`, `components/LayoutWrapper.tsx` wrap app with `<SessionProvider>`.
- **Reading session:** `useSession()` in many pages/layouts; `getServerSession(authOptions)` in API routes.
- **Sign out:** `signOut({ callbackUrl: "/login" })` in navbars and venue layout.

### 3.4 Token storage

- **NextAuth:** Session in encrypted cookie (default NextAuth behavior).
- **Backend JWT:** `lib/api.ts` – `localStorage`: `accessToken`, `refreshToken` (keys `"accessToken"`, `"refreshToken"`).
- **Super-admin:** Cookie `superAdminToken` or Authorization header (see super-admin middleware).
- No use of `sessionStorage` for auth tokens in the audited code.

### 3.5 API request auth headers

- **Direct to backend (`apiFetch`):** `lib/api.ts` adds `Authorization: Bearer <accessToken>` when `auth: true`; token from localStorage; 401 triggers refresh and retry.
- **Next.js proxy routes:** `lib/backend-proxy.ts` forwards `req.headers.get("authorization")` to backend. So if the client sends Authorization (e.g. from `apiFetch` to same origin, or from a page that passes token), it is forwarded. Many Next.js API routes use only `getServerSession` and do **not** add a Bearer token when proxying; the browser request to `/api/...` often has no Authorization header, so backend may receive no JWT for those proxy calls.
- **Internal secret:** Next.js server adds `X-Internal-Secret` in a few event proxy routes (events/[id], layout, brochure).

---

## 4. AUTHENTICATION FLOWS (SUMMARY)

| Flow | Mechanism | Notes |
|------|------------|--------|
| Email/password login (main app) | Backend JWT + NextAuth session | `loginWithEmailPassword()` → setTokens(localStorage); then `signIn("credentials", ...)` → NextAuth session. Two parallel states. |
| Google login | NextAuth OAuth | `signIn("google")` → NextAuth session; user in MongoDB. No backend JWT at login. |
| LinkedIn login | NextAuth OAuth | Same as Google. |
| API calls with backend JWT | Bearer token from localStorage | `apiFetch(..., { auth: true })` → Authorization: Bearer; backend requireUser/requireAdmin. |
| API calls via Next.js only | NextAuth session | Browser sends session cookie; Next.js getServerSession; often proxy without adding Bearer → backend may get no JWT. |
| Next.js server → backend (selected routes) | X-Internal-Secret | Event PATCH/layout/brochure proxies send INTERNAL_API_SECRET; backend requireUserOrInternal. |
| Super-admin dashboard | Custom JWT (NEXTAUTH_SECRET) + cookie | Sign-in via Next.js route; cookie `superAdminToken` or header; middleware verifies for `/admin-dashboard`. |
| Sub-admin login | Custom JWT (JWT_SECRET) | Next.js route; token returned in response; used for sub-admin flows. |

---

## 5. DUPLICATE OR CONFLICTING AUTH SYSTEMS

1. **Dual state after email/password login**  
   Backend JWT (localStorage) and NextAuth session (cookie) are both set. Some features rely on session (e.g. Next.js API route guards), others on backend JWT (e.g. apiFetch to backend). If user logs in only via Google, they have NextAuth session but no backend tokens in localStorage, so `apiFetch(..., { auth: true })` has no token and backend returns 401.

2. **Two JWT “realms”**  
   - Backend: JWT_SECRET / JWT_REFRESH_SECRET (auth.service, middleware).  
   - Next.js admin: NEXTAUTH_SECRET (super-admin) and JWT_SECRET (sub-admin, auth-utils). Different payloads and lifetimes; not interchangeable.

3. **Multiple “login” entry points**  
   - Backend: `POST /api/auth/login` (single source for backend JWT).  
   - Next.js: Credentials provider (calls backend), super-admin signin, sub-admin login. Admin routes use Next.js Prisma + own JWT, not backend login.

4. **Protection of same resource by different auth**  
   - Example: Event dashboard can use NextAuth session on Next.js and/or backend JWT when calling backend. Some Next.js routes (e.g. appointments) guard with getServerSession but proxy without adding Bearer, so backend /api/appointments is effectively unauthenticated; only Next.js enforces “who is logged in.”

5. **Secret confusion**  
   NEXTAUTH_SECRET used for super-admin JWT and in some verify; JWT_SECRET used for backend and sub-admin. Must be kept distinct and consistent per system.

---

## 6. RELIANCE ON SESSION, COOKIES, JWT, OAUTH

| Relies on | Where |
|------------|--------|
| **Session (NextAuth JWT in cookie)** | All Next.js API routes using getServerSession; all UI using useSession; redirects after login; navbars and role-based UI. |
| **Cookies** | NextAuth session cookie; super-admin `superAdminToken` cookie. |
| **JWT (backend, in localStorage)** | apiFetch with auth: true; backend requireUser/requireAdmin; refresh flow in lib/api.ts. |
| **JWT (Next.js admin)** | Super-admin/sub-admin sign-in and verify; admin middleware; permissions route. |
| **OAuth tokens** | Only inside NextAuth (Google/LinkedIn); not stored or used elsewhere. |

---

## 7. COMPONENTS TO CHANGE FOR PURE JWT AUTHENTICATION

If the system is standardized on **one** backend-issued JWT (and optionally refresh):

### 7.1 Remove or reduce NextAuth

- Replace getServerSession in Next.js API routes with: (a) verify backend JWT (e.g. from Authorization header or from a cookie that you set with the same token), or (b) proxy to backend and let backend verify JWT only.
- Replace useSession/signIn/signOut with a small auth context that reads backend JWT (e.g. from cookie or localStorage), exposes user and logout (clear token + optional backend revoke).
- Remove or repurpose Credentials and OAuth providers; OAuth would need a flow that ends in backend issuing JWT (e.g. backend “login with Google” that returns access/refresh).

### 7.2 Unify token storage and sending

- Decide single place for access (and refresh) token: e.g. httpOnly cookie (recommended for web) or localStorage. Ensure every call to backend that needs auth sends that token (e.g. proxy routes add Authorization from cookie or from incoming header).
- Ensure all Next.js proxy routes that require auth forward the backend JWT (or X-Internal-Secret where appropriate) so backend never receives unauthenticated requests for protected resources.

### 7.3 Backend

- Keep current JWT + optional refresh; optionally add “logout” or refresh blacklist if needed. No change to requireUser/requireAdmin if all clients send the same JWT.
- Keep or drop X-Internal-Secret depending on whether you still need server-to-server calls without a user token.

### 7.4 Admin (Super/Sub) auth

- Either move admin login to backend (same AuthService, same JWT) and remove Next.js super-admin/sub-admin sign-in and custom JWTs, or keep a separate admin auth but document it as “admin-only JWT” and use one secret/payload shape.

### 7.5 OAuth (Google/LinkedIn)

- Implement “login with Google” (and LinkedIn) on backend (e.g. verify ID token or use OAuth flow on server), create or find user, issue same backend access/refresh JWT. Frontend then only needs to send that JWT; no NextAuth OAuth provider.

### 7.6 Files to touch (high level)

- **NextAuth:** `lib/auth-options.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/providers.tsx`, `components/LayoutWrapper.tsx`, all API routes using getServerSession, all pages using useSession/signIn/signOut.
- **Token handling:** `lib/api.ts`, `lib/backend-proxy.ts`, any Next.js route that proxies to backend (ensure they forward or inject JWT).
- **Admin:** `app/api/auth/super-admin/*`, `app/api/auth/sub-admin/*`, `app/api/auth/permissions/route.ts`, `lib/auth-super-admin.ts`, `lib/auth-sub-admin.ts`, `app/api/auth/super-admin/middleware.ts`, admin dashboard and sub-admin UI.
- **Login/signup pages:** `app/login/page.tsx`, `app/sign-in/page.tsx`, `app/signup/page.tsx`, `app/auth/page.tsx` (and any other entry points that call loginWithEmailPassword or signIn).
- **Types:** `types/next-auth.d.ts` (session shape); replace with app-specific user type if NextAuth is removed.

---

## 8. SUMMARY TABLE

| System | Location | Purpose |
|--------|----------|--------|
| Backend JWT (auth.service) | Express | Login, refresh, protect API (requireUser/requireAdmin) |
| NextAuth (session + credentials + OAuth) | Next.js | App session, UI state, protect many Next.js API routes |
| localStorage backend tokens | Browser (lib/api.ts) | apiFetch auth to backend |
| Internal API secret | Next.js ↔ Backend | Server-to-backend bypass JWT |
| Super/Sub-admin JWT | Next.js API + middleware | Admin dashboard and permissions |
| auth-utils JWT | lib/auth-utils.ts | Generic sign/verify (e.g. 7d token); not primary login |

---

*Report generated for standardization on JWT. No code was modified.*
