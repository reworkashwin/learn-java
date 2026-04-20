# How Authentication Works

## Introduction

Before writing a single line of authentication code, you need to understand **what authentication actually is** and **how it works** in a React application that talks to a backend server. This foundational knowledge will make every implementation decision clear.

---

## What Is Authentication?

Authentication means that **certain backend resources are protected** and should not be accessible by everyone. Your React application must prove it has permission before the backend grants access.

Think of it like a nightclub with a bouncer. You can't just walk in — you need to prove you belong. But *how* do you prove it?

---

## The Authentication Flow

### Step 1: Send Credentials

The client (your React app) sends a request to the backend with **user credentials** — typically an email and password.

### Step 2: Server Validates

The backend server checks those credentials:
- Are they valid?
- Does this user exist?
- Is the password correct?

### Step 3: Server Responds with... What?

Here's where it gets interesting. Can the server just say "Yes, you're allowed"?

**No.** A simple "yes" isn't enough because you could **fake it**. Anyone could attach a "yes" to their requests and pretend to be authenticated. The server needs to respond with something that can be **verified** — something that proves you actually went through the authentication process.

---

## Two Solutions: Sessions vs. Tokens

### Server-Side Sessions

The idea: After login, the server stores a **unique identifier** (essentially a "yes" mapped to a specific client). That ID is sent back to the client, and the client includes it in future requests. The server checks if the ID matches a stored session.

**The catch:** This requires a tight coupling between frontend and backend. The server must store client state. React apps typically talk to **decoupled APIs** that don't store client information — making sessions less ideal.

### Authentication Tokens (JWT) ✅

This is the approach used in most modern React applications.

The idea:
1. After successful authentication, the server **creates a token** — a specially encoded string
2. The token is created using a **private key** that only the server knows
3. The server sends this token to the client but **does NOT store it**
4. The client stores the token and **attaches it to future requests**
5. The server can **validate** the token because it knows the private key used to create it

```
Client                          Server
  |                                |
  |--- POST /login (email, pw) -->|
  |                                |  validates credentials
  |                                |  creates JWT with private key
  |<-- Response { token: "..." }--|
  |                                |
  |  stores token locally          |
  |                                |
  |--- GET /events                 |
  |    Authorization: Bearer xxx ->|
  |                                |  validates token with private key
  |<-- Protected data ------------|
```

---

## JSON Web Tokens (JWT) Explained

A JWT is essentially a **string** created according to a specific algorithm and **signed** with a secret key:

- The token contains encoded information (like user ID, expiration time)
- It's signed with a private key that only the backend knows
- Anyone can *read* the token, but only the backend can *create and verify* valid ones
- Tokens typically have an **expiration time** (e.g., 1 hour)

💡 **Pro Tip:** Think of a JWT like a stamped wristband at a concert. The venue (server) stamps it with a special stamp (private key). Security guards (middleware) can check if the stamp is genuine, but no attendee can forge it.

---

## What Happens on the Backend

On the backend, a **middleware** layer sits in front of protected routes:

```
Request → Middleware (check token) → Route Handler
                                  ↗ ✅ Valid? → Proceed
                                  ↘ ❌ Invalid? → Error response
```

- **Unprotected routes** (like fetching events) don't require authentication
- **Protected routes** (like creating/editing/deleting events) require a valid token in the request headers

---

## What You Must Do on the Frontend

Once you understand the flow, here's your job as a React developer:

1. **Send credentials** to the backend's login/signup endpoint
2. **Store the token** you receive in the response
3. **Attach the token** to all requests that target protected resources
4. **Use the token's existence** to update the UI (show/hide buttons, redirect users)
5. **Clear the token** when it expires or the user logs out

---

## ✅ Key Takeaways

- Authentication = proving your identity to access protected resources
- **Server-side sessions** store state on the server → tightly coupled, less ideal for React SPAs
- **JWT tokens** are created and verified by the server but stored by the client → perfect for decoupled React + API architectures
- The token is signed with a private key — only the server can create and validate it
- Not all routes need authentication — only protected ones (create, edit, delete)

⚠️ **Common Mistake:** Thinking that hiding a button in the UI is "security." It's not. The backend must **always** validate the token. UI hiding is just a UX improvement.
