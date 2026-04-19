# Accepting Lowercase Service Names in Gateway

## Introduction

There's an annoying default behavior in Spring Cloud Gateway — it requires service names in **ALL CAPS** in the URL path (e.g., `/ACCOUNTS/api/create`). That's because Eureka registers services with uppercase names by default. But having `ACCOUNTS` in a URL path looks weird and unprofessional. Let's fix that.

---

## The Problem

By default:
- ✅ `http://localhost:8072/ACCOUNTS/api/fetch` — works
- ❌ `http://localhost:8072/accounts/api/fetch` — returns 404 Not Found

Sending paths in ALL CAPS is awkward and goes against URL conventions. You'd never ask clients to use `https://api.yourbank.com/ACCOUNTS/...` in production.

---

## The Fix: One Property

Add this property to your `application.yml`:

```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lowerCaseServiceId: true    # ← This is the fix
```

Setting `lowerCaseServiceId` to `true` tells the gateway to accept service names in **lowercase** in the URL path.

---

## After the Change

- ✅ `http://localhost:8072/accounts/api/fetch` — works
- ❌ `http://localhost:8072/ACCOUNTS/api/fetch` — now returns 404 (reversed!)

Once you enable lowercase service IDs, uppercase paths **stop working**. It's one or the other, not both. Choose lowercase — it's the standard convention for URL paths.

---

## ✅ Key Takeaways

- Add `lowerCaseServiceId: true` under `discovery.locator` to use lowercase service names in URLs
- This is a one-line property change — no code needed
- After enabling, uppercase paths stop working — it switches to lowercase-only
- Lowercase URLs are the standard convention and look professional

## 💡 Pro Tip

Always enable `lowerCaseServiceId: true` from the start. URL conventions universally use lowercase, and asking clients to use uppercase paths is a code smell that will confuse API consumers.
