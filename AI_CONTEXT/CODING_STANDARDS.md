# CODING_STANDARDS.md

# CODING STANDARDS

Version: 1.0

Purpose:
Maintain consistency, readability, scalability, and maintainability across the entire codebase.

---

# GENERAL PRINCIPLES

Code must be:

* Readable
* Reusable
* Testable
* Scalable
* Documented

Avoid:

* Technical Debt
* Dead Code
* Duplicate Logic
* Overengineering

---

# NAMING CONVENTIONS

## Variables

Use:

camelCase

Example:

userProfile

eventRegistration

---

## Components

Use:

PascalCase

Example:

MemberCard

EventTable

PrayerRequestForm

---

## Files

Use:

kebab-case

Example:

member-card.tsx

event-service.ts

prayer-request-form.tsx

---

## Django Apps

Use:

snake_case

Example:

daily_scripture

audit_logs

---

# TYPESCRIPT RULES

Always use:

* Interfaces
* Types
* Strong Typing

Avoid:

any

Never use:

// @ts-ignore

unless approved.

---

# REACT RULES

Use:

Functional Components

Example:

const MemberCard = () => {}

Avoid:

Class Components

---

# COMPONENT DESIGN

Components must:

* Have a single responsibility
* Be reusable
* Be typed

Avoid:

Huge components

Maximum recommended size:

300 lines

Split when necessary.

---

# CUSTOM HOOKS

Reusable logic belongs inside hooks.

Example:

useMembers()

useAuth()

useEvents()

---

# STATE MANAGEMENT

Global State:

Zustand

Form State:

React Hook Form

Avoid unnecessary global state.

---

# STYLING RULES

Use:

Tailwind CSS

Avoid:

Inline Styles

Example:

❌ style={{}}

Preferred:

✅ Tailwind Utility Classes

---

# FRONTEND COMMENTS

Comment only when necessary.

Prefer:

Self-explanatory code

Avoid obvious comments.

---

# DJANGO RULES

Views:

Thin

Services:

Thick

Business logic belongs inside services.

Never place complex logic inside views.

---

# MODEL RULES

Models represent data.

Avoid business logic in models.

Use service layer.

---

# SERIALIZER RULES

Use separate serializers:

* Create
* Update
* Read

Avoid massive serializers.

---

# TESTING RULES

Every feature requires:

* Unit Tests
* Integration Tests

Critical flows require:

* Permission Tests

---

# GIT COMMIT STANDARDS

Format:

type(scope): message

Examples:

feat(auth): add jwt login

fix(events): resolve event registration bug

refactor(members): improve search service

docs(api): update endpoint documentation

---

# SECURITY RULES

Never:

* Hardcode secrets
* Expose API keys
* Store passwords in plain text

Use:

Environment Variables

---

# FILE SIZE GUIDELINES

Components:

< 300 lines

Services:

< 500 lines

Views:

< 200 lines

Split large files.

---

# DOCUMENTATION RULES

Document:

* APIs
* Services
* Complex Logic

Keep documentation synchronized with code.

---

# AI DEVELOPMENT RULES

When generating code:

Always follow:

* MASTER_PROJECT_PROMPT.md
* FRONTEND_MASTER_PROMPT.md
* BACKEND_MASTER_PROMPT.md

Never generate:

* Duplicate Logic
* Unused Code
* Temporary Hacks
* Hardcoded Values

Quality over speed.

END OF DOCUMENT
