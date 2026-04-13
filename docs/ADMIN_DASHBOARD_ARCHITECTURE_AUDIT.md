# Admin Dashboard – Architecture Audit Report

**Scope:** `app/admin-dashboard` and related backend admin APIs  
**Reference:** Event management platform (e.g. 10times.com-style admin)  
**Date:** 2025

---

## 1. Folder and File Scan

### 1.1 Root-Level Files (admin-dashboard/)

| File | Purpose |
|------|---------|
| `page.tsx` | Entry: session check, role derivation, renders Navbar + NameBanner + AdminDashboard (sidebar) |
| `sidebar.tsx` | Main layout: sidebar menu + content area; routes sections via `activeSection` / `activeSubSection` |
| `navbar.tsx` | Top navbar |
| `NameBanner.tsx` | Banner with admin name/designation |
| `dashboard-overview.tsx` | Dashboard overview (stats cards + recent activity) – uses backend `/api/admin/dashboard` |
| `event-management.tsx` | All Events list (table, filters, edit/delete/verify) – uses backend `/api/admin/events` |
| `EventApprovalDashboard.tsx` | Event Approvals (pending/rejected/approved tabs) – uses backend `/api/admin/events?status=...` |
| `EventDetailsModal.tsx` | Event detail panel (view/approve/reject) – uses backend `/api/admin/events/:id` |
| `event-categories.tsx` | Event categories – uses Next.js `/api/admin/event-categories` |
| `events/[id]/preview/page.tsx` | Event preview page |
| `organizer-management.tsx` | Organizers list – Next.js `/api/admin/organizers` |
| `add-organizer-form.tsx` | Add organizer form |
| `organizer/*` | connections, promotions, venue-bookings, feedback |
| `exhibitor-management.tsx` | Exhibitors list – Next.js `/api/admin/exhibitors` |
| `add-exhibitor-form.tsx` | Add exhibitor |
| `exhibitors/*` | promotions, followers, feedback, appointments |
| `speaker-management.tsx` | Speakers – Next.js `/api/admin/speakers` |
| `AddSpeaker.tsx` | Add speaker |
| `speaker/*` | followers, feedback |
| `venue-management.tsx` | Venues – Next.js `/api/admin/venues` |
| `AddVenue.tsx` | Add venue |
| `venue/*` | events, bookings, venue-feedback |
| `visitor-management.tsx` | Visitors – Next.js `/api/admin/visitors` |
| `visitors/*` | events, connections, appointments |
| `user-management.tsx` | User management (likely Next.js APIs) |
| `superadminmanagement.tsx` | Super Admin list – Next.js `/api/sub-admins` |
| `subadmin-management.tsx` | Sub-admin create/list – Next.js `/api/sub-admins` |
| `sub-admin-edit-page.tsx`, `sub-admin-view-page.tsx` | Sub-admin edit/view (may not be in sidebar) |
| `eventManagement/createEvent/*` | Create-event wizard (tabs: basic, details, pricing, media, preview, etc.) |
| `financial/*` | payments, subscriptions, invoices, transactions, packeges (typo) |
| `integrations/*` | payments, communication, travel |
| `settings/*` | modules, notifications, security, languages, backup |
| `help-support/*` | main, support-tickets, support-contacts, support-notes, faq-management |
| `content/banners.tsx` | Banners |
| `content-management.tsx` | Content management placeholder |
| `countries-management.tsx` | Countries |
| `email-templates.tsx`, `email-notifications.tsx` | Email templates and campaigns |
| `push-templates.tsx`, `push-notifications.tsx` | Push templates and notifications |
| `reports-management.tsx`, `revenue-management.tsx`, `promotions-management.tsx` | Reports/revenue/promotions |
| `analytics-dashboard.tsx`, `ads-management.tsx` | Analytics and ads |
| `import.tsx` | Bulk import |
| `system-settings.tsx` | System settings |
| `add-venue.tsx` | Add venue (alternate) |
| `auth-error-handler.tsx` | Auth error handling |
| `types.ts` | Shared types |

### 1.2 Backend Admin Surface (Express)

- **Events:** GET/PATCH/DELETE `/api/admin/events`, GET `/api/admin/events/stats`, GET `/api/admin/events/:id`, POST `/api/admin/events/approve`, POST `/api/admin/events/reject`, POST `/api/admin/events` (create).
- **Dashboard:** GET `/api/admin/dashboard` (totals, recent events, recent registrations).
- **Venues:** GET `/api/admin/venues`.
- **Visitors:** GET `/api/admin/visitors`.

