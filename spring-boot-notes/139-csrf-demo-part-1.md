# CSRF Protection End-to-End Demo — Part 1

## Introduction

We understand the theory — CSRF tokens must appear in both the cookie and the request header. Now let's **implement** this in Spring Security. This lecture covers the backend setup: configuring the CSRF token repository, creating the CSRF token REST API, and understanding the key classes and interfaces involved.

---

## Configuring CSRF in SecurityConfig

### ⚙️ The Configuration

```java
http.csrf(csrfConfig -> csrfConfig
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
);
```

This replaces the old `csrf(csrf -> csrf.disable())`. Let's break down each part.

---

### Part 1: `csrfTokenRepository()` — Where to Store the Token

```java
.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
```

#### 🧠 What Is `CsrfTokenRepository`?

An interface that defines **how** CSRF tokens are generated, stored, and retrieved. It has two main implementations:

| Implementation | Token Storage | Use Case |
|---------------|--------------|----------|
| `CookieCsrfTokenRepository` | Browser cookie | SPA apps (React, Angular) |
| `HttpSessionCsrfTokenRepository` | Server-side session | Traditional server-rendered apps |

We use `CookieCsrfTokenRepository` because our frontend is a React SPA.

#### ❓ What Does `withHttpOnlyFalse()` Mean?

Every cookie has an `HttpOnly` flag:

| `HttpOnly` Value | What Happens |
|-----------------|--------------|
| `true` (default) | JavaScript **cannot** read the cookie — only the browser can send it |
| `false` | JavaScript **can** read the cookie value |

We set it to `false` because our React frontend needs to **read** the CSRF token from the cookie and place it in the request header. If `HttpOnly` were `true`, the frontend couldn't read the cookie — defeating the purpose.

#### 🔑 Cookie and Header Names

`CookieCsrfTokenRepository` uses these standards:

| Element | Name |
|---------|------|
| Cookie name | `XSRF-TOKEN` |
| Expected header name | `X-XSRF-TOKEN` |

These follow the **AngularJS convention** (also used by React and other SPAs).

---

### Part 2: `csrfTokenRequestHandler()` — How to Expose the Token

```java
.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
```

#### 🧠 What Does This Do?

When a CSRF token is generated, it needs to be accessible within the request so that our REST API can return it. The `CsrfTokenRequestAttributeHandler` exposes the token as a **Request Attribute** with the name `_csrf`.

This means any controller handling a request can access the CSRF token via:

```java
request.getAttribute(CsrfToken.class.getName())
```

---

### Optional: `ignoringRequestMatchers()` — Exempting Endpoints

```java
.ignoringRequestMatchers("/api/some-path/**")
```

This tells Spring Security: "Don't enforce CSRF protection for these endpoints." Use this sparingly and only when you genuinely understand the risk.

For our application, we're **not** using this — we want CSRF protection everywhere.

---

## Building the CSRF Token REST API

### 🧠 Why Do We Need This?

The client application needs a way to **request** a CSRF token from the backend. Spring Security doesn't generate one automatically — it waits until the client asks.

### ⚙️ The Controller

```java
@RestController
@RequestMapping("/api/csrf-token")
public class CsrfController {

    @GetMapping("/public/v1.0")
    public CsrfToken getCsrfToken(HttpServletRequest request) {
        return (CsrfToken) request.getAttribute(CsrfToken.class.getName());
    }
}
```

### 🔍 How This Works

1. Client sends a **GET** request to `/api/csrf-token/public/v1.0`.
2. Spring Security intercepts the request and generates a CSRF token.
3. The token is placed in the **request attribute** (thanks to `CsrfTokenRequestAttributeHandler`).
4. Our controller reads it via `request.getAttribute()`.
5. The token is returned in two forms:
   - As part of the **response body** (the `CsrfToken` object)
   - As a **cookie** named `XSRF-TOKEN` (set by `CookieCsrfTokenRepository`)

### ❓ Why Must This Be a GET Request?

If it were a POST, it would **require** a CSRF token to invoke — creating a chicken-and-egg problem. GET requests are **safe methods** and exempt from CSRF protection.

### ❓ How Did We Know to Use `CsrfToken.class.getName()`?

The `CsrfTokenRequestAttributeHandler` documentation states:

> "The CSRF token is available as a request attribute named `CsrfToken.class.getName()`."

---

## Making the CSRF Endpoint Public

Add to your `PathsConfig`:

```java
"/api/csrf-token/public/**"
```

### ❓ If It's Public, Can't Hackers Get a Token Too?

Yes! A hacker can absolutely invoke this endpoint and get their own CSRF token. But that token is useless to them because:

- They'd get a token associated with **their own session**
- They still can't read the **victim's** CSRF token cookie (Same-Origin Policy)
- They can't forge requests against the victim's account

---

## The Key Classes and Interfaces

| Class/Interface | Purpose |
|----------------|---------|
| `CsrfTokenRepository` | Interface — defines how tokens are generated and stored |
| `CookieCsrfTokenRepository` | Stores token as a cookie (`XSRF-TOKEN`) |
| `HttpSessionCsrfTokenRepository` | Stores token in server session |
| `CsrfTokenRequestAttributeHandler` | Exposes token as request attribute (`_csrf`) |
| `CsrfToken` / `DefaultCsrfToken` | Represents the actual token value |
| `CsrfFilter` | Spring Security filter that validates tokens on non-safe requests |

---

## ✅ Key Takeaways

- Configure CSRF with `csrfTokenRepository()` and `csrfTokenRequestHandler()`.
- Use `CookieCsrfTokenRepository.withHttpOnlyFalse()` for SPA applications (React/Angular).
- Build a **GET** endpoint that returns the CSRF token — the client calls this before making non-safe requests.
- The `CsrfFilter` automatically validates tokens on POST/PUT/DELETE requests.
- Setting `HttpOnly = false` is **essential** for SPAs — otherwise JavaScript can't read the cookie.

## ⚠️ Common Mistakes

- **Leaving `HttpOnly = true`** — your SPA frontend won't be able to read the CSRF cookie.
- **Making the CSRF endpoint a POST** — it needs a token to invoke, creating a circular dependency.
- **Forgetting to add the CSRF endpoint to public paths** — unauthenticated users need to request tokens too.

## 💡 Pro Tips

- The CSRF token is session-scoped — it stays valid until the session expires or the user logs out.
- `CsrfFilter` is one of the many filters in Spring Security's filter chain — understanding the filter chain helps debug security issues.
- In microservice architectures where services communicate via API (no browser), you can safely disable CSRF for those inter-service endpoints.
