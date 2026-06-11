# Frontend Architecture — Church Management Ecosystem

> **Status:** Structure scaffold only. No implementation files. Await approval before coding.
>
> **Standards:** `FOLDER_STRUCTURE.md` · `FRONTEND_MASTER_PROMPT.md` · `CODING_STANDARDS.md`

---

## 1. Architecture Overview

The frontend follows a **feature-based architecture** inside a Next.js 15+ App Router application. Concerns are separated into four layers:

```
┌─────────────────────────────────────────────────────────────┐
│  app/          Route segments, layouts, page entry points   │
├─────────────────────────────────────────────────────────────┤
│  features/     Domain modules (UI + hooks + services)       │
├─────────────────────────────────────────────────────────────┤
│  components/   Shared, reusable, domain-agnostic UI         │
├─────────────────────────────────────────────────────────────┤
│  lib/ services/ store/ hooks/ types/ constants/ utils/     │
│                Cross-cutting infrastructure                  │
└─────────────────────────────────────────────────────────────┘
```

### Core rules

| Rule | Source |
|------|--------|
| Feature modules are isolated and independently maintainable | `FOLDER_STRUCTURE.md` |
| No business logic inside shared UI components | `FOLDER_STRUCTURE.md` Rule 3 |
| Reusable logic lives in custom hooks | `CODING_STANDARDS.md` |
| API calls live in `services/` (feature or global) | `FRONTEND_MASTER_PROMPT.md` |
| Files use **kebab-case**; components use **PascalCase** | `CODING_STANDARDS.md` |
| Global state via Zustand; form state via React Hook Form | `FRONTEND_MASTER_PROMPT.md` |
| Max component size ~300 lines; split when exceeded | `CODING_STANDARDS.md` |

---

## 2. Route Groups (`src/app/`)

Next.js route groups organize URLs without affecting the path.

### `(public)` — Unauthenticated marketing site

| Route | File | Purpose |
|-------|------|---------|
| `/` | `(public)/page.tsx` | Landing page (11 wireframe sections) |
| `/sermons` | `(public)/sermons/page.tsx` | Public sermon library |
| `/sermons/[id]` | `(public)/sermons/[id]/page.tsx` | Sermon detail |
| `/events` | `(public)/events/page.tsx` | Public event list |
| `/events/[id]` | `(public)/events/[id]/page.tsx` | Event detail |
| `/livestream` | `(public)/livestream/page.tsx` | Public livestream viewer |
| `/about` | `(public)/about/page.tsx` | About the church |
| `/contact` | `(public)/contact/page.tsx` | Contact page |
| `/ministries` | `(public)/ministries/page.tsx` | Ministries overview |

### `(auth)` — Authentication flows

| Route | File | Purpose |
|-------|------|---------|
| `/login` | `(auth)/login/page.tsx` | Login (glass card) |
| `/register` | `(auth)/register/page.tsx` | Multi-step registration |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Password recovery request |
| `/reset-password` | `(auth)/reset-password/page.tsx` | Password reset form |

Shared layout: `(auth)/layout.tsx`

### `(dashboard)` — Authenticated application (RBAC-guarded)

