# Install Grafana Loki & Tempo in Kubernetes Using Helm Chart

## Introduction

With Prometheus handling metrics, we now need the other two pillars of observability: **Loki** for log aggregation and **Tempo** for distributed tracing. Both are Grafana ecosystem components, and both have Bitnami Helm charts ready to go.

---

## Installing Grafana Loki

Loki aggregates logs from all your microservices into a central, queryable store. The good news? The default chart configuration works out of the box — no changes to `values.yaml` needed.

```bash
cd grafana-loki
helm dependency build
cd ..
helm install loki grafana-loki
```

### What gets deployed?

Loki's architecture involves several components, all installed automatically:
- **Ingester** — receives and stores log streams
- **Distributor** — distributes incoming logs to ingesters
- **Querier** — handles log queries
- **Promtail** — agent that collects and ships logs
- **Compactor** — compresses stored log data
- **Gateway** — entry point for the Loki cluster

Can you imagine setting all of this up manually with individual Kubernetes manifests? That could take weeks. With Helm, it's one command.

---

## Installing Grafana Tempo

Tempo provides distributed tracing — it collects the trace data sent by the OpenTelemetry Java agent running in each microservice.

### Required Customization

Unlike Loki, Tempo needs a small change. The **OpenTelemetry receiver** is disabled by default:

In `values.yaml`, search for `otlp` and enable both protocols:

```yaml
traces:
  otlp:
    http:
      enabled: true    # Changed from false
    grpc:
      enabled: true    # Changed from false
```

Without this, the OpenTelemetry agents in your microservices have nowhere to send trace data.

### Install

```bash
cd grafana-tempo
helm dependency build
cd ..
helm install tempo grafana-tempo
```

Tempo deploys components similar to Loki: ingester, distributor, querier, query-frontend, compactor.

---

## Finding the Right Service URLs

After installation, your microservices need to know how to reach Tempo. Run:

```bash
kubectl get services
```

Look for the **Tempo distributor service** — that's the endpoint your OpenTelemetry agents send data to:

```
tempo-grafana-tempo-distributor    ClusterIP    ...    4317/TCP
```

This maps to the environment chart's ConfigMap:
```yaml
global:
  tempoUrl: "http://tempo-grafana-tempo-distributor:4317"
```

### How do you know which service to use?

For Tempo, the **distributor** is the ingestion endpoint — it's where data enters the system. The querier and query-frontend are for reading data (used by Grafana). This information comes from Tempo's official documentation, not guesswork.

Similarly for Loki, Grafana connects through the **gateway** service at port 80:
```yaml
# Used in Grafana's data source configuration
loki-grafana-loki-gateway:80
```

---

## ✅ Key Takeaways

- **Loki** works with default values — just install it
- **Tempo** requires enabling OTLP HTTP and gRPC receivers in `values.yaml`
- Both components deploy multiple sub-services (distributor, ingester, querier, etc.)
- OpenTelemetry agents send traces to Tempo's **distributor** service on port `4317`
- Grafana connects to Loki's **gateway** service on port `80`
- Use `kubectl get services` to discover the exact service names and ports after installation

💡 **Pro Tip:** The service names Helm creates follow the pattern `<release-name>-<chart-name>-<component>`. Understanding this pattern helps you predict DNS names without having to look them up every time.
