# Implementing Cross-Cutting Concerns: Tracing & Logging Using Gateway — Part 1

## Introduction

You've got your Gateway Server up and running — it routes requests, handles discovery, and acts as the single entry point. But here's a question: when a request travels through multiple microservices (Gateway → Accounts → Loans → Cards), how do you trace it end to end? If something breaks three services deep, how does a developer figure out *where* it broke?

This is where **correlation IDs** come in. In this section, we build custom filters in Spring Cloud Gateway to generate a unique trace ID for every incoming request, propagate it across all microservices, and attach it to the response — giving both developers and clients a single ID to track any request through the entire chain.

---

## Why Do We Need a Correlation ID?

Imagine a client calls your `fetchCustomerDetails` API. That single request fans out to Accounts, Loans, and Cards. Now imagine the client reports: "My data looked wrong on that last call."

Without a correlation ID, you'd need to dig through logs of 3+ services trying to match timestamps and payloads. With a correlation ID, you have **one unique string** that ties together every log entry from every service that touched that request.

### What a correlation ID gives you:
- A randomly generated UUID attached to every incoming request
- The same ID forwarded through all downstream microservices
- The same ID returned in the response headers to the client
- A debugging lifeline — the client can quote the ID in a support ticket, and devs can search logs across all services

---

## Building the Custom Filters

We need three components inside a new `filters` package in the Gateway Server:

### 1. `FilterUtility` — Shared Logic

This utility class handles the common operations: checking if a correlation ID header exists, getting its value, and setting it.

**Key details:**
- The header name is `eazybank-correlation-id`
- `getCorrelationId()` — reads the header from the request, returns the value or `null`
- `setCorrelationId()` — mutates the exchange to add a new request header with the correlation ID value

---

### 2. `RequestTraceFilter` — Pre-Filter (Inbound)

This filter runs **before** the request reaches any microservice.

#### How it works:

```
@Component
@Order(1)
public class RequestTraceFilter implements GlobalFilter {
    // ...
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 1. Check if correlation ID already exists
        // 2. If yes → log it, don't overwrite
        // 3. If no → generate UUID, set it as header
        // 4. Pass to next filter in chain
        return chain.filter(exchange);
    }
}
```

**Why `@Order(1)`?** When you have multiple custom filters, the `@Order` annotation determines execution sequence. Order 1 means this filter runs first.

**Why `GlobalFilter`?** Because we want this filter to execute for *all* traffic coming through the Gateway — not just for specific routes.

**Why check if a header already exists?** Consider redirections. If a request loops back through the Gateway, you don't want to generate a *new* correlation ID and overwrite the original. The if-check prevents this.

**Reactive note:** Spring Cloud Gateway is built on Spring WebFlux (reactive), not Servlet. That's why you see `ServerWebExchange` instead of `HttpServletRequest`, and `Mono<Void>` instead of `void`. `Mono` represents a single async value; `Void` means we return nothing — we just pass the exchange to the next filter.

---

### 3. `ResponseTraceFilter` — Post-Filter (Outbound)

This filter runs **after** the response comes back from the downstream microservice.

#### Different flavor of defining a global filter:

Instead of implementing the `GlobalFilter` interface, this filter uses a `@Configuration` class with a `@Bean` method that returns a `GlobalFilter`:

```java
@Configuration
public class ResponseTraceFilter {
    @Bean
    public GlobalFilter postGlobalFilter() {
        return (exchange, chain) -> {
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                // Get correlation ID from request headers
                // Set it in response headers
                // Log it
            }));
        };
    }
}
```

**The `.then()` trick:** By using `chain.filter(exchange).then(...)`, the code inside `.then()` only executes *after* the request has traveled to the microservice and a response has been received. This is what makes it a **post-filter**.

---

## Enabling Debug Logging

All three filters use `log.debug(...)` statements. By default, Spring Boot only prints `INFO` level and above. To see debug logs, add this to `application.yml`:

```yaml
logging:
  level:
    com.eazybytes.gatewayserver: DEBUG
```

This tells Spring Boot: "For any logger in the `com.eazybytes.gatewayserver` package, print DEBUG level and above."

---

## What Happens Next

The Gateway now generates and attaches a correlation ID. But the individual microservices (Accounts, Loans, Cards) still don't know about it. They need to:
1. Accept the `eazybank-correlation-id` request header
2. Read its value
3. Use it in their own log statements

That's covered in Part 2.

---

## ✅ Key Takeaways

- Custom Gateway filters let you implement **cross-cutting concerns** (logging, tracing, security) in one place
- A **correlation ID** is a UUID that follows a request across all microservices
- `GlobalFilter` applies to all routes; `@Order` controls execution sequence
- Pre-filters intercept requests before forwarding; post-filters intercept responses before returning to clients
- Spring Cloud Gateway uses reactive types (`Mono`, `ServerWebExchange`) — not Servlet types

## ⚠️ Common Mistakes

- Forgetting to enable debug-level logging — your log statements exist but never print
- Overwriting correlation IDs on redirect loops — always check if the header already exists
- Confusing `Mono<Void>` with returning nothing — you **must** return `chain.filter(exchange)` to continue the filter chain

## 💡 Pro Tip

The two approaches for creating global filters (implementing `GlobalFilter` interface vs. defining a `@Bean` method) are interchangeable. Use the interface approach when you need `@Order` control. Use the bean approach for quick post-filters where you leverage `.then()`.
