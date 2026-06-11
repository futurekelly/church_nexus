# API_STRUCTURE.md

## API STANDARD

Base URL

```text
/api/v1/
```

Authentication

```text
JWT Authentication
```

Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Response Format

Success:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

---

# AUTHENTICATION MODULE

## Register

POST

```text
/api/v1/auth/register/
```

Body

```json
{
  "first_name": "",
  "last_name": "",
  "email": "",
  "password": ""
}
```

---

## Login

POST

```text
/api/v1/auth/login/
```

Body

```json
{
  "email": "",
  "password": ""
}
```

Returns

```json
{
  "access": "",
  "refresh": ""
}
```

---

## Logout

POST

```text
/api/v1/auth/logout/
```

---

## Profile

GET

```text
/api/v1/auth/profile/
```

---

## Update Profile

PUT

```text
/api/v1/auth/profile/update/
```

---

# MEMBER MANAGEMENT

## Members List

GET

```text
/api/v1/members/
```

---

## Member Details

GET

```text
/api/v1/members/{id}/
```

---

## Create Member

POST

```text
/api/v1/members/create/
```

---

## Update Member

PUT

```text
/api/v1/members/update/{id}/
```

---

## Delete Member

DELETE

```text
/api/v1/members/delete/{id}/
```

---

# SERMON MODULE

## List Sermons

GET

```text
/api/v1/sermons/
```

---

## Sermon Details

GET

```text
/api/v1/sermons/{id}/
```

---

## Create Sermon

POST

```text
/api/v1/sermons/create/
```

---

## Update Sermon

PUT

```text
/api/v1/sermons/update/{id}/
```

---

## Delete Sermon

DELETE

```text
/api/v1/sermons/delete/{id}/
```

---

# EVENTS MODULE

## Events

GET

```text
/api/v1/events/
```

---

## Event Details

GET

```text
/api/v1/events/{id}/
```

---

## Register Event

POST

```text
/api/v1/events/register/
```

---

## Create Event

POST

```text
/api/v1/events/create/
```

---

# PRAYER REQUESTS

GET

```text
/api/v1/prayers/
```

POST

```text
/api/v1/prayers/create/
```

PUT

```text
/api/v1/prayers/update/{id}/
```

DELETE

```text
/api/v1/prayers/delete/{id}/
```

---

# TESTIMONIES

GET

```text
/api/v1/testimonies/
```

POST

```text
/api/v1/testimonies/create/
```

PUT

```text
/api/v1/testimonies/approve/{id}/
```

---

# LIVESTREAM

GET

```text
/api/v1/livestreams/
```

POST

```text
/api/v1/livestreams/create/
```

GET

```text
/api/v1/livestreams/{id}/
```

---

# LIVE CHAT

GET

```text
/api/v1/livechat/{stream_id}/
```

POST

```text
/api/v1/livechat/send/
```

---

# DONATIONS

GET

```text
/api/v1/donations/
```

POST

```text
/api/v1/donations/create/
```

GET

```text
/api/v1/donations/reports/
```

---

# MEDIA CENTER

GET

```text
/api/v1/media/
```

POST

```text
/api/v1/media/upload/
```

DELETE

```text
/api/v1/media/delete/{id}/
```

---

# NOTIFICATIONS

GET

```text
/api/v1/notifications/
```

PUT

```text
/api/v1/notifications/read/{id}/
```

---

# ATTENDANCE

GET

```text
/api/v1/attendance/
```

POST

```text
/api/v1/attendance/create/
```

---

# ANALYTICS

GET

```text
/api/v1/analytics/dashboard/
```

GET

```text
/api/v1/analytics/members/
```

GET

```text
/api/v1/analytics/donations/
```

GET

```text
/api/v1/analytics/events/
```

---

# ADMIN SETTINGS

GET

```text
/api/v1/settings/
```

PUT

```text
/api/v1/settings/update/
```

---

# FUTURE MODULES

Reserved APIs:

```text
/api/v1/ministries/
/api/v1/small-groups/
/api/v1/courses/
/api/v1/devotionals/
/api/v1/ai-assistant/
/api/v1/chat/
/api/v1/polls/
/api/v1/surveys/
/api/v1/mobile-app/
```