Most other admin features (organizers, exhibitors, speakers, visitors CRUD, settings, financial, integrations, help-support, etc.) are still served by **Next.js API routes** (`app/api/admin/*`), which use legacy Prisma/MongoDB or no backend and often fail when `DATABASE_URL` is unset.

---

## 2. Identified Issues

### 2.1 Event Approval Dashboard – No Data While “All Events” Shows PENDING_APPROVAL

- **Observation:** All Events (event-management) and Event Approvals (EventApprovalDashboard) both call the **same backend** (`/api/admin/events` vs `/api/admin/events?status=PENDING_APPROVAL`).
- **Possible causes:**
  - Backend `adminListEvents` when `status=PENDING_APPROVAL` returns a different result (e.g. empty) due to enum/casing or `where` logic.
  - Frontend error path or response shape (e.g. `data.events` undefined in one flow).
  - Auth: `requireAdmin` or JWT causing 401 for the approval request only.
- **Recommendation:** Verify in browser Network tab: `GET /api/admin/events?status=PENDING_APPROVAL&page=1&limit=10` response body and status. Confirm backend Prisma `Event.status` uses `PENDING_APPROVAL` and that the handler passes `status` into `adminListEvents` unchanged (no extra mapping). Ensure Event Approval Dashboard uses the same base URL (backend) and auth (apiFetch with `auth: true`).

### 2.2 Missing or Incomplete Features

- **Dashboard overview:** Stats and recent activity are backed by backend; no drill-down or links to real lists.
- **Event categories:** Uses Next.js `/api/admin/event-categories` (legacy); no backend equivalent; likely to fail or return stale data.
- **All Events (event-management):** PATCH/verify/delete still use `fetch("/api/admin/events/...")` (Next.js) in places; mixed backend vs Next.js can cause inconsistent state.
- **Create Event:** Wizard exists under `eventManagement/createEvent`; submission target and backend alignment need verification.
- **Organizers / Exhibitors / Speakers / Venues / Visitors:** CRUD and list APIs are Next.js-only; no Express admin CRUD for these entities.
- **Financial:** Payments, subscriptions, invoices, transactions – pages exist but point to Next.js APIs (e.g. `/api/admin/financial/...`) that may not be implemented or may use legacy DB.
- **Integrations:** Payment, communication, travel – same pattern; backend integrations not present.
- **Settings:** Modules, notifications, security, language, backup – Next.js APIs; no backend settings layer.
- **Help & Support:** Tickets, contacts, notes, FAQ – Next.js APIs; no backend.
- **Content:** Banners – Next.js; no admin content API in backend.
- **Reports & Analytics:** Placeholder or local only; no backend analytics.
- **Sub-admin / Super-admin management:** Next.js `/api/sub-admins`; no backend role-management API.

### 2.3 Pages Not Connected in Navigation

- `events/[id]/preview/page.tsx` – route exists; may be reachable only by direct URL or from a specific action.
- `sub-admin-edit-page.tsx`, `sub-admin-view-page.tsx` – not clearly linked from sidebar (Sub Admins list may link; needs check).
- `analytics-dashboard.tsx`, `ads-management.tsx`, `content-management.tsx` – not in sidebar or only under generic “Content”/“Reports”.
- `reports-management.tsx`, `revenue-management.tsx`, `promotions-management.tsx` – may be under Financial/Reports but some show “Coming Soon” or placeholders.

### 2.4 Components Created But Never Used

- `auth-error-handler.tsx` – usage not evident in sidebar or page flow.
- Duplicate/alternate add-venue flows (`add-venue.tsx` vs `AddVenue.tsx`) – both exist; only one wired in sidebar.
- `PromotionPackagesPagee` (typo) import in sidebar – duplicate of PromotionPackagesPage.

### 2.5 API Integrations Missing or Wrong

- **Backend used for:** Dashboard summary, admin events list (all + by status), event stats, event by id, approve/reject, and (partially) event-management list.
- **Next.js only (no backend):** event-categories, organizers, exhibitors, speakers, venues, visitors, sub-admins, financial, integrations, settings, help-support, content/banners, and most PATCH/DELETE for admin events (e.g. verify, delete) in event-management.
- **Inconsistent:** event-management mixes `apiFetch` (backend) for list and some PATCH with `fetch` (Next.js) for others; verify and delete still use Next.js.

