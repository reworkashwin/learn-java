# Making Spring Boot Observable with Minimal Code

## Introduction

We've covered the theory — Micrometer, OpenTelemetry, OTLP, LGTM. Now it's time to **make it real**. In this section, we'll add the necessary dependencies, configure the exporter endpoints, set up a Grafana LGTM stack using Docker, and wire everything together.

The beauty of Spring Boot 4+? It takes surprisingly **little code**.

---

## Step 1: Add Dependencies

### The OpenTelemetry Starter

This single starter handles **metrics and tracing**:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-opentelemetry</artifactId>
</dependency>
```

What's inside this starter?
- `spring-boot-starter-micrometer-metrics` — publishes metrics
- Micrometer tracing libraries — adds trace/span IDs
- OTLP exporters — exports data via the OTLP protocol
- Tracing bridge to OTel — connects Micrometer tracing to OpenTelemetry

Before Spring Boot 4, you'd add **each of these individually**. Now it's one dependency.

### The Logback OTLP Appender (for Logs)

The starter handles metrics and traces, but **logs need a separate dependency** because the underlying logging framework varies:

```xml
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-logback-appender-1.0</artifactId>
    <version>2.x.x</version> <!-- Check Maven Central for latest -->
</dependency>
```

### ❓ Why Isn't Logging Included in the Starter?

Different projects use different logging libraries:
- **Logback** (most common with Spring Boot)
- **Log4j2**
- **java.util.logging**

Each requires its own appender. The starter can't know which one you use, so you add the matching one manually. In the future, Spring Boot may auto-detect this.

---

## Step 2: Configure the Logback Appender

### Adding the OTel Appender to `logback-spring.xml`

Add a new appender alongside your existing console and file appenders:

```xml
<appender name="otel" class="io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender"/>
```

### Referencing It in Your Profiles

Add the `otel` appender reference wherever you use other appenders:

```xml
<!-- Default profile -->
<root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="ROLLING_FILE"/>
    <appender-ref ref="otel"/>
</root>

<!-- Production profile -->
<springProfile name="prod">
    <root level="ERROR">
        <appender-ref ref="ROLLING_FILE"/>
        <appender-ref ref="otel"/>
    </root>
</springProfile>
```

This ensures logs are sent to the observability backend in **every profile**.

---

## Step 3: Set Up the LGTM Stack with Docker

### Adding a Grafana Service to `compose.yml`

Just like you set up MySQL via Docker Compose, add the LGTM stack:

```yaml
grafana-lgtm:
    image: grafana/otel-lgtm:latest
    ports:
        - "3000:3000"    # Grafana UI
        - "4317:4317"    # OTLP gRPC endpoint
        - "4318:4318"    # OTLP HTTP endpoint
```

### Port Breakdown

| Port | Purpose | Protocol |
|------|---------|----------|
| **3000** | Grafana UI — access via browser | HTTP |
| **4317** | OTLP data ingestion | gRPC |
| **4318** | OTLP data ingestion | HTTP |

Now when your application starts, Docker Compose creates **two containers**: the database and the LGTM stack.

---

## Step 4: Configure OTLP Endpoints in `application.properties`

### Metrics Export

```properties
management.otlp.metrics.export.url=http://localhost:4318/v1/metrics
management.otlp.metrics.export.step=10s
```

- The `url` tells Spring Boot where to send metrics via OTLP/HTTP
- The `step` controls export frequency (default: 1 minute, set to 10s for local testing)

### Tracing Export

```properties
management.opentelemetry.tracing.export.otlp.endpoint=http://localhost:4318/v1/traces
management.tracing.sampling.probability=1.0
```

- The endpoint for trace data
- `sampling.probability` controls what percentage of requests get traced:
  - `0.1` (default) = 10% of requests — good for production to reduce data volume
  - `1.0` = 100% of requests — use for local testing only

### Logging Export

```properties
management.opentelemetry.logging.export.otlp.endpoint=http://localhost:4318/v1/logs
```

---

## Step 5: Wire the OTel Appender to the Configuration

### The Problem

The `OpenTelemetryAppender` defined in logback doesn't automatically know about the OTLP endpoint configured in `application.properties`. We need to **connect them programmatically**.

### The Solution: An Initializer Bean

```java
package com.eazybytes.jobportal.otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OpenTelemetryAppenderInitializer implements InitializingBean {

    private final OpenTelemetry openTelemetry;

    @Override
    public void afterPropertiesSet() {
        OpenTelemetryAppender.install(openTelemetry);
    }
}
```

### What This Does:

1. When the Spring context starts, this `@Component` bean is created
2. The `OpenTelemetry` bean (auto-configured by the starter) is injected
3. On initialization, `OpenTelemetryAppender.install()` connects the logback appender to the OTel configuration
4. Now the appender knows where to send logs (the OTLP endpoint from `application.properties`)

---

## Summary of All Changes

| Change | File | Purpose |
|--------|------|---------|
| Add OpenTelemetry starter | `pom.xml` | Metrics + tracing support |
| Add Logback OTLP appender | `pom.xml` | Log export via OTLP |
| Define `otel` appender | `logback-spring.xml` | Log appender configuration |
| Reference `otel` in profiles | `logback-spring.xml` | Enable in all environments |
| Add LGTM Docker service | `compose.yml` | Observability backend |
| Configure OTLP endpoints | `application.properties` | Tell Spring Boot where to send data |
| Create initializer bean | `OpenTelemetryAppenderInitializer.java` | Link logback appender to OTel config |

---

## ✅ Key Takeaways

- One starter (`spring-boot-starter-opentelemetry`) handles metrics and tracing
- Logs need a separate appender dependency matched to your logging framework
- The LGTM stack runs in Docker — Grafana UI on port 3000, OTLP on ports 4317/4318
- Three OTLP endpoints to configure: `/v1/metrics`, `/v1/traces`, `/v1/logs`
- Set `sampling.probability=1.0` for local testing, `0.1` for production
- The `OpenTelemetryAppenderInitializer` bridges logback with OpenTelemetry configuration
- Default metric export interval is 1 minute — reduce for local testing

---

## ⚠️ Common Mistakes

- Forgetting to add the separate logback appender dependency — the starter alone won't export logs
- Using `sampling.probability=1.0` in production — this generates massive amounts of trace data
- Not adding the `otel` appender reference to logback profiles — logs won't be exported
- Skipping the initializer bean — the appender won't know where to send data

---

## 💡 Pro Tips

- The `compose.yml` approach is great for local dev — in production, DevOps manages the LGTM infrastructure
- Use `4318` (HTTP) for simplicity; `4317` (gRPC) for better performance in high-throughput systems
- The initializer bean pattern is reusable — the same approach works for any appender needing runtime config