| Route | File | Roles |
|-------|------|-------|
| `/dashboard` | `(dashboard)/page.tsx` | All authenticated — role redirect |
| `/dashboard/members` | `members/page.tsx` | Super Admin, Church Admin |
| `/dashboard/members/create` | `members/create/page.tsx` | Super Admin, Church Admin |
| `/dashboard/members/[id]` | `members/[id]/page.tsx` | Super Admin, Church Admin |
| `/dashboard/members/[id]/edit` | `members/[id]/edit/page.tsx` | Super Admin, Church Admin |
| `/dashboard/visitors` | `visitors/page.tsx` | Super Admin, Church Admin, Pastor |
| `/dashboard/visitors/[id]` | `visitors/[id]/page.tsx` | Super Admin, Church Admin, Pastor |
| `/dashboard/follow-up` | `follow-up/page.tsx` | Pastor, Church Admin |
| `/dashboard/follow-up/[id]` | `follow-up/[id]/page.tsx` | Pastor, Church Admin |
| `/dashboard/sermons` | `sermons/page.tsx` | Pastor, Media Team, Super Admin |
| `/dashboard/sermons/create` | `sermons/create/page.tsx` | Pastor, Super Admin |
| `/dashboard/sermons/[id]` | `sermons/[id]/page.tsx` | Pastor, Media Team, Super Admin |
| `/dashboard/sermons/[id]/edit` | `sermons/[id]/edit/page.tsx` | Pastor, Super Admin |
| `/dashboard/events` | `events/page.tsx` | Pastor, Church Admin, Super Admin |
| `/dashboard/events/calendar` | `events/calendar/page.tsx` | Pastor, Church Admin, Super Admin |
| `/dashboard/events/create` | `events/create/page.tsx` | Pastor, Church Admin, Super Admin |
| `/dashboard/events/[id]` | `events/[id]/page.tsx` | Pastor, Church Admin, Super Admin |
| `/dashboard/events/[id]/register` | `events/[id]/register/page.tsx` | Member, Visitor |
| `/dashboard/livestream` | `livestream/page.tsx` | Media Team, Pastor, Super Admin |
| `/dashboard/livestream/[id]` | `livestream/[id]/page.tsx` | Media Team, Pastor, Super Admin |
| `/dashboard/livestream/[id]/moderate` | `livestream/[id]/moderate/page.tsx` | Media Team, Pastor |
| `/dashboard/prayer` | `prayer/page.tsx` | Member, Visitor, Pastor, Super Admin |
| `/dashboard/prayer/create` | `prayer/create/page.tsx` | Member, Visitor |
| `/dashboard/prayer/[id]` | `prayer/[id]/page.tsx` | Pastor, Super Admin |
| `/dashboard/donations` | `donations/page.tsx` | Member, Visitor, Treasurer |
| `/dashboard/donations/history` | `donations/history/page.tsx` | Member, Visitor |
| `/dashboard/donations/reports` | `donations/reports/page.tsx` | Treasurer, Super Admin |
| `/dashboard/testimonies` | `testimonies/page.tsx` | Member, Pastor, Church Admin |
| `/dashboard/testimonies/create` | `testimonies/create/page.tsx` | Member |
| `/dashboard/media` | `media/page.tsx` | Media Team, Pastor, Super Admin |
| `/dashboard/media/upload` | `media/upload/page.tsx` | Media Team, Pastor, Super Admin |
| `/dashboard/scripture` | `scripture/page.tsx` | Pastor, Super Admin, Member |
| `/dashboard/scripture/archive` | `scripture/archive/page.tsx` | All authenticated |
| `/dashboard/celebrations` | `celebrations/page.tsx` | All authenticated |
| `/dashboard/notifications` | `notifications/page.tsx` | All authenticated |
| `/dashboard/analytics` | `analytics/page.tsx` | Role-scoped per `BUSINESS_RULES.md` |
| `/dashboard/settings` | `settings/page.tsx` | Super Admin |
| `/dashboard/users` | `users/page.tsx` | Super Admin |
| `/dashboard/users/[id]` | `users/[id]/page.tsx` | Super Admin |
| `/dashboard/users/roles` | `users/roles/page.tsx` | Super Admin |

Shared layout: `(dashboard)/layout.tsx` (sidebar + topbar + mobile bottom nav)

### Root app files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root HTML shell, font loading, global providers |
| `app/globals.css` | Tailwind directives, CSS variables, design tokens |
| `app/not-found.tsx` | 404 page |
| `app/error.tsx` | Global error boundary |
| `app/loading.tsx` | Global loading UI |

---

## 3. Feature Modules (`src/features/`)

Each feature follows the same internal contract:

```
features/<name>/
├── components/     Feature-specific UI (PascalCase components)
├── hooks/          Data fetching & state hooks (use-<name>.ts)
├── services/       API calls (<name>-service.ts)
├── schemas/        Zod validation schemas
├── types/          TypeScript interfaces & types
├── utils/          Feature-specific helpers
└── index.ts        Public barrel export
```

