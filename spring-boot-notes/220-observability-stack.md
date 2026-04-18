# Understanding the Observability Stack — Micrometer, OTel, OTLP & LGTM

## Introduction

Now that you understand *what* observability is, let's understand *how* it works under the hood. When you implement observability in a Spring Boot application, there's a whole **pipeline** of components working together — from your application to the visualization dashboard.

Let's break down each component: **Micrometer**, **OpenTelemetry (OTel)**, **OTLP**, and the **LGTM Stack**.

---

## The Observability Pipeline

Think of observability as a pipeline with four stages:

```
Spring Boot App → Micrometer → OpenTelemetry (OTel) → LGTM Stack (Grafana)
     [Generate]      [Collect]      [Export via OTLP]      [Store & Visualize]
```

Each stage has a specific role. Let's walk through them.

---

## Stage 1: Spring Boot Application

Your application generates **business logic**, handles requests, talks to databases. But it doesn't natively know how to expose its metrics, traces, or logs in a standardized format.

It needs help — and that's where the observability libraries come in.

---

## Stage 2: Micrometer — The Collection Layer

### 🧠 What is Micrometer?

Micrometer is Spring's **abstraction layer for observability** — specifically for metrics and tracing.

### 🔗 The SLF4J Analogy

Remember SLF4J for logging? SLF4J provides a common API, and you can swap the underlying implementation (Logback, Log4j2) without changing your code. **Micrometer does the same thing for metrics and tracing.**

It provides a facade that hides the complexity of the underlying observability framework.

### What Micrometer Does

| Responsibility | How |
|---------------|-----|
| Collects **metrics** | By integrating deeply with Spring Boot Actuator (CPU, memory, request counts, latency) |
| Adds **tracing** | Via Micrometer Tracing — generates trace IDs and span IDs for every request |
| Forwards data | Passes collected telemetry to OpenTelemetry |

### What Micrometer Does NOT Do

Micrometer **does not store data**. It collects and forwards — that's it.

💡 **Key Insight:** Micrometer handles metrics and traces. **Logging is handled separately** by the logging framework (Logback/SLF4J).

---

## Stage 3: OpenTelemetry (OTel) — The Export Layer

### 🧠 What is OTel's Role Here?

OpenTelemetry receives the telemetry data from Micrometer and **exports it** to the observability backend.

It provides:
- Standardized **APIs and SDKs**
- **Vendor-neutral standards** — the format of the data is the same regardless of the backend
- The bridge between your application and any observability product

### How Micrometer and OTel Work Together

```
Micrometer generates data → formats it per OTel standards → OTel exports it
```

Micrometer acts as the **bridge** to OpenTelemetry. It formats the data in a way that OTel expects.

---

## The OTLP Protocol — How Data Travels

### 🧠 What is OTLP?

**OTLP** = OpenTelemetry Protocol. It's the **wire protocol** that defines how telemetry data is sent to observability backends.

### Why OTLP Matters

Before OpenTelemetry, every vendor (Grafana, Splunk, Datadog) had their **own proprietary format**. Switching vendors meant changing your application code - a nightmare.

OTLP solves this by providing a **single standard format**:

- Today you use Grafana → OTLP sends data to Grafana
- Tomorrow you switch to Splunk → OTLP sends data to Splunk
- **Zero code changes** in your Spring Boot application

### Transport Options

| Protocol | Port | Use Case |
|----------|------|----------|
| **HTTP** | 4318 | Simpler, HTTP-based transport |
| **gRPC** | 4317 | Higher performance, binary transport |

### The Analogy

Just like **REST** is the standard protocol for HTTP-based APIs, **OTLP** is the standard protocol for observability data.

---

## Stage 4: LGTM Stack — The Backend

### 🧠 What is LGTM?

LGTM is a collection of **four Grafana products** that together form a complete observability backend:

| Letter | Product | Handles |
|--------|---------|---------|
| **L** | **Loki** | Stores and indexes **logs** for searching |
| **G** | **Grafana** | The **UI** — visualizes logs, metrics, traces; builds dashboards |
| **T** | **Tempo** | Stores **traces** — the path requests take through your app |
| **M** | **Mimir** | Stores **metrics** — CPU, memory, response times |

### How They Work Together

```
Logs    → Loki   → Grafana UI
Traces  → Tempo  → Grafana UI
Metrics → Mimir  → Grafana UI
```

All data flows into their respective storage systems and is **visualized through Grafana**.

### Important: LGTM Doesn't Collect Data

The LGTM stack **only stores and visualizes**. It relies on OpenTelemetry (via OTLP) to **push** data to it. There's no direct connection between your Spring Boot app and the LGTM stack.

---

## The Complete Pipeline Visualized

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Spring Boot    │     │  Micrometer  │     │ OpenTelemetry │     │  LGTM Stack │
│  Application    │────▶│  (Collect)   │────▶│  + OTLP      │────▶│  (Store &   │
│                 │     │              │     │  (Export)     │     │  Visualize) │
│ • Business Logic│     │ • Metrics    │     │ • Vendor      │     │ • Loki      │
│ • Logging       │     │ • Traces     │     │   neutral     │     │ • Grafana   │
│ • Actuator      │     │ • Bridge     │     │ • HTTP/gRPC   │     │ • Tempo     │
│                 │     │              │     │              │     │ • Mimir     │
└─────────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
```

---

## Who Does What?

| Role | Component |
|------|-----------|
| Generate telemetry | Spring Boot + Micrometer |
| Collect & forward | Micrometer |
| Standardize & export | OpenTelemetry + OTLP |
| Store logs | Loki |
| Store traces | Tempo |
| Store metrics | Mimir |
| Visualize everything | Grafana |
| Alerting & dashboards | Grafana |

---

## Developer vs DevOps Responsibility

| Who | Responsibility |
|-----|---------------|
| **Developer** | Add dependencies, configure properties, write code to emit telemetry |
| **DevOps** | Set up the LGTM stack, configure Grafana dashboards, set up alerts |

As a developer, your job is to make the **code changes**. Setting up Grafana and its ecosystem is typically the DevOps team's responsibility. For local development, you'll use Docker.

---

## ✅ Key Takeaways

- **Micrometer** = Spring's abstraction for metrics and tracing (like SLF4J for logging)
- **OpenTelemetry** = the framework that standardizes and exports telemetry data
- **OTLP** = the wire protocol (HTTP or gRPC) — ensures vendor neutrality
- **LGTM** = Loki (logs) + Grafana (UI) + Tempo (traces) + Mimir (metrics)
- The pipeline: App → Micrometer → OTel → OTLP → LGTM
- No vendor lock-in — switch backends without code changes
- Developers handle code changes; DevOps handles infrastructure setup

---

## ⚠️ Common Mistakes

- Confusing Micrometer with OpenTelemetry — Micrometer collects, OTel exports
- Thinking Grafana collects data directly from your app — it relies on OTel/OTLP
- Not understanding that OTLP supports both HTTP (4318) and gRPC (4317)

---

## 💡 Pro Tips

- Prometheus (another metrics tool) is also supported by Grafana — you may see it mentioned alongside Mimir
- The decoupled architecture means you can test locally with Grafana and deploy to production with Splunk/Datadog — no code changes
- Understanding this pipeline is essential for microservices interviews
