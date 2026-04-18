# How JWT Tokens Are Validated Using the Signature

## Introduction

We know JWT tokens have three parts: Header, Payload, and Signature. We know the Header and Payload are just Base64-encoded (readable by anyone). So how does the backend detect if someone tampered with the token? The answer lies in the **digital signature** and the **hashing formula**. Let's break it down step by step.

---

## Concept 1: The Signature Formula

### 🧠 How is the signature generated?

The backend uses this formula:

```
Signature = HashAlgorithm(
    base64UrlEncode(header) + "." + base64UrlEncode(payload),
    SECRET_KEY
)
```

Two inputs go into the hashing algorithm:
1. **The encoded header + "." + encoded payload** — everything that's visible in the token
2. **A secret key** — known ONLY to the backend server

The output is a **hash value** (digest) — which becomes the third part of the JWT token.

### 🧪 Example

```
Header (JSON):  { "alg": "HS256", "typ": "JWT" }
Header (encoded): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

Payload (JSON): { "name": "John Doe", "sub": "12345", "iat": 1713446400 }
Payload (encoded): eyJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiIxMjM0NSIsImlhdCI6MTcxMzQ0NjQwMH0

Signature = HMACSHA256(
    "eyJhbGci...9" + "." + "eyJuYW1l...0",
    "my-super-secret-key"
) → produces a hash value
```

### 💡 Insight

> The signature binds the header and payload to the secret. Change any part — header, payload, or secret — and the hash changes completely.

---

## Concept 2: What Happens During Login (Token Generation)

### ⚙️ Step-by-step

1. User logs in with valid credentials
2. Backend generates the **Header** (algorithm info, token type)
3. Backend generates the **Payload** (username, roles, issued time, expiration)
4. Both are **Base64 encoded**
5. Backend creates the **Signature** using the formula (encoded header + payload + secret)
6. The complete JWT token is sent to the client:

```
[Encoded Header].[Encoded Payload].[Signature Hash]
```

The client receives ALL three parts. The header and payload can be decoded and read. The signature cannot be reverse-engineered.

---

## Concept 3: How Validation Works — The Happy Path

### 🧠 When the token is NOT tampered

1. Client sends the JWT token with a secured API request
2. Backend extracts the **encoded header** and **encoded payload** from the token
3. Backend runs the **same formula** with its secret key:
   ```
   newHash = HMACSHA256(encodedHeader + "." + encodedPayload, SECRET_KEY)
   ```
4. Compares `newHash` with the **signature** in the token
5. **They match!** → Token is valid → Request is allowed

```
newHash == tokenSignature → ✅ Token is VALID → Allow request
```

---

## Concept 4: How Validation Works — Tampered Payload

### 🧠 What if someone changes the payload?

Let's say someone changes `"name": "John Doe"` to `"name": "Madan"`:

1. They decode the payload, change the name, re-encode it
2. They send the modified token to the backend
3. Backend extracts the **new encoded payload** and the **original encoded header**
4. Backend runs the formula:
   ```
   newHash = HMACSHA256(encodedHeader + "." + MODIFIED_encodedPayload, SECRET_KEY)
   ```
5. Since the payload changed, the **newHash is different** from the original signature
6. **They don't match!** → Token is INVALID → Request is rejected

```
newHash ≠ tokenSignature → ❌ Token is TAMPERED → Reject request
```

### 💡 Insight

> Even changing a single character in the payload produces a completely different hash. That's the nature of hashing — the output is drastically different for even the smallest input change.

---

## Concept 5: Can They Just Change the Signature Too?

### ❓ What if the attacker modifies the signature to match the new payload?

They **can't** — because to generate a valid signature, they need the **SECRET_KEY**. And the secret is known only to the backend server.

Without the secret:
- They can change the payload ✅
- They can re-encode it ✅  
- They can try to compute a new signature ❌ (they don't have the secret)
- Any signature they compute will be **invalid**

### 🧪 The Chain of Trust

```
Secret Key (server only) → Generates valid signature
No secret → Cannot generate valid signature
Modified token + invalid signature → Backend rejects it
```

---

## Concept 6: The Power of JWT Tokens

### 🧠 Everything is shared, yet nothing can be tampered

Think about this: we give the client **everything** — the header, the payload, and even the signature. Yet the client:
- ❌ Cannot change the header without breaking the signature
- ❌ Cannot change the payload without breaking the signature  
- ❌ Cannot forge a new signature without the secret key
- ✅ Can only READ the data (which is exactly what we want)

### ⚙️ The Secret Key is Everything

The security of JWT tokens ultimately depends on the **secret key**:
- It must be **complex** and **long** (not `12345` or `secret`)
- It must be **stored securely** on the server
- It must **never** be shared with client applications
- Usually it's a **random string** with all types of characters

---

## Concept 7: Visual Summary

```
LOGIN:
  Header + Payload + Secret → [Hash] → Signature
  Token = Header.Payload.Signature → Sent to client

SUBSEQUENT REQUESTS:
  Client sends token
  Backend extracts Header + Payload
  Backend computes: Hash(Header + Payload + Secret) → New Hash
  
  If New Hash == Signature → ✅ Valid token → Allow
  If New Hash ≠ Signature → ❌ Tampered token → Reject
```

---

## ✅ Key Takeaways

1. The **signature** is a hash of (encoded header + encoded payload + secret key)
2. If **any part** of the header or payload is changed, the hash value changes → tampering is detected
3. The attacker **cannot forge** a valid signature because they don't have the secret key
4. JWT tokens share everything openly, yet remain **tamper-proof** through the signature
5. The **secret key** is the foundation of JWT security — protect it at all costs
6. The same secret must be used for both **generating** and **validating** tokens

---

## ⚠️ Common Mistakes

1. **Using a simple secret** like `"secret"` or `"12345"` — makes brute-force guessing feasible
2. **Sharing the secret** with client applications — defeats the entire purpose of signatures
3. **Not validating signatures** on the backend — anyone could send forged tokens
4. **Hardcoding the secret** in source code without environment variable fallback

---

## 💡 Pro Tips

- Use a **256-bit or longer** random string as your secret key
- In production, inject the secret via **environment variables**, not hardcoded values
- The hashing algorithm (e.g., HS256, HS512) is specified in the Header — the backend must use the same algorithm for validation
- Coming up next: we'll implement JWT token generation in our Spring Boot backend!
