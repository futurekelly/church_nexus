# API_RESPONSE_STANDARDS.md

# API RESPONSE STANDARDS

Version: 1.0

Purpose:
Ensure every API endpoint returns consistent, predictable, and frontend-friendly responses.

---

# GENERAL PRINCIPLES

All API responses must:

* Be JSON
* Be consistent
* Be predictable
* Be documented
* Follow the same structure

Never return raw database objects.

Never return inconsistent formats.

---

# SUCCESS RESPONSE FORMAT

Standard:

{
"success": true,
"message": "Operation completed successfully",
"data": {}
}

Example:

{
"success": true,
"message": "Member retrieved successfully",
"data": {
"id": 1,
"name": "John Doe"
}
}

---

# LIST RESPONSE FORMAT

{
"success": true,
"message": "Records retrieved successfully",
"data": [],
"pagination": {}
}

Example:

{
"success": true,
"message": "Members retrieved successfully",
"data": [],
"pagination": {
"page": 1,
"page_size": 20,
"total_pages": 5,
"total_records": 100
}
}

---

# CREATE RESPONSE FORMAT

{
"success": true,
"message": "Resource created successfully",
"data": {}
}

Status Code:

201 Created

---

# UPDATE RESPONSE FORMAT

{
"success": true,
"message": "Resource updated successfully",
"data": {}
}

Status Code:

200 OK

---

# DELETE RESPONSE FORMAT

For soft deletes:

{
"success": true,
"message": "Resource archived successfully"
}

Status Code:

200 OK

---

# VALIDATION ERROR FORMAT

{
"success": false,
"message": "Validation failed",
"errors": {
"email": [
"Email is required"
]
}
}

Status Code:

400 Bad Request

---

# AUTHENTICATION ERROR FORMAT

{
"success": false,
"message": "Authentication failed"
}

Status Code:

401 Unauthorized

---

# AUTHORIZATION ERROR FORMAT

{
"success": false,
"message": "You do not have permission to perform this action"
}

Status Code:

403 Forbidden

---

# NOT FOUND RESPONSE

{
"success": false,
"message": "Resource not found"
}

Status Code:

404 Not Found

---

# SERVER ERROR RESPONSE

{
"success": false,
"message": "Internal server error"
}

Status Code:

500 Internal Server Error

Never expose stack traces.

---

# PAGINATION STANDARD

{
"page": 1,
"page_size": 20,
"total_pages": 5,
"total_records": 100
}

---

# JWT LOGIN RESPONSE

{
"success": true,
"message": "Login successful",
"data": {
"access_token": "",
"refresh_token": "",
"user": {}
}
}

---

# FILE UPLOAD RESPONSE

{
"success": true,
"message": "File uploaded successfully",
"data": {
"file_url": ""
}
}

---

# API VERSIONING

All APIs must support:

/api/v1/

Future:

/api/v2/

Never break existing clients.

END OF DOCUMENT
