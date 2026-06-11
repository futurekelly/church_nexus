# DATABASE_ERD.md

# DATABASE ENTITY RELATIONSHIP DOCUMENT

Version: 1.0

Purpose:
Define database entities, relationships, cardinality, ownership rules, and future expansion strategy.

This document must be followed by all backend AI agents when generating:

* Django Models
* Serializers
* Services
* APIs
* Database Migrations

Do not create relationships outside this document without approval.

---

# CORE IDENTITY MODEL

## User

Represents authenticated users.

Fields:

* id
* first_name
* last_name
* email
* phone_number
* password
* is_active
* last_login
* created_at
* updated_at

Relationships:

User
|
|---- 1 : 1 ---- Role
|
|---- 1 : 1 ---- Member Profile

---

# ROLE MODEL

## Role

Fields:

* id
* name
* description

Supported Values:

* Super Admin
* Pastor
* Church Admin
* Treasurer
* Media Team
* Member
* Visitor

Relationships:

Role
|
|---- 1 : Many ---- Users

---

# MEMBER MANAGEMENT

## Member

Represents registered church members.

Fields:

* id
* membership_number
* date_joined
* status
* profile_photo
* gender
* occupation
* address
* date_of_birth

Relationships:

Member
|
|---- 1 : 1 ---- User
|
|---- 1 : Many ---- Prayer Requests
|
|---- 1 : Many ---- Event Registrations
|
|---- 1 : Many ---- Donations
|
|---- 1 : Many ---- Attendance Records

---

# VISITOR MANAGEMENT

## Visitor

Fields:

* id
* full_name
* phone
* email
* source
* visit_date
* status

Relationships:

Visitor
|
|---- 1 : Many ---- Follow Up Records

---

# FOLLOW UP RECORD

## FollowUp

Fields:

* id
* notes
* follow_up_date
* status

Relationships:

Visitor
|
|---- 1 : Many ---- FollowUp

User
|
|---- 1 : Many ---- FollowUp

---

# SERMON MANAGEMENT

## Sermon

Fields:

* id
* title
* description
* scripture_reference
* sermon_date
* status
* thumbnail
* video_url
* audio_url

Relationships:

User
|
|---- 1 : Many ---- Sermons

Sermon
|
|---- Many : Many ---- Tags

---

# SERMON TAGS

## SermonTag

Fields:

* id
* name

Relationships:

Sermon
|
|---- Many : Many ---- SermonTag

---

# EVENT MANAGEMENT

## Event

Fields:

* id
* title
* description
* event_date
* location
* capacity
* event_type
* status

Relationships:

User
|
|---- 1 : Many ---- Events

Event
|
|---- 1 : Many ---- Event Registrations

---

# EVENT REGISTRATION

## EventRegistration

Fields:

* id
* registration_date
* attendance_status

Relationships:

Member
|
|---- 1 : Many ---- EventRegistration

Event
|
|---- 1 : Many ---- EventRegistration

---

# ATTENDANCE MANAGEMENT

## Attendance

Fields:

* id
* attendance_date
* service_type
* check_in_time

Relationships:

Member
|
|---- 1 : Many ---- Attendance

---

# PRAYER MANAGEMENT

## PrayerRequest

Fields:

* id
* title
* description
* is_anonymous
* status

Statuses:

* New
* In Progress
* Answered
* Archived

Relationships:

Member
|
|---- 1 : Many ---- PrayerRequest

---

# DONATION MANAGEMENT

## Donation

Fields:

* id
* amount
* donation_type
* payment_method
* transaction_reference
* status
* donation_date

Types:

* Tithe
* Offering
* Special Contribution

Relationships:

Member
|
|---- 1 : Many ---- Donation

---

# LIVESTREAM MANAGEMENT

## Livestream

Fields:

* id
* title
* description
* stream_url
* scheduled_at
* started_at
* ended_at
* status

Relationships:

User
|
|---- 1 : Many ---- Livestreams

Livestream
|
|---- 1 : Many ---- Livestream Messages

---

# LIVESTREAM CHAT

## LivestreamMessage

Fields:

* id
* message
* created_at

Relationships:

Livestream
|
|---- 1 : Many ---- Messages

User
|
|---- 1 : Many ---- Messages

---

# DAILY SCRIPTURE

## DailyScripture

Fields:

* id
* scripture_reference
* verse_text
* reflection
* publish_date
* is_featured

Relationships:

User
|
|---- 1 : Many ---- Daily Scriptures

Business Rule:

Only one featured scripture per day.

---

# CELEBRATIONS

## Celebration

Fields:

* id
* title
* celebration_type
* celebration_date

Types:

* Birthday
* Anniversary
* Membership Milestone

Relationships:

Member
|
|---- 1 : Many ---- Celebrations

---

# NOTIFICATIONS

## Notification

Fields:

* id
* title
* message
* notification_type
* is_read

Relationships:

User
|
|---- 1 : Many ---- Notifications

---

# TESTIMONIES

## Testimony

Fields:

* id
* title
* content
* approval_status

Relationships:

Member
|
|---- 1 : Many ---- Testimonies

User
|
|---- 1 : Many ---- Approved Testimonies

---

# AUDIT LOGGING

## AuditLog

Fields:

* id
* action
* entity_name
* entity_id
* previous_value
* new_value
* created_at

Relationships:

User
|
|---- 1 : Many ---- Audit Logs

Business Rule:

Audit logs are immutable.

Never delete audit logs.

---

# SETTINGS

## SystemSetting

Fields:

* id
* key
* value
* description

Relationships:

Managed by Super Admin only.

---

# ANALYTICS

## AnalyticsSnapshot

Fields:

* id
* snapshot_date
* total_members
* total_visitors
* total_events
* total_donations
* total_sermons

Purpose:

Store aggregated analytics data.

Avoid expensive live calculations.

---

# FUTURE PHASE 2 ENTITIES

Reserved:

* BibleStudyGroup
* BibleStudyMember
* KidsKingdomLesson
* KidsChallenge
* AchievementBadge
* MemberBadge
* Volunteer

Do not implement during Phase 1.

---

# FUTURE PHASE 3 ENTITIES

Reserved:

* FaithQuestion
* FaithAnswer
* ChurchBranch
* RegionalOffice
* SMSMessage
* WhatsAppMessage

Do not implement during Phase 1.

---

# GLOBAL DATABASE RULES

Every major table must contain:

* id
* created_at
* updated_at

Where appropriate:

* created_by
* updated_by

Soft Delete Required For:

* Members
* Events
* Sermons
* Testimonies

Never hard delete critical records.

---

# INDEXING REQUIREMENTS

Create indexes for:

* email
* membership_number
* event_date
* donation_date
* publish_date
* status fields
* foreign keys

---

# RELATIONSHIP SUMMARY

User
├── Role
├── Member
├── Sermons
├── Events
├── Livestreams
├── Notifications
├── Audit Logs
└── Daily Scriptures

Member
├── Donations
├── Attendance
├── Prayer Requests
├── Event Registrations
├── Celebrations
└── Testimonies

Visitor
└── FollowUp Records

Event
└── Event Registrations

Livestream
└── Livestream Messages

END OF DOCUMENT
