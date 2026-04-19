# Introduction to the Rate Limiter Pattern

## Introduction

Have you ever played a balloon pop game at a fair? The shop owner gives you only 3 or 5 darts based on how much you paid. No matter how good you are, once your darts are gone — you're done. Why? Because if the owner gave you unlimited darts, he'd go bankrupt.

That's **exactly** how the Rate Limiter pattern works in microservices. You're controlling how many "darts" (requests) each user gets within a time window.

---

## What Is the Rate Limiter Pattern?

The Rate Limiter pattern **controls and limits the rate of incoming requests** to a specific API or microservice. It sets a ceiling on how many requests a client can make within a given time period.

Think of it as a bouncer at a club — only so many people can enter per hour. If you've hit your limit, you wait.

---

## Why Do We Need Rate Limiting?

In a microservices network, multiple services interact with each other. Without rate limits, several dangerous scenarios can unfold:

### 1. Resource Exhaustion
A single client sending thousands of requests per second can consume all the CPU, memory, and threads — making the service unavailable for everyone else.

### 2. Performance Degradation
Even without malicious intent, a spike in traffic from one client can slow down the entire system.

### 3. DoS (Denial of Service) Attacks
A hacker intentionally floods your service with millions of requests to bring it down. Without rate limiting, your microservices have no defense.

### 4. Unfair Usage
One "heavy" user hogs all the resources while other users experience slow responses or timeouts.

---

## How Does It Work?

When a client exceeds the configured rate limit, the service returns:

> **HTTP 429 — Too Many Requests**

This tells the client: "You've used up your quota. Try again later."

The limit can be enforced based on various criteria:

| Strategy | Description |
|----------|-------------|
| **Per User** | Each logged-in user gets their own quota |
| **Per IP Address** | Each IP address has a separate limit |
| **Per Session** | Each browser session is rate-limited |
| **Per Tenant** | In multi-tenant systems, each tenant gets a quota |
| **Per Server** | Global limit across all clients for a server |

---

## Real-World Use Case: Subscription Tiers

Rate limiting is also used to **differentiate service levels** based on subscription:

| Tier | Rate Limit |
|------|-----------|
| **Basic** | 100 requests/minute |
| **Premium** | 1,000 requests/minute |
| **Enterprise** | 10,000 requests/minute |

This way, paying customers get higher throughput while free-tier users are kept within reasonable bounds.

---

## Advantages of Rate Limiting

1. **Protects against abuse** — prevents malicious or accidental request floods
2. **Ensures stability** — the service stays available even under heavy load
3. **Fair resource sharing** — every client gets their fair quota
4. **Controlled degradation** — instead of crashing, the service gracefully rejects excess requests
5. **Security layer** — helps mitigate DoS attacks

---

## ✅ Key Takeaways

- Rate Limiter pattern enforces a ceiling on how many requests a client can make per time window
- Excess requests receive **HTTP 429 (Too Many Requests)**
- Can be enforced per user, IP, session, tenant, or server
- Essential for preventing DoS attacks, resource exhaustion, and unfair usage
- Also useful for implementing subscription-based service tiers
- Think of it like the balloon game — you get a fixed number of tries per payment

💡 **Pro Tip:** Rate limiting isn't just about security. It's also a business tool. APIs like Google Maps, Twitter, and Stripe all use rate limits to manage usage and monetize access levels.
