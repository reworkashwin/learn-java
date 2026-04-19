# Introduction to Redis RateLimiter in Spring Cloud Gateway

## Introduction

We know what rate limiting is. Now, how do we actually implement it in a **Spring Cloud Gateway**? The answer involves two things: a **KeyResolver** (who are we limiting?) and a **Redis-backed Token Bucket** (how are we limiting?).

This lecture covers the theory and configuration behind the `RequestRateLimiter` filter in Spring Cloud Gateway, powered by Redis.

---

## The Two Building Blocks

### 1. KeyResolver — Who Are We Rate Limiting?

Before you can limit requests, you need to define the **criteria** — who gets their own bucket?

The `KeyResolver` interface tells the Gateway how to identify each "client." You might resolve the key based on:

- **Username** (from Spring Security's `Principal`)
- **IP address**
- **Session ID**
- **A custom header value**

Spring Cloud Gateway provides a default implementation called `PrincipalNameKeyResolver` that uses the logged-in username from Spring Security. But you can create your own.

If the KeyResolver **cannot find a key**, requests are denied by default. You can change this behavior with:

```yaml
spring.cloud.gateway.filter.request-rate-limiter.deny-empty-key: false
```

### 2. Redis RateLimiter — The Token Bucket Algorithm

The actual rate limiting uses Redis as a backend store and is based on the **Token Bucket algorithm**, inspired by work done at **Stripe** (the payment company).

#### Why Redis?
Because rate limiting needs shared state. If your Gateway runs multiple instances, they all need to agree on how many requests a user has made. Redis provides that shared, fast, in-memory storage.

---

## The Token Bucket Algorithm — Explained

Imagine each user has a **bucket** that holds tokens. Every request costs tokens. The bucket gets refilled at a steady rate.

Three properties control this bucket:

### `replenishRate` — How Fast the Bucket Refills

This is the number of tokens added to the bucket **per second**.

Example: `replenishRate = 100` → 100 tokens added every second.

### `burstCapacity` — Maximum Bucket Size

This is the **maximum** number of tokens the bucket can hold at any time. It prevents the bucket from growing infinitely when the user isn't making requests.

Example: `burstCapacity = 200` → Even if the user hasn't made requests for 10 seconds, the bucket never holds more than 200 tokens.

### `requestedTokens` — Cost Per Request

How many tokens each request consumes. Usually `1`, but you can increase it for expensive operations.

---

## How These Properties Work Together

### Scenario 1: Steady Rate (No Bursting)
```
replenishRate = 100
burstCapacity = 100
requestedTokens = 1
```
Result: Exactly 100 requests/second. Unused tokens are **discarded** — no accumulation.

### Scenario 2: Allow Temporary Bursts
```
replenishRate = 100
burstCapacity = 200
requestedTokens = 1
```
Result: Normally 100 requests/second. But if the user was idle, they can burst up to 200 requests at once. After that, they're back to 100/second.

### Scenario 3: One Request Per Minute
```
replenishRate = 1
burstCapacity = 60
requestedTokens = 60
```
How? Every second, 1 token is added. After 60 seconds, the bucket has 60 tokens. Each request costs 60 tokens. So the user can make **one request per minute**.

---

## Configuration Example (YAML)

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: cards-service
          uri: lb://CARDS
          predicates:
            - Path=/eazybank/cards/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                redis-rate-limiter.requestedTokens: 1
                key-resolver: "#{@userKeyResolver}"
```

Or via Java-based route configuration (which we'll use in the next lecture).

---

## Important Edge Case

⚠️ **Never set `burstCapacity` to 0!** That will block ALL requests. If the bucket can hold 0 tokens, no request can ever pass through.

---

## How Stripe Uses Rate Limiting

Stripe's engineering blog describes real-world scenarios that drove this design:

1. **One user causes a traffic spike** → Rate limit protects other users
2. **A misbehaving script** sends accidental floods → Contained by rate limits
3. **Intentional attack** trying to overwhelm servers → Blocked at the gate
4. **Low-priority bulk requests** threatening critical transactions → Rate limits preserve capacity for high-priority traffic
5. **Internal system failure** → Rate limits help shed low-priority load gracefully

---

## ✅ Key Takeaways

- Spring Cloud Gateway uses **Redis** for distributed rate limiting with the Token Bucket algorithm
- **KeyResolver** defines the criteria (per user, per IP, etc.)
- Three key properties: `replenishRate` (refill speed), `burstCapacity` (max bucket size), `requestedTokens` (cost per request)
- Setting `burstCapacity = replenishRate` = strict steady rate, no bursting allowed
- Setting `burstCapacity > replenishRate` = allows temporary traffic bursts
- Never set `burstCapacity = 0` unless you want to block all requests

💡 **Pro Tip:** For most production APIs, start with `replenishRate` equal to your expected requests-per-second, set `burstCapacity` to 2× that for headroom, and monitor. Tune based on real traffic patterns.