### Phase 1 feature map

| Feature folder | Phase | Domain responsibility |
|----------------|-------|----------------------|
| `auth/` | 1 | Login, register, JWT session, password flows |
| `members/` | 1 | Member CRUD, profiles, search, directory |
| `visitors/` | 1 | Visitor registration and tracking |
| `follow-up/` | 1 | Visitor follow-up workflow and status |
| `sermons/` | 1 | Sermon library, upload, publish workflow |
| `events/` | 1 | Events, calendar, RSVP, registration |
| `livestream/` | 1 | Stream viewer, chat, moderation controls |
| `prayer/` | 1 | Prayer wall, submission, status filters |
| `donations/` | 1 | Giving flow, history, treasurer reports |
| `testimonies/` | 1 | Submit, approve, featured testimonies |
| `media/` | 1 | Media library, upload queue, gallery |
| `notifications/` | 1 | In-app notification center |
| `analytics/` | 1 | Role-scoped charts and metrics |
| `daily-scripture/` | 1 | Daily verse, reflection, archive |
| `celebrations/` | 1 | Birthdays, anniversaries, milestones |
| `dashboard/` | 1 | Role-specific dashboard widgets |
| `settings/` | 1 | System settings (Super Admin) |

### Phase 2+ reserved (folders created, not implemented)

| Feature folder | Phase | Notes |
|----------------|-------|-------|
| `kids-kingdom/` | 2 | Age-based lessons and challenges |
| `bible-study/` | 2 | Study groups and discussions |
| `achievements/` | 2 | Badge system |
| `ai-assistant/` | 2 | Intelligence assistant |
| `ministries/` | 2 | Ministry department management |
| `faith-questions/` | 3 | Q&A knowledge hub |

---

## 4. Shared Components (`src/components/`)

Domain-agnostic, reusable across features. No business logic.

| Directory | Intended contents |
|-----------|-------------------|
| `ui/` | ShadCN primitives (button, input, card, dialog, etc.) |
| `forms/` | Form field wrappers, multi-step form shell |
| `tables/` | Data table shell (TanStack Table integration) |
| `charts/` | Recharts wrappers (line, bar, pie, area) |
| `cards/` | Glass cards, stat cards, metric cards |
| `dialogs/` | Confirm, delete, form dialog shells |
| `navigation/` | Sidebar, topbar, bottom nav, breadcrumbs |
| `feedback/` | Toast triggers, alert banners, status badges |
| `empty-states/` | Empty list, empty search, no-permission states |
| `loading/` | Skeleton loaders, spinners, page loaders |

---

## 5. Infrastructure Layer

### `src/layouts/`

| File | Purpose |
|------|---------|
| `public-layout.tsx` | Landing page shell (navbar, footer) |
| `auth-layout.tsx` | Centered glass auth card wrapper |
| `dashboard-layout.tsx` | Sidebar + topbar + content area |

### `src/hooks/` (global)

| File | Purpose |
|------|---------|
| `use-auth.ts` | Auth state and session helpers |
| `use-permissions.ts` | RBAC permission checks |
| `use-media-query.ts` | Responsive breakpoint detection |
| `use-debounce.ts` | Input debounce utility |
| `use-pagination.ts` | Pagination state helper |

### `src/services/` (global)

| File | Purpose |
|------|---------|
| `api-client.ts` | Axios instance, interceptors, token refresh |
| `websocket-client.ts` | Django Channels connection for live chat |

### `src/store/` (Zustand)

| File | Purpose |
|------|---------|
| `auth-store.ts` | User, tokens, role |
| `notification-store.ts` | Unread count, notification list |
| `ui-store.ts` | Sidebar collapse, mobile nav state |

### `src/providers/`

| File | Purpose |
|------|---------|
| `theme-provider.tsx` | next-themes dark mode |
| `auth-provider.tsx` | Session initialization |
| `toast-provider.tsx` | Sonner toast container |

### `src/lib/`