### 2.6 Forms Without Backend Submission

- Add Organizer, Add Exhibitor, Add Speaker, Add Venue – forms exist; submission goes to Next.js APIs that may not persist to the same DB as the backend.
- Create Event wizard – needs to point to backend POST `/api/admin/events` and use same event model as the rest of admin.
- Settings (modules, notifications, security, language, backup) – forms call Next.js; no backend.
- Help-support (tickets, contacts, notes, FAQ) – same.

### 2.7 Tables Without Pagination / Filter / Search

- Many list pages (organizers, exhibitors, speakers, venues, visitors) use Next.js APIs; pagination/filter/search depend on those APIs and frontend implementation; not audited per table but likely inconsistent.
- Event Approval Dashboard has pagination and search (backend-backed).
- Event-management (All Events) has filters and search in UI; backend list supports pagination and search when using backend.

### 2.8 Actions Missing (Create / Edit / Delete / View)

- Event: View (modal), Approve, Reject exist; Edit/Delete in event-management may call Next.js only.
- Organizers/Exhibitors/Speakers/Venues/Visitors: Create forms exist; Edit/Delete/View depend on Next.js routes; backend CRUD missing.
- Sub-admins: Create/Delete via Next.js; Edit/View pages exist but linkage unclear.
- Financial/Integrations/Settings/Support: Actions call Next.js; backend actions missing.

### 2.9 Role Permission Checks

- **Sidebar:** `hasPermission()` – SUPER_ADMIN sees all; SUB_ADMIN uses `userPermissions` and `MENU_PERMISSIONS` mapping. Role is derived from session (`role` / `adminType`) in `page.tsx`.
- **Backend:** Admin routes use `requireAdmin` (JWT); no per-action permission (e.g. “approve_events” vs “manage_users”) in backend.
- **Frontend:** No per-component checks (e.g. “only SUPER_ADMIN can delete event”); if user can open the section, they can trigger any action in that section.
- **Sub-admin permissions:** Stored in token/session; not enforced on backend per permission string.

### 2.10 Dashboard Metrics Not Connected to Real Data

- Overview uses backend `/api/admin/dashboard` (totals, recent events, recent registrations) – **connected**.
- Event Approval uses backend `/api/admin/events/stats` – **connected**.
- Other “dashboard” or report views (reports-management, analytics-dashboard, revenue) – not backed by a single source of truth; many placeholders or Next.js-only.

### 2.11 Duplicate or Bad Structure

- Two add-venue components; typo `PromotionPackagesPagee` in sidebar.
- `eventManagement` vs `events` – one is create wizard, one is list/preview; naming could be clearer.
- Financial pages under `financial/*` and also “promotions” under financial packeges; some show “Page will updated-----soon” with component commented out.
- Many list/detail/add pages live next to each other without a shared `hooks` or `api` layer for admin; each file does its own fetch.

### 2.12 Pages That Should Exist (SaaS Event-Platform Admin)

- **Event lifecycle:** Draft → Pending → Approved/Rejected → Published → Completed/Cancelled – approval exists; bulk status change and lifecycle view (e.g. timeline) missing.
- **Audit log:** No admin action log (who approved/rejected what, when).
- **User management:** user-management.tsx exists but scope and backend unclear; no backend user list/ban/roles.
- **Notifications:** Settings and marketing notifications exist in UI; no backend notification center or templates.
- **Analytics:** No dedicated analytics API (event views, registrations, revenue per event/organizer).
- **Bulk operations:** Import exists; bulk approve/reject/archive for events not present.
- **Configurable roles/permissions:** Sub-admin permissions are list-based; no UI to define custom roles or permission sets in backend.
- **System health / audit:** No health check or audit-log API for admin.

---

## 3. Comparison with a 10times.com-Style Event Platform Admin

Typical capabilities of a professional event-platform admin vs current state:

