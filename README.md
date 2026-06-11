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
| **JWT (SimpleJWT)** | Authentication |
| **PostgreSQL** | Primary database |
| **Redis** | Caching & task queue |
| **Celery** | Background jobs |
| **Django Channels** | WebSockets (live chat, notifications) |
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
├── backend/                   # Django REST Framework API (planned)
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
| `/livestream` | `(public)` | Public livestream viewer |
| `/login` | `(auth)` | Login |
| `/register` | `(auth)` | Member registration |
| `/forgot-password` | `(auth)` | Password recovery |
| `/reset-password` | `(auth)` | Password reset |
| `/dashboard` | `(dashboard)` | Dashboard home (role-redirected) |
| `/dashboard/members` | `(dashboard)` | Member management |
| `/dashboard/sermons` | `(dashboard)` | Sermon library |
| `/dashboard/events` | `(dashboard)` | Event management |
| `/dashboard/donations` | `(dashboard)` | Donations & finance |
| `/dashboard/prayer` | `(dashboard)` | Prayer center |
| `/dashboard/analytics` | `(dashboard)` | Analytics & reports |
| `/dashboard/settings` | `(dashboard)` | System settings |

---

## 👥 User Roles

| Role | Access Level |
|---|---|
| **Super Admin** | Full platform access, users, audit, settings |
| **Pastor** | Scripture, prayer, sermons, testimonies, livestream |
| **Church Admin** | Members, events, attendance, visitors, follow-up |
| **Treasurer** | Donations, reports, financial charts |
| **Media Team** | Livestream, media upload, gallery |
| **Member** | Scripture, events, prayer, sermons, profile |
| **Visitor** | Public routes + limited authenticated views |

---

## 🎨 Design System

- **Theme:** Dark mode by default
- **Aesthetic:** Glassmorphism + neon interaction effects
- **Animations:** Framer Motion throughout
- **Typography:** Inter, Plus Jakarta Sans, JetBrains Mono (Google Fonts)
- **Approach:** Mobile-first, accessibility-first

---

## 🏗️ Feature Modules

### Phase 1 (In Development)
- ✅ Authentication & RBAC
- ✅ Member Management
- ✅ Sermon Management
- ✅ Event Management
- ✅ Livestream Center
- ✅ Donations & Finance
- ✅ Prayer Center
- ✅ Testimonies
- ✅ Media Center
- ✅ Notifications
- ✅ Analytics
- ✅ Daily Scripture
- ✅ Celebrations Widget
- ✅ Visitor Follow-Up

### Phase 2 (Planned)
- ⬜ Kids Kingdom
- ⬜ Bible Study Groups
- ⬜ Achievement Badges
- ⬜ AI Assistant
- ⬜ Ministries Management

### Phase 3 (Future)
- ⬜ Faith Questions Hub
- ⬜ Multi-Church Support
- ⬜ Mobile Applications
- ⬜ WhatsApp Integration
- ⬜ SMS Gateway

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
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

### Backend Setup _(coming soon)_

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
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
