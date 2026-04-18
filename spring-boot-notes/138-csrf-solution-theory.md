# Solution to CSRF Attack — Theory

## Introduction

We now understand the CSRF attack — a forged request from an evil site using your browser's cookies. The question is: **how do we stop it?**

The answer is surprisingly simple in concept but requires careful implementation. It's called a **CSRF token** — and it's the industry-standard defense used by virtually every major web application.

---

## The Core Idea

The backend needs a way to distinguish between:
- A **legitimate request** from its own UI
- A **forged request** from an attacker's site

Currently, the backend can't tell the difference because both requests carry the same cookies — and that's the only thing the backend checks.

The solution: **require something that ONLY the legitimate UI can provide**.

---

## How CSRF Tokens Work

### 🧠 The Concept

1. When a user logs in, the backend generates a **random, unique CSRF token**.
2. This token is sent to the browser as a **cookie**.
3. For every subsequent **non-safe request** (POST, PUT, DELETE), the backend expects the CSRF token in **two places**:
   - In the **cookie** (sent automatically by the browser)
   - In the **request header** (sent manually by the JavaScript code)
4. If both values match → legitimate request. If the header is missing → forged request.

### ❓ Why Two Places?

Here's the critical insight:

| Location | Who Can Send It? | Legitimate UI | Hacker's Site |
|----------|-----------------|---------------|---------------|
| **Cookie** | Browser (automatic) | ✅ Yes | ✅ Yes |
| **Request Header** | JavaScript (manual) | ✅ Yes | ❌ No |

- The **browser** sends cookies automatically regardless of which site initiated the request. Both the legitimate UI and the hacker's site benefit from this.
- But the **request header** must be set by JavaScript code. And here's the key: **JavaScript on evil.com CANNOT read a cookie that belongs to netflix.com**.

> This is the **Same-Origin Policy** — a browser security rule that prevents JavaScript on one domain from reading cookies of another domain.

---

## The Netflix Scenario — With CSRF Protection

### ✅ Legitimate Flow

1. User logs into Netflix → backend sends a **login cookie** and a **CSRF token cookie**.
2. User navigates Netflix → Netflix's JavaScript reads the CSRF token from the cookie.
3. Netflix's JavaScript places the token value in the **request header** (e.g., `X-XSRF-TOKEN`).
4. Backend receives both the cookie AND the header → values match → **request accepted**.

### ❌ Hacker's Attack (Blocked)

1. User is logged into Netflix (Tab 1) and visits evil.com (Tab 2).
2. evil.com's JavaScript sends a POST request to Netflix.
3. Browser automatically attaches **both cookies** (login + CSRF token).
4. But evil.com's JavaScript **cannot read** the CSRF token cookie (different domain!).
5. Therefore, the CSRF token value is **NOT in the request header**.
6. Backend sees: cookie ✅ but header ❌ → **request rejected** (401/403).

### 💡 The Key Distinction

```
Legitimate request:
  Cookie: XSRF-TOKEN=abc123 ✅
  Header: X-XSRF-TOKEN=abc123 ✅
  → Backend: Both match → ACCEPT

Forged request (from evil.com):
  Cookie: XSRF-TOKEN=abc123 ✅ (sent automatically by browser)
  Header: (missing) ❌ (evil.com can't read the cookie)
  → Backend: Header missing → REJECT
```

---

## Why Can't the Hacker Read the Cookie?

The **Same-Origin Policy (SOP)** is a fundamental browser security feature:

- JavaScript on `evil.com` can only read cookies belonging to `evil.com`.
- It **cannot** read cookies belonging to `netflix.com`, even though they exist in the same browser.
- The browser sends cookies automatically (that's why CSRF works), but it doesn't let foreign JavaScript **read** them.

> The hacker can't generate a CSRF token on their own either — the token is unique per session and is a large random value that's impossible to guess.

---

## When Is CSRF Protection NOT Needed?

CSRF is only relevant for **web applications running in browsers**. It does NOT apply to:

- **Microservice-to-microservice** communication — no browser, no cookies
- **Mobile apps** — typically use bearer tokens in headers, not cookies
- **Desktop applications** — no browser-based cookie management

If there's no browser involved, there's no CSRF risk.

---

## Spring Security's Default CSRF Behavior

Spring Security enforces CSRF protection on all **non-safe HTTP methods** by default:

| HTTP Method | Safe? | CSRF Protected? |
|------------|-------|-----------------|
| `GET` | ✅ Yes | ❌ No |
| `HEAD` | ✅ Yes | ❌ No |
| `OPTIONS` | ✅ Yes | ❌ No |
| `POST` | ❌ No | ✅ Yes |
| `PUT` | ❌ No | ✅ Yes |
| `DELETE` | ❌ No | ✅ Yes |
| `PATCH` | ❌ No | ✅ Yes |

Safe methods only **read** data — they can't cause damage even if forged.

---

## Disabling CSRF (Low-Risk Applications Only)

```java
http.csrf(csrf -> csrf.disable());
```

Only acceptable for:
- Internal tools not exposed to the public internet
- Applications with no browser-based clients
- Development/testing environments

⚠️ **Never disable CSRF in production web applications.**

---

## ✅ Key Takeaways

- The CSRF solution uses a **token** that must be present in **both** the cookie AND the request header.
- The **browser** sends cookies automatically, but only **same-origin JavaScript** can read cookie values.
- Attackers can send the cookie (browser does it) but **cannot set the header** (they can't read the cookie from another domain).
- This is the **industry-standard** CSRF defense — used by Netflix, Amazon, Google, and virtually every major web app.
- Spring Security enforces CSRF on non-safe methods (POST, PUT, DELETE) by default.

## ⚠️ Common Mistakes

- **Thinking the cookie alone is sufficient** — the whole point is that the attacker CAN send the cookie. The header is the differentiator.
- **Disabling CSRF for convenience** — "it was easier" is not a valid security strategy.
- **Not understanding Same-Origin Policy** — it's the foundation that makes CSRF tokens work.

## 💡 Pro Tips

- CSRF tokens should be **unique per session** and **randomly generated** — never predictable.
- The token in the cookie and the token in the header must **match exactly** — this is what the backend validates.
- For SPA frameworks (React, Angular), the client reads the CSRF cookie value and places it in a custom header for every non-safe request.
