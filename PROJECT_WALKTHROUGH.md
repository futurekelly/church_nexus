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
| Frontend — Feature Modules | Donations | ✅ Complete |
| Frontend — Feature Modules | Livestream | 🔄 Active Module |
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

> [!NOTE]
> **Backend Upgrade Candidate**: Auth session state is stored client-side in `localStorage` under the key `church-auth-storage`. Requires integration with backend JWT endpoints.

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

> [!NOTE]
> **Backend Upgrade Candidate**: Member catalog lists and updates are simulated in client state using `localStorage` (key: `church-mock-members`).

---

### 📅 Events Module (`features/events/`)
- [x] Monthly calendar dashboard grid view with responsive day listings
- [x] Detailed event layout sheets showing host, venue logistics, occupancy progress bars, and attendee logs
- [x] Confirm RSVP registration dialogs gated to members only (visitors blocked)
- [x] Create and Edit forms generating deterministic vector covers

> [!NOTE]
> **Backend Upgrade Candidate**: Event records and RSVP lists are persisted locally via `localStorage` (keys: `church-mock-events`, `church-event-registrations`).

---

### 🎙️ Sermons Module (`features/sermons/`)
- [x] Spotlight Hero banner displaying the latest featured message
- [x] Audio/Video multi-tab player with active equalizer graphics
- [x] Study guide notes viewer with copy, outline markdown formatting, and PDF download loading animations
- [x] Create and Edit form inputs managing featured status exclusions and gradient covers

> [!NOTE]
> **Backend Upgrade Candidate**: Sermons list is persisted locally via `localStorage` (key: `church-mock-sermons`).

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

> [!NOTE]
> **Backend Upgrade Candidate**: Prayer center requests, intercession counts, and response updates are persisted locally via `localStorage` (key: `church-mock-prayers`).

---

### 📊 Attendance Module (`features/attendance/`)
- [x] Create Attendance Session builder (for events or Sunday services)
- [x] Implement simulated QR/Barcode check-in panel and manual search checklist
- [x] Develop dashboard widgets, stats aggregates, and member detail logs

> [!NOTE]
> **Backend Upgrade Candidate**: Check-in logs, sessions, and follow-up tickets are saved locally via `localStorage` (keys: `church-mock-attendance-sessions`, `church-mock-attendance-records`, `church-attendance-follow-up-tickets`).

---

### 👁️ Visitor Follow-Up (`features/follow-up/`)
- [x] Visitor registration and directory tracking with custom guest backgrounds
- [x] Kanban Pipeline Dashboard with status progression click-to-move tools
- [x] Contact Touchpoint History logs with details logging modals
- [x] Attendance Absentee log ticket auto-ingestion bridges
- [x] Confirmation dialog active member transitions auto-registering members

> [!NOTE]
> **Backend Upgrade Candidate**: Follow-up pipeline queues, log histories, and visitor records are persisted locally via `localStorage` (keys: `church-mock-visitors`, `church-follow-up-tickets`, `church-visitor-contact-logs`).

---

### 💰 Donations (`features/donations/`)
- [x] Public online giving form (`/give`) supporting card and M-Pesa push triggers, anonymous checking, and automated member linking.
- [x] Financial Ledger lists with search and category filters in Tanzanian Shillings (TZS).
- [x] Printable receipt invoices with browser dialog triggers.
- [x] Area and Pie graphs demonstrating contribution trend lines.

> [!NOTE]
> **Backend Upgrade Candidate**: Donation ledger records, pledge campaigns, and issued receipt IDs are saved locally via `localStorage` (keys: `church-mock-donations`, `church-mock-pledges`, `church-mock-receipts`).

---

## 🔄 IN PROGRESS

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
4. Implement core modules: members, sermons, events, prayer, attendance, visitor follow-up, donations (Completed)
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

## 🚀 Production Readiness Backlog & Upgrades

### 1. Production Readiness Backlog
To transition from the current simulated frontend to a production-ready application, the following tasks must be completed:
- [ ] **Unit & Integration Testing**: Implement Jest/React Testing Library tests for core state hooks (`useAuth`, `useMembers`, `useDonations`) and form validations.
- [ ] **E2E Testing**: Add Playwright test suites for critical user journeys (Auth logins, member check-in flows, donation checkouts).
- [ ] **Security Hardening**: Implement input sanitization (DOMPurify), helmet headers (via Next.js headers config), and CSP (Content Security Policy).
- [ ] **Containerization**: Create a multi-stage `Dockerfile` and `docker-compose.yml` for local production-simulation runs.
- [ ] **Continuous Integration (CI/CD)**: Configure GitHub Actions pipelines to run linting, type checks, testing, and automated Vercel preview deployments.

