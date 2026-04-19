# Implementing Retry Pattern in Spring Cloud Gateway

## Introduction

We've already seen what the Retry pattern is and why it matters for fault tolerance. Now it's time to actually wire it up inside a **Spring Cloud Gateway**. The idea is simple — if a downstream microservice fails to respond (maybe a network hiccup, maybe a temporary outage), the Gateway will silently retry the request a few times before giving up. The best part? Your microservice doesn't even know it's being retried.

In this section, we implement the Retry pattern for the **Loans microservice** through the Gateway Server using Java-based route configuration.

---

## Setting Up Retry in the Gateway Route

### Where Does It Go?

Inside the `GatewayServerApplication` class (or wherever you define your route configuration), you add a **retry filter** to the route for the Loans microservice — right after other filters like `AddResponseHeader`.

### The Configuration

```java
.filters(f -> f
    .addResponseHeader(...)
    .retry(retryConfig -> retryConfig
        .setRetries(3)
        .setMethods(HttpMethod.GET)
        .setBackoff(Duration.ofMillis(100), Duration.ofMillis(1000), 2, true)
    )
)
```

Let's break this down piece by piece.

---

## Understanding the Retry Configuration Properties

### `setRetries(3)` — How Many Times to Retry

This tells the Gateway: "If the request fails, retry it **3 more times**." So combined with the original request, the total attempts become **4**.

### `setMethods(HttpMethod.GET)` — Which HTTP Methods to Retry

Why only GET? Because GET is **idempotent** — calling it multiple times has no side effects. You're just reading data.

What about POST, PUT, DELETE? Retrying a POST could create duplicate records. Retrying a DELETE could cause unexpected behavior if someone wrote a bad SQL WHERE clause. So we keep it safe and retry only GET requests.

⚠️ **Common Mistake:** Enabling retry for all HTTP methods. This can cause duplicate data creation or unexpected mutations. Always limit retries to idempotent operations.

### `setBackoff(firstBackoff, maxBackoff, factor, basedOnPreviousValue)`

This controls **how long to wait** between retry attempts:

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `firstBackoff` | 100ms | Wait 100ms before the first retry |
| `maxBackoff` | 1000ms | Never wait more than 1 second between retries |
| `factor` | 2 | Multiply the previous wait time by 2 |
| `basedOnPreviousValue` | true | Apply the factor on the **previous** backoff, not the initial one |

So the wait pattern looks like: 100ms → 200ms → 400ms → capped at 1000ms.

💡 **Pro Tip:** Exponential backoff is essential because it gives the failing service progressively more time to recover, rather than hammering it with rapid retries.

---

## Seeing the Retry in Action

### Test 1: Using a Breakpoint

1. Add a logger statement to `LoansController.getContactInfo()`:
   ```java
   logger.debug("Invoked loans contact-info API");
   ```
2. Set a breakpoint in the method
3. Invoke the API through the Gateway via Postman
4. Hold the breakpoint — the Gateway's global timeout (2 seconds) expires, triggering retries

**Result:** Postman shows `Gateway Timeout` after ~9 seconds. The console shows the logger statement **4 times** (1 original + 3 retries). The total time makes sense: 4 attempts × ~2 seconds per timeout ≈ 8–9 seconds.

### Test 2: Throwing a RuntimeException

1. Remove the breakpoint
2. Replace the method body with `throw new RuntimeException()`
3. Restart Loans and Gateway

**Result:** The console shows the logger statement **4 times** again. Even a `RuntimeException` triggers retries — the Gateway is giving the microservice a chance to recover from transient errors.

---

## Why This Matters

Without retry, a single network glitch = immediate failure for the user. With retry:

- Temporary network issues are handled silently
- The microservice gets multiple chances to respond
- No manual intervention needed
- The end user may never even notice the problem

---

## Key Code Changes

The only change needed is in the **Gateway Server** route configuration:

```java
.retry(retryConfig -> retryConfig
    .setRetries(3)
    .setMethods(HttpMethod.GET)
    .setBackoff(Duration.ofMillis(100), Duration.ofMillis(1000), 2, true)
)
```

No changes required in the Loans microservice itself — the Gateway handles everything.

---

## ✅ Key Takeaways

- Retry in the Gateway is **transparent** to the downstream microservice
- Always restrict retries to **idempotent operations** (GET, optionally DELETE)
- Use **exponential backoff** to avoid overwhelming a struggling service
- The total attempts = original request + configured retries (1 + 3 = 4 in Gateway)
- With Gateway retry, there's **no fallback mechanism** — the Gateway either succeeds or returns an error

⚠️ **Important:** Gateway-level retry has no built-in fallback support. If you need fallback behavior, implement the Retry pattern inside the microservice itself using Resilience4j (covered in the next lecture).
