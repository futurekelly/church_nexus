# 📋 Project Walkthrough — Church Nexus
> **Living Document** — Updated as the project progresses.
> Last Updated: 2026-06-13

---

## 🗺️ Overall Project Status

| Phase | Area | Status |
|---|---|---|
| Architecture & Planning | Documentation | ✅ Complete |
| Frontend Scaffold | Next.js App Router | ✅ Complete |
| Frontend — Public Routes | Landing, About, Contact, Sermons, Events | ✅ Complete |
| Frontend — Auth Flows | Login, Register, Password flows | ✅ Complete |
| Frontend — Dashboard Shell | Layout, sidebar, topbar, RBAC | ✅ Complete |
| Frontend — Feature Modules | Members, Events, Sermons | ✅ Complete |
| Frontend — Feature Modules | Prayer Requests | ✅ Complete |
| Frontend — Feature Modules | Attendance | ✅ Complete |
| Frontend — Feature Modules | Visitor Follow-up | ✅ Complete |
| Frontend — Feature Modules | Donations | 🔄 Active Module |
| Backend — Django API | All services | ⬜ Not Started |
| Database | PostgreSQL schema | ⬜ Not Started |
| CI/CD | GitHub Actions | ⬜ Not Started |
| Deployment | Vercel + Railway | ⬜ Not Started |

---

## ✅ COMPLETED

### 📄 Architecture & Documentation
- [x] `PROJECT_VISION.md` — Vision statement, objectives, target users
- [x] `ROLE_SYSTEM.md` — 7 user roles and permission hierarchy
- [x] `UI_GUIDELINES.md` — Design system, glassmorphism, dark theme rules
- [x] `DATABASE_SCHEMA.md` — Complete relational schema design
- [x] `DATABASE_ERD.md` — Entity relationship diagram
- [x] `API_STRUCTURE.md` — REST API endpoint design
- [x] `API_RESPONSE_STANDARDS.md` — Standardized response envelopes
- [x] `FEATURE_MAP.md` — All 20 feature modules documented
- [x] `SYSTEM_ARCHITECTURE.md` — Full distributed system design
- [x] `BUSINESS_RULES.md` — Business logic and constraints
- [x] `CODING_STANDARDS.md` — Naming conventions and code rules
- [x] `FOLDER_STRUCTURE.md` — Monorepo layout specification
- [x] `WIREFRAMES.md` — UI wireframes for all major screens
- [x] `FRONTEND_ARCHITECTURE.md` — Next.js App Router design
- [x] `GLOBAL_ARCHITECTURE.md` — End-to-end architecture overview
- [x] `DEPLOYMENT_MASTER_PROMPT.md` — Deployment strategy
- [x] `BACKEND_MASTER_PROMPT.md` — Django backend standards
- [x] `FRONTEND_MASTER_PROMPT.md` — Next.js frontend standards
- [x] `PROJECT_STRUCTURE_AUDIT.md` — Code structure, naming collision, and visitor gating audit

---

### 🖥️ Frontend — Project Bootstrap & Core Layouts
- [x] Next.js 15 initialized with TypeScript and App Router
- [x] Tailwind CSS configured with design tokens
- [x] ShadCN UI installed and configured
- [x] Google Fonts loaded (Inter, Plus Jakarta Sans, JetBrains Mono)
- [x] `globals.css` with CSS custom properties
- [x] Root `app/layout.tsx` with AppProviders, font variables
- [x] `app/not-found.tsx` — 404 page
- [x] `app/error.tsx` — Global error boundary
- [x] `app/loading.tsx` — Global loading state
- [x] `(public)/layout.tsx` → wraps `PublicLayout`
- [x] `(auth)/layout.tsx` → wraps `AuthLayout`
- [x] `(dashboard)/layout.tsx` → wraps `DashboardLayout`

---

### 🔐 Auth Flows & Security (`features/auth/`)
- [x] Centered glassmorphic auth cards for credentials forms
- [x] Zustand `auth-store.ts` — persistent reactive user role state
- [x] `use-auth.ts` hook gating auth sessions
- [x] Credentials login page (`/login`)
- [x] Credentials registration page (`/register`)
- [x] Forgot password and reset password views (`/forgot-password`, `/reset-password`)
- [x] Middleware route protection guard (`src/middleware.ts`)

---

### 📊 Dashboard Shell & Navigation (`features/dashboard/`)
- [x] Responsive layout with collapsible sidebar and headers
- [x] Custom topbar with notification drop-downs and user profiles
- [x] Mobile bottom navigators
- [x] Role-scoped dashboard homes (`SuperAdminHome`, `PastorHome`, `ChurchAdminHome`, etc.)
- [x] `use-permissions.ts` + `lib/permissions.ts` role-based access controllers (RBAC)

---

### 👥 Members Module (`features/members/`)
- [x] Paginated grid/list directory of members with search & filtering
- [x] Member profile overview sheet with activity history log
- [x] Create and Edit member sheets built with `react-hook-form` and validation powered by `zod`

---

### 📅 Events Module (`features/events/`)
- [x] Monthly calendar dashboard grid view with responsive day listings
- [x] Detailed event layout sheets showing host, venue logistics, occupancy progress bars, and attendee logs
- [x] Confirm RSVP registration dialogs gated to members only (visitors blocked)
- [x] Create and Edit forms generating deterministic vector covers

---

### 🎙️ Sermons Module (`features/sermons/`)
- [x] Spotlight Hero banner displaying the latest featured message
- [x] Audio/Video multi-tab player with active equalizer graphics
- [x] Study guide notes viewer with copy, outline markdown formatting, and PDF download loading animations
- [x] Create and Edit form inputs managing featured status exclusions and gradient covers

