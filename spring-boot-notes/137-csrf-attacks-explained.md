# How CSRF Attacks Can Exploit Your Application

## Introduction

You've built registration and login with database authentication. Everything works from Postman. But before testing from the UI application, there's a critical security concept to handle: **CSRF (Cross-Site Request Forgery)**.

Previously, we **disabled** CSRF protection in our Spring Security config. That was fine for learning, but it's a massive vulnerability in production. In this lesson, we learn what CSRF is, how attackers exploit it, and why your application is at risk.

---

## What Happens When We Re-Enable CSRF?

As soon as we remove the `csrf().disable()` line from our security config, Spring Security **enforces CSRF protection** by default. This means:

- **GET requests** → Still work fine ✅
- **POST/PUT/DELETE requests** → Blocked with `401 Unauthorized` ❌

Even our **public** registration endpoint stops working! Why? Because CSRF protection applies to all **non-safe HTTP methods**, regardless of whether the endpoint is authenticated or public.

---

## What is CSRF?

### 🧠 The Definition

**CSRF (Cross-Site Request Forgery)** is an attack that tricks a user into performing an unwanted action on a website where they're currently authenticated — **without their knowledge or consent**.

Let's break this down with a story.

---

## The Netflix Attack Scenario

### 🎬 Setting the Scene

It's Friday night. You log into **Netflix.com** to watch a movie.

1. You enter your credentials on Netflix.
2. Netflix backend validates them and sends back a **cookie** stored in your browser.
3. This cookie is tagged to the domain `netflix.com`.
4. As long as this cookie exists, you can browse Netflix without logging in again.

> This is how most websites work. Amazon, Gmail, Netflix — they all use cookies to maintain your session.

### 😈 The Attack

After an hour of Netflix, you open a **new tab** in the same browser and visit `evil.com` — a website controlled by a hacker.

The `evil.com` page displays a tempting link:

> 🎉 **90% OFF on iPhone — Click Here!**

You click it. Behind the scenes, this is what the hacker's JavaScript does:

```html
<form action="https://netflix.com/change-email" method="POST">
    <input type="hidden" name="email" value="hacker@evil.com" />
</form>
<script>
    document.forms[0].submit();
</script>
```

### 🔍 What Just Happened?

1. The hidden form sends a **POST request** to Netflix.com to change your email.
2. Since the request goes to `netflix.com`, the browser **automatically attaches** all Netflix cookies.
3. Netflix sees a valid cookie → thinks it's a legitimate request → changes your email to the hacker's.
4. **You never consented to this.** You just clicked a link on a different website.

### The Key Insight

The hacker **didn't steal your password**. They didn't need to. They tricked your browser into making a request using your existing credentials (cookies).

---

## Why Is It Called "Cross-Site Request Forgery"?

Let's break down the name:

| Word | Meaning |
|------|---------|
| **Cross-Site** | The attack originates from a **different website** (evil.com) targeting another site (netflix.com) |
| **Request** | A HTTP request is being sent |
| **Forgery** | The request is **faked** — it looks legitimate but wasn't initiated by the real user |

> A forged request from one site to another, using the victim's credentials. That's CSRF.

---

## Why Does the Browser Attach Cookies Automatically?

This is the **fundamental behavior** that enables CSRF:

- When a request is sent to a domain (e.g., `netflix.com`), the browser **automatically attaches** all cookies associated with that domain.
- It doesn't matter **which tab** or **which website** initiated the request.
- The browser doesn't check if the request was user-initiated or script-initiated.

So from `evil.com`, a script sends a request to `netflix.com`, and the browser helpfully attaches the Netflix cookies. The Netflix server has no way to tell the difference between:
- A legitimate request from the Netflix UI
- A forged request from evil.com

---

## When Is CSRF NOT a Concern?

CSRF attacks are **only possible** for web applications with browsers. They are NOT a concern for:

- **Backend-to-backend microservice calls** — no browser, no cookies
- **Mobile apps using tokens** — tokens aren't auto-attached like cookies
- **APIs using only JWT in headers** — not vulnerable to CSRF (JWT must be explicitly attached)

CSRF exploits the fact that browsers **automatically** send cookies. If there's no browser, there's no CSRF.

---

## Safe vs Non-Safe HTTP Methods

Spring Security distinguishes between:

| Type | Methods | CSRF Protection |
|------|---------|-----------------|
| **Safe** | `GET`, `HEAD`, `OPTIONS` | Not enforced — these only read data |
| **Non-Safe** | `POST`, `PUT`, `DELETE`, `PATCH` | **Enforced** — these modify data |

A hacker can read data through a forged GET request, but they can't do much damage. The real danger is when they can **create, update, or delete** data — hence CSRF protection targets non-safe methods.

---

## The Temptation: Just Disable CSRF

You *can* disable CSRF protection:

```java
http.csrf(csrf -> csrf.disable());
```

But this is **only acceptable** for:
- Internal applications not accessible from the public web
- Low-severity applications
- Development/testing environments

For any **production** or **user-facing** application, properly implementing CSRF protection is non-negotiable.

---

## ✅ Key Takeaways

- **CSRF** tricks users into making unintended requests using their existing browser cookies.
- The browser **automatically attaches cookies** — the hacker doesn't need to steal credentials.
- CSRF is only relevant for **web applications** with browser-based sessions — not for API-to-API calls.
- Spring Security enforces CSRF protection on **non-safe HTTP methods** (POST, PUT, DELETE) by default.
- **Never disable CSRF** in production unless you fully understand the implications.

## ⚠️ Common Mistakes

- **Disabling CSRF and forgetting about it** — it works in development but creates vulnerabilities in production.
- **Thinking CSRF steals passwords** — it doesn't. It exploits existing authenticated sessions.
- **Assuming public endpoints don't need CSRF handling** — Spring Security blocks ALL non-safe methods without a token.

## 💡 Pro Tips

- CSRF is one of the **OWASP Top 10** web security vulnerabilities — understanding it is essential for any web developer.
- If you're building a pure API backend consumed only by mobile apps (no browser), CSRF doesn't apply.
- The solution involves **CSRF tokens** — which we'll implement in the next lecture.
