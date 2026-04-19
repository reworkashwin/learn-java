# Getting Access Token from Auth Server in Client Credentials Flow

## Introduction

We've set up Keycloak and registered our client. Now it's time for the moment of truth — actually requesting an access token and understanding what's inside it. This is where the theory becomes tangible.

---

## Finding the Token Endpoint

Before the client can request a token, it needs to know *where* to send the request. Every OIDC-compliant auth server exposes a discovery endpoint.

In Keycloak:
1. Go to **Realm Settings**
2. Scroll to the bottom → **Endpoints** section
3. Click **OpenID Endpoint Configuration**

This opens a JSON document listing all supported endpoints. Look for:

```
"token_endpoint": "http://localhost:7080/realms/master/protocol/openid-connect/token"
```

This is the URL your client application will POST to.

---

## Making the Token Request

### The Request

```
POST http://localhost:7080/realms/master/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id=easybank-callcenter-CC
client_secret=<your-generated-secret>
scope=openid email profile
```

### Understanding Each Parameter

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `grant_type` | `client_credentials` | Tells Keycloak which OAuth2 flow to use |
| `client_id` | `easybank-callcenter-CC` | Client's identity (the "username") |
| `client_secret` | *(from Keycloak)* | Client's credential (the "password") |
| `scope` | `openid email profile` | Requested permissions |

### About Scopes

You might wonder: "We never assigned scopes to our client. How does this work?"

Keycloak assigns **default scopes** to every new client automatically. Go to your client's **Client Scopes** tab and you'll see:

| Default Scope | Description |
|--------------|-------------|
| `address` | Access to address claims |
| `email` | Access to email claims |
| `phone` | Access to phone claims |
| `profile` | Access to profile claims |
| `roles` | Access to role claims |

The `openid` scope is implicit — since we selected OpenID Connect as the client type, it's always available.

---

## The Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 60,
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

### Key Observations

- **access_token** — A JWT (JSON Web Token) for authorization
- **id_token** — A JWT for authentication (returned because we included `openid` in the scope)
- **expires_in: 60** — The token is valid for 60 seconds (configurable in Keycloak admin)
- **token_type: Bearer** — The token should be sent as a `Bearer` token in the `Authorization` header

### What Happens Without the `openid` Scope?

If you remove `openid` from the scope and send just `email profile`:
- You still get an **access_token** ✅
- You do **NOT** get an **id_token** ❌

The `openid` scope is what triggers the OpenID Connect layer and the ID token generation.

---

## Decoding the JWT Tokens

JWT tokens are Base64-encoded. To see what's inside, paste them into [jwt.io](https://jwt.io).

### Access Token Payload

```json
{
  "exp": 1234567890,
  "iat": 1234567830,
  "iss": "http://localhost:7080/realms/master",
  "client_id": "easybank-callcenter-CC",
  "scope": "openid email profile",
  "realm_access": {
    "roles": ["default-roles-master", ...]
  },
  "email_verified": false,
  "preferred_username": "service-account-easybank-callcenter-cc",
  "clientHost": "172.17.0.1",
  "clientId": "easybank-callcenter-CC"
}
```

Key fields:
- **exp** — When the token expires
- **iat** — When the token was issued
- **iss** — Who issued the token (your Keycloak realm)
- **scope** — What permissions this token carries
- **roles** — What roles the client has
- **preferred_username** — The service account username (auto-created for Client Credentials clients)

### ID Token Payload

The ID token contains similar information focused on identity:
- Client ID, client host, preferred username
- It confirms *who* the client is, while the access token controls *what* they can do

---

## Real-World Usage

In this demo, we used Postman to simulate a client requesting a token. In a real application:

1. The client application's backend code makes this POST request programmatically (using Java's `RestTemplate`, `WebClient`, or any HTTP client)
2. It extracts the `access_token` from the response
3. It includes the token in subsequent requests to the Resource Server:

```
GET /api/fetchCustomerDetails
Authorization: Bearer eyJhbGci...
```

The client doesn't need a browser, a login page, or human interaction — it's completely automated.

💡 **Pro Tip:** Always handle token expiration in your client code. The token has a TTL (default 60 seconds in Keycloak). Your client should either refresh the token before expiry or request a new one when the current one expires.

---

## ✅ Key Takeaways

- Find the token endpoint via Keycloak's OpenID Endpoint Configuration (under Realm Settings)
- POST to the token endpoint with `grant_type=client_credentials`, `client_id`, `client_secret`, and `scope`
- Including `openid` in scope returns **both** access token and ID token; without it, only access token
- Tokens are JWT (JSON Web Token) format — decode at jwt.io to inspect their payload
- Default scopes (email, profile, roles, etc.) are auto-assigned by Keycloak
- Access tokens expire (default 60s) — your client code must handle renewal
- In real applications, the token request is made programmatically, not via Postman