| File | Purpose |
|------|---------|
| `utils.ts` | cn() and shared helpers |
| `permissions.ts` | RBAC permission matrix |
| `formatters.ts` | Date, currency, number formatting |
| `validators.ts` | Shared Zod primitives |

### `src/types/`

| File | Purpose |
|------|---------|
| `api.ts` | API response envelopes (per `API_RESPONSE_STANDARDS.md`) |
| `user.ts` | User, profile types |
| `roles.ts` | Role enum and permission types |
| `pagination.ts` | Pagination meta types |

### `src/constants/`

| File | Purpose |
|------|---------|
| `routes.ts` | Route path constants |
| `roles.ts` | Role names and hierarchy |
| `colors.ts` | Design token hex values |
| `api-endpoints.ts` | `/api/v1/` endpoint paths |

### `src/utils/`

| File | Purpose |
|------|---------|
| `date.ts` | date-fns wrappers |
| `currency.ts` | Donation amount formatting |
| `storage.ts` | Token localStorage helpers |

### `src/styles/`

| File | Purpose |
|------|---------|
| `tokens.css` | CSS custom properties (colors, spacing, radii) |
| `animations.css` | Framer Motion fallback keyframes |

---

## 6. Public Assets (`public/`)

```
public/
├── images/
│   ├── logo.svg
│   ├── hero/
│   └── placeholders/
├── fonts/
└── favicon.ico
```

---

## 7. Tests (`tests/`)

Per `CODING_STANDARDS.md` — every feature requires unit and integration tests.

```
tests/
├── unit/
│   ├── hooks/
│   ├── utils/
│   └── schemas/
├── integration/
│   ├── features/
│   └── services/
└── e2e/
    ├── auth/
    ├── donations/
    └── livestream/
```

---

## 8. Root Config Files (pending implementation)

These files are **named** in the structure but not yet created. Await approval.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies (Next.js 15+, ShadCN, etc.) |
| `tsconfig.json` | TypeScript strict config |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind + design tokens |
| `postcss.config.mjs` | PostCSS pipeline |
| `components.json` | ShadCN UI config |
| `.env.example` | Environment variable template |
| `.eslintrc.json` | ESLint rules |
| `.prettierrc` | Prettier formatting |

---

## 9. Data Flow Pattern

```
Page (app/)
  └── Feature Component (features/<name>/components/)
        └── Custom Hook (features/<name>/hooks/)
              └── Service (features/<name>/services/)
                    └── API Client (services/api-client.ts)
                          └── Django REST API (/api/v1/)
```

State that crosses routes → Zustand store.
Form state → React Hook Form + Zod schema.
Server Components used where no interactivity is needed.

---

## 10. Role-Based Access

Route guards enforced in `(dashboard)/layout.tsx` via `use-permissions.ts` and `lib/permissions.ts`.

| Dashboard | Primary roles |
|-----------|---------------|
| Super Admin | Platform analytics, users, audit, settings |
| Pastor | Scripture, prayer, sermons, testimonies, livestream |
| Church Admin | Members, events, attendance, visitors, follow-up |
| Treasurer | Donations, reports, financial charts |
| Media Team | Livestream, media upload, gallery |
| Member | Scripture, events, prayer, sermons, profile |
| Visitor | Public routes + limited authenticated views |

---

## 11. Naming Conventions Summary

| Artifact | Convention | Example |
|----------|------------|---------|
| Files | kebab-case | `member-card.tsx` |
| Components | PascalCase | `MemberCard` |
| Hooks | camelCase with `use` prefix | `useMembers` |
| Variables | camelCase | `memberProfile` |
| Feature folders | kebab-case | `daily-scripture/` |
| Route segments | kebab-case | `follow-up/` |

---

## 12. Next Steps (awaiting approval)

1. Approve this folder structure
2. Generate root config files (`package.json`, `tsconfig.json`, etc.)
3. Implement design tokens and ShadCN theme
4. Build foundation providers and API client
5. Implement routes in priority order (public → auth → dashboards → modules)
