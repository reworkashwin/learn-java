# Demo: Heartbeat Mechanism Between Microservices and Eureka

## Introduction

We've seen registration and deregistration. Now let's observe the third piece of the puzzle — **heartbeats**. Every microservice continuously sends heartbeat signals to the Eureka Server to confirm it's alive and healthy. But how do we *see* this happening? By breaking things intentionally, of course.

---

## The Experiment: Stop Eureka, Watch the Errors

### Setup

Start all microservices (Accounts, Loans, Cards) and verify they're registered in the Eureka dashboard. Clean the console logs for each microservice.

### The Trick

**Stop the Eureka Server.** Now watch the microservice consoles.

### What Happens

Within **30 seconds** (the default heartbeat interval), all three microservices start throwing exceptions:

```
was unable to send Heartbeat to Eureka Server
PUT http://localhost:8070/eureka/apps/ACCOUNTS/... - connection refused
```

This tells us several things:

1. **Heartbeats are real** — they're not just a concept; they're actual HTTP PUT requests
2. **Default interval is 30 seconds** — each microservice attempts to ping Eureka every 30 seconds
3. **The request type is PUT** — heartbeats update the instance's lease in the registry
4. **Failures generate exceptions** — but the microservice keeps running; it just logs errors

---

## Why Heartbeats Matter

### ❓ What if a microservice crashes without deregistering?

This is exactly why heartbeats exist. If Eureka stops receiving heartbeats from an instance, it knows something is wrong. After the lease expiration period (default: 90 seconds), Eureka **automatically removes** the unresponsive instance from the registry.

Without heartbeats, a crashed instance would remain in the registry forever — and other services would keep trying to send requests to a dead endpoint.

### The Flow

```
Microservice sends heartbeat → Eureka renews lease → Timer resets
                                      ↓
                    No heartbeat for 90s → Eureka removes instance
```

---

## The Complete Communication Picture

| Phase | Action | Direction | Automatic? |
|-------|--------|-----------|------------|
| **Startup** | Registration | Microservice → Eureka | ✅ Yes |
| **Running** | Heartbeat (every 30s) | Microservice → Eureka | ✅ Yes |
| **Shutdown** | Deregistration | Microservice → Eureka | ✅ Yes |
| **Crash** | Lease expires (no heartbeat) | Eureka removes entry | ✅ Yes |

Every phase is handled automatically by the Spring Cloud Netflix Eureka Client library. Zero manual intervention required.

---

## What's Next?

We now have a fully functioning service discovery setup:
- Eureka Server maintains the registry
- Microservices register, send heartbeats, and deregister automatically
- The registry is always up to date

The next step: **how does a microservice actually use Eureka to discover and call another microservice?** That's where service discovery and client-side load balancing come together.

---

## ✅ Key Takeaways

- Heartbeats are **HTTP PUT requests** sent every 30 seconds (default) from each microservice to Eureka
- If Eureka doesn't receive a heartbeat within the lease expiration (90s), it removes the instance
- Heartbeats ensure the registry only contains **healthy, responsive** instances
- The entire lifecycle — registration, heartbeats, deregistration, crash recovery — is **fully automatic**
- Stopping Eureka doesn't crash your microservices; it just prevents them from sending heartbeats

## 💡 Pro Tip

You can customize the heartbeat interval with `eureka.instance.leaseRenewalIntervalInSeconds` and the expiration time with `eureka.instance.leaseExpirationDurationInSeconds`. For production, the defaults (30s and 90s) are generally fine.
