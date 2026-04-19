# Implementing Retry Pattern in Accounts Microservice — Part 2

## Introduction

We've got the basic retry pattern working in our Accounts microservice. But here's a question — should you retry for *every* kind of exception? If a `NullPointerException` happens because of bad input data, retrying 3 more times won't magically fix it. You'll just waste resources getting the same error 3 more times.

This lecture covers how to **fine-tune which exceptions trigger retries** and which ones should be ignored.

---

## Ignoring Specific Exceptions

### The Problem

By default, Resilience4j retries on *any* exception. But a `NullPointerException` typically means there's a code bug or invalid data — retrying won't help.

### The Solution: `ignoreExceptions`

In `application.yml` of the accounts microservice:

```yaml
resilience4j:
  retry:
    configs:
      default:
        maxRetryAttempts: 3
        waitDuration: 100
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2
        ignoreExceptions:
          - java.lang.NullPointerException
```

The key detail: you must use the **fully qualified class name** including the package.

### What Happens Now?

With `throw new NullPointerException()` in the method:

- ❌ No retry attempts happen
- ✅ Fallback is invoked immediately
- Console shows only **2 log statements**: `getBuildInfo method invoked` and `getBuildInfoFallback method invoked`

The retry pattern is activated but **skips the retries** and goes straight to fallback. Smart resource usage!

---

## Retrying Only for Specific Exceptions

### The Alternative Approach: `retryExceptions`

Sometimes it's easier to specify *which* exceptions to retry for, rather than which to ignore:

```yaml
resilience4j:
  retry:
    configs:
      default:
        maxRetryAttempts: 3
        waitDuration: 500
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2
        retryExceptions:
          - java.util.concurrent.TimeoutException
```

### Key Insight: `retryExceptions` vs `ignoreExceptions`

When you define `retryExceptions`, you **don't need** `ignoreExceptions`. Why? Because:

- With `retryExceptions`: retries happen **only** for listed exceptions. Everything else is automatically ignored.
- With `ignoreExceptions`: retries happen for **all** exceptions *except* the listed ones.

They're inverse approaches — pick one, not both.

### Testing with TimeoutException

Change the controller to throw a `TimeoutException`:

```java
@GetMapping("/build-info")
public ResponseEntity<String> getBuildInfo() throws TimeoutException {
    logger.debug("getBuildInfo method invoked");
    throw new TimeoutException();
}
```

Since `TimeoutException` is a checked exception, you need `throws TimeoutException` in the method signature.

**Result:** Console shows `getBuildInfo method invoked` **3 times** followed by the fallback — confirming retries happen for `TimeoutException` as configured.

---

## Gateway Server: Exception-Based Retry Configuration

Can you do the same in the Gateway Server? Yes! Inside the retry configuration, use methods like:

```java
.retry(retryConfig -> retryConfig
    .setRetries(3)
    .setMethods(HttpMethod.GET)
    .setExceptions(TimeoutException.class)    // retry only for these
    .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)  // retry based on status codes
    .setBackoff(...)
)
```

Note: The Gateway retry doesn't have an `ignoreExceptions` option — only `setExceptions` (which exceptions to retry for) and status-code-based retry.

---

## Fixing the Duplicate Header Bug

There's a subtle bug discovered during retry testing. When you inspect the response headers for a retried request, the `easybank-correlation-id` header appears **multiple times** with the same value. Why?

The `ResponseTraceFilter` runs on every response — including retry responses. Each retry cycle adds another copy of the header.

### The Fix

```java
if (!exchange.getResponse().getHeaders().containsKey(FilterUtility.CORRELATION_ID)) {
    logger.debug("Updated the correlation id to the outbound headers: {}", correlationId);
    exchange.getResponse().getHeaders().add(FilterUtility.CORRELATION_ID, correlationId);
}
```

Simply check if the header already exists before adding it. The `!containsKey()` check ensures the header is added only once, regardless of how many retry attempts happened.

---

## Summary of Retry Pattern Configuration

### In a Microservice (via Resilience4j)

1. Add `@Retry(name = "...", fallbackMethod = "...")` to the method
2. Create a fallback method with matching signature + `Throwable`
3. Configure properties in `application.yml`:
   ```yaml
   resilience4j.retry.configs.default:
     maxRetryAttempts: 3
     waitDuration: 100
     enableExponentialBackoff: true
     exponentialBackoffMultiplier: 2
     retryExceptions:
       - java.util.concurrent.TimeoutException
   ```

### In the Gateway Server

- Use `.retry()` filter in route configuration
- No fallback mechanism available

---

## ✅ Key Takeaways

- Use `ignoreExceptions` to skip retries for exceptions where retrying won't help (e.g., `NullPointerException`)
- Use `retryExceptions` to retry *only* for specific exceptions (e.g., `TimeoutException`) — all others are auto-ignored
- Don't use both `retryExceptions` and `ignoreExceptions` together — they're inverse approaches
- Always use fully qualified class names for exception configuration
- Fix duplicate response headers by checking `containsKey()` before adding headers in response filters

💡 **Pro Tip:** In production, `retryExceptions` is usually the safer approach. You explicitly list the transient, recoverable exceptions (network timeouts, connection refused) and everything else falls through to the fallback immediately.
