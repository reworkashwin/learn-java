# HTTP Timeout Configurations in Spring Cloud Gateway

## Introduction

Here's a scenario that happens more often than you'd think: a microservice receives a request, starts processing it, but gets stuck — maybe a database lock, maybe an infinite loop, maybe external API delays. Without timeout configurations, **the client (and the Gateway) will wait indefinitely.** That's a silent performance killer.

This section covers how to configure connection and response timeouts in Spring Cloud Gateway — both globally and per-route.

---

## The Problem: Waiting Forever

### Demo without timeouts:

Put a breakpoint in a Loans controller method and don't release it. Call the API through the Gateway.

**What happens:** The Gateway keeps waiting... and waiting... and waiting. After 2 minutes and 26 seconds, the client finally gives up. During all that time:
- A thread on the Gateway was blocked
- A thread on the Loans service was blocked
- Resources (memory, connections) were tied up doing nothing

### Why is this different from Accounts?

The Accounts route has a **circuit breaker** configured, which has its own internal timeout (default ~1 second). The Loans route doesn't. Without explicit timeout config, there's no upper bound on how long the Gateway will wait.

---

## The Solution: Global HTTP Timeouts

Spring Cloud Gateway lets you configure two types of timeouts:

### 1. Connection Timeout

```yaml
spring:
  cloud:
    gateway:
      httpclient:
        connect-timeout: 1000  # milliseconds
```

**What it controls:** How long the Gateway will wait to **establish a TCP connection** with the downstream service. If the network is down or the service isn't reachable, this is the timeout that kicks in.

1000ms = 1 second. If the Gateway can't connect within 1 second, it gives up.

### 2. Response Timeout

```yaml
spring:
  cloud:
    gateway:
      httpclient:
        response-timeout: 2s  # duration format
```

**What it controls:** How long the Gateway will wait for the **complete response** from the downstream service after the connection is established.

2 seconds means: "I connected to the service, sent the request, and if I don't have a full response in 2 seconds, I'm done."

### Both together in `application.yml`:

```yaml
spring:
  cloud:
    gateway:
      httpclient:
        connect-timeout: 1000
        response-timeout: 2s
```

---

## Global vs. Circuit Breaker Timeouts

Important distinction: when a route has a **circuit breaker filter**, the circuit breaker's internal timeout takes precedence over the global HTTP timeout.

| Route | Timeout Source | Behavior |
|-------|---------------|----------|
| Accounts (has circuit breaker) | Circuit breaker default (~1s) | Fails fast via circuit breaker |
| Loans (no circuit breaker) | Global HTTP timeout (2s) | Fails after 2s with Gateway Timeout |
| Cards (no circuit breaker) | Global HTTP timeout (2s) | Fails after 2s with Gateway Timeout |

---

## Per-Route Timeout Configuration

Sometimes you want different timeouts for different routes. A bulk data export API might legitimately take 30 seconds, while a simple lookup should respond in 1 second.

### Using Java DSL:

```java
.route(p -> p
    .path("/eazybank/loans/**")
    .filters(f -> f
        .rewritePath(...)
        .metadata("response-timeout", 5000)      // 5 seconds
        .metadata("connect-timeout", 1000))       // 1 second
    .uri("lb://LOANS"))
```

### Disabling timeout for a specific route:

```java
.metadata("response-timeout", -1)  // No timeout for this route
```

Setting response timeout to `-1` means this route will **wait indefinitely**. Use with extreme caution.

---

## After Adding Timeouts: The Demo

### Before:
Call Loans API with a breakpoint → client waits 2+ minutes → eventually times out.

### After (with 2s response timeout):
Call Loans API with a breakpoint → Gateway waits 2 seconds → returns 504 Gateway Timeout immediately.

The client gets a definitive answer in 2 seconds instead of waiting minutes. Threads are freed. Resources are released. The system stays healthy.

---

## When to Use What

| Scenario | Solution |
|----------|----------|
| Always want fast failure + fallback | Circuit Breaker |
| Just want to limit wait time | HTTP Timeout |
| Want both protection and fallback | Circuit Breaker (which has its own timeout) |
| Different APIs need different limits | Per-route timeout via metadata |
| Bulk/long-running operations | Per-route timeout with higher value |

---

## ✅ Key Takeaways

- **Always configure timeouts** — leaving them at defaults (or infinite) is a production risk
- `connect-timeout` controls connection establishment; `response-timeout` controls response wait time
- Global timeouts apply to all routes without circuit breakers
- Circuit breaker timeouts override global timeouts for their specific routes
- Per-route timeouts let you customize behavior for different APIs
- `-1` response timeout disables timeout for a route (use rarely)

## ⚠️ Common Mistakes

- Setting response timeout too low — legitimate slow responses get killed (tune based on your service's actual response times)
- Assuming circuit breaker routes use global timeouts — they don't; they use circuit breaker's internal timeout
- Not configuring any timeouts at all — the most common and most dangerous mistake

## 💡 Pro Tip

Start with conservative timeouts (e.g., 5 seconds) and tighten them based on monitoring data. Check your service's P99 response times — your timeout should be slightly above P99 for that route. If 99% of requests complete in 1.5 seconds, a 2-second timeout is tight but appropriate. A 30-second timeout is wasteful.
