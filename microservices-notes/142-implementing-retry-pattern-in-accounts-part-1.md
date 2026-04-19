# Implementing Retry Pattern in Accounts Microservice — Part 1

## Introduction

In the previous lecture, we implemented retry at the **Gateway** level. That's powerful — but it has a limitation: **no fallback mechanism**. What if, after all retries fail, you want to return a default response instead of an ugly error?

That's where implementing retry **inside the microservice itself** using Resilience4j shines. You get retries *and* a fallback method that kicks in when all attempts are exhausted.

---

## Step 1: Annotate the Method with `@Retry`

Pick a method that's safe to retry. In this case, `getBuildInfo()` — it's a GET endpoint that returns the current build version. Perfect candidate.

```java
@Retry(name = "getBuildInfo", fallbackMethod = "getBuildInfoFallback")
@GetMapping("/build-info")
public ResponseEntity<String> getBuildInfo() {
    logger.debug("getBuildInfo method invoked");
    return ResponseEntity.ok(buildVersion);
}
```

Two things specified in the annotation:
1. **`name`** — a unique identifier for this retry configuration (used in `application.yml`)
2. **`fallbackMethod`** — the method to call when all retries are exhausted

---

## Step 2: Create the Fallback Method

The fallback method has strict rules:

### Rule 1: Same Return Type
The fallback must return the same type as the original method (`ResponseEntity<String>`).

### Rule 2: Same Parameters + Throwable
It must accept all the same parameters as the original method, **plus** one extra parameter of type `Throwable`.

```java
public ResponseEntity<String> getBuildInfoFallback(Throwable throwable) {
    logger.debug("getBuildInfoFallback method invoked");
    return ResponseEntity.ok("0.9");
}
```

Since `getBuildInfo()` has no parameters, the fallback only has the `Throwable` parameter. If your original method had 2 parameters, the fallback would have 3 (original 2 + Throwable).

💡 **Pro Tip:** The `Throwable` parameter gives you access to the exception that caused the failure. You can log it, inspect it, or use it to decide what fallback response to return.

---

## Step 3: Configure Retry Properties in `application.yml`

```yaml
resilience4j:
  retry:
    configs:
      default:
        maxRetryAttempts: 3
        waitDuration: 100
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2
```

### What Do These Properties Mean?

| Property | Value | Explanation |
|----------|-------|-------------|
| `maxRetryAttempts` | 3 | Total retry attempts (including the first call!) |
| `waitDuration` | 100ms | Wait before the first retry |
| `enableExponentialBackoff` | true | Each wait doubles |
| `exponentialBackoffMultiplier` | 2 | Multiply wait time by 2 |

Using `default` means these settings apply to **all** retry instances in the microservice. You can also create named configurations for specific instances.

⚠️ **Important Difference from Gateway Retry:** In Resilience4j, `maxRetryAttempts: 3` means **3 total attempts** (original + 2 retries). In Gateway, `setRetries(3)` means 3 *additional* retries (4 total). Don't mix them up!

---

## Step 4: Demo — Intentionally Breaking the Method

To test, throw a `NullPointerException` in `getBuildInfo()`:

```java
throw new NullPointerException();
```

**Result:** Postman returns `"0.9"` (the fallback response). The console shows:
- `getBuildInfo method invoked` — **3 times** (the 3 retry attempts)
- `getBuildInfoFallback method invoked` — **1 time** (after all retries failed)

This confirms: retry happened 3 times → all failed → fallback kicked in.

---

## Handling the Circuit Breaker Timeout Conflict

Here's a tricky scenario. If you increase `waitDuration` to 500ms:

```yaml
waitDuration: 500
```

And invoke the API — you might get the **Circuit Breaker's fallback** instead of the Retry's fallback! Why?

The Circuit Breaker has a **TimeLimiter** — by default it waits only ~1 second for an operation to complete. If your retry takes longer than that (3 attempts × 500ms = 1.5s), the Circuit Breaker times out first.

### The Fix: Increase the Circuit Breaker's TimeLimiter

In the **Gateway Server**, create a bean to configure a longer timeout:

```java
@Bean
public Customizer<ReactiveResilience4JCircuitBreakerFactory> defaultCustomizer() {
    return factory -> factory.configureDefault(id ->
        new Resilience4JConfigBuilder(id)
            .circuitBreakerConfig(CircuitBreakerConfig.ofDefaults())
            .timeLimiterConfig(TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(4))
                .build())
            .build()
    );
}
```

This tells the Circuit Breaker: "Wait up to **4 seconds** before timing out." Now the retry pattern has enough time to complete its attempts.

---

## ✅ Key Takeaways

- Resilience4j `@Retry` gives you **retry + fallback** — something Gateway retry can't do
- Fallback methods must match the original method's signature + add a `Throwable` parameter
- `maxRetryAttempts` in Resilience4j counts **total attempts** (not additional retries)
- Watch out for **Circuit Breaker TimeLimiter** conflicts — if retries take too long, the Circuit Breaker may short-circuit them
- Always check the [Resilience4j documentation](https://resilience4j.readme.io) for the latest configuration options

⚠️ **Common Mistake:** Forgetting that Circuit Breaker and Retry can conflict. If you're using both patterns, make sure the Circuit Breaker's timeout is longer than the total retry duration.
