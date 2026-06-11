# BUSINESS_RULES.md

# CHURCH MANAGEMENT ECOSYSTEM

Version: 1.0

Purpose:
This document defines system-wide business rules, permissions, workflows, approval processes, and operational restrictions.

These rules override any assumptions made by AI coding agents.

---

# GENERAL SYSTEM RULES

## Rule 1

Every user must have exactly one role.

Roles:

* Super Admin
* Pastor
* Church Admin
* Treasurer
* Media Team
* Member
* Visitor

A user cannot hold multiple roles simultaneously.

---

## Rule 2

All sensitive operations must be logged.

Examples:

* Role changes
* Donation modifications
* Member deletion
* Event deletion
* Sermon deletion
* Livestream creation

Every log must contain:

* User
* Action
* Timestamp
* IP Address
* Device Information

---

## Rule 3

Deleted records are soft-deleted.

The system must not permanently remove:

* Members
* Donations
* Sermons
* Events
* Testimonies

Instead:

```text
is_deleted = true
deleted_at = timestamp
```

---

# AUTHENTICATION RULES

## Registration

Visitors may register themselves.

New registrations receive:

```text
Visitor Role
```

by default.

---

## Role Assignment

Only Super Admin can:

* Assign roles
* Change roles
* Revoke roles

Pastors cannot assign roles.

Church Admins cannot assign roles.

Members cannot assign roles.

---

## Password Rules

Minimum:

```text
8 characters
```

Must contain:

* Uppercase letter
* Lowercase letter
* Number

Recommended:

* Special character

---

## Account Locking

After:

```text
5 failed login attempts
```

Lock account for:

```text
15 minutes
```

---

# MEMBER MANAGEMENT RULES

## Member Creation

Members may:

* Register themselves

Church Admin may:

* Create members manually

Super Admin may:

* Create members manually

---

## Member Deletion

Only:

* Super Admin

may delete members.

Deletion must be soft delete.

---

## Member Profile Updates

Members may update:

* Profile photo
* Phone
* Address
* Biography

Members may not update:

* Role
* Membership Status

---

# SERMON RULES

## Sermon Creation

Allowed:

* Pastor
* Super Admin

Not Allowed:

* Member
* Visitor
* Treasurer

---

## Sermon Publishing

Requires:

```text
Published Status
```

Before publication.

Status:

* Draft
* Published
* Archived

---

## Sermon Editing

Only:

* Creator Pastor
* Super Admin

---

# EVENT RULES

## Event Creation

Allowed:

* Pastor
* Church Admin
* Super Admin

---

## Event Registration

Allowed:

* Members
* Visitors

---

## Event Cancellation

Allowed:

* Event Creator
* Super Admin

Notifications must be sent automatically.

---

# LIVESTREAM RULES

## Livestream Creation

Allowed:

* Media Team
* Pastor
* Super Admin

---

## Livestream Start

Allowed:

* Media Team
* Pastor
* Super Admin

---

## Livestream Moderation

Allowed:

* Media Team
* Pastor

Actions:

* Delete messages
* Mute users
* Ban users

---

# LIVE CHAT RULES

## Message Posting

Allowed:

* Members
* Visitors
* Church Leaders

---

## Chat Moderation

Allowed:

* Media Team
* Pastor
* Super Admin

---

## Banned Users

Cannot:

* Send messages
* React
* Participate

---

# PRAYER REQUEST RULES

## Submission

Allowed:

* Members
* Visitors

---

## Anonymous Prayer Requests

Allowed:

```text
Anonymous = True
```

Names hidden from members.

Visible to:

* Pastor
* Super Admin

---

## Prayer Status

Statuses:

* New
* In Progress
* Answered
* Archived

---

# TESTIMONY RULES

## Submission

Allowed:

* Members

---

## Approval Required

Before public display:

Must be approved by:

* Pastor
  OR
* Church Admin

---

## Rejected Testimonies

Remain visible only to submitter.

---

# DONATION RULES

## Donations

Allowed:

* Members
* Visitors

---

## Donation Modification

Only:

* Treasurer
* Super Admin

---

## Donation Deletion

Not allowed.

Donations may only be:

```text
Voided
```

to preserve audit trails.

---

## Financial Reports

Visible only to:

* Treasurer
* Super Admin

---

## Donation Receipts

Automatically generated after successful donation.

---

# MEDIA RULES

## Upload Media

Allowed:

* Media Team
* Pastor
* Super Admin

---

## Delete Media

Allowed:

* Media Team
* Super Admin

---

## Media Approval

Optional workflow:

Uploaded
↓
Review
↓
Published

---

# MINISTRY RULES

## Ministry Creation

Allowed:

* Church Admin
* Pastor
* Super Admin

---

## Ministry Leadership Assignment

Allowed:

* Church Admin
* Super Admin

---

## Ministry Member Assignment

Allowed:

* Church Admin
* Ministry Leader
* Super Admin

---

# COMMUNITY RULES

## Discussions

Allowed:

* Members

---

## Visitors

May read public discussions.

Cannot create discussions.

---

## Community Moderation

Allowed:

* Church Admin
* Pastor
* Super Admin

---

# NOTIFICATION RULES

Notifications trigger automatically when:

* Event Created
* Event Updated
* Sermon Published
* Livestream Starts
* Prayer Updated
* Testimony Approved
* Role Changed

---

# ATTENDANCE RULES

Attendance can be recorded by:

* Church Admin
* Pastor
* Super Admin

Members cannot modify attendance.

---

# ANALYTICS RULES

## Super Admin

Full analytics access.

---

## Pastor

Can view:

* Attendance
* Member growth
* Prayer statistics
* Sermon statistics

Cannot view financial analytics.

---

## Treasurer

Can view:

* Donation analytics
* Financial reports

Cannot view prayer analytics.

---

## Member

Can view only:

Personal statistics.

---

## DAILY SCRIPTURE

Creation Allowed:

Pastor
Super Admin

Editing Allowed:

Pastor
Super Admin

Only one scripture may be featured per day.

## CELEBRATIONS

Birthdays are automatically generated from member profiles.

Membership anniversaries are automatically calculated.

Members may choose visibility settings.

## VISITOR FOLLOW-UP
Only:

Pastor
Church Admin

may manage follow-up records.

Visitors cannot access follow-up notes.

## KIDS KINGDOM

Parents or guardians must manage child accounts.

Children cannot access public discussions.

Child content must be age-appropriate.

## BIBLE STUDY GROUPS

Groups may be:

Public
Private

Only group leaders may moderate discussions.

Pastors and Super Admins may override moderation actions.

## ACHIEVEMENT BADGES

Badges are awarded automatically based on predefined rules.

Manual badge assignment is restricted to:

Super Admin

Badges must never be tied to donation amounts.

## FAITH QUESTIONS HUB

Questions may be submitted by:

Members

Answers may be provided by:

Pastor
Church Leaders

Pastors may mark answers as:

Official Answer

Inappropriate questions moderated or removed

# AI ASSISTANT RULES (PHASE 2)

AI Assistant may:

* Summarize attendance trends
* Suggest event improvements
* Generate reports
* Forecast donations

AI Assistant may not:

* Assign roles
* Delete records
* Modify financial data
* Approve testimonies

Human approval required for all critical actions.

---

# AUDIT POLICY

The following actions must always be logged:

* Login
* Logout
* Role Assignment
* Member Deletion
* Sermon Publishing
* Donation Update
* Event Deletion
* Livestream Creation
* Financial Report Export

Audit logs are immutable.

No user may delete audit logs.
