# Install Grafana in Kubernetes Using Helm Chart

## Introduction

The final observability component — **Grafana** itself. This is the dashboard and visualization layer that ties everything together. It connects to Prometheus (metrics), Loki (logs), and Tempo (traces) to give you a unified view of your entire microservice ecosystem.

---

## Configuring Data Sources in values.yaml

The most important customization is setting up **data source connections** so Grafana automatically knows where Prometheus, Loki, and Tempo are. Without this, you'd have to configure data sources manually through the UI every time you deploy.

In `values.yaml`, find the `secretDefinition` section and add the data source configuration:

```yaml
datasources:
  secretDefinition:
    apiVersion: 1
    deleteDatasources:
      - name: Prometheus
      - name: Tempo
      - name: Loki
    datasources:
      - name: Prometheus
        type: prometheus
        url: http://prometheus-kube-prometheus-prometheus:9090
        access: proxy
        isDefault: true

      - name: Tempo
        type: tempo
        url: http://tempo-grafana-tempo-query-frontend:3200
        access: proxy

      - name: Loki
        type: loki
        url: http://loki-grafana-loki-gateway:80
        access: proxy
        jsonData:
          derivedFields:
            - datasourceUid: tempo
              matcherRegex: "traceId=(\\w+)"
              name: TraceID
              url: "$${__value.raw}"
```

### Understanding the Service URLs

Each URL uses the **Kubernetes service name** from the respective Helm installation:

| Component | Service Name | Port | Purpose |
|-----------|-------------|------|---------|
| Prometheus | `prometheus-kube-prometheus-prometheus` | 9090 | Metrics queries |
| Tempo | `tempo-grafana-tempo-query-frontend` | 3200 | Trace queries |
| Loki | `loki-grafana-loki-gateway` | 80 | Log queries |

Note: For Tempo, Grafana connects to the **query-frontend** (port 3200), not the distributor (port 4317). The distributor is for *ingesting* traces; the query-frontend is for *reading* them.

### Loki-Tempo Integration

The `derivedFields` configuration under Loki creates a **clickable link** from log entries to their corresponding distributed traces in Tempo. When you view a log line that contains a `traceId`, you can click through directly to the full trace visualization — the same integration we set up in Docker Compose earlier.

---

## Installing Grafana

```bash
cd grafana
helm dependency build
cd ..
helm install grafana grafana
```

Grafana is deployed as ClusterIP by default. To access it, use port forwarding:

```bash
kubectl port-forward svc/grafana 3000:3000
```

Then open `http://localhost:3000`.

---

## Getting the Admin Credentials

The default username is `admin`. To get the password:

```bash
kubectl get secret grafana-admin -o jsonpath="{.data.GF_SECURITY_ADMIN_PASSWORD}" | base64 -d
```

---

## Verifying Data Sources

After logging in, go to **Explore** and check the data source dropdown. You should see three sources:
- **Prometheus** — for metrics
- **Loki** — for logs
- **Tempo** — for traces

If all three appear, the Grafana setup is complete and properly connected to the observability stack.

---

## Current Installation Summary

At this point, everything is ready for the microservices. Check with:

```bash
helm ls
```

You should see six releases:
| Release | Chart |
|---------|-------|
| grafana | grafana |
| kafka | kafka |
| keycloak | keycloak |
| loki | grafana-loki |
| prometheus | kube-prometheus |
| tempo | grafana-tempo |

---

## ✅ Key Takeaways

- Configure Grafana data sources in `values.yaml` to **avoid manual UI setup** on every deployment
- Grafana connects to Tempo's **query-frontend** (port 3200) for reading traces, not the distributor
- The Loki `derivedFields` config creates clickable links from log entries to Tempo traces
- Access Grafana via `kubectl port-forward` — it runs as ClusterIP by default
- After setup, verify all three data sources (Prometheus, Loki, Tempo) appear in the Explore dropdown

💡 **Pro Tip:** Port forwarding with `kubectl port-forward` is temporary — it stops when you press Ctrl+C or close the terminal. For persistent access in a real environment, you'd use an Ingress controller or change the service type to LoadBalancer.