### 2. Backend Upgrade Candidates (LocalStorage Migrations)
The following tables map simulated `localStorage` schemas to their future Django REST API endpoints:

| Feature / Module | Simulated LocalStorage Keys | Target REST API Endpoints | Migration Notes |
| :--- | :--- | :--- | :--- |
| **Authentication** | `church-auth-storage` | `POST /api/v1/auth/token/`<br>`POST /api/v1/auth/token/refresh/` | Switch Zustand store from local persistence to memory, reading JWT cookies. |
| **Members** | `church-mock-members` | `GET /api/v1/members/`<br>`POST /api/v1/members/` | Paginate responses on server-side. Map fields to Django PostgreSQL backend. |
| **Events** | `church-mock-events`, `church-event-registrations` | `GET /api/v1/events/`<br>`POST /api/v1/events/<id>/rsvp/` | Restrict RSVPs based on database token-verified membership status. |
| **Sermons** | `church-mock-sermons` | `GET /api/v1/sermons/`<br>`POST /api/v1/sermons/` | Integrate media file hosting paths (AWS S3) and CDN streaming distribution. |
| **Prayer Center** | `church-mock-prayers` | `GET /api/v1/prayers/`<br>`POST /api/v1/prayers/` | Implement backend approving logic. Rate limit public prayer requests submits. |
| **Attendance** | `church-mock-attendance-sessions`, `church-mock-attendance-records` | `POST /api/v1/attendance/checkin/` | Generate secure single-use QR payload hashes on the backend. |
| **Visitor Follow-Up** | `church-mock-visitors`, `church-follow-up-tickets`, `church-visitor-contact-logs` | `GET /api/v1/followups/`<br>`POST /api/v1/followups/logs/` | Integrate email/SMS microservices (Twilio/SendGrid) for automated contact triggers. |
| **Donations** | `church-mock-donations`, `church-mock-pledges`, `church-mock-receipts` | `POST /api/v1/donations/charge/`<br>`GET /api/v1/donations/receipts/<id>/` | Integrate Stripe/M-Pesa payment gateways. Generate cryptographically signed receipts. |

### 3. Future Document Generation & Automation
Roadmap for PDF generation and automated badge issuance:
- [ ] **Membership Cards**: ID card with member photo, membership number, and join date.
- [ ] **Visitor Welcome Cards**: Automated personalized welcome postcards printable for follow-up team distributions.
- [ ] **Event Badges**: Thermal-printable labels with attendee names and event barcodes for entry checkpoints.
- [ ] **Donation Receipts PDF**: Formal PDF printable receipts generated server-side with digital signatures and tax-exemption metadata.
- [ ] **Certificates**: Automatically generated Baptism, Wedding, Child Dedication, and Membership milestones certificates.
- [ ] **QR-based IDs**: Static and dynamic QR credentials displayed in member profiles for rapid check-ins.

### 4. Schema Localisation & Branch Extensions
Proposed strategy for integrating localization, internationalization, and multi-tenant branches with minimal refactoring:
- **Tenant / Branch Support**:
  - Add `branch_id: string (UUID)` attribute to core schemas: `User`, `Member`, `DonationRecord`, `AttendanceSession`, and `Event`.
  - Filter all queries on the client or server wrapper by default based on the authenticated user's current `branch_id`.
- **Localization Profile (Country, Currency, Language)**:
  - Extend settings models with `country_code` (e.g. `TZ`), `currency` (e.g. `TZS`), and `preferred_language` (e.g. `sw` or `en`).
  - Centralize display helpers (like `formatTZS` and date formatting) to read from a unified `useLocalization` hook rather than hardcoded locales.
- **International Phone Standard**:
  - Update all input forms to enforce strict E.164 formats (`+` followed by country code and numbers, e.g. `+255754000000`).
  - Validate values using standard zod validators `z.string().regex(/^\+[1-9]\d{1,14}$/)`.

---

## 🧑‍💻 Dev Team

| Name | Role | Email |
|---|---|---|
| **Sir. Kelvin Mbise** | Lead Developer & Architect | futurekelly360@gmail.com |

---

*This document is updated after every significant milestone. Do not delete — it serves as the project's source of truth for progress tracking.*
