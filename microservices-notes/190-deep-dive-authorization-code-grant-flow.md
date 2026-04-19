# Deep Dive: Authorization Code Grant Type Flow

## Introduction

Client credentials grant type works great for **machine-to-machine** communication — where no human is involved. But what happens when there's an actual person sitting at a browser or using a mobile app? You can't use client credentials for that. You need a flow that authenticates *both* the end user *and* the client application. That's the **Authorization Code Grant Type Flow**.

Think about logging into Stack Overflow with your GitHub account. You (the end user) interact with Stack Overflow (the client), which needs your data from GitHub (the resource server), verified through GitHub's auth server. That's this flow in action.

---

## The Four Roles

| Role | Who is it? | Example |
|------|-----------|---------|
| **User** | The human being | You, sitting at a browser |
| **Client** | The application the user is interacting with | Stack Overflow, a mobile banking app |
| **Auth Server** | Issues and validates tokens | Keycloak, GitHub's OAuth server |
| **Resource Server** | Holds the protected data | Your microservices behind the Gateway |

---

## The Step-by-Step Flow

### Step 1-3: User → Client → Auth Server Login

1. The end user goes to the client application and asks to access a resource
2. The client redirects the user to the auth server's **login page**
3. The user enters credentials directly on the auth server (never shared with the client!)

### Step 4: Auth Server → Client (Authorization Code)

Once the user proves their identity and gives consent, the auth server issues a **temporary authorization code** — not an access token. This is a critical design decision.

### Step 5-6: Client → Auth Server (Token Exchange)

The client takes the authorization code and sends it back to the auth server, this time with:
- The authorization code
- Client ID + Client Secret (proving the client's own identity)

If everything checks out, the auth server issues an **access token**.

### Step 7-8: Standard Resource Access

From here, it's the same as client credentials — send the access token to the resource server, get your data back.

---

## What Gets Sent in Each Step

### During the Login Redirect (Steps 2-3)

| Parameter | Purpose |
|-----------|---------|
| `client_id` | Identifies which app is requesting access |
| `redirect_uri` | Where to send the user after login |
| `scope` | What permissions are requested |
| `state` | Random value to prevent CSRF attacks |
| `response_type=code` | Tells the server: "I want an authorization code" |

### During the Token Exchange (Step 5)

| Parameter | Purpose |
|-----------|---------|
| `code` | The authorization code from the previous step |
| `client_id` | Client identity |
| `client_secret` | Client's secret credential |
| `grant_type=authorization_code` | Specifies the flow type |
| `redirect_uri` | Must match what was sent originally |

---

## Why Two Steps Instead of One?

This is the most common question: *"Why doesn't the auth server just issue the access token directly after login?"*

The answer is **security through separation**.

In this flow, a browser is involved. Browsers are vulnerable — a hacker sitting in the middle could intercept traffic. If the access token were sent in the first response (through the browser's URL), it could be stolen.

Instead:
1. The authorization code travels through the browser (less sensitive — it's temporary and single-use)
2. The access token exchange happens **backend-to-backend** (Client → Auth Server), with no browser involved

This is a two-layer security design. The deprecated **Implicit Grant Flow** tried to do it in one step — the access token came back immediately. But it was too easy to steal tokens from browser URLs, which is why it was deprecated in favor of this more secure approach.

---

## The `state` Parameter — CSRF Protection

The `state` value is a randomly generated string the client sends with the initial request. When the auth server redirects back, it includes this same `state` value. The client checks: *"Is this the same state I sent?"*

If it's different, someone tampered with the redirect — possibly a CSRF attack. The client rejects the response.

---

## Seeing It in Action — OAuth 2.0 Playground

The OAuth 2.0 Playground (https://www.oauth.com/playground/) lets you walk through the flow interactively:

1. **Register a client** — generates Client ID + Client Secret + test user credentials
2. **Build the authorization URL** — see the `response_type=code`, `client_id`, `redirect_uri`, `scope`, `state` parameters
3. **Login as the user** — enter the test credentials
4. **Grant consent** — approve the client's access request
5. **Verify the state** — confirm it matches what was sent
6. **Receive the authorization code**
7. **Exchange code for token** — send `grant_type=authorization_code`, `code`, `client_id`, `client_secret`
8. **Receive the access token**

💡 **Pro Tip:** Walk through this playground yourself. Seeing the actual HTTP requests and responses makes the flow click in a way that reading about it never can.

---

## ✅ Key Takeaways

- Authorization Code flow is for scenarios with **end users** (browsers, mobile apps)
- The user's credentials are **never** shared with the client application — only with the auth server
- Two-step verification: authorization code first, then token exchange with client credentials
- The `state` parameter prevents CSRF attacks during the redirect flow
- Implicit grant flow (one-step) is deprecated due to security vulnerabilities
- The token exchange happens backend-to-backend, keeping the access token out of the browser

⚠️ **Common Mistake:** Confusing when to use Client Credentials vs. Authorization Code. Simple rule: if a human is involved, use Authorization Code. If it's server-to-server with no UI, use Client Credentials.
