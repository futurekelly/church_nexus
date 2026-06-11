# 🤖 AI_CONTEXT — Church Nexus Project Intelligence Layer

This directory is the **single source of truth** for all AI coding agents, contributors, and automated tools working on the Church Nexus platform.

> **Rule:** Before generating any code, architecture, API, database schema, or deployment configuration — read every document in this directory.

---

## 📋 Document Index

### 🏛️ Master Prompts (Read First)

| File | Purpose |
|---|---|
| [MASTER_PROJECT_PROMPT.md](./MASTER_PROJECT_PROMPT.md) | Project identity, vision, rules, success criteria |
| [FRONTEND_MASTER_PROMPT.md](./FRONTEND_MASTER_PROMPT.md) | Frontend architecture, design system, component rules |
| [BACKEND_MASTER_PROMPT.md](./BACKEND_MASTER_PROMPT.md) | Django API rules, service architecture, security |
| [DEPLOYMENT_MASTER_PROMPT.md](./DEPLOYMENT_MASTER_PROMPT.md) | Vercel + Railway + CI/CD deployment standards |

---

### 🎯 Project Foundation

| File | Purpose |
|---|---|
| [PROJECT_VISION.md](./PROJECT_VISION.md) | Vision statement, objectives, target users, design philosophy |
| [ROLE_SYSTEM.md](./ROLE_SYSTEM.md) | 7 user roles, permissions, and restrictions |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | System-wide business rules — overrides all assumptions |
| [FEATURE_MAP.md](./FEATURE_MAP.md) | All 20 feature modules across 3 phases |

---

### 🏗️ Architecture & Design

| File | Purpose |
|---|---|
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | Full distributed system design — frontend ↔ API ↔ DB |
| [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) | Monorepo layout — frontend, backend, docs |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Naming conventions, file limits, code quality rules |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Design tokens, glassmorphism, animations, color system |
| [WIREFRAMES.md](./WIREFRAMES.md) | Screen layouts for all pages and dashboards |

---

### 🗄️ Data & API

| File | Purpose |
|---|---|
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Full relational database schema |
| [DATABASE_ERD.md](./DATABASE_ERD.md) | Entity relationship diagram |
| [API_STRUCTURE.md](./API_STRUCTURE.md) | REST API endpoint design |
| [API_RESPONSE_STANDARDS.md](./API_RESPONSE_STANDARDS.md) | Standardized API response envelopes |

---

### 📊 Progress Tracking

| File | Purpose |
|---|---|
| [CURRENT_PROGRESS.md](./CURRENT_PROGRESS.md) | Project phase status and feature checklist |

---

## ⚡ Priority Order for Conflicts

When documents conflict, this hierarchy applies:

```
BUSINESS_RULES.md
      ↓
FEATURE_MAP.md
      ↓
DATABASE_SCHEMA.md
      ↓
WIREFRAMES.md
```

## 🚫 AI Agent Rules

- **Never** invent features not in `FEATURE_MAP.md`
- **Never** invent roles not in `ROLE_SYSTEM.md`
- **Never** create database tables not in `DATABASE_SCHEMA.md`
- **Never** ignore wireframes
- **Always** follow `CODING_STANDARDS.md` naming conventions
- **Always** treat accessibility as a requirement, not enhancement
- **When uncertain** — ask for clarification

---

*Maintained by: Sir. Kelvin Mbise (futurekelly360@gmail.com)*
