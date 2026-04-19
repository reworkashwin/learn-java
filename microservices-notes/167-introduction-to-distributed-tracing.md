# Introduction to Distributed Tracing in Microservices

## Introduction

We've tackled **logs** (what happened?) and **metrics** (how healthy is the system?). Now comes the third and final pillar of observability: **tracing** — which answers the most difficult question in distributed systems: **where did the request go?**

In a monolithic application, debugging is straightforward — you set a breakpoint and step through the code. But in microservices, a single user request might travel through 5, 10, or even 20 services. If something fails, which service caused it? Where did things slow down? Logs alone can't answer this without painful manual correlation.

Distributed tracing solves this problem.

---

## Why Logs and Metrics Aren't Enough

### ❓ What's the Gap?

- **Logs** tell you what happened inside *one* service for a specific event
- **Metrics** tell you the overall health (CPU, memory, uptime) of *one* service
- Neither tells you the **journey of a request** across multiple services

Imagine this scenario: a user calls `fetchCustomerDetails`, which goes through the Gateway → Accounts → Loans → Cards. The response takes 5 seconds. Is the delay in the Gateway? Accounts? Loans? Cards? Without tracing, you're guessing.

---

## What Is Distributed Tracing?

### 🧠 The Core Idea

Distributed tracing is a technique that **tracks a request as it flows across multiple services**, recording:
- Which services were involved
- In what order they were called
- How long each service took
- Where errors or bottlenecks occurred

It gives developers a **complete map** of a request's journey through the distributed system.

---

## The Three Components of Distributed Tracing

Every distributed tracing implementation follows a standard with three components:

### 1. Tags (Metadata)

**What**: Key-value pairs attached to logs that provide context — like the application name, username, or service identifier.

**Why**: Lets you instantly identify which service generated a log line. If you tag every log with `application=accounts`, filtering becomes trivial.

### 2. Trace ID

**What**: A unique identifier generated **once** at the entry point of a request (e.g., the API Gateway). This same ID is carried through every service the request touches.

**Why**: It ties together all logs across all services for a single request. Search for one Trace ID and you see the complete request journey.

**Scope**: One Trace ID per user request, across all services.

### 3. Span ID

**What**: A unique identifier generated for each **stage** of request processing — typically one per microservice.

**Why**: Within a single request (Trace ID), you need to distinguish what happened *in* Accounts vs. *in* Loans. Span IDs provide this granularity.

**Scope**: One Span ID per microservice per request.

---

## How It All Fits Together: A Visual Example

```
User → Gateway Server → Accounts → Loans → Cards
```

Every log line in the system now contains three pieces of information:

| Service | Tag | Trace ID | Span ID |
|---------|-----|----------|---------|
| Gateway Server | `gatewayserver` | `29xxx...` | `a1b2c3` |
| Accounts | `accounts` | `29xxx...` | `d4e5f6` |
| Loans (log 1) | `loans` | `29xxx...` | `g7h8i9` |
| Loans (log 2) | `loans` | `29xxx...` | `g7h8i9` |
| Cards (log 1) | `cards` | `29xxx...` | `j0k1l2` |
| Cards (log 2) | `cards` | `29xxx...` | `j0k1l2` |

Notice:
- **Trace ID** is the same everywhere — it's the request's fingerprint
- **Span ID** is the same within one service but different across services
- **Tag** identifies the service

### 💡 The Key Insight

Given any log line, you can:
1. Use the **Tag** to know which service it's from
2. Use the **Trace ID** to find all logs from the same request across all services
3. Use the **Span ID** to find all logs within one specific service for that request

---

## Wasn't Our Correlation ID the Same Thing?

### ❓ How Is This Different from What We Built?

Earlier, we generated a correlation ID in the Gateway Server and passed it through all microservices. That was a step in the right direction, but it had limitations:

| Aspect | Correlation ID (our approach) | Distributed Tracing (standard) |
|--------|------------------------------|-------------------------------|
| Tag/Metadata | ❌ Not included | ✅ Service name, user info |
| Trace ID | ✅ (correlation ID acted as this) | ✅ Auto-generated |
| Span ID | ❌ No per-service granularity | ✅ Auto-generated per service |
| Developer effort | High (manually append to every log) | Low (automatic instrumentation) |
| Standardized format | ❌ Custom | ✅ Industry standard |

With proper distributed tracing tools, all three components are **automatically injected** into every log line. The developer doesn't need to manually append anything to their log statements.

---

## ✅ Key Takeaways

- Distributed tracing tracks a request's complete journey across multiple microservices
- Three components: **Tags** (metadata), **Trace ID** (request identifier), **Span ID** (per-service identifier)
- Trace ID is shared across all services for one request; Span ID is unique per service
- Unlike our custom correlation ID approach, proper distributed tracing is automatic and follows industry standards
- This is essential for debugging issues in production distributed systems

### ⚠️ Common Mistakes

- Confusing Trace ID and Span ID — Trace ID is per-request (global), Span ID is per-service (local)
- Thinking correlation IDs are sufficient — they lack metadata tags and span-level granularity
- Expecting to understand distributed tracing fully from theory alone — the demo in upcoming lectures will make it click

### 💡 Pro Tip

When someone describes a production issue, the first question a microservice developer should ask is: "What's the Trace ID?" With that single value, you can reconstruct the entire request journey across every service.
