# Implementing Circuit Breaker Pattern in Gateway — Part 2: Fallback Mechanism

## Introduction

In Part 1, when the circuit breaker triggered, clients received raw exceptions like "504 Gateway Timeout" or "503 Service Unavailable." That's not a great user experience. In a real application, you want to send a **meaningful, business-friendly message** instead. That's what fallback mechanisms are for.

---

## The Problem with No Fallback

Without a fallback, the error response looks like this:

```json
{
  "status": 503,
  "error": "Service Unavailable",
  "message": "upstream service is temporarily unavailable"
}
```

Your clients (frontend apps, mobile apps) have to handle this raw exception. They don't know what happened, what to do next, or who to contact. Not ideal.

---

## Building the Fallback Controller

Inside the Gateway Server, create a new REST API that serves as the fallback:

```java
@RestController
public class FallbackController {

    @RequestMapping("/contactSupport")
    public Mono<String> contactSupport() {
        return Mono.just("An error occurred. Please try after some time or contact support team.");
    }
}
```

### Why `Mono<String>`?

Because Gateway Server runs on Spring WebFlux (reactive). All return types must be wrapped in reactive types. `Mono.just(...)` creates a `Mono` that immediately emits the provided value.

### What goes in the fallback?

In this example, a simple message. In production, you might:
- Trigger an email to the support team
- Return cached data from the last successful call
- Return a default/static response
- Log an incident in your monitoring system

---

## Connecting Fallback to Circuit Breaker

In the routing configuration, add `setFallbackUri`:

```java
.circuitBreaker(config -> config
    .setName("accountsCircuitBreaker")
    .setFallbackUri("forward:/contactSupport"))
```

**`forward:/contactSupport`** tells the circuit breaker: "When you need to fail a request, don't throw an exception — instead, forward the request internally to this `/contactSupport` endpoint."

### How it works:

```
Normal flow:     Client → Gateway → Accounts → Response
Fallback flow:   Client → Gateway → Circuit Open → /contactSupport → Friendly message
```

---

## The Demo

### Happy path:
Request goes through normally. Fallback is never invoked. Client gets full response.

### With breakpoint (simulating failure):
1. Request hits the Accounts controller breakpoint
2. Circuit breaker times out (default ~1 second)
3. Instead of "503 Service Unavailable," client receives: *"An error occurred. Please try after some time or contact support team."*

The client never sees raw status codes or stack traces. They get a clean, actionable message.

### After removing breakpoint:
Requests succeed normally again. Fallback stops being invoked. Circuit eventually closes.

---

## Summary of Steps

1. **Add dependency**: `spring-cloud-starter-circuitbreaker-reactor-resilience4j` in `pom.xml`
2. **Apply filter**: `.circuitBreaker(config -> config.setName(...).setFallbackUri(...))`  in routing config
3. **Create fallback controller**: REST endpoint that returns a business-friendly message
4. **Configure properties**: `sliding-window-size`, `failure-rate-threshold`, `wait-duration-in-open-state`, `permitted-number-of-calls-in-half-open-state` in `application.yml`

---

## ✅ Key Takeaways

- Fallback transforms raw exceptions into **business-friendly responses**
- Use `setFallbackUri("forward:/path")` to route failed requests to a fallback controller
- The fallback REST API lives inside the Gateway Server itself — no external service needed
- Fallback is only invoked when the circuit breaker kicks in; normal requests bypass it completely
- In production, fallbacks can do anything: return cached data, trigger alerts, call alternative services

## ⚠️ Common Mistakes

- Forgetting `forward:` prefix in the fallback URI — without it, the Gateway treats it as an external URL
- Making the fallback call another microservice that might also be down — keep fallback logic self-contained
- Returning generic "error" messages — give the client something actionable (try later, contact support, etc.)

## 💡 Pro Tip

Design your fallback responses based on the API's consumer. If it's a mobile app, return structured JSON with error codes the app can parse. If it's a human-facing web page, return a friendly message they can understand. The circuit breaker doesn't care what you return — it just routes to the fallback URI.