| Capability | Expected | Current |
|------------|----------|---------|
| Event list (all statuses) | Yes, with filters, search, pagination | Yes (backend); filters in UI |
| Event approval workflow | Pending queue, approve/reject with reason | Yes (backend); Event Approval empty-data bug |
| Event create/edit by admin | Full CRUD | Create wizard exists; edit/delete partially Next.js |
| Event categories | CRUD, used in filters | Next.js only; no backend |
| Organizers/Exhibitors/Speakers | CRUD, list, search, export | Next.js only; no backend |
| Venues | CRUD, list, approval | Next.js only; no backend |
| Visitors/Attendees | List, search, export | Next.js only; no backend |
| Dashboard metrics | Real-time totals, charts | Partially (backend dashboard); no charts |
| Financial | Payments, refunds, payouts, invoices | Next.js only; placeholders |
| Integrations | Payments, email, CRM | Next.js only; no backend |
| Notifications | Templates, logs, test send | Next.js only |
| Roles (Super/Sub admin) | Create, edit, permissions | Next.js only; permissions not enforced in backend |
| Audit log | Who did what, when | Missing |
| Reports | Events, revenue, users, export | Placeholders |
| Settings | Global config, feature flags | Next.js only |
| Help/Support | Tickets, FAQ | Next.js only |

---

## 4. Structured Report

### 4.1 Missing Admin Features

- Event categories backend and UI consistency.
- Organizer/Exhibitor/Speaker/Venue/Visitor backend CRUD and list APIs.
- Sub-admin and super-admin management backend (create, update, delete, list with permissions).
- Financial backend (transactions, subscriptions, invoices, payouts).
- Integrations backend (payment, email/SMS, travel).
- Settings backend (modules, notifications, security, language, backup).
- Help & support backend (tickets, contacts, notes, FAQ).
- Content/banners backend.
- Analytics and reporting backend (event stats, revenue, user engagement).
- Audit log (admin actions).
- Notification center and template management backed by API.
- Bulk event operations (bulk approve/reject/status change).
- Export (events, users, orders) as CSV/Excel with backend support.

### 4.2 Missing CRUD Operations

- **Backend CRUD for:** Organizers, Exhibitors, Speakers, Venues, Visitors, Event Categories, Sub-admins, Settings (key-value or config table), FAQ, Support tickets, Banners.
- **Consistent admin event CRUD:** All event mutations (create, update, delete, verify) should go to backend; currently only list/approve/reject and one list in event-management are backend.

### 4.3 Missing Analytics

- No backend APIs for: event views, registration funnel, revenue by event/organizer, top events, user growth.
- No charts on dashboard (only numeric cards and recent activity).
- Reports-management and analytics-dashboard not backed by real data.

### 4.4 Missing Approval Workflows

- Event approval exists (pending/approved/rejected) but Event Approval Dashboard shows no data (bug to fix).
- No venue or organizer “approval” workflow (e.g. pending venues).
- No bulk approval/rejection.

### 4.5 Missing User Management Capabilities

- No backend user list (attendees, organizers, etc.) with filters.
- No ban/suspend or role change via backend.
- Sub-admin permissions not enforced per action in backend.

### 4.6 Missing Event Lifecycle Management

- No single “lifecycle” view (draft → pending → published → completed).
- No bulk status transition or archive.
- No scheduled publish or auto-close.

### 4.7 Missing Notification Systems

- No backend for email/push templates and sending.
- No in-app notification center or read/unread.
- No “test send” or delivery log API.

### 4.8 Missing Integrations

- No backend config for payment gateways, email/SMS providers, or travel partners.
- No webhook or API key management for admin.

### 4.9 Missing Security Features

- No 2FA or session management API for admin users.
- No IP allowlist or “last login” in backend.
- Permissions are list-based; no backend permission check per route.

### 4.10 Missing Audit Logs

- No table or API for admin actions (who approved/rejected which event, who changed what setting, etc.).

---

## 5. Improvement Suggestions

### 5.1 Folder Structure

- **`admin-dashboard/`**
  - `api/` or `lib/` – shared admin API functions (e.g. `getAdminEvents(status?)`, `approveEvent(id)`), all calling backend with `apiFetch`.
  - `components/` – shared tables, filters, modals, stat cards.
  - `sections/` or `features/` – one folder per area (events, organizers, exhibitors, …) with list, detail, form, and sub-routes.
  - Keep `sidebar.tsx` as layout; move menu config to a constant file (e.g. `menuConfig.ts`).
- Use a single “admin API base” and ensure all admin fetches go through it (backend base URL + auth).

### 5.2 Component Reuse

