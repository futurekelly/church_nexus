# FOLDER_STRUCTURE.md

# PROJECT STRUCTURE

The Church Management Ecosystem follows a monorepo-style organization.

Root Structure:

church-management-ecosystem/

├── AI_CONTEXT/
├── frontend/
├── backend/
├── docs/
├── scripts/
├── .github/
└── docker/

---

# FRONTEND STRUCTURE

frontend/

├── public/
│
├── src/
│
│   ├── app/
│   │
│   ├── components/
│   │
│   ├── features/
│   │
│   ├── layouts/
│   │
│   ├── hooks/
│   │
│   ├── services/
│   │
│   ├── store/
│   │
│   ├── providers/
│   │
│   ├── lib/
│   │
│   ├── types/
│   │
│   ├── constants/
│   │
│   ├── utils/
│   │
│   └── styles/

---

# FEATURES STRUCTURE

src/features/

auth/

members/

visitors/

sermons/

events/

livestream/

prayer/

donations/

notifications/

analytics/

daily-scripture/

celebrations/

dashboard/

settings/

---

# COMPONENTS STRUCTURE

src/components/

ui/

forms/

tables/

charts/

cards/

dialogs/

navigation/

feedback/

empty-states/

loading/

---

# APP ROUTES

src/app/

(auth)

(dashboard)

(public)

api/

---

# BACKEND STRUCTURE

backend/

├── config/
├── apps/
├── common/
├── services/
├── tests/
├── scripts/
└── requirements/

---

# DJANGO APPS

apps/

authentication/

members/

visitors/

sermons/

events/

livestream/

prayer/

donations/

notifications/

analytics/

daily_scripture/

celebrations/

audit_logs/

roles/

settings/

---

# COMMON MODULES

common/

permissions/

exceptions/

validators/

mixins/

constants/

utils/

pagination/

responses/

---

# SERVICES

services/

email/

notification/

storage/

reporting/

analytics/

audit/

---

# TEST STRUCTURE

tests/

unit/

integration/

api/

frontend/

---

# DOCUMENTATION

docs/

api/

architecture/

deployment/

database/

user-guides/

---

# CI/CD

.github/

workflows/

frontend.yml

backend.yml

deployment.yml

---

# DEPLOYMENT

docker/

frontend/

backend/

nginx/

postgres/

redis/

---

# ARCHITECTURE RULES

1. Feature-Based Frontend Architecture.

2. Modular Django Applications.

3. No business logic inside UI components.

4. No business logic inside Django views.

5. Reusable services must live in services/.

6. Shared utilities belong in common/.

7. Every module must have tests.

8. Every major feature must be independently maintainable.

END OF DOCUMENT
