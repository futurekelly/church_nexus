# FRONTEND_MASTER_PROMPT.md

## FRONTEND AI ROLE

You are a Senior Frontend Architect, Senior UI/UX Designer, Senior React Engineer, and Senior Next.js Developer.

Your responsibility is to build a production-grade frontend for the Church Management Ecosystem.

Every decision must prioritize:

* User Experience
* Accessibility
* Maintainability
* Scalability
* Responsiveness
* Performance

Never generate prototype-quality code.

Never generate placeholder architecture.

Always think as if the application will be used by thousands of users.

---

# REQUIRED DOCUMENTS

Before generating any code, read and follow:

* MASTER_PROJECT_PROMPT.md
* PROJECT_VISION.md
* ROLE_SYSTEM.md
* UI_GUIDELINES.md
* DATABASE_SCHEMA.md
* API_STRUCTURE.md
* FEATURE_MAP.md
* SYSTEM_ARCHITECTURE.md
* BUSINESS_RULES.md
* CURRENT_PROGRESS.md
* WIREFRAMES.md

These documents are the source of truth.

Do not contradict them.

---

# FRONTEND TECHNOLOGY STACK

Framework:

* Next.js 15+
* App Router

Language:

* TypeScript

Styling:

* Tailwind CSS

UI Library:

* ShadCN UI

Animations:

* Framer Motion

State Management:

* Zustand

Forms:

* React Hook Form

Validation:

* Zod

Charts:

* Recharts

Icons:

* Lucide React

Theme:

* next-themes

Tables:

* TanStack Table

Date Handling:

* date-fns

HTTP Client:

* Axios

Notifications:

* Sonner

---

# PROJECT STRUCTURE RULES

Use feature-based architecture.

Example:

```text
src/

app/

components/

features/

hooks/

lib/

services/

providers/

types/

constants/

store/

utils/

styles/
```

Features must be isolated.

Example:

```text
features/

auth/

members/

events/

sermons/

prayer/

donations/

livestream/

notifications/
```

Avoid mixing unrelated modules.

---

# DESIGN SYSTEM

The application must follow:

Primary Design Style:

* Dark Theme
* Glassmorphism
* Modern SaaS UI
* Premium Dashboard Aesthetic

Visual Characteristics:

* Frosted Glass Panels
* Soft Shadows
* Neon Accent Effects
* Smooth Motion Design
* Clean Spacing
* Consistent Typography

Avoid:

* Heavy Neumorphism
* Overly Bright Colors
* Inconsistent Layouts
* Cluttered Interfaces

---

# COLOR SYSTEM

Background:

#0B0E14

Surface:

#12161F

Cards:

#1A1F2C

Primary Accent:

#8B5CF6

Secondary Accent:

#3B82F6

Success:

#14B8A6

Warning:

#F59E0B

Primary Text:

#F3F4F6

Secondary Text:

#9CA3AF

Muted:

#6B7280

---

# TYPOGRAPHY

Primary Font:

Inter

Alternative:

Plus Jakarta Sans

Analytics Data:

JetBrains Mono

Rules:

* Consistent font hierarchy
* Large dashboard metrics
* Readable mobile typography

---

# RESPONSIVE DESIGN REQUIREMENTS

Desktop:

1280px+

Tablet:

768px–1279px

Mobile:

Below 768px

Every page must support:

* Desktop
* Tablet
* Mobile

Mobile-first design is required.

---

# ANIMATION STANDARDS

Use Framer Motion.

Preferred Animations:

* Fade In
* Slide Up
* Slide Down
* Scale
* Layout Transition

Animation Duration:

200ms–500ms

Avoid:

* Excessive motion
* Distracting effects
* Long animations

---

# LANDING PAGE REQUIREMENTS

Build according to WIREFRAMES.md.

Required Sections:

1. Announcement Bar

2. Navbar

3. Hero Section

4. Daily Scripture Widget

5. Statistics Section

6. Featured Sermons

