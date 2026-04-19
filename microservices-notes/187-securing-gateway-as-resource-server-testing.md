# Securing the Gateway Server as a Resource Server — Testing

## Introduction

Configuration means nothing if it doesn't work in practice. In this section, we put the security setup to the test — verifying that GET APIs are truly public, POST APIs are truly protected, and access tokens are properly validated by the resource server.

---

## Testing Public GET APIs (No Security Required)

With all services started (Config Server → Eureka → Accounts/Loans/Cards → Gateway), the first thing to verify is that GET requests go through without authentication.

| API | Path | Result |
|-----|------|--------|
| Accounts | `/eazybank/accounts/api/contact-info` | ✅ 200 OK |
| Cards | `/eazybank/cards/api/java-version` | ✅ 200 OK |
| Loans | `/eazybank/loans/api/build-info` | ✅ 200 OK |

No authorization header. No tokens. Just a plain request — and it works. This confirms the `permitAll()` rule for GET requests is functioning correctly.

---

## Testing Protected POST APIs (Security Required)

Now try creating an account without an access token:

**Request:** POST `/eazybank/accounts/api/create`  
**Authorization:** None  
**Result:** ❌ **401 Unauthorized**

This is exactly what we want. The Gateway (acting as a resource server) rejects the request because no access token was provided.

---

## Using Postman's OAuth 2.0 Feature for Easy Token Management

Manually copying access tokens from one request and pasting them into another is tedious. Postman has a built-in OAuth 2.0 feature that automates this.

### Setup Steps

1. Go to the **Authorization** tab of your request
2. Select Type: **OAuth 2.0**
3. Fill in:
   - **Token Name:** Any descriptive name (e.g., `clientcredentials_access_token`)
   - **Grant Type:** Client Credentials
   - **Access Token URL:** Your Keycloak token endpoint
   - **Client ID / Client Secret:** Your registered client's credentials
   - **Scope:** `openid`
   - **Client Authentication:** Send client credentials in body
4. Click **"Get New Access Token"**
5. Click **"Use Token"**

The token automatically populates the `Authorization: Bearer <token>` header for your request.

💡 **Pro Tip:** Every time your token expires, just click "Get New Access Token" → "Use Token" — no manual copy-pasting needed.

---

## Testing with a Valid Access Token

With the token attached:

**Request:** POST `/eazybank/accounts/api/create`  
**Authorization:** Bearer `<valid_access_token>`  
**Result:** ✅ **201 Created**

The resource server validated the token against Keycloak's public certificate and confirmed it's legitimate.

---

## Testing with a Tampered Access Token

What if someone modifies the token? Delete a few characters from the access token and resend:

**Result:** ❌ **401 Unauthorized**

The resource server detects that the token's signature no longer matches. It rejects the request immediately. This proves the JWT validation is working — the Gateway isn't just checking *if* a token exists, it's verifying the token's integrity using Keycloak's public key.

---

## Testing Cards and Loans

The same pattern works for all protected endpoints:

| API | With Valid Token | Without Token |
|-----|-----------------|---------------|
| POST Cards `/api/create` | ✅ 201 | ❌ 401 |
| POST Loans `/api/create` | ✅ 201 | ❌ 401 |
| GET Fetch Customer Details | ✅ 200 (no token needed) | ✅ 200 |

---

## ✅ Key Takeaways

- GET APIs pass through without authentication — `permitAll()` works as configured
- POST/PUT/DELETE APIs are blocked without a valid token — `authenticated()` enforced
- Tampered tokens are caught and rejected — JWT signature validation is working
- Postman's OAuth 2.0 feature saves significant time during testing
- The `fetchCustomerDetails` GET endpoint works without auth and returns aggregated data from accounts, loans, and cards

⚠️ **Common Mistake:** Forgetting to select "Send client credentials in body" in Postman's OAuth 2.0 setup. This causes authentication failures even with correct credentials.
