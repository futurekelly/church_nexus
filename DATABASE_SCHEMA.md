# DATABASE SCHEMA

## AUTHENTICATION

User

* id
* first_name
* last_name
* email
* password
* role
* profile_image
* phone
* status
* created_at

Role

* id
* role_name
* description

---

## MEMBER MANAGEMENT

MemberProfile

* id
* user_id
* gender
* date_of_birth
* address
* emergency_contact
* ministry

Visitor

* id
* full_name
* phone
* email
* visit_date

---

## SERMONS

Sermon

* id
* title
* description
* speaker
* sermon_date
* video_url
* audio_url
* thumbnail

---

## EVENTS

Event

* id
* title
* description
* location
* start_date
* end_date
* banner

EventRegistration

* id
* event_id
* user_id

---

## PRAYER REQUESTS

PrayerRequest

* id
* user_id
* title
* description
* status
* created_at

---

## TESTIMONIES

Testimony

* id
* user_id
* content
* approved
* created_at

---

## DONATIONS

Donation

* id
* donor_id
* amount
* payment_method
* transaction_reference
* donation_date

---

## LIVESTREAM

Livestream

* id
* title
* stream_url
* start_time
* end_time
* status

LiveChat

* id
* livestream_id
* user_id
* message
* timestamp

---

## MEDIA

MediaFile

* id
* title
* file_url
* type
* uploaded_by

---

## NOTIFICATIONS

Notification

* id
* user_id
* title
* message
* read_status
* created_at

---

## ATTENDANCE

Attendance

* id
* member_id
* service_date
* attendance_status

---

## ANALYTICS

AnalyticsSnapshot

* id
* active_members
* attendance_count
* donation_total
* livestream_views
* created_at



## DAILY SCRIPTURE

DailyScripture

id
verse_reference
scripture_text
reflection
display_date
created_by
created_at
CELEBRATIONS

## Celebration

id
member_id
celebration_type
celebration_date
visibility

Types:

Birthday
Wedding Anniversary
Membership Anniversary
VISITOR FOLLOW-UP

## VisitorFollowUp

id
visitor_id
assigned_staff
status
notes
follow_up_date
created_at
## KIDS KINGDOM

 KidProfile

id
user_id
age_group
guardian_name

Lesson

id
title
description
age_group

Challenge

id
lesson_id
title
description
reward_points
## BIBLE STUDY GROUPS

StudyGroup

id
name
description
leader_id

StudyGroupMember

id
group_id
member_id

StudyDiscussion

id
group_id
author_id
content
## ACHIEVEMENT BADGES

Badge

id
badge_name
description
icon

MemberBadge

id
member_id
badge_id
awarded_date
## FAITH QUESTIONS HUB

Question

id
author_id
title
content
category
status

Answer

id
question_id
responder_id
content
created_at