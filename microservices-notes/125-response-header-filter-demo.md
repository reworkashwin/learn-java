# Adding Response Header Filters in Spring Cloud Gateway

## Introduction

We've set up routing with the `rewritePath` filter. But in real projects, you'll need **multiple filters** per route. Let's add a second filter — `addResponseHeader` — to include a custom header in every response. This also demonstrates how to chain filters and how to find predefined filters in the official documentation.

---

## The Requirement

We want to add an `X-Response-Time` header to every response sent back to clients. This header contains the timestamp of when the response was generated, which helps clients:
- Understand when the response was created
- Calculate round-trip time (request sent → response received)
- Debug performance issues

---

## How to Find Predefined Filters

### 🧠 The Approach

Before writing custom code, always check if Spring Cloud Gateway has a **predefined filter** for your use case:

1. Go to the [Spring Cloud Gateway documentation](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/)
2. Navigate to **Gateway Filter Factories**
3. Search for your requirement

For adding response headers, there's a built-in filter: **AddResponseHeader GatewayFilter Factory**.

### 💡 How to Read the Docs

The documentation shows YAML-based examples:
```yaml
filters:
  - AddResponseHeader=X-Response-Time, value
```

To translate this to Java code, look for methods in the filter builder (`f`) that match the filter name. In our case: `f.addResponseHeader(...)`.

---

## Adding the Filter

### ⚙️ Chaining Filters in Java

Simply chain `.addResponseHeader()` after `.rewritePath()`:

```java
@Bean
public RouteLocator easyBankRouteConfig(RouteLocatorBuilder routeLocatorBuilder) {
    return routeLocatorBuilder.routes()
        .route(p -> p
            .path("/easybank/accounts/**")
            .filters(f -> f
                .rewritePath("/easybank/accounts/(?<segment>.*)", "/${segment}")
                .addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
        .uri("lb://ACCOUNTS"))
        .route(p -> p
            .path("/easybank/loans/**")
            .filters(f -> f
                .rewritePath("/easybank/loans/(?<segment>.*)", "/${segment}")
                .addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
            .uri("lb://LOANS"))
        .route(p -> p
            .path("/easybank/cards/**")
            .filters(f -> f
                .rewritePath("/easybank/cards/(?<segment>.*)", "/${segment}")
                .addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
            .uri("lb://CARDS"))
        .build();
}
```

The key addition is:
```java
.addResponseHeader("X-Response-Time", LocalDateTime.now().toString())
```

This adds a response header with the current date and time.

---

## Testing the Result

Before the filter, API responses had standard headers only (Content-Type, etc.).

After adding the filter, check the response headers in Postman:

```
X-Response-Time: 2024-01-15T14:32:45.123456
Content-Type: application/json
...
```

The `X-Response-Time` header now appears in every response routed through the gateway.

---

## Available Predefined Filters — Quick Reference

Here are some commonly used filters from the Gateway Filter Factories:

| Filter | Purpose |
|--------|---------|
| `AddRequestHeader` | Add a header to the request |
| `AddRequestParameter` | Add a query parameter |
| `AddResponseHeader` | Add a header to the response |
| `RewritePath` | Rewrite the request path |
| `CircuitBreaker` | Implement circuit breaker pattern |
| `FallbackHeaders` | Add headers for fallback responses |
| `ModifyRequestBody` | Transform request body |
| `ModifyResponseBody` | Transform response body |
| `Retry` | Retry failed requests |
| `TokenRelay` | Forward OAuth2 tokens |
| `RequestRateLimiter` | Throttle requests |
| `PrefixPath` | Add a prefix to the path |
| `RedirectTo` | Redirect to a different URL |
| `SetStatus` | Override the response status code |
| `JsonToGrpc` | Convert JSON to gRPC |

---

## What If No Predefined Filter Fits?

Sometimes your business requirement doesn't match any predefined filter. In that case, you write a **custom filter**. We'll explore custom filters in upcoming lectures.

---

## ✅ Key Takeaways

- Chain multiple filters by adding `.filterName()` calls inside the `.filters()` lambda
- Always check the official documentation for predefined filters before writing custom ones
- `addResponseHeader` adds custom headers to responses — useful for debugging, tracing, and metadata
- The same filter should be added to **all route definitions** where you want the behavior
- Spring Cloud Gateway has dozens of predefined filters covering most common scenarios

## ⚠️ Common Mistakes

- Forgetting to add the filter to ALL routes — if you add `X-Response-Time` only to accounts but not loans/cards, the behavior is inconsistent
- Confusing `addRequestHeader` (adds to the request going to the microservice) with `addResponseHeader` (adds to the response going to the client)

## 💡 Pro Tip

The `LocalDateTime.now().toString()` in this example captures the time when the **route bean is created** (application startup), not when each request is processed. For per-request timestamps, you'd need a custom filter that generates the value dynamically. We'll learn how to build custom filters next.
