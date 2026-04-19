# Centralized Logging and Log Aggregation in Microservices

## Introduction

Let's tackle the first pillar of observability: **Logs**. In a monolith, all logs go to one place — easy to search, easy to debug. In microservices? Each container writes its own logs, in its own location, in its own format. If you have 100 containers, you have 100 different places to look.

The answer is **centralized logging** (also called log aggregation) — collecting all logs from all services into a single, searchable location.

---

## What Are Logs, Really?

Logs are **discrete records of events** that happen inside your application over time. A good log entry contains:

| Component | Example |
|-----------|---------|
| **Timestamp** | `2025-04-19T14:23:45.123Z` |
| **Severity** | `ERROR`, `WARN`, `INFO`, `DEBUG` |
| **Thread** | `http-nio-8080-exec-5` |
| **Message** | `Failed to fetch loan details for customer 12345` |
| **Context** | User ID, tenant, correlation ID |

Logs answer critical questions:
- What happened at 2:15 AM?
- Which thread was processing the request?
- Which user or tenant was affected?
- What was the exact exception?

---

## Logging in Monolith vs Microservices

### Monolith: Simple

```
[Single Application] → [Single Log Folder]
                              ↓
                     Developer downloads & searches
```

One codebase, one log location, one developer searching through it. Life is good.

### Microservices: Complex

```
[Accounts Container] → logs/accounts.log
[Loans Container]    → logs/loans.log
[Cards Container]    → logs/cards.log
[Gateway Container]  → logs/gateway.log
[Config Server]      → logs/config.log
... × 100 more services
```

A single request might generate logs in 5+ containers. To debug an issue, a developer would need to:
1. SSH into each container
2. Find the log file
3. Search for the relevant entries
4. Correlate timestamps across services

For 20 services? **Impossible** in any reasonable timeframe.

---

## The Solution: Centralized Logging

Centralized logging collects logs from **all** services and stores them in **one** place:

```
[Accounts] ──┐
[Loans]   ───┤
[Cards]   ───┼──→ [Centralized Log Storage] ←── Developer queries here
[Gateway] ───┤
[Config]  ───┘
```

Now the developer goes to **one place** to search, filter, and analyze logs from every service.

---

## The 15-Factor Methodology Connection

Remember the 15-factor app methodology? One of its recommendations is:

> **Treat logs as event streams to standard output, and don't be concerned with how they are processed or stored.**

This means:
- Your microservice just writes to `stdout` — that's it
- It does **not** manage log files, rotation, or aggregation
- An external agent handles collection and forwarding
- The developer focuses on **business logic**, not logging infrastructure

This is exactly what we're going to implement.

---

## Should Developers Handle Log Aggregation?

**No!** Here's why:

- Log aggregation is **infrastructure**, not business logic
- Forcing developers to write log-shipping code wastes their time
- It introduces coupling between your service and the logging system
- It's error-prone — what if the log-shipping code has a bug?

Instead, we use **external agents** that automatically collect logs from containers without any code changes in the microservices.

---

## Severity Levels — A Quick Refresher

| Level | When to Use | Production? |
|-------|-------------|-------------|
| `TRACE` | Very detailed step-by-step | ❌ Never |
| `DEBUG` | Debugging info, variable values | ❌ Rarely |
| `INFO` | Normal operations, startup, connections | ⚠️ Sparingly |
| `WARN` | Something unexpected but handled | ✅ Yes |
| `ERROR` | Something broke, needs attention | ✅ Always |

⚠️ **Don't over-log in production.** Every log statement has a performance cost. In production, log `WARN` and `ERROR`. Activate `DEBUG` only when actively troubleshooting.

---

## What's Next?

We need tools that can:
1. **Collect** logs from all containers automatically (no code changes)
2. **Store** them in a centralized, scalable location
3. **Search and visualize** them through a user-friendly interface

In the next lecture, we'll explore **Grafana, Loki, and Promtail** — a powerful open-source stack that does exactly this.

---

## ✅ Key Takeaways

- Centralized logging = collecting all service logs into one searchable location
- Without it, debugging microservices is impractical at scale
- Developers should **not** be responsible for log aggregation — use external agents
- Follow the 15-factor methodology: write to stdout, let infrastructure handle the rest
- Be disciplined with log severity — production should only emit WARN and ERROR
- The goal: a developer goes to **one place** to search logs from **all** services
