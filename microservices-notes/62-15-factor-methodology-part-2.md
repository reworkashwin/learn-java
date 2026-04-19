# 15-Factor Methodology Deep Dive — Part 2 (Factors 6-10)

## Introduction

Continuing our journey through the 15-factor methodology. Factors 6-10 deal with how your applications handle logs, lifecycle, external services, environment consistency, and maintenance tasks.

---

## Factor 6: Logs

### The Problem with Traditional Logging

In monolithic applications, the app writes logs to a file on the server. When an issue occurs, a developer SSHes into the server, navigates to the log directory, opens the file for the correct date, and searches for the exception.

Now imagine doing that across **100 different microservices** running on different servers. Are you going to log into 100 servers and search through 100 log files? Obviously not.

### The Cloud-Native Approach

As per this factor, your microservice should **not** manage log storage or rotation. Instead:

1. The application simply writes logs to **standard output** (`stdout`)
2. Logs are treated as a **stream of time-ordered events**
3. An external **log aggregator** tool collects, stores, and indexes logs from all services
4. Developers search and analyze all logs from a **single centralized UI**

### How It Works

```
Accounts MS → stdout → Log Aggregator → Single Search UI
Loans MS    → stdout →       ↑
Cards MS    → stdout →       ↑
```

Your microservice's only job is to `System.out.println()` (or use a proper logging framework). Everything else — collection, storage, rotation, search — is handled externally.

💡 **Pro Tip**: This course has a dedicated section on log aggregation where we'll feed all microservice logs into a centralized tool and search them from a single UI.

---

## Factor 7: Disposability

### The Mindset Shift

In traditional apps, keeping the single monolithic server running is **top priority**. It must never go down.

In cloud-native, applications are **ephemeral** — they can be started, stopped, and replaced at any time. Why? Because:

- You have multiple instances running
- If one becomes unresponsive, Kubernetes terminates it and creates a new one
- During high traffic, new instances spin up automatically
- During low traffic, excess instances are removed

### Requirements for Disposability

For this to work, your applications must be designed for:

1. **Fast startup** — new instances need to be ready in seconds, not minutes
2. **Graceful shutdown** — stop accepting new requests, finish ongoing ones, then exit

Spring Boot + Docker containers satisfy both — a microservice container can start and stop within seconds. Virtual machines? 10-15 minutes minimum.

⚠️ **Common Mistake**: Ignoring ongoing requests during shutdown. A graceful shutdown must complete in-flight requests and return pending jobs to queues before exiting.

---

## Factor 8: Backing Services

### What Are Backing Services?

Any external resource your microservice depends on:
- Databases
- SMTP servers
- FTP servers
- Caching systems (Redis)
- Message brokers (Kafka, RabbitMQ)

### The Principle

Treat all backing services as **attached resources**. You should be able to swap one for another **without changing application code** — only by changing configuration.

### Example: Database Switching

Throughout the development lifecycle, you might use different databases:
- Development: H2 (in-memory)
- QA: PostgreSQL on a shared server
- Production: PostgreSQL on AWS RDS

Your application code stays the same. Only the connection URL, username, and password change — and those come from **externalized configuration** (Factor 5).

```
App Code (unchanged) + Config (dev DB URL)  → Development
App Code (unchanged) + Config (prod DB URL) → Production
```

---

## Factor 9: Environment Parity

### The Principle

Minimize differences between your environments. Dev should look like QA. QA should look like production. When environments diverge, bugs appear in one environment but not another.

### Three Gaps to Eliminate

**Time Gap**: Reduce the time between writing code and deploying to production. Use CI/CD pipelines for continuous deployment.

**People Gap**: Break down the wall between developers and operations. Adopt DevOps culture — "you build it, you run it."

**Tools Gap**: Use the **same type and version** of backing services across all environments.

> If you use H2 in development but PostgreSQL in production, your code might work perfectly with H2 but fail with PostgreSQL due to SQL dialect differences. Use the same database type everywhere.

⚠️ **Common Mistake**: Using different backing service types across environments just to save time. This creates subtle bugs that only surface in production.

---

## Factor 10: Administrative Processes

### What Are Administrative Processes?

Management tasks like:
- Database migrations
- Data cleanup batch jobs
- One-time data updates
- Schema changes

### The Principle

Treat these tasks as **isolated processes**. They should be:
- **Version controlled** alongside the application code
- **Packaged** with the application
- **Executed in the same environment** as the application
- Run in **every environment** (dev, QA, production) — not just production

### Best Practice

Consider administrative tasks as **independent microservices** that execute once and are then discarded. Don't bundle them into your main business logic — that means your microservice permanently carries code it only needed once.

Alternatively, expose an administrative task as a **dedicated endpoint** that can be triggered when needed.

---

## ✅ Key Takeaways

- **Factor 6 (Logs)**: Write to stdout, let a log aggregator handle the rest
- **Factor 7 (Disposability)**: Design for fast startup and graceful shutdown
- **Factor 8 (Backing Services)**: Treat external resources as swappable attached resources
- **Factor 9 (Environment Parity)**: Keep all environments identical — same tools, same versions
- **Factor 10 (Admin Processes)**: Treat maintenance tasks as isolated, version-controlled processes
- Never skip admin tasks in lower environments just to save time
- Spring Boot + Docker inherently support disposability with fast startup/shutdown
