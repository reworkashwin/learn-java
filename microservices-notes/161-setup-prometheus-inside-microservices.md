# Setting Up Prometheus Inside Microservices

## Introduction

Micrometer is now exposing metrics in Prometheus format. But Prometheus still doesn't know *where* to find your microservices. In this lecture, we configure Prometheus, tell it about our services, and integrate it with Grafana — all through Docker Compose.

---

## Creating the Prometheus Configuration

### ⚙️ The prometheus.yml File

Create a new folder `observability/prometheus/` and add `prometheus.yml`:

```yaml
global:
  scrape_interval: 5s
  evaluation_interval: 5s

scrape_configs:
  - job_name: 'accounts'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['accounts:8080']

  - job_name: 'loans'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['loans:8090']

  - job_name: 'cards'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['cards:9000']

  - job_name: 'gatewayserver'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['gatewayserver:8072']

  - job_name: 'eurekaserver'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['eurekaserver:8070']

  - job_name: 'configserver'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['configserver:8071']
```

### 🧠 Understanding the Configuration

**Global Settings:**
- `scrape_interval: 5s` — Prometheus fetches metrics every 5 seconds from each target
- `evaluation_interval: 5s` — Dashboard graphs refresh every 5 seconds

**Scrape Configs — The Heart of Prometheus:**

Each job represents a microservice. The key fields:
- `job_name` — A label for grouping (appears in Prometheus UI)
- `metrics_path` — The endpoint Micrometer exposes (`/actuator/prometheus`)
- `targets` — List of `host:port` pairs. We use **Docker Compose service names** instead of `localhost` because all containers run in the same Docker network

### ❓ Why Service Names Instead of localhost?

Inside Docker Compose, containers communicate using **service names** as hostnames. The `accounts` service is reachable at `accounts:8080` from any other container in the same network.

---

## Adding Prometheus to Docker Compose

### ⚙️ The Service Definition

```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./observability/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
  extends:
    file: common-config.yml
    service: network-deploy-service
```

The volume mounts our config file into the container. The `extends` ensures Prometheus joins the same network as all other services.

---

## Integrating Prometheus with Grafana via Data Source

### ⚙️ The datasource.yml Approach

Previously, Grafana's Loki connection was defined inline in the Docker Compose entry point. This gets unwieldy with multiple data sources. A cleaner approach: create a dedicated file.

Create `observability/grafana/datasource.yml`:

```yaml
apiVersion: 1

deleteDatasources:
  - name: Prometheus
  - name: Loki

datasources:
  - name: Prometheus
    type: prometheus
    uid: prometheus
    url: http://prometheus:9090
    isDefault: false
    access: proxy
    editable: true

  - name: Loki
    type: loki
    uid: loki
    url: http://gateway:3100
    isDefault: false
    access: proxy
    editable: true
```

### ⚙️ Updating Grafana in Docker Compose

Remove the inline Loki configuration from Grafana's entry point and instead mount the `datasource.yml`:

```yaml
grafana:
  volumes:
    - ./observability/grafana/datasource.yml:/etc/grafana/provisioning/datasources/datasource.yml
```

Grafana reads this file at startup and automatically creates both data source connections.

---

## ✅ Key Takeaways

- `prometheus.yml` defines **what** Prometheus monitors (targets, scrape intervals, metric paths)
- Use Docker Compose **service names** as hostnames in Prometheus targets
- Prometheus scrapes `/actuator/prometheus` from each microservice every 5 seconds
- Use a `datasource.yml` file to cleanly configure multiple Grafana data sources
- Mount the datasource file into Grafana's provisioning directory via Docker volumes
- Always regenerate Docker images before testing with Docker Compose

### ⚠️ Common Mistakes

- Using `localhost` in Prometheus targets instead of Docker service names — Prometheus runs in its own container, so `localhost` points to itself
- Forgetting to regenerate Docker images after adding Micrometer changes — you'll test stale code
- Not moving the Loki data source config out of the Docker Compose entry point when adding Prometheus — leads to duplication and maintainability issues
