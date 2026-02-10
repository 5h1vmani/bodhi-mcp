---
domain: documentation
topic: api-docs
tags: [api, documentation, openapi, reference, endpoints]
complexity: intermediate
last_updated: 2025-01-24
---

# API Documentation Best Practices

> How to write API documentation that developers can use without guessing.

## TL;DR

- **Every endpoint needs**: method, path, description, request, response, errors
- **Show real examples** - actual JSON, not just schema
- **Document errors explicitly** - don't make developers discover them
- **Use OpenAPI/Swagger** - machine-readable, generates docs

## Decision Guide

| Scenario                           | Approach                                 |
| ---------------------------------- | ---------------------------------------- |
| New API, greenfield                | Start with OpenAPI spec, generate docs   |
| Existing API, no docs              | Code-first: annotate code, generate spec |
| Public API for external developers | OpenAPI + interactive docs (Swagger UI)  |
| Internal microservices             | Minimal: endpoint template + examples    |
| RESTful CRUD API                   | OpenAPI with reusable schemas            |
| Complex workflows/webhooks         | Detailed guides + sequence diagrams      |
| Breaking changes planned           | Version API, document migration path     |

## Essential Elements

### Per-Endpoint Documentation

| Element         | Required      | Description                    |
| --------------- | ------------- | ------------------------------ |
| HTTP Method     | Yes           | GET, POST, PUT, DELETE, PATCH  |
| Path            | Yes           | `/users/{id}` with path params |
| Description     | Yes           | What it does in one sentence   |
| Authentication  | Yes           | Required auth, or "None"       |
| Request body    | If applicable | Schema and example             |
| Response        | Yes           | Success schema and example     |
| Error responses | Yes           | All possible error codes       |
| Rate limits     | If applicable | Limits and headers             |

### Endpoint Template

```markdown
**GET /users/{id}** - Retrieves user by ID | Auth: Bearer token

Parameters: `id` (string, path) - User's unique identifier

Success (200): {"id": "usr_123", "email": "user@example.com", "name": "Jane"}

Errors: 401 unauthorized | 404 user_not_found | 429 rate_limited

cURL: curl -H "Authorization: Bearer TOKEN" https://api.example.com/users/usr_123
```

## Examples

- **Use real data**: `"email": "jane@example.com"`, not `"email": "string"`
- **Show variations**: minimal request vs. with optional fields
- **Include cURL**: copy-paste ready with placeholder tokens/IDs
- **Cover scenarios**: basic usage, optional params, error cases

## Error Documentation

**Document all possible errors:**

| Status | Code             | Message               | When             |
| ------ | ---------------- | --------------------- | ---------------- |
| 400    | `invalid_email`  | Email format invalid  | Malformed email  |
| 409    | `email_exists`   | Email already exists  | Duplicate signup |
| 422    | `weak_password`  | Password too weak     | < 8 chars        |
| 429    | `rate_limited`   | Too many requests     | > 100 req/min    |
| 500    | `internal_error` | Internal server error | Bug (report it)  |

**Error response format:**

```json
{
  "error": {
    "code": "invalid_email",
    "message": "Email format is invalid",
    "field": "email"
  }
}
```

## OpenAPI/Swagger

**Benefits:** Machine-readable, auto-generates docs, client SDKs, validates requests

**Minimal spec:**

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          content:
            application/json:
              example: { id: "usr_123", email: "user@example.com" }
```

**Sync strategies:**

| Approach             | When to Use                     |
| -------------------- | ------------------------------- |
| Code-first           | Existing API, add annotations   |
| Spec-first           | New API, design before building |
| Generated from tests | Need guaranteed accuracy        |

## Authentication & Rate Limiting

**Authentication:**

- All requests require Bearer token: `Authorization: Bearer YOUR_TOKEN`
- Get token: `POST /auth/token` with `client_id` and `client_secret`
- Tokens expire after 1 hour. Refresh via `POST /auth/refresh`

**Rate limits:**

| Plan       | Requests/min | Requests/day |
| ---------- | ------------ | ------------ |
| Free       | 60           | 1,000        |
| Pro        | 600          | 50,000       |
| Enterprise | Custom       | Custom       |

**Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Versioning

- **Strategy**: URL path (`/v1/users`), header, or query param
- **Lifecycle**: Current (full support) → Deprecated (12 months) → Sunset
- **Migrations**: Provide upgrade path for breaking changes

## Common Mistakes

| Mistake                  | Fix                         |
| ------------------------ | --------------------------- |
| Placeholder examples     | Use real example data       |
| Missing errors           | Document all error codes    |
| Stale docs               | Automate doc generation     |
| No authentication info   | Document auth first         |
| Missing rate limits      | Document limits and headers |
| No versioning policy     | Document lifecycle clearly  |
| Schema only, no examples | Always include examples     |

## Checklist

**Per endpoint:**

- [ ] HTTP method, path, description
- [ ] Auth requirements
- [ ] Parameters (path, query, header)
- [ ] Request/response with examples
- [ ] All error responses
- [ ] cURL example

**API-wide:**

- [ ] Authentication guide
- [ ] Rate limits
- [ ] Versioning policy
- [ ] Error format
- [ ] Changelog

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2025-01-24 | Initial version |
