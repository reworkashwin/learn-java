# Registering Client & End User in Keycloak for Authorization Code Flow

## Introduction

The authorization code flow requires two registrations in Keycloak: one for the **client application** (the UI app) and one for the **end user** (the human). You can't reuse the client from the client credentials flow because the configuration options are fundamentally different. Let's set both up.

---

## Creating a New Client for Authorization Code Flow

### ❓ Why a new client?

The existing `easybank-callcenter-cc` client was created with **client credentials** as its grant type. Authorization code requires different settings — specifically, the **Standard Flow** must be enabled. Mixing grant types in a single client is possible but not clean for separation of concerns.

### Step-by-Step Client Creation

1. Go to **Clients** → **Create client**
2. **Client Type:** OpenID Connect
3. **Client ID:** `easybank-callcenter-ac` (the `ac` suffix distinguishes it from `cc`)
4. **Name/Description:** "Easy Bank Call Center UI App"
5. Click **Next**

### Capability Configuration

On the next page, the critical selections:

| Setting | Value | Why |
|---------|-------|-----|
| Client Authentication | ✅ Enabled | This client has a secret |
| Standard Flow | ✅ Enabled | This IS the authorization code flow |
| Direct Access Grants | ❌ Disabled | Not needed |
| Service Account Roles | ❌ Disabled | That's for client credentials |

### Login Settings

| Setting | Value | Notes |
|---------|-------|-------|
| Root URL | (leave empty) | Not needed for API testing |
| Home URL | (leave empty) | Not needed for API testing |
| Valid Redirect URIs | `*` | In production, set this to your actual redirect URL |
| Web Origins | `*` | Allows CORS from any domain |

### ⚠️ Why Valid Redirect URIs Matter

In production, this field is **critical for security**. If you leave it as `*`, a hacker could trick the auth server into redirecting the authorization code to their own malicious site. Always specify the exact redirect URL of your client application in production.

### Web Origins and CORS

When your client app runs on `app.example.com` and Keycloak runs on `auth.example.com`, browsers block cross-domain requests by default (CORS policy). The Web Origins setting tells Keycloak which domains are allowed to send requests. Using `*` allows all — fine for development, restrictive URLs for production.

---

## Creating an End User

### Step-by-Step User Creation

1. Go to **Users** → **Add user**
2. Fill in:
   - **Username:** `madan`
   - **Email:** `tutor@eazybytes.com`
   - **Email Verified:** Yes
   - **First Name:** Madan
   - **Last Name:** Reddy
3. Click **Create**

### Setting the Password

1. Go to the **Credentials** tab
2. Click **Set password**
3. Enter: `12345`
4. **Temporary:** OFF (otherwise the user is forced to change password on first login)
5. Save

---

## How End Users Get Created in Production

In real applications, the admin doesn't manually create every user. Keycloak exposes **REST APIs** for user management. Your signup page calls these APIs to create users programmatically.

The flow looks like:
1. User visits your signup page
2. Fills in registration details
3. Your application calls Keycloak's User REST API
4. Keycloak creates the user account

You can explore all available Admin REST APIs in Keycloak's official documentation under **Administration REST API**.

---

## What We Have Now

| Entity | Details |
|--------|---------|
| Client (Auth Code) | ID: `easybank-callcenter-ac`, Standard Flow enabled |
| Client (Client Creds) | ID: `easybank-callcenter-cc`, Service Accounts enabled |
| End User | Username: `madan`, Password: `12345` |

---

## ✅ Key Takeaways

- Authorization code flow requires a separate client with **Standard Flow** enabled
- The client secret is generated automatically — copy it for Postman configuration
- End users need both a username AND a password set (with Temporary = OFF for testing)
- Valid Redirect URIs should be restrictive in production to prevent redirect attacks
- Keycloak provides REST APIs for programmatic user creation — admins don't manually create every user

💡 **Pro Tip:** Name your clients with suffixes that hint at their grant type (`-cc` for client credentials, `-ac` for authorization code). It makes the Keycloak admin console much easier to navigate.