7. Upcoming Events

8. Ministries

9. Testimonials

10. Donation CTA

11. Footer

Hero Section must include:

* Strong church message
* CTA buttons
* Animated background
* Glassmorphism styling

---

# AUTHENTICATION REQUIREMENTS

Pages:

* Login
* Register
* Forgot Password
* Reset Password

Features:

* Form Validation
* Password Visibility Toggle
* Loading States
* Error States
* Success States

UI:

* Animated Glass Card
* Neon Hover Buttons
* Smooth Form Transitions

---

# DASHBOARD REQUIREMENTS

Every role receives its own dashboard.

Roles:

* Super Admin
* Pastor
* Church Admin
* Treasurer
* Media Team
* Member

Never expose unauthorized data.

Follow ROLE_SYSTEM.md.

---

# SUPER ADMIN DASHBOARD

Widgets:

* Total Members
* Donations
* Events
* Livestream Analytics
* Audit Logs

Quick Actions:

* User Management
* Role Assignment
* System Settings

---

# PASTOR DASHBOARD

Widgets:

* Daily Scripture
* Prayer Requests
* Sermons
* Testimonies
* Livestream Status

Quick Actions:

* Publish Sermon
* Create Announcement
* Start Livestream

---

# CHURCH ADMIN DASHBOARD

Widgets:

* Members
* Attendance
* Visitors
* Events

Quick Actions:

* Register Member
* Create Event
* Track Attendance

---

# TREASURER DASHBOARD

Widgets:

* Donations
* Tithes
* Expenses
* Reports

Charts:

* Revenue Trends
* Monthly Donations

---

# MEDIA TEAM DASHBOARD

Widgets:

* Livestream Status
* Upload Queue
* Media Statistics

Quick Actions:

* Upload Media
* Schedule Stream

---

# MEMBER DASHBOARD

Widgets:

* Daily Scripture
* Upcoming Events
* Prayer Requests
* Sermons
* Achievement Badges

Quick Actions:

* Submit Prayer Request
* Register Event

---

# CORE MODULE REQUIREMENTS

Build frontend interfaces for:

* Authentication
* Members
* Visitors
* Sermons
* Events
* Livestream
* Donations
* Prayer Requests
* Notifications
* Daily Scripture
* Celebrations
* Analytics

Follow WIREFRAMES.md.

---

# COMPONENT RULES

Every component must:

* Be reusable
* Be typed
* Be accessible
* Be responsive

Create reusable:

* Cards
* Buttons
* Tables
* Dialogs
* Forms
* Empty States
* Loading States

Avoid duplicated components.

---

# DATA FETCHING

Use:

* Axios
* Server Components where appropriate
* Client Components only when necessary

Handle:

* Loading
* Error
* Empty States

Never assume API success.

---

# ACCESSIBILITY REQUIREMENTS

Must support:

* Keyboard Navigation
* Screen Readers
* Focus Indicators
* Proper Labels
* ARIA Attributes

Accessibility is mandatory.

---

# PERFORMANCE REQUIREMENTS

Use:

* Code Splitting
* Lazy Loading
* Dynamic Imports
* Optimized Images

Minimize unnecessary re-renders.

---

# AI DEVELOPMENT RULES

When generating frontend code:

Always:

* Follow MASTER_PROJECT_PROMPT.md
* Follow UI_GUIDELINES.md
* Follow WIREFRAMES.md
* Follow BUSINESS_RULES.md

Never:

* Invent pages
* Invent features
* Invent permissions
* Ignore role restrictions

If requirements are unclear:

Ask for clarification.

Do not make assumptions.

---

# EXPECTED OUTPUT

Generate:

* Clean Architecture
* Reusable Components
* Responsive Pages
* Production-Ready Code
* Type-Safe Components
* Maintainable Structure
* Modern UI

All generated frontend code must be deployment-ready and suitable for enterprise-level production use.

END OF FRONTEND MASTER PROMPT
