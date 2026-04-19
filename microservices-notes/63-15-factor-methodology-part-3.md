# 15-Factor Methodology Deep Dive — Part 3 (Factors 11-15)

## Introduction

The final five factors complete the 15-factor methodology — covering self-contained services, statelessness, scalability through concurrency, observability, and security. These are the factors that separate a well-architected cloud-native system from one that just happens to run in the cloud.

---

## Factor 11: Port Binding

### The Principle

Cloud-native applications must be **self-contained** — they should not rely on an external server in the execution environment.

### Traditional vs. Cloud-Native

**Traditional**: You build a WAR file → manually deploy it into an external Tomcat/Jetty server → the server runs your app.

**Cloud-Native**: The application **embeds the server within itself**. Spring Boot does exactly this — it packages an embedded Tomcat server inside your JAR. When you `java -jar app.jar`, the server starts from within.

### Why Does This Matter?

If your microservice depends on an external Tomcat server, you need to install, configure, and manage that server on every machine where your microservice runs. With 100+ microservices, that's 100+ external server installations.

With an embedded server:
- Each microservice is self-contained
- Each microservice maps to its own server
- No shared servers serving multiple applications
- Services are exposed via **port binding** (e.g., `docker run -p 8080:8080`)

### The Rule

> Never deploy multiple applications on a single server. Every application gets its own self-contained, embedded server.

---

## Factor 12: Stateless Processes

### The Principle

All microservice instances must be **stateless** and follow a **shared-nothing architecture**.

### Why Statelessness Is Non-Negotiable

Imagine your `accounts` microservice scales to 5 instances under heavy traffic. When traffic drops, 3 instances are terminated. If those instances stored user session data or cached information **in memory**, all that data is lost.

### How to Achieve Statelessness

- **Never store** user sessions, cache data, or any state inside a microservice instance
- Use **external backing services** for all state:
  - Databases for persistent data
  - Redis for caching
  - Distributed session stores for user sessions

This way, when an instance is terminated and a new one starts, it reads state from the external store — no data loss.

```
Instance 1 ──┐
Instance 2 ──┤──→ External Data Store (Redis / DB)
Instance 3 ──┘
```

Any instance can handle any request because all state lives externally.

⚠️ **Common Mistake**: Storing user sessions in-memory on the application server. This breaks scalability — requests must always hit the same instance (sticky sessions), which defeats the purpose of horizontal scaling.

---

## Factor 13: Concurrency

### The Principle

Statelessness enables scaling, but your application must also support **concurrent processing** — handling many requests simultaneously.

### How Java Handles This

Java and the JVM manage concurrency through **thread pools**. When a request arrives, a thread from the pool handles it. Multiple threads process multiple requests in parallel.

### Horizontal vs. Vertical Scaling

| Approach | How | Limit |
|----------|-----|-------|
| **Vertical** | Add more RAM/CPU to a single machine | Physical hardware limits |
| **Horizontal** | Add more machines/instances | Virtually unlimited |

Always prefer **horizontal scaling**. Vertical scaling hits a ceiling; horizontal scaling doesn't.

```
Vertical:   [16 GB RAM, 8 CPU] → [32 GB RAM, 16 CPU] → ceiling reached ❌

Horizontal: [2 GB, 2 CPU] + [2 GB, 2 CPU] + [2 GB, 2 CPU] + ... → no limit ✅
```

### Process Types

- **Web processes**: Handle HTTP requests
- **Worker processes**: Execute background/scheduled jobs

Classifying and optimizing these processes ensures your application scales effectively.

---

## Factor 14: Telemetry

### The Problem

With a monolith, you monitor 1-2 servers. Easy. With microservices, you have dozens or hundreds of services running across multiple machines. How do you know what's happening?

### The Solution: Observability

Cloud-native applications require comprehensive **telemetry** — the ability to monitor, understand, and control your system remotely.

Kevin Hoffman compares this to **space probes**: NASA sends satellites into space and controls them remotely using telemetry data. Similarly, you manage your microservices remotely using:

| Data Type | Purpose |
|-----------|---------|
| **Logs** | Troubleshooting individual issues |
| **Metrics** | Measuring performance (CPU, memory, response times) |
| **Traces** | Understanding request flow across services |
| **Health status** | Assessing system well-being |
| **Events** | Capturing significant occurrences |

All this data must be fed into a **centralized component** where you can monitor and control everything from a single place.

💡 **Pro Tip**: This course has a dedicated observability section covering how to gather and centralize all telemetry data.

---

## Factor 15: Authentication and Authorization

### The Principle

Follow a **zero-trust approach** — every interaction within your microservice network must be authenticated and authorized. Security is not optional; it's fundamental.

### Authentication vs. Authorization

**Authentication**: *Who are you?* Verify identity through credentials (username/password, tokens).

**Authorization**: *What can you do?* After identity is confirmed, check if the user has permission for the requested action.

### Why This Matters in Microservices

In a monolith, you secure one entry point. In microservices, every service-to-service communication is a potential attack vector. Every endpoint must validate both authentication and authorization.

### Tools We'll Use

This course implements security using **OAuth 2.1** and **OpenID Connect** — the industry-standard protocols for securing microservices.

---

## The Complete 15-Factor Methodology Summary

| # | Factor | One-Line Summary |
|---|--------|-----------------|
| 1 | One Codebase | One repo per microservice |
| 2 | API First | Design APIs before implementations |
| 3 | Dependency Management | Declare all dependencies explicitly |
| 4 | Design, Build, Release, Run | Strict separation of stages |
| 5 | Configuration | Externalize environment-specific configs |
| 6 | Logs | Write to stdout, aggregate externally |
| 7 | Disposability | Fast startup, graceful shutdown |
| 8 | Backing Services | Treat external resources as attached |
| 9 | Environment Parity | Keep all environments identical |
| 10 | Admin Processes | Treat as isolated, versioned processes |
| 11 | Port Binding | Self-contained apps with embedded servers |
| 12 | Stateless Processes | No in-memory state; use external stores |
| 13 | Concurrency | Horizontal scaling with concurrent processing |
| 14 | Telemetry | Centralized monitoring and observability |
| 15 | Auth & AuthZ | Zero-trust security for all interactions |

---

## ✅ Key Takeaways

- **Port Binding**: Embed the server (Spring Boot does this); never rely on external servers
- **Stateless Processes**: Store all state in external backing services, never in memory
- **Concurrency**: Scale horizontally, not vertically; use thread pools for parallel processing
- **Telemetry**: Feed logs, metrics, traces, and health data into a centralized monitoring system
- **Authentication & Authorization**: Implement zero-trust security using OAuth 2.1 and OpenID Connect
- Without following all 15 factors, you can't call your application truly cloud-native
- These factors are common interview topics — know them well
