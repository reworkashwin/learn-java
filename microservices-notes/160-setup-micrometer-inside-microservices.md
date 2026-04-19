# Setting Up Micrometer Inside Microservices

## Introduction

Now that we understand the roles of Actuator, Micrometer, Prometheus, and Grafana, it's time to implement. The good news? As a developer, the changes are minimal — just a dependency and a property. Micrometer does the heavy lifting.

---

## Step 1: Add the Micrometer-Prometheus Dependency

### ⚙️ What to Add

In each microservice's `pom.xml`, just after the Actuator dependency, add:

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

That's it. This single dependency tells Micrometer: "Expose all Actuator metrics in a format Prometheus can understand."

### 💡 What If You Switch Monitoring Tools?

If your organization moves from Prometheus to, say, Datadog, you just change the `artifactId` to `micrometer-registry-datadog`. No other code changes required. This is the power of the facade pattern.

### ❓ Where to Add It?

In **every** microservice that you want to monitor — Accounts, Loans, Cards, Gateway Server, Eureka Server, and Config Server.

---

## Step 2: Add the Application Tag Property

### ⚙️ What to Add

In each microservice's `application.yml`, add this property under `management`:

```yaml
management:
  metrics:
    tags:
      application: ${spring.application.name}
```

### ❓ Why Do We Need This?

When Prometheus scrapes metrics from multiple microservices, how does it know which metrics belong to which service? This property tells Micrometer and Prometheus: "Group all metrics from this microservice under the application name `accounts`" (or `loans`, `cards`, etc.).

Without this tag, you'd see a jumble of metrics with no way to filter by microservice.

---

## Verifying the Setup

### ⚙️ Testing Actuator Metrics (JSON Format)

Start all microservices locally (Config Server → Eureka → Accounts/Loans/Cards → Gateway), then access:

```
http://localhost:8080/actuator/metrics
```

This shows all available metrics in JSON format — the human-readable version. To drill into a specific metric:

```
http://localhost:8080/actuator/metrics/system.cpu.usage
http://localhost:8080/actuator/metrics/process.uptime
```

### ⚙️ Testing Prometheus-Format Metrics

The critical endpoint is:

```
http://localhost:8080/actuator/prometheus
```

This is the **Micrometer-translated** version — the format Prometheus understands. It's a wall of text with metric names, labels, and values. Prometheus will scrape this endpoint periodically for each microservice instance.

### 🧪 Verify All Services

Test the `/actuator/prometheus` endpoint on every microservice:

| Service | Port | URL |
|---------|------|-----|
| Accounts | 8080 | `localhost:8080/actuator/prometheus` |
| Loans | 8090 | `localhost:8090/actuator/prometheus` |
| Cards | 9000 | `localhost:9000/actuator/prometheus` |
| Eureka Server | 8070 | `localhost:8070/actuator/prometheus` |
| Config Server | 8071 | `localhost:8071/actuator/prometheus` |
| Gateway Server | 8072 | `localhost:8072/actuator/prometheus` |

All should return Prometheus-formatted metrics.

---

## ✅ Key Takeaways

- Only **two changes** are needed per microservice: one dependency + one YAML property
- The `micrometer-registry-prometheus` dependency translates Actuator metrics to Prometheus format
- The `management.metrics.tags.application` property groups metrics by microservice name
- The `/actuator/prometheus` endpoint is what Prometheus will scrape
- Visiting actuator URLs manually across all instances is not feasible — that's why Prometheus exists

### ⚠️ Common Mistakes

- Forgetting to add the `management.metrics.tags.application` property — your metrics will work but you won't be able to identify which service they belong to
- Adding the dependency in only some microservices — add it to **all** services including Config Server and Eureka

### 💡 Pro Tip

Always regenerate Docker images after making these changes if you plan to test with Docker Compose. These pom.xml and application.yml changes exist only in your local workspace until you rebuild.
