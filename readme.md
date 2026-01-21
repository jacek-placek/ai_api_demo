# Demo API – Reference Documentation v1.0

## 1. Overview

This document describes a **simple demonstration REST API** implemented in JavaScript (Node.js + Express) and intended **solely for training and demonstration purposes**.

The API is deliberately minimal. Its goal is **not** to showcase backend complexity, but to provide a stable and predictable surface for:
- API testing fundamentals
- Tool-based testing (e.g. Postman, Postbot)
- AI-assisted test generation and analysis
- Positive and negative test scenarios

The API uses **in-memory storage** and **does not persist data** between restarts.

---

## 2. Technical Overview

| Item | Value |
|----|----|
| Protocol | HTTP |
| Format | JSON |
| Authentication | None (simulated login only) |
| Persistence | In-memory only |
| Base URL (local) | `http://localhost:3000` |

---

## 3. General Conventions

### 3.1 Request Headers
All requests that include a body must use:

```
Content-Type: application/json
```

No authentication or authorisation headers are required.

---

### 3.2 Response Format
- All responses are JSON unless otherwise stated
- Timestamps use **ISO 8601** format
- Error responses always contain an `error` field
- Some endpoints support **explicit error simulation** for testing purposes

Example error response:
```json
{
  "error": "Missing password"
}
```
- All responses are JSON unless otherwise stated
- Timestamps use **ISO 8601** format
- Error responses always contain an `error` field

Example error response:
```json
{
  "error": "Missing password"
}
```

---

### 3.3 HTTP Status Codes

| Code | Meaning |
|----|----|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful request, no response body |
| 400 | Client error / validation error |
| 401 | Authentication failure (simulated) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## 4. Health Check

### GET /health

Returns basic service status. Intended for connectivity and availability checks.

This endpoint also supports **explicit simulation of internal server errors** for testing and training purposes.

**Request**
```
GET /health
```

**Successful Response – 200**
```json
{
  "status": "ok",
  "time": "2026-01-21T10:15:30.123Z"
}
```

---

### Simulated Error

**Request**
```
GET /health?fail=500
```

**Error Response – 500**
```json
{
  "error": "Internal error (simulated)",
  "time": "2026-01-21T10:15:45.456Z"
}
```

This behaviour allows clients and tests to distinguish between:
- Service outage (no response)
- Service failure (HTTP 500)

---


## 5. Users API

> Note: Unless explicitly stated otherwise, all user-related endpoints operate on the same in-memory data set. Users created via `POST /api/users` are included in subsequent list and retrieval operations until the service is restarted.


### 5.1 List Users (Paginated)

#### GET /api/users

Returns a paginated list of users.

**Query Parameters**

| Name | Type | Required | Description |
|----|----|----|----|
| page | number | No | Page number (default: 1) |
| per_page | number | No | Items per page (default: 2) |

**Request**
```
GET /api/users?page=1&per_page=2
```

**Successful Response – 200**
```json
{
  "page": 1,
  "per_page": 2,
  "total": 3,
  "total_pages": 2,
  "data": [
    {
      "id": 1,
      "email": "janet.weaver@example.com",
      "first_name": "Janet",
      "last_name": "Weaver"
    }
  ],
  "support": {
    "url": "https://example.com/support",
    "text": "Demo API for testing tooling"
  }
}
```

**Error Responses**
- `400` – invalid pagination parameters

---

### 5.2 List All Users (Unpaginated)

#### GET /api/users/all

Returns **all users currently stored in memory**, including those created via `POST /api/users`. This endpoint ignores pagination parameters and always returns the full data set.

This endpoint exists primarily to simplify testing and validation scenarios where complete data visibility is required.

**Request**
```
GET /api/users/all
```

**Successful Response – 200**
```json
{
  "total": 3,
  "data": [
    {
      "id": 1,
      "email": "janet.weaver@example.com",
      "first_name": "Janet",
      "last_name": "Weaver"
    },
    {
      "id": 2,
      "email": "emma.wong@example.com",
      "first_name": "Emma",
      "last_name": "Wong"
    },
    {
      "id": 3,
      "email": "ja.demo@example.com",
      "first_name": "JA",
      "last_name": "Demo"
    }
  ]
}
```

