# Why We Need an Edge Server / API Gateway

## Introduction

"Can't we just let clients talk directly to microservices?" Sure, you *can*. But should you? Let's paint the picture of what happens without an API Gateway, and then see how adding one transforms the architecture.

---

## Life Without an API Gateway

Imagine accounts, loans, and cards microservices deployed in their respective servers. Now three different client applications — a mobile app, a website, and a partner API — all communicate directly with each microservice.

### The Problems Stack Up Fast

**Problem 1: Cross-cutting concerns everywhere**

Every microservice needs to implement security, auditing, logging, and routing. Different developers build these features differently. Accounts might validate JWT tokens one way, Loans another. You get inconsistent security enforcement across your network.

**Problem 2: "Let's use a shared library!"**

Someone suggests packaging all cross-cutting logic into a common library and adding it as a dependency. Sounds smart, but:

- **Tight coupling** — the library becomes a dependency for every service
- **Regression risk** — changing the library means re-testing every service
- **Impact analysis** — with 100+ services, figuring out what breaks is painful
- **Version hell** — different services might need different library versions

**Problem 3: No centralized control**

Without a gateway, there's no single place to:
- Rate-limit abusive clients
- Enforce API versioning
- Perform protocol conversion
- Collect unified metrics

---

## Life With an API Gateway

Now insert an Edge Server between clients and microservices:

```
Clients → [Edge Server / API Gateway] → Microservices
```

### What the Gateway Can Do

The API Gateway acts as a **central policy enforcement point**. Here's what it handles:

**On the way in (request flow):**
1. **Request validation** — reject malformed requests immediately
2. **IP whitelisting/blacklisting** — block or allow specific IP ranges
3. **Authentication & Authorization** — verify identity and permissions
4. **Rate limiting** — throttle requests per client based on their subscription plan
5. **Dynamic routing** — forward to the right service based on path, headers, or other criteria
6. **Service discovery** — find the right instance using Eureka
7. **Request modification** — add headers, transform payloads
8. **Protocol conversion** — accept HTTPS externally, forward as HTTP internally

**On the way out (response flow):**
- Exception handling
- Response modification
- Logging and monitoring (send data to Grafana, Prometheus, etc.)

**For resilience:**
- Circuit breaker implementation — prevent cascading failures
- Retry and timeout policies
- Fallback responses

**For business rules:**
- Quota enforcement (standard/premium/enterprise plans)
- API versioning
- Caching (integration with Redis)

### ❓ Why Can't Eureka Do All This?

Great question. Eureka's job is strictly **service discovery and registration**. It answers one question: *"Where are the available instances of service X?"*

Eureka doesn't do routing, security, rate limiting, or any cross-cutting concerns. Keeping these responsibilities separate follows the **single responsibility principle** — each component does one thing well. It also gives organizations the flexibility to adopt service discovery without being forced into an API gateway, or vice versa.

---

## The Full Picture

```
External Client
    ↓
API Gateway
    ├── Validate request
    ├── Check whitelist/blacklist
    ├── Authenticate & Authorize
    ├── Rate limit
    ├── Route to correct service
    ↓
Microservice (Accounts/Loans/Cards)
    ↓
API Gateway (post-processing)
    ├── Exception handling
    ├── Circuit breaker
    ├── Logging → Grafana
    ├── Caching → Redis
    ↓
External Client (response)
```

---

## ✅ Key Takeaways

- An API Gateway provides a **single entry point**, **centralized cross-cutting concerns**, and **dynamic routing**
- Shared libraries create tight coupling — an API Gateway achieves centralization without coupling
- The Gateway handles request validation, auth, rate limiting, routing, protocol conversion, and more
- Eureka handles service discovery only — the gateway handles everything else
- Gateway also enables resilience patterns (circuit breaker, retries, timeouts) that protect downstream services
- Organizations can selectively adopt gateway features based on their needs

## 💡 Pro Tip

Don't be overwhelmed by the long list of gateway capabilities. You don't need to implement *all* of them. Start with routing + security, then add rate limiting, logging, and circuit breaker as your system matures. The beauty of the gateway is that it's a single place to add these features incrementally.
