# Deep Dive: Client Credentials Grant Type Flow

## Introduction

Time to get into the actual mechanics of OAuth2. Knowing the theory is one thing — understanding how a specific grant flow works step-by-step is what lets you implement it. The **Client Credentials** grant type is the simplest OAuth2 flow, and it's the perfect one for our microservices scenario.

But when exactly should you use it? And when should you *not*?

---

## When to Use Client Credentials Flow

This flow is designed for one specific scenario:

> **Two backend applications (APIs/services) communicating with each other — with NO end user involved.**

No browser. No login page. No human clicking buttons. Just machine-to-machine communication.

Examples:
- A batch processing service calling your payments API
- An external partner's backend invoking your order service
- A CI/CD pipeline calling your deployment API
- A cron job fetching data from your analytics service

If there's a human with a browser involved, this is **not** the right flow. We'll cover those flows later.

---

## The Three Actors

Only three roles are involved in this flow (notice — no Resource Owner!):

| Actor | Role |
|-------|------|
| **Client** | The backend application requesting access |
| **Auth Server** | Validates the client and issues tokens (Keycloak) |
| **Resource Server** | The protected API/service (our Gateway Server) |

There's no "Resource Owner" (end user) in this flow — that's what makes it the simplest grant type.

---

## The Flow: Step by Step

### Step 1: Client Requests Access Token

The client application sends a POST request to the auth server's token endpoint with:

```
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id=my-app-id
client_secret=my-app-secret
scope=openid email profile
```

Let's break down each parameter:

| Parameter | Purpose |
|-----------|---------|
| `grant_type` | Tells the auth server which flow to use → `client_credentials` |
| `client_id` | The client's "username" — assigned during registration |
| `client_secret` | The client's "password" — assigned during registration |
| `scope` | The permissions the client is requesting |

⚠️ **Important about scopes:** The client can only request scopes that were pre-approved during its registration with the auth server. If it tries to request a scope it's not authorized for, the request fails. You can't trick the system by requesting extra scopes.

### Step 2: Auth Server Issues Access Token

If the client credentials are valid, the auth server returns:

```json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 60,
  "scope": "openid email profile"
}
```

If OpenID Connect is enabled, an **ID token** is also returned.

### Step 3: Client Sends Request to Resource Server

The client includes the access token in the request header:

```
GET /api/accounts
Authorization: Bearer eyJhbGci...
```

### Step 4: Resource Server Validates and Responds

The resource server (Gateway) takes the access token and validates it with the auth server behind the scenes:
- Is this token valid?
- Was it issued by our auth server?
- Does it have the right scopes?

If everything checks out, the resource server processes the request and sends back the response.

---

## Why This is the Simplest Flow

Compare it to other OAuth2 flows:

- **No redirect** — no browser redirect to a login page
- **No consent screen** — no end user granting permissions
- **No end user credentials** — only client credentials
- **Direct token exchange** — client sends credentials, gets token, done

It's essentially: authenticate → get token → use token. Three steps.

---

## Registration is Required

Before any of this works, the client must be **pre-registered** with the auth server. During registration:
- The client receives a `client_id` and `client_secret`
- The admin configures which scopes the client is allowed to request
- The admin approves the client for the `client_credentials` grant type

A random, unregistered application can't just show up and request tokens.

---

## ✅ Key Takeaways

- Client Credentials flow is for **machine-to-machine** communication — no end user, no browser
- Three actors: Client, Auth Server, Resource Server (no Resource Owner)
- The client authenticates with `client_id` + `client_secret` and receives an access token
- The `grant_type` parameter must be set to `client_credentials`
- Clients can only request scopes that were pre-approved during registration
- This is the **simplest** OAuth2 flow — no redirects, no consent screens
- Perfect for: backend API-to-API communication, external service integration, batch jobs
