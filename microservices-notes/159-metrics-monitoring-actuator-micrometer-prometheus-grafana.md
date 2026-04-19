# Metrics & Monitoring: Actuator, Micrometer, Prometheus & Grafana

## Introduction

We've conquered the first pillar of observability — **logging**. Now it's time for the second pillar: **metrics**.

Here's the thing about logs — they tell you *what happened* in a specific scenario. But can logs tell you the **overall health** of your Accounts microservice right now? Can they tell you how much CPU it's consuming, how many threads are active, or how much heap memory is in use? No. Logs are event-level detail. Metrics are system-level health.

To properly monitor microservices, you need numerical measurements collected and aggregated at regular intervals. And that's exactly what this section is about.

---

## The Metrics Pipeline: Four Components Working Together

### 🧠 The Big Picture

The metrics pipeline involves four components, each with a specific role:

```
Microservice → [Actuator] → [Micrometer] → [Prometheus] → [Grafana]
        generates metrics    translates format    scrapes & stores    visualizes
```

Let's understand each one.

---

## Component 1: Spring Boot Actuator

### 🧠 What Is It?

Spring Boot Actuator is a dependency already present in our microservices. When you add it, your application automatically exposes metrics at:

```
/actuator/metrics
```

This endpoint lists all available metrics — CPU usage, memory consumption, thread counts, HTTP request stats, garbage collection details, and much more.

### ❓ Why Isn't Actuator Enough?

Actuator exposes metrics as **JSON** on a per-instance basis. If you have 100 microservices with multiple instances each, are you going to manually visit each actuator URL? That's not monitoring — that's torture.

You need something to **automatically pull** metrics from all instances and aggregate them.

---

## Component 2: Micrometer

### 🧠 What Is It?

Micrometer is a **vendor-neutral** metrics facade for Java — think of it as the **SLF4J of metrics**.

Just like SLF4J abstracts away whether you use Logback, Log4j, or java.util.logging for logging, Micrometer abstracts away whether you use Prometheus, Datadog, CloudWatch, or Elastic for metrics monitoring.

### ❓ Why Do We Need It?

Prometheus can't understand Actuator's JSON format directly. Micrometer **translates** Actuator metrics into a format that Prometheus *can* understand. You add one dependency — the vendor-specific registry — and Micrometer handles the rest.

### ⚙️ How It Works

1. Actuator generates metrics in JSON
2. Micrometer intercepts these metrics
3. Micrometer exposes them at `/actuator/prometheus` in Prometheus-compatible format
4. Prometheus scrapes this endpoint periodically

### 🧪 Supported Vendors

Micrometer supports a huge range of monitoring systems:
- Prometheus
- Datadog
- Dynatrace
- Elastic
- CloudWatch
- Azure Monitor
- New Relic
- And many more

To switch vendors, you just change the dependency — no code changes needed.

---

## Component 3: Prometheus

### 🧠 What Is It?

Prometheus is an **open-source monitoring and alerting toolkit**. It scrapes metrics from all your microservice instances at regular intervals (e.g., every 5 seconds) and stores them centrally.

### ❓ Why Do We Need It?

Without Prometheus, metrics live scattered across individual microservice instances. Prometheus is to **metrics** what Loki is to **logs** — it collects and centralizes everything into one place.

### ⚙️ What It Provides

- A central store for all metrics across all microservices
- A web UI for querying and graphing metrics
- Target health monitoring (which instances are up/down)
- A basic alerting engine

---

## Component 4: Grafana (Again!)

### ❓ Wait, We Already Used Grafana for Logs. Why Again?

Yes — and that's the beauty of Grafana. It's a **universal visualization layer** that connects to different data sources:

- **Loki** → search logs
- **Prometheus** → visualize metrics
- **Tempo** → trace requests (coming later)

### ❓ Why Not Just Use Prometheus's Built-in UI?

Prometheus has a basic graphing UI, but it has limitations:
- Can't build complex, multi-panel dashboards
- No built-in alerting with notifications to Slack, email, webhooks, etc.
- Limited visualization options

Grafana provides:
- Beautiful, customizable dashboards
- Pre-built community dashboards (with millions of downloads)
- Alerting and notification to multiple channels
- Advanced querying and filtering

---

## The SLF4J Analogy

If the Micrometer concept feels abstract, this analogy makes it concrete:

| Concern | Facade | Implementations |
|---------|--------|----------------|
| Logging | SLF4J | Logback, Log4j, java.util.logging |
| Metrics | Micrometer | Prometheus, Datadog, CloudWatch |

Just as SLF4J lets you swap logging implementations without changing your code, Micrometer lets you swap monitoring systems without changing your code. Add the right dependency, and Micrometer handles format translation automatically.

---

## ✅ Key Takeaways

- **Actuator** generates metrics inside your microservice (CPU, memory, threads, etc.)
- **Micrometer** translates Actuator's JSON metrics into vendor-specific formats (like Prometheus format)
- **Prometheus** scrapes and centralizes metrics from all microservice instances
- **Grafana** provides rich dashboards, alerts, and notifications on top of Prometheus data
- Micrometer is the "SLF4J for metrics" — vendor-neutral, swap implementations by changing a dependency
- Logs tell you **what happened**; metrics tell you **how healthy the system is**

### 💡 Pro Tip

The three pillars of observability — logs, metrics, and traces — each answer a different question. Logs: "What happened?" Metrics: "How is the system doing?" Traces: "Where did the request go?" You need all three for complete observability.