- Shared `DataTable` with sort, filter, pagination, and optional row actions.
- Shared `StatCard` for dashboard and any section that shows KPIs.
- Shared `ConfirmDialog` and `DetailDrawer` for approve/reject and view-detail flows.
- Reuse organizer/exhibitor/speaker card or row component where list UI is similar.

### 5.3 API Layer

- **Single admin client:** e.g. `adminApi.events.list({ status, page, limit, search })`, `adminApi.events.approve(id)`, etc., all using `apiFetch` and backend base URL.
- **Backend alignment:** Migrate all admin features to Express: add routes and services for organizers, exhibitors, speakers, venues, visitors, categories, settings, financial, support, content, and analytics. Deprecate or proxy Next.js admin routes to backend.
- **Error and auth:** Centralize 401 handling (e.g. redirect to login or refresh token) and surface API errors in a consistent way (toast or inline).

### 5.4 Performance

- Use pagination and virtualized lists for large tables (organizers, events, visitors).
- Cache dashboard summary and event stats for a short TTL or invalidate on approval/reject.
- Lazy-load section components (e.g. by sidebar section) to reduce initial bundle.

---

## 6. Task List to Finish Admin Dashboard

### Critical

1. **Fix Event Approval Dashboard empty data**  
   Verify backend `GET /api/admin/events?status=PENDING_APPROVAL` returns events when such events exist; fix backend filter or frontend parsing if needed; ensure JWT is sent.

2. **Unify event mutations to backend**  
   In event-management (and anywhere else), replace all `fetch("/api/admin/events/...")` (Next.js) with `apiFetch` to backend (PATCH/DELETE and verify); remove reliance on Next.js for admin events.

3. **Stabilize dashboard and event list**  
   Ensure dashboard overview and “All Events” use only backend APIs and handle errors; no legacy Prisma in Next.js for admin.

4. **Backend + frontend for Event Categories**  
   Add GET/POST/PUT/DELETE for event categories in Express; point event-categories.tsx and event-management category dropdown to backend.

5. **Admin auth and role consistency**  
   Ensure session always has `adminType` or `role` for admin users (already partially fixed); ensure sidebar and backend `requireAdmin` use the same notion of admin.

### Important

6. **Backend CRUD for Organizers**  
   Implement list/get/create/update/delete (and optional export) in Express; point organizer-management and add-organizer-form to backend.

7. **Backend CRUD for Exhibitors, Speakers, Venues, Visitors**  
   Same pattern as organizers; wire exhibitor/speaker/venue/visitor management and add forms to backend.

8. **Sub-admin and permissions backend**  
   Implement sub-admin CRUD and permission list in backend; enforce permissions in backend per route (e.g. “can_approve_events”); wire superadminmanagement and subadmin-management to backend.

9. **Pagination and search**  
   Ensure every admin list (events, organizers, exhibitors, etc.) has backend-supported pagination and search and that the UI uses it.

10. **Create Event wizard → backend**  
    Ensure the create-event flow submits to POST `/api/admin/events` (or equivalent) with the same schema as backend; remove dependency on Next.js for event creation.

11. **Financial and integrations (MVP)**  
    At least read-only or minimal config for payments and one integration (e.g. email) in backend; wire existing financial/integration pages to backend.

12. **Settings and help-support (MVP)**  
    Backend APIs for key settings (e.g. feature flags, notification toggles) and for support tickets or FAQ list; wire existing settings and help-support UIs.

### Optional

13. **Audit log**  
    Backend table and API for admin actions; optional UI to view logs.

14. **Analytics and reports**  
    Backend APIs for event stats, revenue summary, user counts; charts on dashboard or reports page.

15. **Bulk event actions**  
    Backend support for bulk approve/reject/status change; UI in Event Approval or All Events.

16. **Export**  
    Backend endpoints for CSV/Excel export of events, users, or orders; export buttons in list pages.

17. **Notification center**  
    Backend for in-app notifications and template management; link from navbar or settings.

18. **Cleanup**  
    Remove duplicate components (add-venue), fix typo (PromotionPackagesPagee), and retire or redirect unused pages (e.g. content-management placeholder).

19. **Role-based UI**  
    Hide or disable actions in the UI based on sub-admin permissions (e.g. “approve_events” only), in addition to backend enforcement.

20. **Performance and DX**  
    Lazy-load sections; shared admin API layer and shared table/filter components; optional Storybook for admin components.

---

**End of audit.** No code was modified; this document is analysis and recommendation only.
