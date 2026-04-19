# Introduction to OpenTelemetry

## Introduction

We know *what* distributed tracing is. Now the question is: *how* do we implement it? There are several options in the Java/Spring ecosystem, and choosing the right one matters — some are actively maintained, some are being sunset, and one stands out as the clear winner for modern microservices.

---

## Option 1: Spring Cloud Sleuth + Zipkin (Outdated)

### 🧠 What Is It?

Spring Cloud Sleuth was the go-to solution for distributed tracing in Spring Boot applications. When combined with Zipkin, it automatically added trace IDs and span IDs to all logs and provided a UI for visualizing request flows.

### ⚠️ Why We're NOT Using It

The Spring Cloud Sleuth team has announced that **version 3.1 is the last minor release**. All tracing functionality is being migrated to Micrometer Tracing. If you see blogs or courses teaching Sleuth + Zipkin, they're using an **outdated approach**.

---

## Option 2: Micrometer Tracing (Java-Only)

### 🧠 What Is It?

Micrometer Tracing is the successor to Spring Cloud Sleuth, built into the Micrometer project (which we already use for metrics). It supports integration with Zipkin and OpenTelemetry.

### ❓ Why Not This Either?

While Micrometer Tracing works, it has two drawbacks:
1. **Requires more configuration and code changes** than the alternative
2. **Java-specific** — if your microservice ecosystem includes Go, Python, or Node.js services, you need a different solution for each language

---

## Option 3: OpenTelemetry (The Winner)

### 🧠 What Is OpenTelemetry?

OpenTelemetry (OTel) is an **open-source, vendor-neutral observability framework** maintained under the Cloud Native Computing Foundation (CNCF). It provides standardized APIs, SDKs, and tools for generating, collecting, and exporting telemetry data — traces, metrics, and logs.

### ❓ Why Choose OpenTelemetry?

| Factor | Spring Cloud Sleuth | Micrometer Tracing | OpenTelemetry |
|--------|-------------------|-------------------|---------------|
| Status | Being sunset | Active | Active & growing |
| Language support | Java only | Java only | Java, Go, Python, Node.js, C++, Rust, and more |
| Ease of setup | Moderate | Requires more config | Very simple (Java agent) |
| Vendor lock-in | Spring ecosystem | Java ecosystem | Vendor-neutral |
| Community | Declining | Moderate | Massive (CNCF project) |
| Framework integration | Spring only | Spring only | Spring, Quarkus, Express, ASP.NET, and more |

### 💡 The Key Advantage

OpenTelemetry uses a **Java Agent** approach. You don't change your application code at all. You just:
1. Add the agent JAR to your classpath
2. Pass a JVM argument pointing to the agent
3. Set the service name

That's it. The agent uses **bytecode instrumentation** to automatically inject trace IDs, span IDs, and metadata into all your logs at runtime.

---

## How OpenTelemetry's Java Agent Works

### ⚙️ Setup Requirements

1. **Download/include the OpenTelemetry Java Agent JAR** in your application's classpath

2. **Pass the JVM agent argument** when starting your application:
   ```
   -javaagent:/path/to/opentelemetry-javaagent.jar
   ```

3. **Set the service name** via environment variable:
   ```
   OTEL_SERVICE_NAME=accounts
   ```

   Or via the `JAVA_TOOL_OPTIONS` environment variable:
   ```
   JAVA_TOOL_OPTIONS=-javaagent:/path/to/opentelemetry-javaagent.jar
   ```

### 🧠 What Happens at Runtime?

The Java agent attaches **bytecode** to your application. This instrumented bytecode:
- Generates Trace IDs at request entry points
- Creates Span IDs at each service boundary
- Propagates context headers across HTTP calls
- Injects tracing data into all log statements

All of this happens **transparently** — zero changes to your business logic.

---

## OpenTelemetry's Multi-Language Support

If your organization has microservices in different languages, OpenTelemetry is the only sane choice:

- **Java** — Java Agent (automatic instrumentation)
- **Python** — Python SDK with auto-instrumentation
- **Go** — Go SDK
- **Node.js/TypeScript** — JavaScript SDK
- **C#/.NET** — .NET SDK
- **Ruby, Rust, Swift, PHP, C++, Erlang** — all supported

Same concepts, same trace propagation, same data format — regardless of language.

---

## ✅ Key Takeaways

- **Spring Cloud Sleuth** is being sunset — don't use it for new projects
- **Micrometer Tracing** works but is Java-specific and requires more configuration
- **OpenTelemetry** is the clear winner: vendor-neutral, multi-language, minimal setup
- The Java Agent approach means **zero code changes** for automatic instrumentation
- OpenTelemetry is a CNCF project with massive community support
- Learning OTel is an investment that pays off across languages and frameworks

### ⚠️ Common Mistakes

- Following tutorials that teach Spring Cloud Sleuth + Zipkin — that approach is being deprecated
- Assuming you need extensive code changes for distributed tracing — the Java Agent handles it automatically
- Choosing a language-specific solution when your org has polyglot microservices

### 💡 Pro Tip

OpenTelemetry isn't just for tracing — it's a complete observability framework that can also handle metrics and logs export. However, for metrics we already have a better tool (Prometheus + Micrometer), so we'll use OTel for tracing only and disable its metrics exporter.
