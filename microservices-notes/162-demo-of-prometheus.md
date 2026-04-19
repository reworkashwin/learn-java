# Demo of Prometheus

## Introduction

Everything is configured. Docker images are regenerated. It's time to start the entire stack and see Prometheus in action — monitoring all our microservices from a single dashboard, detecting when services go down, and giving us instant visibility into system health.

---

## Starting the Stack

### ⚠️ Don't Forget to Rebuild!

Before running `docker compose up`, remember: the Micrometer code changes (dependency + YAML property) only exist in your local workspace. You **must regenerate Docker images** with those changes baked in.

```bash
docker compose up -d
```

Verify the new Prometheus container is running alongside all microservices in Docker Desktop. Prometheus starts at **port 9090**.

---

## Exploring the Prometheus UI

### ⚙️ Checking Targets

Navigate to:

```
http://localhost:9090/targets
```

This is the operations dashboard of Prometheus — it shows **every service being monitored** and its health status.

You'll see six targets:
- `accounts` — UP
- `cards` — UP
- `configserver` — UP
- `eurekaserver` — UP
- `gatewayserver` — UP
- `loans` — UP

From this single page, you can see the overall status of your entire microservice ecosystem. Click **Show More** on any target to see detailed label information, the last scrape time, and any errors.

### ⚙️ Querying Metrics with Graphs

Navigate to the **Graph** tab and search for metrics:

**CPU Usage:**
```
system_cpu_usage
```
This shows CPU usage across all microservices. Switch to the **Graph** view to see a time-series chart. Each colored line represents a different microservice. Hover over a line to highlight that specific service.

**Process Uptime:**
```
process_uptime_seconds
```
Shows how long each microservice has been running without restart. Useful for detecting unexpected restarts.

**Other Useful Metrics:**
- Connection pool details
- Thread information
- JVM memory metrics
- HTTP request counts

### 💡 Discovering Available Metrics

Click the **globe icon** (Metrics Explorer) to see the complete list of all metrics Prometheus is tracking. This is invaluable when you're not sure what's available.

---

## Testing Service Failure Detection

### 🧪 Simulating a Down Service

Here's where Prometheus proves its value:

1. Open Docker Desktop
2. **Stop** the Cards microservice container
3. Go back to Prometheus → Targets page
4. Refresh the page

The Cards microservice now appears in **red** with status **DOWN**. The error message says: "no such host."

Click "Show More" to see the full error details.

### 🧪 Recovering the Service

1. **Start** the Cards container again in Docker Desktop
2. Wait 10-15 seconds for Prometheus to scrape again
3. Refresh the Targets page

Cards is back to **UP** status. Prometheus automatically detects recovery.

---

## Prometheus Limitations

While Prometheus gives you basic monitoring — target health, individual metric graphs — it has limitations:

- **Can't build complex multi-panel dashboards** — you're limited to one metric query at a time
- **No alerting with notifications** — you can see a service is down, but Prometheus alone won't send you a Slack message or email
- **Limited visualization options** — time series graphs only, no gauges, no heatmaps, no tables

That's why we integrate Prometheus with **Grafana** — which provides all of these capabilities and more.

---

## ✅ Key Takeaways

- The `/targets` page is your go-to for understanding what Prometheus is monitoring and what's healthy
- Use the **Graph** tab to query specific metrics like `system_cpu_usage` or `process_uptime_seconds`
- Prometheus automatically detects when services go down and when they recover
- The **Metrics Explorer** (globe icon) shows all available metrics
- Prometheus is great for data collection but limited in visualization and alerting — that's Grafana's job
- Always regenerate Docker images before testing with Docker Compose

### ⚠️ Common Mistakes

- Running `docker compose up` without regenerating images after Micrometer changes
- Expecting Prometheus to send notifications when services go down — it only displays status
- Looking at the graph for "last 1 hour" when your services just started — reduce the time range for better visibility

### 💡 Pro Tip

Toggle between the dark and light theme in Prometheus (icon in the top right) to see graph colors more clearly. The dark theme can make closely colored lines hard to distinguish.
