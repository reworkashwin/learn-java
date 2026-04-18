# Real-Time Insights with Actuator — Metrics, Logs & Mappings

## Introduction

Actuator doesn't just show you health and beans. It goes **much deeper** — exposing live metrics like CPU usage and uptime, all your logging configurations, thread information, REST API mappings, and cache details. These endpoints are the tools that operations teams use to build **real-time monitoring dashboards**.

Let's explore each of these powerful Actuator endpoints.

---

## The Loggers Endpoint — `/actuator/loggers`

### 🧠 What Does It Show?

The complete logging configuration of your application — every package, every class, every logging level.

### What You'll See:

For each package, you get:
- **Configured level** — what you explicitly set
- **Effective level** — what's actually being used (could be inherited from a parent)

For example:
```json
"com.eazybytes.jobportal": {
    "configuredLevel": "INFO",
    "effectiveLevel": "INFO"
}
```

### Why Is This Useful?

If you're troubleshooting a logging issue — like "why aren't my DEBUG statements showing?" — this is the **first place to check**. It shows the logging levels for every package, from every library your application uses.

---

## The Thread Dump — `/actuator/threaddump`

### 🧠 What Does It Show?

A complete snapshot of **all threads** currently running in your JVM.

### When Is This Useful?

- Application running **slowly**? Check which threads are blocked or waiting
- Deadlock suspected? The thread dump will reveal it
- Want to know how many threads are processing requests? It's all here

Each thread entry shows its name, state (RUNNABLE, WAITING, BLOCKED), and stack trace.

---

## The SBOM Endpoint — `/actuator/sbom`

**SBOM** = Software Bill of Materials.

This endpoint shows shared modules or dependencies that are defined as a parent/shared project — especially useful in **microservices environments** where multiple services share the same set of dependencies via a common parent POM.

In a monolithic app, this may be empty. It becomes more relevant in distributed architectures.

---

## The Scheduled Tasks Endpoint — `/actuator/scheduledtasks`

### 🧠 What Does It Show?

Details about all **scheduled tasks** running in your application — tasks that execute at fixed intervals (e.g., every 30 minutes, every day).

If you're using `@Scheduled` annotations, the details about those tasks — their frequency, next execution time — appear here.

---

## The Mappings Endpoint — `/actuator/mappings`

### 🧠 What Does It Show?

**Every REST API path and Spring MVC path** supported by your application, along with:
- The HTTP method (GET, POST, DELETE, etc.)
- The controller class handling it
- The specific method inside that controller

### Why This Is a Game-Changer

- Getting a **404 error** on an endpoint? Check if it's registered here
- Want to understand all APIs in one place? This is your **single source of truth**
- No need to manually browse through every controller class

For example, searching for `api/companies` shows all company-related endpoints with their corresponding `CompanyController` methods.

---

## The Caches Endpoint — `/actuator/caches`

### 🧠 What Does It Show?

All the **caches** configured in your application, along with their names and cache manager details.

For example, if you've configured caches named `jobs`, `companies`, and `roles`, they all appear here.

---

## The Metrics Endpoint — `/actuator/metrics`

### 🧠 Why This Is the Most Important Endpoint

The metrics endpoint exposes **quantitative measurements** about your application's health and performance.

### How to Use It

First, list all available metrics:
```
/actuator/metrics
```

Then drill into a specific metric by appending its name:

### Key Metrics to Know:

| Metric | URL | What It Shows |
|--------|-----|---------------|
| CPU Usage | `/actuator/metrics/process.cpu.usage` | Current CPU utilization (0.0 to 1.0) |
| Uptime | `/actuator/metrics/process.uptime` | How long the JVM has been running (in seconds) |
| Active Requests | `/actuator/metrics/tomcat.threads.busy` | How many Tomcat threads are actively handling requests |

### Real-World Usage

Operations teams take these metrics and feed them into dashboarding tools like **Grafana**:
- Build graphs showing CPU usage over time
- Set up **alerts** when CPU exceeds 80%
- Monitor request counts and response times
- Get notified when something looks abnormal

---

## The Big Picture: All Actuator Endpoints

Here's a summary of the key endpoints:

| Endpoint | Purpose |
|----------|---------|
| `/actuator/health` | Overall and component health |
| `/actuator/beans` | All Spring beans |
| `/actuator/conditions` | Auto-configuration report |
| `/actuator/configprops` | Configuration properties and values |
| `/actuator/env` | Environment variables and app properties |
| `/actuator/loggers` | Logging levels per package/class |
| `/actuator/threaddump` | Thread snapshot |
| `/actuator/mappings` | All REST API and MVC mappings |
| `/actuator/caches` | Cache configurations |
| `/actuator/metrics` | Performance metrics (CPU, memory, uptime, etc.) |
| `/actuator/scheduledtasks` | Scheduled job details |
| `/actuator/sbom` | Software Bill of Materials |

---

## ✅ Key Takeaways

- The **metrics** endpoint is crucial for performance monitoring — CPU, memory, uptime, request counts
- The **loggers** endpoint lets you verify logging levels without opening config files
- The **mappings** endpoint is your go-to for debugging 404 errors or understanding available APIs
- The **threaddump** endpoint helps diagnose slow performance and threading issues
- Operations teams feed these metrics into **Grafana** to build dashboards, alerts, and notifications
- The list of available endpoints varies based on the dependencies in your application

---

## ⚠️ Common Mistakes

- Ignoring metrics until a production issue occurs — monitor from day one
- Not realizing that metric values change in real-time — refresh to see updated data
- Assuming all endpoints are always available — they depend on your dependencies and exposure config

---

## 💡 Pro Tips

- Use `/actuator/metrics/process.cpu.usage` as a quick health check during load testing
- The `mappings` endpoint is incredibly useful during code reviews — verify that all intended APIs are registered
- Combine `loggers` with the ability to **change log levels at runtime** (covered in a later section)