---

### 🌐 Public Route Archiving (`(public)/`)
- [x] `/` — Landing page with section headers updated to resolve naming collisions
- [x] `/about` & `/contact` — Public informational pages
- [x] `/livestream` — Public broadcast broadcast viewer
- [x] `/sermons` & `/sermons/[id]` — Public messages catalog displaying only Published sermons, hiding status dropdowns
- [x] `/events` & `/events/[id]` — Public events listing showing Published schedules, locking RSVPs behind login notices
- [x] `/dashboard/prayer` — Main library catalog of prayer requests with stats indicators, search, filtering, and sort controls
- [x] `/dashboard/prayer/create` — Form to submit a new prayer request with options for anonymous posting
- [x] `/dashboard/prayer/[id]` — Detail view with dynamic intercessory prayer logs, heart buttons, and pastor update panels
- [x] `/dashboard/prayer/[id]/edit` — Form to edit a prayer request

---

### 🙏 Prayer Center Module (`features/prayer/`)
- [x] Implement the public prayer wall and requests catalog
- [x] Build submit requests form supporting anonymous toggles
- [x] Add Pastor status management controls (Approve, Archive, pray count)

---

### 📊 Attendance Module (`features/attendance/`)
- [x] Create Attendance Session builder (for events or Sunday services)
- [x] Implement simulated QR/Barcode check-in panel and manual search checklist
- [x] Develop dashboard widgets, stats aggregates, and member detail logs

---

### 👁️ Visitor Follow-Up (`features/follow-up/`)
- [x] Visitor registration and directory tracking with custom guest backgrounds
- [x] Kanban Pipeline Dashboard with status progression click-to-move tools
- [x] Contact Touchpoint History logs with details logging modals
- [x] Attendance Absentee log ticket auto-ingestion bridges
- [x] Confirmation dialog active member transitions auto-registering members

---

## 🔄 IN PROGRESS

### 💰 Donations (`features/donations/`)
- [ ] Giving flow (one-time & recurring)
- [ ] Donation history for members
- [ ] Treasurer reports & charts
- [ ] Receipt generation

---

## ⬜ TODO — FRONTEND

### 📡 Livestream (`features/livestream/`)
- [ ] Livestream viewer dashboard integration
- [ ] Live chat panel (WebSocket)
- [ ] Moderation controls
- [ ] Stream analytics

### 📢 Testimonies (`features/testimonies/`)
- [ ] Testimony wall
- [ ] Submit testimony form
- [ ] Approval workflow (Church Admin)
- [ ] Featured testimonies section

### 🔔 Notifications (`features/notifications/`)
- [ ] Notification center page
- [ ] Unread badge (topbar)
- [ ] Real-time delivery (Django Channels)

### 📈 Analytics (`features/analytics/`)
- [ ] Member growth chart
- [ ] Attendance trend chart
- [ ] Donation trend chart
- [ ] Role-scoped dashboard widgets

### 📖 Daily Scripture (`features/daily-scripture/`)
- [ ] Daily verse display
- [ ] Scripture reflection
- [ ] Archive page

### 🎉 Celebrations (`features/celebrations/`)
- [ ] Birthdays widget
- [ ] Anniversaries widget
- [ ] Membership milestones

### 🖼️ Media Center (`features/media/`)
- [ ] Media library (video, image, audio, docs)
- [ ] Upload queue
- [ ] Gallery view

### ⚙️ Settings (`features/settings/`)
- [ ] Church profile settings
- [ ] User management (Super Admin)
- [ ] Role assignment UI
- [ ] System configuration

---

## ⚠️ Technical Debt & Future Improvements

- **Equalizer Render Calculation Mismatch**:
  `sermon-media-player.tsx` calculates randomized height styles and animation delays inline using `Math.random()`. This can cause React hydration warnings during Server-Side Rendering (SSR). In the future, this should be moved inside a `useEffect` hook to execute solely on the client, or handled entirely using CSS keyframe rules.
- **Lazy Local Storage State Initialization**:
  The core hook managers `useEvents` and `useSermons` parse JSON from Local Storage synchronously on initial mount. For larger datasets, this can block the main thread. State initialization should be converted to use lazy initializers:
  ```typescript
  const [sermons, setSermons] = useState(() => getInitialSermons());
  ```
  Persisted changes should also utilize debounced write cycles to improve react render efficiency.

---

## 🗓️ Development Phases

### Phase 1 — MVP (Current Focus)
> Goal: Working full-stack church management system for a single church.

1. Complete public landing page (Completed)
2. Implement auth flows (Completed)
3. Build dashboard shell (Completed)
4. Implement core modules: members, sermons, events, prayer (Completed), attendance (In Progress), donations
5. Launch Django backend with all Phase 1 APIs
6. Deploy to Vercel + Railway

### Phase 2 — Enrichment
- Kids Kingdom
- Bible Study Groups
- Achievement Badges
- AI Assistant
- Ministries Management

### Phase 3 — Scale
- Multi-church support
- Mobile applications (React Native)
- WhatsApp integration
- SMS gateway
- Regional administration

---

## 🧑‍💻 Dev Team

| Name | Role | Email |
|---|---|---|
| **Sir. Kelvin Mbise** | Lead Developer & Architect | futurekelly360@gmail.com |

---

*This document is updated after every significant milestone. Do not delete — it serves as the project's source of truth for progress tracking.*
