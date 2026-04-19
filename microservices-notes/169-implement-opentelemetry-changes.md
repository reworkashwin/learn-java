# Implementing OpenTelemetry Changes Inside Microservices

## Introduction

Theory is done. Now let's wire OpenTelemetry into our microservices. The changes are surprisingly minimal — a dependency, a logging pattern, and some cleaner log statements. After this, every log line in every microservice will automatically contain the service name, trace ID, and span ID.

---

## Step 1: Add the OpenTelemetry Java Agent Dependency

### ⚙️ Changes in pom.xml

First, define the version property:

```xml
<properties>
    <otelVersion>1.27.0</otelVersion>
</properties>
```

Then add the dependency:

```xml
<dependency>
    <groupId>io.opentelemetry.javaagent</groupId>
    <artifactId>opentelemetry-javaagent</artifactId>
    <version>${otelVersion}</version>
    <scope>runtime</scope>
</dependency>
```

### 💡 Why `scope=runtime`?

The OpenTelemetry agent is not needed during compilation — your code never references it directly. It only kicks in when the application **runs**, attaching bytecode at runtime. The `runtime` scope keeps your compile classpath clean.

### ❓ Where to Add It?

In **every** microservice's `pom.xml` — Accounts, Loans, Cards, Gateway Server, Eureka Server, and Config Server.

---

## Step 2: Define the Log Pattern

### ⚙️ Changes in application.yml

Add a custom logging pattern that includes the tracing information:

```yaml
logging:
  pattern:
    level: "%5p [${spring.application.name},%X{trace_id},%X{span_id}]"
```

### 🧠 Breaking Down the Pattern

| Component | Meaning |
|-----------|---------|
| `%5p` | Log level (INFO, DEBUG, WARN, ERROR) right-padded to 5 characters |
| `${spring.application.name}` | The microservice name (e.g., `accounts`) — this is the **tag** |
| `%X{trace_id}` | The trace ID injected by OpenTelemetry at runtime |
| `%X{span_id}` | The span ID injected by OpenTelemetry at runtime |

### 🧪 What a Log Line Looks Like

Without OpenTelemetry:
```
INFO  Starting AccountsApplication...
```

With OpenTelemetry:
```
INFO  [accounts,29a8f3b2c4d5e6f7,a1b2c3d4e5f6g7h8] Starting AccountsApplication...
```

Now every log line carries its identity — which service, which request, which span.

---

## Step 3: Simplify Log Statements

### ⚙️ Removing Manual Correlation ID Logging

Remember those correlation ID log statements we manually added?

```java
logger.debug("fetchCustomerDetails correlationId: {}", correlationId);
```

We no longer need to manually append correlation IDs. The pattern does it automatically. Replace with clean, simple log statements:

```java
logger.debug("fetchCustomerDetails method start");
// ... business logic ...
logger.debug("fetchCustomerDetails method end");
```

Do the same across all controllers:
- **AccountsController**: `fetchCustomerDetails` method → `method start` / `method end`
- **LoansController**: `fetchLoanDetails` method → `method start` / `method end`
- **CardsController**: `fetchCardDetails` method → `method start` / `method end`

### 💡 The Power of Automatic Instrumentation

You can add logs **anywhere** — controller, service, DAO, utility classes. Every single log line will automatically carry the trace ID and span ID. No manual work needed beyond defining the pattern once.

---

## What's Still Missing?

We've added tracing information to our **logs**. But raw logs with trace IDs aren't the best developer experience. Ideally, you want:

- A **UI** where you can paste a trace ID and see the complete request journey
- **Visual timelines** showing how long each service took
- **Error highlighting** at the exact span where things went wrong

For this, we need two more components:

### Grafana Tempo

Just like Loki aggregates logs and Prometheus aggregates metrics, **Tempo** aggregates traces. It stores and indexes all tracing data, making it queryable.

### Grafana (UI Layer)

Grafana connects to Tempo as a data source and provides a beautiful visual representation of traces — showing the request path, timing per service, and errors.

---

## The Complete Observability Ecosystem

```
                  Logs    →  Loki         →  Grafana
Microservices →   Metrics →  Prometheus   →  Grafana
                  Traces  →  Tempo        →  Grafana
```

Grafana is the common UI layer for all three pillars. The data backends (Loki, Prometheus, Tempo) each handle their specialized data type. This is the elegance of the Grafana ecosystem.

---

## ✅ Key Takeaways

- Add the `opentelemetry-javaagent` dependency with `scope=runtime` to every microservice
- Define a `logging.pattern.level` that includes service name, trace ID, and span ID
- Remove manual correlation ID logging — OpenTelemetry handles it automatically
- Every log line now carries full tracing context without any manual effort
- **Tempo** stores trace data; **Grafana** visualizes it — similar to Loki for logs and Prometheus for metrics
- Remember to regenerate Docker images after these changes

### ⚠️ Common Mistakes

- Forgetting to add the dependency or pattern to ALL microservices — you'll get tracing gaps
- Not regenerating Docker images after changes — old code won't have tracing
- Keeping the old correlation ID logging alongside OpenTelemetry — redundant and confusing

### 💡 Pro Tip

Check the OpenTelemetry Java Agent's GitHub repo regularly for version updates. The project evolves rapidly, and newer versions often add support for more libraries and frameworks with zero-config instrumentation.
