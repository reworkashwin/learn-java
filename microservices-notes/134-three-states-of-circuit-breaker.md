# Three States of Circuit Breaker Pattern

## Introduction

The circuit breaker isn't a simple on/off switch. It operates through **three distinct states**, and understanding the transitions between them is essential for configuring it correctly. Let's walk through each state and how they work together.

---

## State 1: Closed (Normal Operation)

### What happens:
- **All requests are allowed** through to the microservice
- The circuit breaker silently **monitors** every call
- It tracks success rates and failure rates

### Analogy:
In an electrical circuit, "closed" means current flows freely. Same concept here — traffic flows to the microservice without restriction.

### Transition to Open:
The circuit breaker continuously calculates the **failure rate**. If the failure rate crosses a configured threshold (e.g., 50%), it transitions to the **Open** state.

Example: You configure `failureRateThreshold = 50%` and `slidingWindowSize = 10`. The circuit breaker monitors 10 requests. If 5 or more of those 10 fail, the failure rate is ≥50%, and the circuit opens.

---

## State 2: Open (Protecting the System)

### What happens:
- **No requests** reach the actual microservice
- Every call **fails immediately** with an error or invokes the fallback
- Dependent services are protected from wasting threads waiting for responses

### Duration:
The circuit stays open for a configured period called `waitDurationInOpenState` (e.g., 90 seconds). This gives the failing service time to recover.

### Think of it this way:
The circuit breaker says: *"I've seen enough failures. I'm not going to keep sending traffic to a service that's clearly struggling. I'll wait 90 seconds and check again."*

### Transition to Half-Open:
After the wait duration expires, the circuit automatically moves to **Half-Open**.

---

## State 3: Half-Open (Testing Recovery)

### What happens:
- The circuit breaker allows a **small number of test requests** through (configured by `permittedNumberOfCallsInHalfOpenState`)
- It watches the results of these test calls closely

### Two possible outcomes:

**If most test calls succeed** → The service has recovered → Transition to **Closed** (back to normal)

**If most test calls fail** → The service is still struggling → Transition back to **Open** (wait again)

### The cycle:

```
Closed → [failures exceed threshold] → Open
  ↑                                       ↓
  └── [test calls succeed] ── Half-Open ──┘
                               ↓
                     [test calls fail] → Open (wait again)
```

This **Open → Half-Open → Open** cycle repeats periodically until the service recovers. It's a self-regulating feedback loop.

---

## How the States Map to Configuration

| Configuration Property | What It Controls |
|------------------------|-----------------|
| `slidingWindowSize` | How many requests to monitor before evaluating |
| `failureRateThreshold` | Percentage of failures that triggers Open state |
| `waitDurationInOpenState` | How long to stay Open before trying Half-Open |
| `permittedNumberOfCallsInHalfOpenState` | How many test requests to allow in Half-Open |

---

## Visual Summary

```
        ┌─────────────────────────────────────────┐
        │         CLOSED (Normal)                  │
        │  • All traffic allowed                   │
        │  • Monitoring failure rate               │
        └──────────────┬──────────────────────────-┘
                       │ failure rate > threshold
                       ▼
        ┌─────────────────────────────────────────┐
        │         OPEN (Protected)                 │
        │  • All traffic blocked                   │
        │  • Fails immediately / fallback          │
        │  • Waits configured duration             │
        └──────────────┬──────────────────────────-┘
                       │ wait duration expires
                       ▼
        ┌─────────────────────────────────────────┐
        │       HALF-OPEN (Testing)                │
        │  • Limited traffic allowed               │
        │  • Evaluates test call results           │
        ├──────────────┬──────────────────────────-┤
        │ success ↓    │    ↓ failure              │
        │ → CLOSED     │    → OPEN (wait again)    │
        └──────────────┴──────────────────────────-┘
```

---

## ✅ Key Takeaways

- Circuit breaker has three states: **Closed** (allow all), **Open** (block all), **Half-Open** (test a few)
- Transition from Closed → Open is triggered by failure rate exceeding the threshold
- Open → Half-Open happens automatically after the wait duration
- Half-Open either recovers to Closed or falls back to Open based on test results
- The entire mechanism is **automatic** — no manual intervention needed once configured

## ⚠️ Common Mistakes

- Setting `slidingWindowSize` too small (e.g., 2) — a couple of transient errors can trigger the circuit to open prematurely
- Setting `waitDurationInOpenState` too short — the failing service doesn't get enough time to recover
- Setting `permittedNumberOfCallsInHalfOpenState` to 1 — one request isn't a reliable sample; use at least 2-3

## 💡 Pro Tip

The key to good circuit breaker tuning is knowing your service's normal behavior. If your service typically handles 100 req/s with 1% error rate, a `failureRateThreshold` of 50% is appropriate. But if your error rate is normally 10%, you'd want a higher threshold to avoid false trips.
