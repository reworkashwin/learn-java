# Deep Dive: Spring Cloud Gateway Internal Architecture

## Introduction

We've talked about *what* Spring Cloud Gateway does. Now let's look under the hood. How does it actually process a request? Understanding the internal architecture will make everything else — predicates, filters, routing — click into place.

---

## The Request Flow

Here's the complete lifecycle of a request through Spring Cloud Gateway:

```
Client Request
    ↓
Gateway Handler Mapping    ← "Which route matches this request?"
    ↓
Predicates                 ← "Does this request meet the conditions?"
    ↓
Pre-Filters               ← "Execute business logic BEFORE forwarding"
    ↓
Target Microservice        ← "Forward the request"
    ↓
Post-Filters              ← "Execute business logic AFTER receiving response"
    ↓
Gateway Handler Mapping
    ↓
Client Response
```

Let's break down each component.

---

## Component 1: Gateway Handler Mapping

### 🧠 What Is It?

This is the **traffic director**. When a request arrives, the Gateway Handler Mapping examines the request path and determines which route configuration matches.

### ⚙️ How It Works

It doesn't use AI or magic — it relies entirely on **routing configurations** that you, the developer, define. You tell it:

> "If someone sends a request to path `/accounts/**`, forward it to the accounts microservice."

Without your routing configuration, the Gateway Handler Mapping has no idea what to do with incoming requests.

---

## Component 2: Predicates

### 🧠 What Are Predicates?

A predicate is a **condition that must be true** before a request is forwarded. Think of it as a bouncer at a club — if you don't meet the criteria, you don't get in.

If you know Java 8's `Predicate` functional interface (a function that returns `true` or `false`), this is the same concept applied to HTTP requests.

### 🧪 Examples of Predicates

- **Path predicate**: Does the request path match `/easybank/accounts/**`?
- **Header predicate**: Does the request contain a specific header?
- **Cookie predicate**: Does the request have a specific cookie?
- **Method predicate**: Is it a GET, POST, PUT, or DELETE?
- **Query predicate**: Does it have a specific query parameter?
- **Time-based predicate**: Is the request within a certain time window?

If any predicate returns `false`, the gateway rejects the request immediately — it never reaches the microservice.

---

## Component 3: Pre-Filters

### 🧠 What Are Pre-Filters?

Pre-filters execute **before** the request is forwarded to the target microservice. This is where you implement logic that acts on the **request**.

### 🧪 What You Can Do in Pre-Filters

- Request validation (check required headers, validate payload structure)
- Authentication and authorization
- Logging and auditing
- Request modification (add headers, transform body)
- Security checks
- Rate limiting enforcement

You can chain **any number** of pre-filters. They execute in order, and each one can modify the request before passing it to the next.

---

## Component 4: Post-Filters

### 🧠 What Are Post-Filters?

Post-filters execute **after** the microservice returns its response but **before** the response reaches the client. This is where you implement logic that acts on the **response**.

### 🧪 What You Can Do in Post-Filters

- Modify response headers
- Transform response body
- Log response details
- Add custom headers (like response time)
- Collect metrics

---

## Predefined Filters (Built-In)

Spring Cloud Gateway comes with a rich set of **predefined filters** so you don't have to build everything from scratch.

### Route Predicate Factories
- `Path` — match by URL path
- `Header` — match by request header
- `Cookie` — match by cookie value
- `Host` — match by host name
- `Method` — match by HTTP method
- `Query` — match by query parameter
- `RemoteAddr` — match by client IP
- `Weight` — weighted routing (A/B testing)

### Gateway Filter Factories
- `AddRequestHeader` — add a header to the request
- `AddRequestParameter` — add a query parameter
- `AddResponseHeader` — add a header to the response
- `RewritePath` — rewrite the request path
- `CircuitBreaker` — resilience pattern
- `FallbackHeaders` — headers for fallback responses
- `ModifyRequestBody` — transform request body
- `ModifyResponseBody` — transform response body
- `Retry` — retry failed requests
- `TokenRelay` — forward OAuth2 tokens
- `RequestRateLimiter` — throttle requests
- `JsonToGrpc` — protocol conversion

### Global Filters
- Gateway Metrics Filter — collect performance metrics
- TLS/SSL support — secure communication

---

## ✅ Key Takeaways

- The flow is: **Handler Mapping → Predicates → Pre-Filters → Microservice → Post-Filters → Client**
- **Predicates** decide whether a request should be processed (boolean conditions)
- **Pre-filters** act on the request before forwarding
- **Post-filters** act on the response before returning to the client
- Spring Cloud Gateway provides dozens of **predefined filters** for common scenarios
- If no predefined filter matches your need, you can write **custom filters**

## 💡 Pro Tip

Always check the [official documentation](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/) before writing a custom filter. Chances are, a predefined filter already exists for your use case. Writing custom code when a built-in solution exists wastes time and introduces maintenance burden.
