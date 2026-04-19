# What is OpenID Connect & Why It Matters

## Introduction

You'll often hear developers say "Use OpenID Connect instead of OAuth2 — it's better." That's a misunderstanding that reveals a lack of depth. OpenID Connect (OIDC) isn't a replacement for OAuth2 — it's a **layer built on top of it**. Understanding this relationship is crucial.

Let's clear up the confusion once and for all.

---

## OAuth2's Original Purpose: Authorization, Not Authentication

Here's a subtle but critical distinction that many developers miss:

**OAuth2 was designed for authorization** — controlling *what* an application can do (read emails, access photos, etc.). It was **not** designed for authentication — verifying *who* someone is.

So what happened?

### The Loophole Organizations Exploited

OAuth2 became wildly popular. Organizations like StackOverflow realized they could creatively use OAuth2 not just for authorization, but also for authentication:

1. StackOverflow redirects you to GitHub ("give me read access to your email")
2. GitHub issues an access token
3. StackOverflow uses that token to read your email from GitHub
4. StackOverflow creates a local account using that email — **authenticating you** through GitHub

But here's the thing: GitHub doesn't know StackOverflow is using the token for authentication. GitHub just thinks StackOverflow wants to read an email address. There's no standardized way in OAuth2 to say "this person is authenticated."

This led to chaos. Every organization implemented "authentication via OAuth2" differently — no standards, no consistency.

---

## Enter OpenID Connect (OIDC)

OpenID Connect is a **thin protocol layer on top of OAuth2** that adds a standardized way to handle authentication.

### What It Adds

While OAuth2 provides an **access token** (for authorization), OpenID Connect adds an **ID token** (for authentication). This ID token contains verified identity information about the user.

Think of it this way:

```
HTTP Protocol (foundation)
  └── OAuth2 (authorization layer → access token)
        └── OpenID Connect (authentication layer → ID token)
```

OIDC doesn't replace OAuth2 — it **extends** it. Without OAuth2, there is no OpenID Connect.

### How It Works in Practice

When using OIDC with OAuth2:
- If you send a scope that includes `openid`, the auth server issues **two tokens**:
  - **Access Token** — for authorization (what can this app do?)
  - **ID Token** — for authentication (who is this user?)
- If you *don't* include the `openid` scope, you only get the access token

It's that simple. One extra scope, one extra token.

---

## The IAM Venn Diagram

This is how authentication and authorization combine:

```
┌─────────────────────────┐   ┌─────────────────────────┐
│                         │   │                         │
│   OpenID Connect        │   │      OAuth2             │
│   (Authentication)      │   │      (Authorization)    │
│                         │   │                         │
│   → Identity            │   │   → Access Management   │
│   → ID Token            │   │   → Scopes              │
│                         │   │   → Access Token         │
│           ┌─────────────┼───┼──────────┐              │
│           │    IAM       │   │          │              │
│           │ (Identity &  │   │          │              │
│           │  Access Mgmt)│   │          │              │
│           └─────────────┼───┼──────────┘              │
└─────────────────────────┘   └─────────────────────────┘
```

**IAM = Identity (OIDC) + Access Management (OAuth2)**

---

## Three Benefits of OpenID Connect

### 1. Standardized User Identity Sharing

Before OIDC, everyone invented their own way to share user details. Now there are standard scopes:

| Scope | What It Returns |
|-------|----------------|
| `openid` | Core identity claims |
| `profile` | Name, picture, gender, etc. |
| `email` | Email address and verification status |
| `address` | Physical address |

### 2. JWT-Based ID Token

The ID token follows the **JWT (JSON Web Token)** standard — the same format as the access token. This means consistent tooling and libraries for parsing both tokens.

### 3. Standardized `/userinfo` Endpoint

OIDC defines a standard endpoint (`/userinfo`) that any client can call to get details about the authenticated user. No more guessing which endpoint to hit for user info — it's standardized across all OIDC-compliant servers.

---

## What NOT to Say

- ❌ "OpenID Connect is a replacement for OAuth2" — Wrong. OIDC is built *on top of* OAuth2.
- ❌ "OpenID Connect is better than OAuth2" — They serve different purposes and work together.
- ❌ "Don't use OAuth2, use OpenID Connect" — You can't use OIDC without OAuth2.

### What TO Say

> "By combining OAuth2 and OpenID Connect, we get a complete IAM solution — OAuth2 handles authorization with access tokens and scopes, while OpenID Connect adds standardized authentication with ID tokens."

That answer will impress any interviewer.

---

## ✅ Key Takeaways

- OAuth2 = authorization (access tokens, scopes). OpenID Connect = authentication (ID tokens, user identity).
- OIDC is a protocol built **on top of** OAuth2 — not a replacement
- Send the `openid` scope to get both access token **and** ID token from the auth server
- OIDC provides standard scopes (`openid`, `profile`, `email`, `address`) for user identity
- OIDC exposes a standardized `/userinfo` endpoint
- Together, OAuth2 + OIDC = complete **Identity and Access Management (IAM)**
- Short form: OIDC
