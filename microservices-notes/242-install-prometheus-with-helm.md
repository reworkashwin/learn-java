# Install Prometheus in Kubernetes Using Helm Chart

## Introduction

Our microservices expose metrics through Spring Boot Actuator's Prometheus endpoint. Now we need **Prometheus** running in the cluster to scrape those metrics. Once again, Bitnami provides a production-ready Helm chart — `kube-prometheus` — that handles all the complexity.

---

## Customizing the Prometheus Chart

The key customization is telling Prometheus **where to find our microservices' metrics**. This is done through scrape configurations in `values.yaml`.

### Enable Additional Scrape Configs

Search for `additionalScrapeConfigs` in `values.yaml` and make two changes:

1. **Enable** the additional configs (change from disabled to enabled)
2. Set the **type to `internal`** — we only need to scrape services within the cluster

### Define Scrape Jobs

Under the job list, add entries for each microservice:

```json
[
  {
    "job_name": "configserver",
    "metrics_path": "/actuator/prometheus",
    "static_configs": [
      { "targets": ["configserver:8071"] }
    ]
  },
  {
    "job_name": "eurekaserver",
    "metrics_path": "/actuator/prometheus",
    "static_configs": [
      { "targets": ["eurekaserver:8070"] }
    ]
  },
  {
    "job_name": "accounts",
    "metrics_path": "/actuator/prometheus",
    "static_configs": [
      { "targets": ["accounts:8080"] }
    ]
  },
  {
    "job_name": "loans",
    "metrics_path": "/actuator/prometheus",
    "static_configs": [
      { "targets": ["loans:8090"] }
    ]
  },
  {
    "job_name": "cards",
    "metrics_path": "/actuator/prometheus",
    "static_configs": [
      { "targets": ["cards:9000"] }
    ]
  },
  {
    "job_name": "gatewayserver",
    "metrics_path": "/actuator/prometheus",
    "static_configs": [
      { "targets": ["gatewayserver:8072"] }
    ]
  }
]
```

Each job tells Prometheus: connect to this service at this port, and read metrics from `/actuator/prometheus`. The target hostnames match the **Kubernetes service names** defined in each microservice's Helm chart.

---

## Installing Prometheus

```bash
cd kube-prometheus
helm dependency build
cd ..
helm install prometheus kube-prometheus
```

Prometheus is deployed as a **ClusterIP** service by default — no external access. This makes sense — you access Prometheus through Grafana, not directly.

---

## Temporarily Accessing Prometheus (Optional)

If you need to check the Prometheus UI directly:

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090
```

Then access `http://localhost:9090`. Under **Targets**, you'll see all configured scrape jobs. Until the microservices are actually deployed, targets will show as "down" — that's expected.

Press `Ctrl+C` to stop port forwarding.

---

## What Prometheus Monitors Beyond Your Services

The `kube-prometheus` chart doesn't just monitor your microservices. It also sets up monitoring for Kubernetes internals — node metrics, kubelet, API server, etcd, and more. This is production-ready observability out of the box.

---

## ✅ Key Takeaways

- The `kube-prometheus` Bitnami chart provides a full Prometheus setup with Kubernetes-native monitoring
- Configure **scrape jobs** in `values.yaml` to tell Prometheus where each microservice's metrics endpoint is
- Target hostnames are Kubernetes **service names** — the same names defined in your microservice Helm charts
- Prometheus runs as ClusterIP — access it through Grafana or temporarily via `kubectl port-forward`
- Targets will show as "down" until the microservices are actually deployed

💡 **Pro Tip:** The `kubectl port-forward` trick works for any ClusterIP service. It's useful for debugging without exposing services permanently.
