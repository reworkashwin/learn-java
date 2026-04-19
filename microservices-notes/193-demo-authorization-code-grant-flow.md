# Demo: Authorization Code Grant Type Flow in Action

## Introduction

We have the client and end user registered in Keycloak. Now let's prove the authorization code flow actually works — using Postman to simulate a UI application, complete with browser-based login, role validation, and token management.

---

## Setting Up Postman for Authorization Code Flow

### Configuration in the Authorization Tab

| Setting | Value |
|---------|-------|
| Type | OAuth 2.0 |
| Header Prefix | Bearer |
| Token Name | `auth_code_access_token` |
| Grant Type | **Authorization Code** |
| Callback URL | Auto-populated (Postman's built-in callback) |
| **Authorize using browser** | ✅ Checked |
| Auth URL | `http://localhost:7080/realms/master/protocol/openid-connect/auth` |
| Access Token URL | `http://localhost:7080/realms/master/protocol/openid-connect/token` |
| Client ID | `easybank-callcenter-ac` |
| Client Secret | (your client's secret from Keycloak) |
| Scope | `openid email profile` |
| State | Any random alphanumeric value |
| Client Authentication | Send client credentials in body |

### Where Do the URLs Come From?

- **Auth URL** → The authorization endpoint from Keycloak's OpenID configuration
- **Access Token URL** → The token endpoint from the same configuration

These are the same endpoints you can find by accessing Keycloak's `.well-known/openid-configuration`.

---

## The Browser-Based Login Flow

### Critical Step: Close All Browsers First!

Before clicking "Get New Access Token", **close all browser windows**. If you have an existing Keycloak admin session, the browser will use those admin credentials instead of prompting for end-user login.

### What Happens When You Click "Get New Access Token"

1. Postman opens your **default browser** to Keycloak's login page
2. You enter end-user credentials: `madan` / `12345`
3. Click **Sign In**
4. Behind the scenes:
   - Keycloak issues an authorization code
   - Postman receives it via the callback URL
   - Postman automatically exchanges the code for an access token
5. Back in Postman: you see the token. Click **Use Token**.

This entire browser dance mirrors what a real UI application would do — redirect the user to Keycloak for login, then catch the callback with the authorization code.

---

## Testing — The Role Problem

### First Attempt: 403 Forbidden

With the token from the authorization code flow:

**POST** `/eazybank/accounts/api/create` → ❌ **403 Forbidden**

Wait, why? The token is valid (not 401), but authorization fails (403). The reason: our end user `madan` doesn't have any roles assigned yet.

Remember: the Gateway expects `hasRole("ACCOUNTS")`. The end user's token has no custom roles.

---

## Assigning Roles to End Users

For end users (unlike clients), roles are assigned through **Role Mapping** — not Service Account Roles.

1. Go to **Users** → select `madan`
2. Click **Role Mapping** tab
3. Click **Assign Role**
4. Select: `ACCOUNTS`, `CARDS`, `LOANS`
5. Click **Assign**

### Now Get a Fresh Token

Close the browser (to clear the current session), then click "Get New Access Token" again in Postman. Log in as `madan` — the new token will include all three roles.

---

## Testing All APIs

| API | Method | Role Required | Result |
|-----|--------|--------------|--------|
| Accounts Create | POST | ACCOUNTS | ✅ 201 |
| Cards Create | POST | CARDS | ✅ 201 |
| Loans Create | POST | LOANS | ✅ 201 |
| Fetch Customer Details | GET | None (permitAll) | ✅ 200 |

All APIs work with the authorization code flow — no changes needed in the Gateway server!

---

## Preparing Docker Images

After testing, the section concludes with:
- Updating all `pom.xml` tag versions from `S11` to `S12` for the new section
- Generating Docker images for all microservices
- Updating Docker Compose files

---

## ✅ Key Takeaways

- Postman's "Authorize using browser" option simulates a real UI app's OAuth flow
- Close all browsers before testing to avoid session conflicts with admin credentials
- End user roles are assigned via **Role Mapping** (not Service Account Roles)
- The Gateway server requires **zero code changes** to support both client credentials and authorization code flows
- Always get a fresh token after assigning new roles — old tokens don't update

⚠️ **Common Mistake:** Having a Keycloak admin session active in the browser when testing. Postman will reuse that session, and you'll get admin tokens instead of end-user tokens.
