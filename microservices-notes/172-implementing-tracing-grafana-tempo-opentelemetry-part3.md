# Implementing Tracing with Grafana, Tempo & OpenTelemetry — Part 3

## Introduction

You've started all your microservices with OpenTelemetry enabled. Now comes the exciting part — actually *seeing* the distributed tracing in action. How does a request travel through your microservices? Where does it spend the most time? If something fails, at exactly which service and method did it break?

This is where Tempo, integrated with Grafana, becomes incredibly powerful.

---

## Viewing Trace IDs in Loki Logs

Open Grafana and navigate to the **Explore** section. Select **Loki** as the data source and query logs for the accounts microservice.

Every log statement now includes tracing information, following this pattern:

```
[severity] [application-name, traceId, spanId] log message
```

For example:
```
[INFO ] [accounts, abc123def456..., 789xyz...] fetchCustomerDetails() method end
```

### What Do These IDs Mean?

- **Trace ID** — A unique identifier shared across **all microservices** involved in processing a single request. This is your golden thread.
- **Span ID** — A unique identifier for a specific operation within a single service. Each service gets its own span ID.

### Cross-Service Log Correlation

Take the trace ID from the accounts log and search for it in the cards microservice logs. You'll find logs with the **same trace ID** but a **different span ID**. This proves the two services were part of the same request chain.

This is incredibly powerful for debugging — you can track exactly which services were involved in handling a request, even across dozens of microservices.

---

## Seeing the Full Picture in Tempo

While Loki gives you log-level tracing, the real power emerges when you switch to **Tempo**.

Select Tempo as the data source in Grafana's Explore section, paste the trace ID, and run the query.

What you get is a beautiful visual waterfall diagram showing:

1. **Gateway Server** — The request enters your network here
2. **Accounts Microservice** — `fetchCustomerDetails()` is invoked
   - Controller layer → `CustomerController.fetchCustomerDetails()`
   - Repository layer → fetches account data from database
3. **Loans Microservice** — Accounts calls loans to get loan details
4. **Cards Microservice** — Accounts calls cards to get card details

For each method, you can see:
- **Exact method names** invoked
- **Time taken** at each step
- **Consolidated timing** at parent levels (accounts includes time spent calling loans + cards)

### Why This Matters

If a request is taking 5 seconds instead of 500ms, you can immediately pinpoint:
- Is it slow at the database query layer?
- Is one downstream service (loans? cards?) the bottleneck?
- Is the gateway adding unexpected latency?

Without distributed tracing, debugging performance in microservices is like finding a needle in a haystack — blindfolded.

---

## Tempo vs. Zipkin vs. Jaeger

You might hear about other tracing tools like **Zipkin** and **Jaeger** (by Red Hat). They can also show distributed tracing information. So why Tempo?

| Tool | Tracing | Logs Integration | Metrics Integration |
|------|---------|-----------------|-------------------|
| Zipkin | ✅ | ❌ | ❌ |
| Jaeger | ✅ | ❌ | ❌ |
| Tempo | ✅ | ✅ (via Loki) | ✅ (via Prometheus) |

Tempo's killer advantage is its **deep integration with Grafana**. Within a single dashboard, you get all three pillars of observability — logs (Loki), metrics (Prometheus), and traces (Tempo). Zipkin and Jaeger are standalone tracing tools that don't offer this unified experience.

💡 **Pro Tip:** In interviews, when asked about observability tooling, mention Tempo's integration with the broader Grafana ecosystem as the key differentiator. It shows you understand the *complete* observability picture, not just tracing.

---

## ✅ Key Takeaways

- Trace IDs are shared across all services in a request chain; span IDs are unique per service
- Loki logs let you search by trace ID to correlate logs across services
- Tempo provides a visual waterfall view showing the full request journey across microservices
- Each span shows method names and timing, making performance bottleneck identification trivial
- Tempo + Loki + Prometheus in Grafana gives you all three pillars of observability in one place
- Tempo is preferred over Zipkin/Jaeger because of its unified Grafana integration
