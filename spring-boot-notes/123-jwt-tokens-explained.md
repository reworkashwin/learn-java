# JWT Tokens Explained — Modern Token-Based Authentication

## Introduction

Before we generate JWT tokens in our backend, let's understand what they are, how they work, and why the industry loves them. We'll explore the difference between **Opaque tokens** and **JWT tokens**, break down the three parts of a JWT (Header, Payload, Signature), and understand why the signature makes JWT tokens tamper-proof.

---

## Concept 1: Tokens in Action — Spring Security's Default Behavior

### 🧠 What happens by default?

Even without explicitly implementing tokens, Spring Security already uses them! When you log in using form-based login:

1. Spring Security authenticates you
2. It generates a **JSESSIONID** cookie containing a token
3. This cookie is stored in your browser
4. For every subsequent request, the browser automatically sends this cookie
5. The backend recognizes the token and skips re-authentication

### 🧪 Quick Demo

- Log in to a secured page → view **Developer Console → Application → Cookies**
- You'll see a cookie named `JSESSIONID` with a token value
- Refresh the page → no login prompt (the cookie is doing the work)
- **Delete** or tamper with the cookie → the login page reappears!

### 💡 Insight

> Tokens are not a new concept — Spring Security has been using them silently. We're just going to upgrade from the default token type to a more powerful one.

---

## Concept 2: Two Flavors of Tokens

### 🔑 Opaque Tokens

- **Random strings** with no inherent meaning
- Example: `JSESSIONID = abc123xyz789`
- The token itself tells you nothing — it's just a reference
- The server stores the session data and maps the token to it
- To validate, the server must **look up** the token in its storage

### 🔑 JSON Web Tokens (JWT / "JOT")

- **Self-contained** tokens with actual data inside them
- Contains three parts: **Header**, **Payload**, **Signature**
- You can embed user information directly in the token (username, roles, email)
- You can set an **expiration time**
- The client can **read** the token data without calling the server
- Pronounced as **"JOT"** in the industry

### 🧪 Comparison

| Feature | Opaque Token | JWT Token |
|---------|-------------|-----------|
| Contains data? | ❌ No — just a random string | ✅ Yes — user info, roles, expiration |
| Self-contained? | ❌ No — server must look up session | ✅ Yes — all info is in the token |
| Readable by client? | ❌ No | ✅ Yes (Base64 decoded) |
| Expiration built-in? | ❌ No — managed server-side | ✅ Yes — embedded in the token |
| Industry preference? | Less common | ✅ Widely used |

---

## Concept 3: Anatomy of a JWT Token

### 🧠 The Three Parts

A JWT token is a long string with three sections separated by **periods (.):**

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJKV1QgVG9rZW4iLCJ1c2VybmFtZSI6Im1hZGFuIn0.abc123signature
|_______ Header _______|._____________ Payload ______________|._____ Signature _____|
```

### Part 1: Header (Metadata)

Contains metadata about the token:
```json
{
    "alg": "HS256",    // Hashing algorithm used for signature
    "typ": "JWT"       // Type of token
}
```

This JSON is **Base64 encoded** → becomes the first part of the token.

### Part 2: Payload (User Data)

Contains actual user information (called **claims**):
```json
{
    "sub": "JWT Token",           // Subject
    "username": "madan",          // Custom claim
    "roles": "ROLE_USER",         // Custom claim
    "iat": 1713446400,            // Issued at (timestamp)
    "exp": 1713532800             // Expiration (timestamp)
}
```

This JSON is also **Base64 encoded** → becomes the second part.

### Part 3: Signature (Tamper Protection)

A **hash value** generated from the header + payload + a secret key. This is what makes JWT tokens secure.

```
HMACSHA256(
    base64UrlEncode(header) + "." + base64UrlEncode(payload),
    secret
)
```

### 💡 Insight

> The header and payload are just Base64 encoded — anyone can decode them and read the content. The **signature** is what prevents tampering. It's the security backbone of JWT.

---

## Concept 4: Why JWT Tokens Are Powerful

### ✅ Advantage 1: Self-Contained

The frontend can read user information directly from the token:
- What's the user's role? → Check the payload
- When does the token expire? → Check the `exp` claim
- No need to call the backend for this information

### ✅ Advantage 2: Configurable Expiration

You set the expiration when creating the token:
- 60 minutes for high-security apps
- 24 hours for normal apps
- 1 month for "remember me" features

### ✅ Advantage 3: Reduces Server Load

Unlike opaque tokens, the server doesn't need to maintain session storage. The token carries everything needed for validation.

### ✅ Advantage 4: Works Across Services

In a microservices architecture, any service with the secret key can validate the token. No need for a centralized session store.

---

## Concept 5: The Tampering Risk

### ❓ What if someone changes the token?

Since the payload is just Base64 encoded, someone could:
1. Decode the payload
2. Change `"role": "USER"` to `"role": "ADMIN"`
3. Re-encode and send the modified token

If the backend can't detect this tampering, the user gets elevated privileges — a serious security breach!

### 🧠 This is exactly why the Signature exists

The signature is a hash of the header + payload + a **secret key** known only to the server. If anyone changes even one character in the header or payload, the signature won't match, and the backend rejects the token.

We'll explore exactly how this works in the next lecture.

---

## Concept 6: When Is the Signature Optional?

### 🧠 Internal vs External Communication

- **Internal networks** (services within your company): Signature is technically optional because tampering risk is low
- **Web applications** (exposed to the internet): Signature is **mandatory** because tokens can be intercepted and modified

### 💡 Insight

> In practice, **always include the signature**. It's a small computational cost for significant security benefits.

---

## ✅ Key Takeaways

1. **Opaque tokens** are random strings with no inherent meaning — server must maintain session state
2. **JWT tokens** are self-contained with three parts: Header, Payload, Signature
3. Header and Payload are **Base64 encoded** — anyone can decode and read them
4. The **Signature** prevents tampering — it's the security mechanism of JWT
5. JWT tokens can carry user data (username, roles, email) directly in the payload
6. You can set **expiration times** on JWT tokens
7. JWT tokens are the **industry standard** for modern web applications

---

## ⚠️ Common Mistakes

1. **Storing sensitive data** (like passwords) in the JWT payload — the payload is readable by anyone
2. **Skipping the signature** for web-facing applications — always sign your tokens
3. **Confusing encoding with encryption** — JWT payload is encoded (readable), not encrypted (secret)
4. **Setting very long expiration times** — increases the window of vulnerability if a token is stolen

---

## 💡 Pro Tips

- You can inspect any JWT token at [jwt.io](https://jwt.io) — paste the token and see the decoded header, payload, and signature
- The `iat` (issued at) and `exp` (expiration) claims use Unix timestamps (seconds since Jan 1, 1970)
- In the next lectures, we'll generate JWT tokens in our backend and build a filter to validate them
