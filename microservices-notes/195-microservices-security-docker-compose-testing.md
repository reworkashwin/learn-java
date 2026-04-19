# Microservices Security with Docker Compose — Testing

## Introduction

All containers are up. Keycloak is running in Docker. The individual microservices have no port mappings. Now comes the moment of truth — can we actually access accounts, cards, and loans *only* through the Gateway? And does the entire security flow (token generation, validation, role-based access) still work inside Docker?

---

## Verifying Microservices Are Inaccessible Directly

The first and most satisfying test: try to hit the microservices directly.

| Direct URL | Port | Result |
|------------|------|--------|
| `localhost:8080/eazybank/accounts/...` | 8080 | ❌ **Connection Refused** |
| `localhost:9000/eazybank/cards/...` | 9000 | ❌ **Connection Refused** |
| `localhost:8090/eazybank/loans/...` | 8090 | ❌ **Connection Refused** |

**Connection refused** — not 401, not 403, not a timeout. The port simply isn't open. There's nothing listening. The microservices exist, but only inside the Docker network.

This is a huge security win. Even if someone discovers your microservice endpoints, they can't reach them. The Gateway is the **only** door in.

---

## The Fresh Keycloak Problem

When Docker Compose creates a new Keycloak container with `start-dev`, it starts with a **completely empty** database. All the clients, users, and roles you created earlier? Gone.

This is because `start-dev` uses Keycloak's built-in H2 database, which lives inside the container. When the container is destroyed and recreated, the database goes with it.

💡 **Pro Tip:** In production, Keycloak connects to an external database (PostgreSQL, MySQL) that persists data independently of the container lifecycle.

---

## Re-Creating Everything in Keycloak

### Client Credentials Flow Client

1. Create client: `easybank-callcenter-cc`
2. Enable Client Authentication, enable Service Account Roles
3. Disable Standard Flow and Direct Access Grants
4. Copy the new client secret → update Postman
5. Create realm roles: `ACCOUNTS`, `CARDS`, `LOANS`
6. Assign all three roles under **Service Account Roles**

### Authorization Code Flow Client

1. Create client: `easybank-callcenter-ac`
2. Enable Client Authentication, enable Standard Flow
3. Set Valid Redirect URI: `*`
4. Set Web Origins: `*`
5. Copy the new client secret → update Postman

### End User

1. Create user: `madan`
2. Set password: `12345` (Temporary: OFF)
3. Role Mapping → Assign: `ACCOUNTS`, `CARDS`, `LOANS`

---

## Testing Client Credentials Flow in Docker

### GET APIs (permitAll)

| API | Result |
|-----|--------|
| Accounts contact-info | ✅ 200 |
| Cards java-version | ✅ 200 |
| Loans build-info | ✅ 200 |

### POST APIs without Token

| API | Result |
|-----|--------|
| Accounts create | ❌ 401 |

### POST APIs with Token

After getting a fresh token with the new client secret:

| API | Result |
|-----|--------|
| Accounts create | ✅ 201 |
| Cards create | ✅ 201 |
| Loans create | ✅ 201 |

---

## Testing Authorization Code Flow in Docker

1. Update the client secret in Postman for the auth code requests
2. Close all browsers (clear existing Keycloak sessions)
3. Click "Get New Access Token" → browser opens Keycloak login
4. Enter: `madan` / `12345`
5. Sign in → Postman receives the token
6. Use the token → test all APIs

| API | Result |
|-----|--------|
| Accounts create (auth code) | ✅ 201 |
| Cards create (auth code) | ✅ 201 |
| Loans create (auth code) | ✅ 201 |
| Fetch Customer Details (GET) | ✅ 200 |

Both flows work perfectly inside Docker.

---

## The Security Architecture We've Achieved

```
Outside World
     │
     ▼
  Gateway (port 8072) ◄── Only exposed service
     │
     ├──► Accounts (port 8080, internal only)
     ├──► Cards (port 9000, internal only)
     └──► Loans (port 8090, internal only)
     
  Keycloak (port 7080) ◄── For token validation
```

No one can bypass the Gateway. No one can directly hit any microservice. The Gateway validates every token before forwarding requests. This is production-grade security.

---

## ✅ Key Takeaways

- Removing port mappings from Docker Compose makes microservices truly inaccessible from outside
- Fresh Keycloak containers in `start-dev` mode lose all data — re-register clients and users
- Both client credentials and authorization code flows work identically in Docker
- Always update client secrets in Postman after re-creating Keycloak clients
- This is a major milestone: fully secured microservices with OAuth2, role-based access, and network isolation

⚠️ **Common Mistake:** Forgetting that a new Keycloak container means new client secrets. The old secrets in your Postman requests won't work — always copy the fresh secret from the new Keycloak instance.
