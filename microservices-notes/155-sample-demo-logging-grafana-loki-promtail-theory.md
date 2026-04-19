# Grafana, Loki & Promtail — Architecture Deep Dive (Theory)

## Introduction

We've introduced the roles of Grafana, Loki, and Promtail at a high level. Now let's go deeper — how do these components actually communicate? What happens internally when Promtail sends logs to Loki? How does Grafana read them? This lecture walks through the **official architecture from Grafana's documentation** and maps it to our microservices setup.

---

## The Official Architecture

The Grafana team provides a reference architecture in their **"Getting Started" documentation**. Let's walk through it step by step.

### The Components

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  [Your Microservices]                                           │
│     ↓ logs (stdout/stderr)                                      │
│  [Promtail]  ── collects ──→  [Gateway]  ──→  [Loki Write]     │
│                                     │              ↓             │
│                                     │         [MinIO/Storage]    │
│                                     │              ↑             │
│  [Grafana]  ── queries ──→  [Gateway]  ──→  [Loki Read]        │
│     ↑                                                           │
│  Developer                                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Role |
|-----------|------|
| **Your Microservices** | Generate logs to stdout (no changes needed) |
| **Promtail** | Log agent — reads container logs and forwards them |
| **Gateway** | Routes requests to the right Loki component |
| **Loki Write** | Receives and writes log data |
| **Loki Read** | Handles log queries |
| **MinIO** | Object storage backend for log data |
| **Grafana** | UI for searching and visualizing logs |

---

## The Write Path — How Logs Get Stored

When your microservices generate logs, here's what happens:

1. **Microservice** writes a log line to stdout:
   ```
   2025-04-19 14:23:45 INFO [http-nio-8080-exec-3] - Account created for customer 12345
   ```

2. **Promtail** (running in the same Docker network) detects the container and reads its log output

3. Promtail **forwards** the log entry to the **Gateway**

4. Gateway inspects the request and routes it to **Loki Write** (because it's a write operation)

5. Loki Write component **stores** the log in **MinIO** (the storage backend)

The key insight: Promtail is the only component that touches your microservices. Everything else is internal to the Grafana/Loki stack.

---

## The Read Path — How Developers Query Logs

When a developer opens Grafana and searches for logs:

1. **Developer** enters a query in Grafana:
   ```
   {container="accounts"} |= "ERROR"
   ```

2. Grafana sends the query to the **Gateway**

3. Gateway routes it to **Loki Read** (because it's a read operation)

4. Loki Read fetches the matching logs from **MinIO**

5. Results flow back: MinIO → Loki Read → Gateway → **Grafana** → Developer sees the logs

---

## Why So Many Internal Components?

You might wonder: why have separate Read and Write components? Why a Gateway? Isn't this overengineered?

**Scalability.** Loki is designed to handle enormous log volumes. By separating:
- **Write path** — can be scaled independently when log ingestion is high
- **Read path** — can be scaled independently when many developers are querying
- **Gateway** — routes traffic intelligently between components

For our learning setup, we don't need to worry about these internals. They're all deployed via Docker Compose as a single stack. The Grafana team provides ready-to-use configurations.

---

## Replacing the Sample App with Our Microservices

The official docs use a sample app called "Flog" that generates fake logs. In our setup, we replace it with our actual microservices:

```
Official docs:                    Our setup:
[Flog app] → logs                [Accounts] → logs
                                 [Loans]    → logs
                                 [Cards]    → logs
                                 [Gateway]  → logs
         ↓                            ↓
     [Promtail]                   [Promtail]
         ↓                            ↓
      [Loki]                       [Loki]
         ↓                            ↓
     [Grafana]                    [Grafana]
```

Same architecture, different log sources. That's the beauty of this approach — it works with **any** application that writes to stdout.

---

## Implementation Approach

The official documentation provides **YAML configurations** for Docker Compose that set up the entire stack. Our approach:

1. **Copy** the provided YAML configurations
2. **Replace** the sample application with our microservices
3. **Add** the Grafana/Loki/Promtail services to our existing Docker Compose
4. **Configure** Promtail to discover our microservice containers
5. **Start everything** with `docker compose up`

No code changes in any microservice. Everything is infrastructure configuration.

---

## The 15-Factor Connection (Again)

This architecture perfectly implements the 15-factor methodology's **"Logs"** factor:

> Treat logs as event streams to standard output. Don't be concerned with how they are processed or stored.

Our microservices:
- ✅ Write to stdout (they already do)
- ✅ Don't manage log files
- ✅ Don't know about Promtail, Loki, or Grafana
- ✅ Focus purely on business logic

The infrastructure:
- ✅ Promtail collects logs externally
- ✅ Loki stores them centrally
- ✅ Grafana makes them searchable

---

## What's Next

In the next lecture, we'll actually implement this — adding Grafana, Loki, and Promtail to our Docker Compose setup and seeing real microservice logs appear in the Grafana UI.

---

## ✅ Key Takeaways

- The architecture has a clear **write path** (Promtail → Gateway → Loki Write → MinIO) and **read path** (Grafana → Gateway → Loki Read → MinIO)
- Separate Read/Write components enable **independent scaling**
- The Gateway routes traffic to the appropriate Loki component
- All internal components are **pre-built** — we just deploy them via Docker Compose
- Our microservices need **zero changes** — Promtail reads their stdout logs
- The official Grafana documentation provides ready-to-use Docker Compose configurations

💡 **Pro Tip:** The official Grafana Loki "Getting Started" page is an excellent resource. Bookmark it — it provides Docker Compose files, configuration examples, and architecture diagrams that you can adapt for any project.
