# Introduction to Retry Pattern

## Introduction

Circuit breaker stops traffic to a failing service. Timeouts prevent indefinite waiting. But what about **transient failures** — those brief moments when a service hiccups but would succeed if you just tried again? That's where the **Retry Pattern** comes in.

---

## What Is the Retry Pattern?

The Retry pattern automatically **re-attempts a failed operation** a configured number of times before giving up. It's designed for situations where failures are temporary and likely to resolve on their own within seconds.

Think about it: you're calling a microservice and it fails because of a momentary network glitch. If you wait half a second and try again, it'll probably work. The Retry pattern automates this — instead of failing on the first attempt, it tries again (and again) before declaring failure.

---

## When Does Retry Make Sense?

Retry works best for **transient faults**:
- Brief network disruptions
- Temporary DNS resolution failures
- Service momentarily overloaded (returns 503)
- Database connection pool briefly exhausted
- Intermittent timeout

These are problems that **fix themselves in seconds.** A retry after a short delay often succeeds.

---

## Key Configuration Decisions

### 1. Number of Retries

How many times should you retry? This depends on your business context:
- Too few retries → you might miss a successful attempt
- Too many retries → you waste resources and delay the response

Typical values: **3 to 5 retries** for most use cases.

### 2. Conditional Retries

You don't have to retry blindly. Retry logic can be **conditional** based on:
- HTTP status codes (retry on 503, don't retry on 400)
- Exception types (retry on `TimeoutException`, don't retry on `IllegalArgumentException`)
- Response content

### 3. Backoff Strategy

This is the most important configuration. There are two approaches:

**Simple retry (no backoff):**
```
Attempt 1 → fail → wait 2s → Attempt 2 → fail → wait 2s → Attempt 3
```
Fixed delay between retries. Simple, but can overwhelm a recovering service.

**Exponential backoff (recommended):**
```
Attempt 1 → fail → wait 2s → Attempt 2 → fail → wait 4s → Attempt 3 → fail → wait 8s
```

Each retry waits **longer** than the previous one. Why?

- Gives the failing service **more time to recover** with each attempt
- Reduces the risk of **overwhelming** a service that's already struggling
- Higher chance of success on later attempts because more time has passed

---

## Retry + Circuit Breaker: Working Together

These two patterns are **complementary**, not competing:

- **Retry** handles transient, short-lived failures (network blip)
- **Circuit Breaker** handles sustained failures (service is down)

You can combine them: retry 3 times, and if all 3 fail, the circuit breaker counts that as a failure. After enough failed attempts across multiple requests, the circuit opens.

```
Request → Retry (3 attempts) → all fail → Circuit Breaker counts failure
Next Request → Retry (3 attempts) → all fail → Circuit Breaker counts failure
...
Circuit Breaker: "Failure rate exceeded 50% → OPEN"
```

---

## Critical Warning: Idempotency

### Only retry idempotent operations!

**Idempotent operation:** Produces the same result no matter how many times you call it.
- `GET /api/accounts?mobileNumber=123` → returns the same account data whether called 1 or 10 times ✅
- `GET /api/loans/fetch` → always returns the same loan data ✅

**Non-idempotent operation:** Produces different results or side effects on repeated calls.
- `POST /api/accounts/create` → creates a new account each time ❌
- `PUT /api/accounts/update` with a counter increment → increments multiple times ❌

If you retry a `POST /create` three times and two of them succeed, you've created **two records** instead of one. That's data corruption.

### The rule:
- **Safe to retry:** GET, HEAD, OPTIONS, and idempotent PUT/DELETE
- **Dangerous to retry:** POST, non-idempotent PUT/PATCH

---

## ✅ Key Takeaways

- Retry pattern automatically re-attempts failed operations — ideal for transient faults
- **Exponential backoff** is recommended over fixed-delay retries — it gives services time to recover
- Retry and Circuit Breaker are complementary: retry handles brief failures, circuit breaker handles sustained ones
- **Only retry idempotent operations** — retrying creates/updates can cause data corruption
- Configure retries conditionally: retry on 503 (server overloaded), don't retry on 400 (bad request)

## ⚠️ Common Mistakes

- Retrying non-idempotent operations (POST, PUT with side effects) — leads to duplicate records or corrupted data
- Retrying without backoff → overwhelming an already struggling service with immediate retry attempts
- Retrying on client errors (4xx) — if the request is malformed, retrying won't fix it
- Too many retries with long delays → user waits too long for a response

## 💡 Pro Tip

A good retry strategy includes **jitter** — adding a small random delay on top of the exponential backoff. Without jitter, if 1000 clients all fail at the same time and retry after exactly 2 seconds, they'll all hit the recovering service simultaneously at second 2. With jitter (e.g., 2s ± 500ms random), the retries are spread out, reducing the "thundering herd" effect.
