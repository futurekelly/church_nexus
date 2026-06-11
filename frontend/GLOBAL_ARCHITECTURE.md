# Global Frontend Architecture

> Implementation reference for the Church Management Ecosystem frontend foundation.
> Feature pages are intentionally excluded — only global architecture is implemented.

---

## 1. App Router Structure

```
src/app/
├── layout.tsx              # Root HTML shell, fonts, AppProviders
├── globals.css             # Tailwind + design tokens
├── loading.tsx             # Global loading fallback
├── error.tsx               # Global error boundary
├── not-found.tsx           # 404 page
│
├── (public)/layout.tsx     # Public marketing shell
├── (auth)/layout.tsx       # Auth glass-card shell
└── (dashboard)/layout.tsx  # Authenticated dashboard shell
```

**Decision:** Route groups `(public)`, `(auth)`, and `(dashboard)` isolate layout concerns without affecting URL paths. This matches `FOLDER_STRUCTURE.md` and keeps each area independently evolvable.

---

## 2. Layout System

| Layout | File | Responsibility |
|--------|------|----------------|
| Root | `app/layout.tsx` | Fonts, dark class, global providers |
| Public | `layouts/public-layout.tsx` | Unauthenticated pages (landing, sermons, events) |
| Auth | `layouts/auth-layout.tsx` | Centered glass card with animated gradient backdrop |
| Dashboard | `layouts/dashboard-layout.tsx` | Sidebar + navbar + content + mobile nav |

**Decision:** Layout components live in `src/layouts/` while route group `layout.tsx` files are thin wrappers. This separates Next.js routing from composable layout logic.

---

## 3. Dashboard Layout

```
DashboardLayout
├── RouteGuard          # Client RBAC + auth gate
├── Sidebar             # Role-filtered navigation
├── Navbar              # Breadcrumbs, search, notifications, user menu
├── <main>              # Page content slot
└── MobileBottomNav     # Mobile-only quick navigation
```

**Decision:** Dashboard chrome is client-rendered because sidebar state, permissions, and mobile drawer require interactivity. Page content inside `<main>` can still use Server Components.

---

## 4. Sidebar Architecture

```
Sidebar
├── Brand link
├── SidebarNav
│   └── SidebarNavItem[]   # Filtered by usePermissions()
└── Collapse toggle (desktop only)
```

**Data source:** `constants/navigation.ts` defines all nav items with `permission` keys.

**Filtering:** `usePermissions().visibleNavItems` removes unauthorized links before render.

**Responsive behavior:**
- Desktop (≥1280px): Fixed sidebar, collapsible to icon-only (72px)
- Mobile (<768px): Off-canvas drawer with backdrop overlay

**State:** `ui-store.ts` persists `sidebarCollapsed` across sessions.

---

## 5. Navbar Architecture

```
Navbar
├── Mobile menu trigger (hamburger)
├── Breadcrumbs (auto-generated from pathname)
├── Search input (desktop only)
├── Notification bell + unread badge
└── NavbarUserMenu (name, role, profile, logout)
```

**Decision:** Navbar is sticky with glass styling to match `UI_GUIDELINES.md`. Breadcrumbs are derived from the URL — no manual config per page.

---

## 6. Theme Provider Architecture

```
AppProviders
└── ThemeProvider (next-themes)
    └── AuthProvider
        └── children + Sonner Toaster
```

**Configuration:**
- `attribute="class"` for Tailwind dark mode
- `defaultTheme="dark"` per design system
- `enableSystem={false}` — church brand is always dark-first

**Tokens:** `styles/tokens.css` maps `UI_GUIDELINES.md` hex values to HSL CSS variables consumed by `tailwind.config.ts`.

---

## 7. Route Protection Strategy

Three-layer defense:

### Layer 1 — Edge Middleware (`middleware.ts`)
- Reads `access_token` cookie
- Redirects unauthenticated users away from `/dashboard/*`
- Redirects authenticated users away from `/login`, `/register`, etc.
- Preserves `?redirect=` query for post-login navigation

### Layer 2 — Dashboard RouteGuard (`route-guard.tsx`)
- Waits for Zustand hydration
- Blocks unauthenticated access
- Blocks `visitor` role from dashboard (per `BUSINESS_RULES.md`)
- Redirects unauthorized roles to `/dashboard`

### Layer 3 — Permission Matrix (`lib/permissions.ts`)
- Maps each role to granular permissions
- Maps each dashboard route to a required permission
- `usePermissions().can()` hides UI actions in feature components

**Decision:** Middleware handles authentication (is there a token?). RouteGuard handles authorization (does this role belong here?). Feature components use `can()` for action-level checks.

---

## 8. State Management Strategy

| Store | Tool | Scope | Persisted |
|-------|------|-------|-----------|
| Auth | Zustand | User, tokens, session | Yes (localStorage) |
| UI | Zustand | Sidebar collapse, mobile drawer | Partial |
| Notifications | Zustand | Unread count, notification list | No |

**Not in global state:**
- Form state → React Hook Form (per feature)
- Server data → fetched in hooks/services (TanStack Query can be added later)
- Theme → next-themes

**Decision:** Zustand is used only for truly global client state. Avoiding over-globalization keeps features isolated per `FOLDER_STRUCTURE.md` Rule 1.

---

## 9. API Service Layer Strategy

```
Feature Hook
  └── Feature Service (features/<name>/services/)
        └── api-client.ts (global Axios instance)
              └── Django REST API
```

### `api-client.ts` responsibilities:
- Single Axios instance with `API_BASE_URL`
- Request interceptor: attach `Bearer` token
- Response interceptor: 401 → refresh token queue → retry
- Typed helpers: `apiGet`, `apiPost`, `apiPut`, `apiDelete`
- Response envelope typing per `API_RESPONSE_STANDARDS.md`
- `getErrorMessage()` for consistent error display

### Initialization:
`AuthProvider` calls `initializeApiClient()` on mount, wiring store getters/setters. This avoids circular imports between store and client.

### Token sync:
- Access token stored in Zustand (persisted)
- Mirror token to `access_token` cookie for middleware
- Refresh token flow calls `/api/v1/auth/refresh/`

**Decision:** Feature services will wrap `apiGet/apiPost` — the global client handles cross-cutting auth and error normalization only.

---

## File Index

```
frontend/src/
├── app/                    # App Router entry points
├── components/navigation/  # Sidebar, navbar, guards, breadcrumbs
├── constants/              # Routes, API endpoints, nav config, colors
├── hooks/                  # useAuth, usePermissions, useMediaQuery
├── layouts/                # Public, auth, dashboard shells
├── lib/                    # utils, permissions matrix
├── providers/              # Theme, auth, app providers
├── services/               # api-client.ts
├── store/                  # auth, ui, notification stores
├── styles/                 # CSS design tokens
├── types/                  # api, user, roles
└── middleware.ts           # Edge route protection
```
