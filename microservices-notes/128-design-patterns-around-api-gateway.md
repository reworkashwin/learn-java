# Design Patterns Around API Gateway

## Introduction

We've built an API Gateway using Spring Cloud Gateway. But did you know there are several **named design patterns** around this concept? In interviews and architecture discussions, people throw around terms like "BFF pattern" or "Gateway Aggregation" — and if you haven't heard them before, they sound intimidating.

Good news: you've already *implemented* some of these patterns. This section maps what you've built to their formal names and introduces a few more you should know.

---

## Pattern 1: API Gateway Pattern

### What is it?

The most fundamental pattern — having a **single entry point** (an edge server) that sits between external clients and your microservices.

### What it does:

- Streamlines communication between clients and backend services
- Centralizes security, routing, and other cross-cutting concerns
- Clients never talk directly to individual microservices

### Have we implemented it?

Yes. Our Spring Cloud Gateway *is* the API Gateway pattern in action. Web and mobile clients send all traffic to `localhost:8072`, and the Gateway routes it to the appropriate microservice.

---

## Pattern 2: Gateway Routing Pattern

### What is it?

If your edge server can route incoming requests to the correct backend microservice based on factors like **URL paths, headers, or request parameters**, it implements the Gateway Routing pattern.

### Have we implemented it?

Yes. We configured route predicates based on URL paths (`/eazybank/accounts/**`, `/eazybank/loans/**`) to direct traffic to the right service. That's exactly this pattern.

---

## Pattern 3: Gateway Offloading Pattern

### What is it?

When your Gateway handles **cross-cutting concerns** that would otherwise need to be duplicated across every microservice — things like security, caching, rate limiting, SSL termination, auditing, and monitoring.

### Why "offloading"?

Because you're *offloading* these responsibilities from individual services to the Gateway. Instead of each microservice implementing its own authentication logic, the Gateway does it once for everyone.

### What can you offload?

- Security and authentication
- SSL termination
- Rate limiting
- Caching
- Auditing and logging
- Load balancing

### What should you NOT offload?

Business logic. If you move Accounts business logic into the Gateway, you've defeated the entire purpose of microservices. Only **cross-cutting concerns** belong here.

### Have we implemented it?

Yes — our custom filters for correlation ID tracing and logging are a form of Gateway Offloading.

---

## Pattern 4: Backend For Frontend (BFF) Pattern

### What is it?

Instead of one Gateway for all clients, you build **separate Gateways tailored to specific client types** — one for web, one for mobile, one for tablets.

### Why would anyone do this?

Different clients have different needs:

- **Web applications** have large screens → send full responses with images, detailed transactions, and recommendations
- **Mobile apps** have limited space and bandwidth → send compressed, summarized responses without heavy images
- **Tablets** might fall somewhere in between

With a single Gateway, you'd need complex conditional logic to handle all these variations. With BFF, each Gateway is purpose-built for its client type.

### How it works:

The backend microservices always return the same response. The BFF Gateways sit in between and **filter, transform, or compress** the response based on the client they serve.

### When to use it?

Complex enterprise applications with significantly different client requirements. For simple applications with uniform client needs, a single Gateway is sufficient.

---

## Pattern 5: Gateway Aggregation / Composition Pattern

### What is it?

The Gateway takes a single client request, **invokes multiple backend microservices**, combines their responses, and returns a single aggregated response.

### The problem it solves:

A bank website wants to show account summary, loan summary, and card summary on one page. Without aggregation, the client has three options:

1. **Make 3 separate calls** — too much network traffic
2. **Call one service that calls the others** — what we did with Accounts calling Loans and Cards via Feign
3. **Let the Gateway aggregate** — the Gateway calls all three and combines the response

### How it works:

```
Client → Gateway (fetchSummary)
                ├─→ Accounts Service → account data
                ├─→ Loans Service    → loan data
                └─→ Cards Service    → card data
         Gateway combines all → single response → Client
```

The client makes **one call**. The Gateway handles the fan-out and aggregation internally.

---

## Summary of All Five Patterns

| Pattern | Core Idea | We Implemented? |
|---------|-----------|-----------------|
| API Gateway | Single entry point | ✅ Spring Cloud Gateway |
| Gateway Routing | Route by URL/headers/params | ✅ Route predicates |
| Gateway Offloading | Centralize cross-cutting concerns | ✅ Custom filters |
| Backend For Frontend | Separate Gateways per client type | ❌ (but understand it) |
| Gateway Aggregation | Combine multiple service responses | Partially (via Accounts, not Gateway) |

---

## ✅ Key Takeaways

- These five patterns aren't separate technologies — they're **names for capabilities** your Gateway may or may not implement
- You've already implemented three of them just by building a Spring Cloud Gateway with custom filters
- BFF is for complex enterprise apps with diverse client requirements
- Gateway Aggregation moves the "fan-out and combine" responsibility from individual services to the Gateway
- Knowing these names is essential for **microservices interviews**

## 💡 Pro Tip

Don't memorize definitions — understand what problem each pattern solves. In an interview, if someone asks about the "Gateway Offloading pattern," think: *"That's when the Gateway handles cross-cutting concerns so individual services don't have to."* Problem → Solution → Pattern name.
