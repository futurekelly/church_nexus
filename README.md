# ⛪ Church Nexus — Church Management Ecosystem

> A modern, scalable, and intelligent church management platform built to digitally connect church leadership, members, visitors, ministries, media teams, and financial departments through a single unified ecosystem.

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Django](https://img.shields.io/badge/Django-5+-green?style=flat-square&logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 🌟 Vision

To create a modern, secure, intelligent, and community-driven Church Management Ecosystem that streamlines church operations, improves communication, strengthens member engagement, supports spiritual growth, and provides data-driven decision-making tools for church leadership — serving small congregations up to large multi-campus ministries.

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 15+** | App Router, SSR, SSG |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **ShadCN UI** | Accessible component library |
| **Framer Motion** | Smooth animations |
| **Zustand** | Global state management |
| **React Hook Form + Zod** | Form handling & validation |
| **Recharts** | Analytics charts |
| **Lucide React** | Icon set |

### Backend
| Technology | Purpose |
|---|---|
| **Django 5+** | Web framework |
| **Django REST Framework** | RESTful API |
| **SimpleJWT** | Secure JWT Authentication & Refresh token workflow |
| **PostgreSQL** | Primary relational database |
| **Redis** | Caching, task broker, and WebSockets broker |
| **Celery** | Asynchronous task queue for email routing |
| **Django Channels** | WebSockets (live notifications) |
| **Swagger / OpenAPI** | API documentation |

### Deployment
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting |
| **Railway** | Backend hosting |
| **PostgreSQL** | Managed database |
| **Redis** | Managed cache |
| **GitHub Actions** | CI/CD pipelines |
| **Nginx** | Reverse proxy |

---

## 📁 Project Structure

```
church_saas/
├── frontend/                  # Next.js 15 App Router application
│   └── src/
│       ├── app/               # Route segments & layouts
│       │   ├── (public)/      # Public marketing site → /
│       │   ├── (auth)/        # Auth flows → /login, /register …
│       │   └── (dashboard)/   # Protected app → /dashboard/…
│       ├── features/          # Domain feature modules
│       ├── components/        # Shared UI components
│       ├── layouts/           # Shell layouts (public, auth, dashboard)
│       ├── hooks/             # Global custom hooks
│       ├── services/          # API client & WebSocket client
│       ├── store/             # Zustand stores
│       ├── providers/         # React context providers
│       ├── lib/               # Utilities & permission matrix
│       ├── types/             # TypeScript interfaces
│       ├── constants/         # Routes, roles, API endpoints
│       └── styles/            # CSS tokens & animation keyframes
├── backend/                   # Django REST Framework API
│   ├── authentication/        # User accounts, RBAC, Celery tasks, email logs
│   ├── branches/              # Branch / campus management
│   ├── donations/             # Financial donations ledger & lifecycle hooks
│   ├── events/                # Scheduling & event models
│   ├── finance/               # Double-entry ledger systems
│   └── church_nexus/          # Project configurations & settings
├── docs/                      # Architecture & API documentation
└── docker/                    # Docker compose config
```

---

## 🚦 App Routes

| Route | Group | Description |
|---|---|---|
| `/` | `(public)` | Landing page |
| `/about` | `(public)` | About the church |
| `/contact` | `(public)` | Contact page |
| `/ministries` | `(public)` | Public ministries directory |
| `/livestream` | `(public)` | Public livestream viewer |
| `/login` | `(auth)` | Login |
| `/register` | `(auth)` | Member registration |
| `/forgot-password` | `(auth)` | Password recovery request |
| `/reset-password` | `(auth)` | Secure password reset confirmation |
| `/dashboard` | `(dashboard)` | Dashboard home (role-redirected) |
| `/dashboard/members` | `(dashboard)` | Congregation management & role transitions |
| `/dashboard/sermons` | `(dashboard)` | Sermon library |
| `/dashboard/events` | `(dashboard)` | Event scheduling & tracking |
| `/dashboard/celebrations` | `(dashboard)` | Birthdays, anniversaries, and milestones |
| `/dashboard/scripture` | `(dashboard)` | Daily scripture & devotional editor |
| `/dashboard/donations` | `(dashboard)` | Donations & financial analytics |
| `/dashboard/prayer` | `(dashboard)` | Prayer requests center |
| `/dashboard/users` | `(dashboard)` | Platform administrator user profiles |
| `/dashboard/analytics` | `(dashboard)` | Interactive KPI graphs & reports |
| `/dashboard/settings` | `(dashboard)` | System configurations (branches, payments, localization) |

---

## 👥 User Roles

| Role | Access Level |
|---|---|
| **Super Admin** | Full platform access, users, audit logs, system settings |
| **Pastor** | Devotionals, scripture, prayer, sermons, testimonies, livestream |
| **Church Admin** | Members, events, attendance, visitors, follow-up queues |
| **Treasurer** | Donations, ledger books, financial charts |
| **Media Team** | Livestream settings, media upload, gallery assets |
| **Member** | Daily devotionals, events register, prayer wall, sermons, profile |
| **Visitor** | Public marketing pages + limited authenticated views |

---

## 🎨 Design System

- **Theme:** Dark mode by default
- **Aesthetic:** Glassmorphism + neon interaction effects
- **Animations:** Framer Motion throughout
- **Typography:** Inter, Plus Jakarta Sans, JetBrains Mono (Google Fonts)
- **Approach:** Mobile-first, accessibility-first, zero layout hydration mismatches

---

## 🏗️ Completed Milestone Features

### 1. Authentication & RBAC
- Secure login, register, and refresh token exchange using SimpleJWT.
- Advanced role-based permissions client-side and backend authorization.
- Password recovery request and tokenized confirmations.

### 2. Members & Visitor approval
- Complete congregation lifecycle tracking.
- Visitor role transitions with audit updates and automated welcome notification triggers.

### 3. Financial Ledger & Donations
- Donations ledger tracks currency, branch, donor profile, and transaction references.
- Double-entry accounting registers in `finance` module verifying ledger balance automatically.
- Custom campaign tracking and active pledge meters.

### 4. Asynchronous SMTP Notifications (Phase 1)
- Celery-driven, non-blocking email notifications utilizing a resilient retry policy (exponential backoff).
- Full database auditing using `EmailLog` models to track `PENDING`, `SENT`, and `FAILED` email attempts with errors.
- Prevent duplicate receipts using validation blocks.
- Customized responsive HTML/plaintext email layouts for:
  - **Password Reset Link**
  - **Visitor Registration Alert** (to Church Admins)
  - **Visitor Approval Welcome** (to Members)
  - **Donation Receipt** (triggered on Completed status)

### 5. Bilingual Support (Phase 2)
- English and Swahili (`en.json` and `sw.json`) dictionary catalogs with 100% key parity (197 keys).
- Custom client-side `TranslationProvider` and `useTranslation` hook supporting runtime language switching.
- Language selection is persisted in `localStorage` under `"church-settings-localization"`.
- Server-side pre-render protection preventing hydration warning mismatch.
- Support for fallback language defaults (to English) and development-only missing-key warning reports.
- Localization settings kept separate from system currency configurations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 16+
- Redis 7+

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at: **http://localhost:3000**

### Backend Setup

1. Configure Python virtual environment:
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit backend/.env to configure database and SMTP credentials.
```

4. Run migrations, seed test data, and launch Django:
```bash
python manage.py migrate
python manage.py runserver
```

5. Run Celery Worker (in a separate terminal inside virtual environment):
```bash
celery -A church_nexus worker -l info
```

Backend API at: **http://localhost:8000/api/v1/**

---

## 🤝 Development Team

| Name | Role | Email |
|---|---|---|
| **Sir. Kelvin Mbise** | Lead Developer & Architect | futurekelly360@gmail.com |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

Built with faith, purpose, and a vision to serve the local church through technology.

> *"And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus."* — Colossians 3:17