**Notes**
- The order of users is not guaranteed
- The data set is reset when the service restarts

---
-|----|----|----|
| page | number | No | Page number (default: 1) |
| per_page | number | No | Items per page (default: 2) |

**Request**
```
GET /api/users?page=1&per_page=2
```

**Successful Response – 200**
```json
{
  "page": 1,
  "per_page": 2,
  "total": 3,
  "total_pages": 2,
  "data": [
    {
      "id": 1,
      "email": "janet.weaver@example.com",
      "first_name": "Janet",
      "last_name": "Weaver"
    }
  ],
  "support": {
    "url": "https://example.com/support",
    "text": "Demo API for testing tooling"
  }
}
```

**Error Responses**
- `400` – invalid pagination parameters

---

### 5.3 Get Single User

#### GET /api/users/{id}

Returns a single user by identifier.

**Request**
```
GET /api/users/2
```

**Successful Response – 200**
```json
{
  "data": {
    "id": 2,
    "email": "emma.wong@example.com",
    "first_name": "Emma",
    "last_name": "Wong"
  },
  "support": {
    "url": "https://example.com/support",
    "text": "Demo API for testing tooling"
  }
}
```

**Error Responses**
- `404` – user not found

---

### 5.3 Create User

#### POST /api/users

Creates a new user.

**Request Body**
```json
{
  "name": "JA Demo",
  "job": "QA Lead"
}
```

**Successful Response – 201**
```json
{
  "id": 3,
  "name": "JA Demo",
  "job": "QA Lead",
  "createdAt": "2026-01-21T10:20:00.000Z"
}
```

**Validation Rules**
- `name`: string, minimum 2 characters
- `job`: string, minimum 2 characters

**Error Responses**
- `400` – validation failure

---

### 5.4 Update User

#### PUT /api/users/{id}

Updates an existing user. Partial updates are allowed.

**Request Body**
```json
{
  "name": "JA Demo Updated",
  "job": "QA Lead"
}
```

**Successful Response – 200**
```json
{
  "name": "JA Demo Updated",
  "job": "QA Lead",
  "updatedAt": "2026-01-21T10:25:00.000Z"
}
```

**Error Responses**
- `400` – validation failure
- `404` – user not found

---

### 5.5 Delete User

#### DELETE /api/users

Deletes a user using an identifier provided in the **request body**.

> Note: While HTTP allows request bodies in DELETE operations, client support varies. This design is intentional and used for training purposes.

**Request Body**
```json
{
  "id": 2
}
```

**Successful Response – 204**
(no response body)

**Validation Rules**
- `id`: integer, required

**Error Responses**
- `400` – missing or invalid `id`
- `404` – user not found

---


## 6. Authentication (Simulated)

> This API does **not** implement real authentication.
> The endpoint exists purely to demonstrate login flows and error handling.

### POST /api/login

**Request Body (Success)**
```json
{
  "email": "eve.holt@reqres.in",
  "password": "cityslicka"
}
```

**Successful Response – 200**
```json
{
  "token": "demo-token-123"
}
```

**Error Scenarios**

| Condition | Status | Response |
|----|----|----|
| Missing email | 400 | `{ "error": "Missing email" }` |
| Missing password | 400 | `{ "error": "Missing password" }` |
| Invalid credentials | 401 | `{ "error": "Invalid credentials" }` |

---

## 7. Known Limitations

- Data is reset when the server restarts
- No real authentication or authorisation
- No rate limiting
- No persistent identifiers
- Error simulation endpoints are intended for testing only


- Data is reset when the server restarts
- No real authentication or authorisation
- No rate limiting
- No persistent identifiers

These limitations are intentional and suitable for training scenarios.

---

## 8. Intended Usage

This API is intended for:
- API testing exercises
- Demonstrating test design techniques
- Tool-based testing demos (Postman, Postbot, etc.)
- AI-assisted test case generation and validation

It is **not** intended for production or integration use.

---

## 9. Versioning

This documentation applies to **Demo API v1.0**.

Changes to endpoints or behaviour should be reflected in an updated version of this document.

