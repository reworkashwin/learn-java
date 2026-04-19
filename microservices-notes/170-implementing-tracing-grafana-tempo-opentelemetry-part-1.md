# Implementing Tracing with Grafana, Tempo & OpenTelemetry — Part 1

## Introduction

OpenTelemetry is ready inside our microservices. Now we need to set up the infrastructure to **collect, store, and visualize** traces. This lecture focuses on the Docker Compose changes: configuring OpenTelemetry environment variables, adding the Tempo service, and connecting Tempo to Grafana.

---

## Step 1: Configure OpenTelemetry Environment Variables

### ⚙️ Changes in common-config.yml

Since the OpenTelemetry properties are the same for all microservices, define them in `common-config.yml` under the `microservice-base-config` service (not `configserver-config`, so Config Server inherits them too):

```yaml
microservice-base-config:
  environment:
    JAVA_TOOL_OPTIONS: "-javaagent:/app/libs/opentelemetry-javaagent.jar"
    OTEL_EXPORTER_OTLP_ENDPOINT: "http://tempo:4317"
    OTEL_METRICS_EXPORTER: "none"
```

### 🧠 What Each Property Does

| Property | Purpose |
|----------|---------|
| `JAVA_TOOL_OPTIONS` | Tells the JVM to load the OpenTelemetry Java Agent from the specified path inside the container |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Where OpenTelemetry sends trace data — our Tempo service at port 4317 |
| `OTEL_METRICS_EXPORTER` | Set to `none` because we already use Prometheus for metrics; no need for OTel metrics |

### ❓ Why Is the JAR at `/app/libs/`?

When Maven packages the application and creates a Docker image, all runtime dependencies (including the OpenTelemetry agent) are placed under `/app/libs/` inside the container. That's where the JVM finds the agent.

### ⚙️ Changes in docker-compose.yml

Each microservice needs its own `OTEL_SERVICE_NAME` to identify itself in traces:

```yaml
configserver:
  environment:
    OTEL_SERVICE_NAME: "configserver"

eurekaserver:
  environment:
    OTEL_SERVICE_NAME: "eurekaserver"

accounts:
  environment:
    OTEL_SERVICE_NAME: "accounts"

loans:
  environment:
    OTEL_SERVICE_NAME: "loans"

cards:
  environment:
    OTEL_SERVICE_NAME: "cards"

gatewayserver:
  environment:
    OTEL_SERVICE_NAME: "gatewayserver"
```

Keep the `OTEL_SERVICE_NAME` consistent with `SPRING_APPLICATION_NAME` for clarity.

---

## Step 2: Add the Tempo Service

### ⚙️ Tempo Configuration File

Create `observability/tempo/tempo.yml`:

```yaml
server:
  http_listen_port: 3100

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: "0.0.0.0:4317"

storage:
  trace:
    backend: local
    local:
      path: /tmp/tempo/blocks
    wal:
      path: /tmp/tempo/wal

metrics_generator:
  storage:
    path: /tmp/tempo/metrics
```

Key points:
- Tempo listens on HTTP port `3100`
- Receives trace data via gRPC on port `4317` (the `OTEL_EXPORTER_OTLP_ENDPOINT` we configured)
- Stores traces locally inside the container

### ⚙️ Tempo Service in Docker Compose

```yaml
tempo:
  image: grafana/tempo
  container_name: tempo
  command: [ "-config.file=/etc/tempo-config.yml" ]
  ports:
    - "3110:3100"
    - "4317:4317"
  volumes:
    - ./observability/tempo/tempo.yml:/etc/tempo-config.yml
  extends:
    file: common-config.yml
    service: network-deploy-service
```

### ❓ Why Port 3110 Instead of 3100?

Port `3100` is already taken by the Loki Gateway service in our Docker Compose. So we map Tempo's internal port `3100` to external port `3110`. The `4317` port isn't conflicted, so it maps directly.

---

## Step 3: Connect Tempo to Grafana

### ⚙️ Update datasource.yml

Add Tempo as a third data source in `observability/grafana/datasource.yml`:

```yaml
deleteDatasources:
  - name: Prometheus
  - name: Loki
  - name: Tempo

datasources:
  - name: Prometheus
    type: prometheus
    uid: prometheus
    url: http://prometheus:9090
    # ... existing config ...

  - name: Loki
    type: loki
    uid: loki
    url: http://gateway:3100
    # ... existing config ...

  - name: Tempo
    type: tempo
    uid: tempo
    url: http://tempo:3100
    isDefault: false
    access: proxy
    editable: true
```

### 🧠 The Complete Data Source Picture

Grafana now connects to all three observability backends:

| Data Source | Type | Purpose | Port |
|-------------|------|---------|------|
| Prometheus | Metrics | CPU, memory, threads, uptime | 9090 |
| Loki | Logs | Centralized log search | 3100 (via gateway) |
| Tempo | Traces | Distributed request tracing | 3100 |

---

## The Data Flow

```
Microservices (with OpenTelemetry Java Agent)
       ↓ sends traces via gRPC (port 4317)
    Tempo (stores & indexes traces)
       ↓ data source connection
    Grafana (visualizes traces, timelines, spans)
```

This completes the third pillar of observability. In the next lecture, we'll start everything up and see distributed tracing in action.

---

## ✅ Key Takeaways

- Define common OpenTelemetry properties in `common-config.yml` under the base config (not config-server config)
- Each microservice needs its own `OTEL_SERVICE_NAME` in the Docker Compose file
- Disable OTel metrics export (`OTEL_METRICS_EXPORTER=none`) since Prometheus handles metrics
- **Tempo** is to traces what Loki is to logs and Prometheus is to metrics
- Handle port conflicts by mapping to different external ports (3100 → 3110 for Tempo)
- The `datasource.yml` now has three entries: Prometheus, Loki, and Tempo

### ⚠️ Common Mistakes

- Defining OpenTelemetry environment variables under `configserver-config` instead of `base-config` — Config Server won't get the properties
- Forgetting the port conflict between Tempo and Loki Gateway — both default to 3100
- Not setting `OTEL_METRICS_EXPORTER=none` — leads to duplicate, potentially conflicting metrics collection

### 💡 Pro Tip

The observability folder structure now has four subdirectories — `loki/`, `promtail/`, `prometheus/`, `tempo/`, and `grafana/`. This clean separation makes it easy for any team member to find and modify observability configurations independently.
