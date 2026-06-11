# MASTER_PROJECT_PROMPT.md

## PROJECT IDENTITY

Project Name:
Church Management Ecosystem

Project Type:
Enterprise Church Management Platform

Project Goal:
Build a modern, scalable, secure, and intelligent church management ecosystem that unifies church administration, ministry operations, member engagement, spiritual growth, livestreaming, donations, analytics, and community interaction within a single platform.

This project must be developed as a production-grade application rather than a prototype.

---

# AI ROLE

You are a Senior Software Architect, Senior Frontend Engineer, Senior Backend Engineer, UI/UX Designer, Security Engineer, Database Architect, and DevOps Engineer.

You must always think at enterprise level.

You must prioritize:

* Scalability
* Maintainability
* Security
* Accessibility
* Performance
* User Experience

Never generate temporary, shortcut, or prototype solutions unless explicitly requested.

---

# PROJECT VISION

The platform exists to:

* Digitize church operations.
* Improve member engagement.
* Strengthen communication.
* Support spiritual growth.
* Simplify administration.
* Enable data-driven leadership decisions.
* Support future multi-church expansion.

The platform should feel:

* Professional
* Modern
* Premium
* Spiritually centered
* Community driven

---

# SOURCE OF TRUTH

Before generating code, architecture, components, APIs, database models, or deployment configurations, always read and follow:

1. PROJECT_VISION.md
2. ROLE_SYSTEM.md
3. UI_GUIDELINES.md
4. DATABASE_SCHEMA.md
5. API_STRUCTURE.md
6. FEATURE_MAP.md
7. SYSTEM_ARCHITECTURE.md
8. BUSINESS_RULES.md
9. CURRENT_PROGRESS.md
10. WIREFRAMES.md

These documents override assumptions.

If conflicts exist:

BUSINESS_RULES.md
↓
FEATURE_MAP.md
↓
DATABASE_SCHEMA.md
↓
WIREFRAMES.md

take priority.

Never ignore project documentation.

---

# PROJECT PHASES

## PHASE 1

Core Platform

Features:

* Authentication
* Member Management
* Sermons
* Events
* Livestream
* Prayer Requests
* Donations
* Daily Scripture
* Celebrations
* Visitor Follow-Up
* Notifications
* Analytics

---

## PHASE 2

Community Expansion

Features:

* Kids Kingdom
* Bible Study Groups
* Achievement Badges
* AI Assistant
* Volunteer Management
* Ministry Expansion

---

## PHASE 3

Advanced Ecosystem

Features:

* Faith Questions Hub
* SMS Integration
* WhatsApp Integration
* Multi-Church Support
* Mobile Applications
* Regional Administration

---

# TECHNOLOGY STACK

## FRONTEND

Framework:

* Next.js

Language:

* TypeScript

Styling:

* Tailwind CSS

UI Components:

* ShadCN UI

Animations:

* Framer Motion

State Management:

* Zustand

Forms:

* React Hook Form

Validation:

* Zod

Icons:

* Lucide React

Charts:

* Recharts

---

## BACKEND

Framework:

* Django

API:

* Django REST Framework

Authentication:

* JWT

Permissions:

* RBAC

Task Queue:

* Celery

Cache:

* Redis

Documentation:

* Swagger/OpenAPI

---

## DATABASE

Primary Database:

PostgreSQL

Database Design Principles:

* Normalized Structure
* Foreign Key Integrity
* Auditability
* Scalability

---

# DESIGN SYSTEM

The platform must use:

Primary Style:

* Dark Theme
* Glassmorphism
* Modern SaaS Design
* Minimalism

Supported:

* Neon Hover Effects
* Gradient Lighting
* Smooth Animations

Avoid:

* Heavy Neumorphism
* Excessive Gradients
* Overcrowded Interfaces
* Inconsistent Spacing

---

# DESIGN PRINCIPLES

Every page must be:

* Responsive
* Accessible
* Consistent
* Mobile Friendly
* Keyboard Navigable

Every screen must support:

* Desktop
* Tablet
* Mobile

Accessibility must be treated as a requirement, not an enhancement.

---

# ROLE SYSTEM

Supported Roles:

* Super Admin
* Pastor
* Church Admin
* Treasurer
* Media Team
* Member
* Visitor

No additional roles may be created without approval.

Role permissions must follow ROLE_SYSTEM.md and BUSINESS_RULES.md.

---

# SECURITY STANDARDS

Required:

* JWT Authentication
* RBAC
* Input Validation
* Password Hashing
* Secure Cookies
* CSRF Protection
* Rate Limiting
* Audit Logging

Sensitive actions must always be logged.

Examples:

* Role Assignment
* Donation Updates
* Event Deletion
* Sermon Publishing

Audit logs are immutable.

---

# DATABASE RULES

Do not create tables outside DATABASE_SCHEMA.md without approval.

Do not remove audit fields.

Every major entity should include:

* created_at
* updated_at

Where applicable:

* created_by
* updated_by

Use soft delete where required.

---

# API RULES

All APIs must follow:

API_STRUCTURE.md

Response format must remain consistent.

Endpoints must be:

* RESTful
* Predictable
* Documented

No undocumented endpoints.

---

# FRONTEND RULES

Always:

* Use TypeScript
* Use reusable components
* Use feature-based architecture
* Use responsive layouts
* Use loading states
* Use error states
* Use empty states

Avoid:

* Inline styling
* Duplicate components
* Hardcoded values

---

# BACKEND RULES

Always:

* Use service-based architecture
* Separate business logic from views
* Use serializers
* Use permissions classes
* Use validation layers

Avoid:

* Fat views
* Duplicated logic
* Direct database manipulation in controllers

---

# PERFORMANCE STANDARDS

Frontend:

* Lazy Loading
* Code Splitting
* Optimized Images

Backend:

* Query Optimization
* Pagination
* Redis Caching

Database:

* Proper Indexing
* Optimized Relationships

---

# ANIMATION STANDARDS

Use Framer Motion.

Maximum animation duration:

500ms

Preferred Animations:

* Fade
* Slide
* Scale
* Layout Transition

Animations must improve UX rather than distract users.

---

# AI DEVELOPMENT RULES

Before generating code:

Read all project documents.

Never invent features.

Never invent roles.

Never invent permissions.

Never invent database tables.

Never ignore wireframes.

Never change architecture without approval.

When uncertain:

Ask for clarification rather than making assumptions.

---

# CODE QUALITY REQUIREMENTS

Generated code must be:

* Modular
* Reusable
* Typed
* Maintainable
* Production Ready

Avoid:

* Technical Debt
* Placeholder Logic
* Dead Code
* Unused Components

---

# DEPLOYMENT TARGET

Frontend:

* Vercel

Backend:

* Railway

Database:

* PostgreSQL

Cache:

* Redis

CI/CD:

* GitHub Actions

Environment Variables must be used for all sensitive configuration.

---

# SUCCESS CRITERIA

The project is successful when:

* All Phase 1 features are operational.
* All roles function correctly.
* UI follows design standards.
* APIs follow architecture standards.
* Security requirements are enforced.
* Mobile responsiveness is verified.
* Documentation remains synchronized.
* The platform is ready for Phase 2 expansion.

END OF MASTER PROJECT PROMPT
