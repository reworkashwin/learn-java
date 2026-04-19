# Implementing RateLimiter Pattern in Accounts Microservice

## Introduction

We've seen rate limiting at the Gateway level using Redis. But what if you want rate limiting **inside** a specific microservice? Maybe you want to protect a low-priority API from consuming too many resources, or your infrastructure can only handle a certain throughput.

Resilience4j provides a `@RateLimiter` annotation that works differently from the Gateway's Redis approach — and it has its own strengths.

---

## Gateway vs Microservice Rate Limiting — Different Approaches

| Aspect | Gateway (Redis) | Microservice (Resilience4j) |
|--------|----------------|----------------------------|
| **Scope** | Per user/IP/session | Per API endpoint (all requests) |
| **Backend** | Redis required | No external dependency |
| **Use case** | Fair usage per client | Protect infrastructure capacity |
| **Key resolution** | KeyResolver bean | N/A — applies to all callers |

The Gateway approach says: "User X can make 100 requests/second."  
The Microservice approach says: "This API can handle 1000 requests/second total, from all users combined."

Both serve different purposes. Choose based on your requirements.

---

## Step 1: Annotate the Method

```java
@RateLimiter(name = "getJavaVersion", fallbackMethod = "getJavaVersionFallback")
@GetMapping("/java-version")
public ResponseEntity<String> getJavaVersion() {
    return ResponseEntity.ok(environment.getProperty("JAVA_HOME"));
}
```

Unlike the Gateway approach, Resilience4j rate limiting supports a **fallback method** — a nice advantage.

---

## Step 2: Configure Properties

```yaml
resilience4j:
  ratelimiter:
    configs:
      default:
        limitRefreshPeriod: 5000
        limitForPeriod: 1
        timeoutDuration: 1000
```

### What Do These Properties Mean?

| Property | Value | Meaning |
|----------|-------|---------|
| `limitRefreshPeriod` | 5000ms (5 seconds) | Quota resets every 5 seconds |
| `limitForPeriod` | 1 | Only 1 request allowed per refresh period |
| `timeoutDuration` | 1000ms (1 second) | A blocked thread waits max 1 second for a new period |

So the behavior is: **1 request every 5 seconds**. If a second request comes in during the same period, the thread waits up to 1 second. If a new period hasn't started by then, the request is rejected.

---

## Step 3: Create the Fallback Method

```java
public ResponseEntity<String> getJavaVersionFallback(Throwable throwable) {
    return ResponseEntity.ok("Java 17");
}
```

Same rules as retry fallback:
- Same return type as original method
- Same parameters + one extra `Throwable` parameter
- Returns a sensible default response

---

## Testing Without Fallback

Without a fallback defined, when the rate limit is exceeded:

- The `GlobalExceptionHandler` catches the `RequestNotPermitted` exception
- Returns HTTP 500 with message: *"RateLimiter does not permit further calls"*

This isn't a great user experience — hence the need for a proper fallback.

---

## Testing With Fallback

Rapidly clicking "Send" in the browser or Postman:

1. First request → returns actual `JAVA_HOME` value ✅
2. Rapid subsequent requests → returns `"Java 17"` (fallback) 🔄
3. Wait 5 seconds → original response again ✅

The fallback keeps the API responsive even when rate-limited, instead of throwing ugly errors.

---

## Real-World Use Cases for Microservice-Level Rate Limiting

1. **Infrastructure protection** — Your server can only handle 10,000 requests/second. Cap it there.
2. **Low-priority API throttling** — A reporting API processing heavy queries should serve fewer concurrent requests so other APIs aren't starved.
3. **Cache-backed fallback** — When rate-limited, return cached data instead of hitting the database.
4. **Graceful degradation** — Return a "try again later" message instead of crashing.

---

## Two Approaches, Two Use Cases

Now you have flexibility:

| Approach | Best For |
|----------|----------|
| **Gateway + Redis** | Per-user rate limiting, subscription tiers, abuse prevention |
| **Microservice + Resilience4j** | Infrastructure protection, API-level throttling, graceful degradation with fallback |

You can even use **both** — Gateway rate limiting for per-user fairness, and microservice rate limiting for infrastructure protection.

---

## ✅ Key Takeaways

- Resilience4j `@RateLimiter` applies to **all requests** for an API (not per-user)
- No Redis needed — it's in-process rate limiting
- Three key properties: `limitRefreshPeriod`, `limitForPeriod`, `timeoutDuration`
- Supports **fallback methods** — unlike Gateway rate limiting
- Use it to protect infrastructure capacity or throttle low-priority APIs
- Combine with Gateway rate limiting for comprehensive protection

💡 **Pro Tip:** In production, the fallback for a rate-limited API could return data from a cache, a simplified response, or a "please retry after X seconds" message with the `Retry-After` header.
