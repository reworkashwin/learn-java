# Demo of Prometheus & Grafana Integration

## Introduction

Prometheus collects and stores the metrics. But Prometheus alone gives you a bare-bones UI. Grafana is where the magic happens — beautiful graphs, multiple data sources, flexible querying, and the foundation for alerts and dashboards.

We already set up the integration via `datasource.yml`. Now let's use it.

---

## Verifying the Connection

### ⚙️ Checking Data Sources in Grafana

1. Open Grafana at `http://localhost:3000`
2. Navigate to **Menu → Connections → Data Sources**
3. You should see **two** connections: **Loki** and **Prometheus**

Click on Prometheus to verify the URL is `http://prometheus:9090`. This was auto-provisioned from the `datasource.yml` file we created.

---

## Exploring Metrics in Grafana

### ⚙️ Using the Explore Page

1. Click the **Explore** button in the left menu
2. Select **Prometheus** as the data source (instead of Loki)
3. Choose a metric: `system_cpu_usage`
4. Select label: `application`
5. Click **Run Query**

A graph appears showing CPU usage across all microservices over time. Adjust the time range — switching from "Last 1 hour" to "Last 15 minutes" makes short-lived changes more visible.

### 🧪 Visualizing Multiple Metrics

Click **Add Query** to overlay multiple metrics on the same graph:

- Query A: `system_cpu_usage` (label: `application`)
- Query B: `up` (label: `job`)

The graph now shows both metrics. The `up` metric stays at 1 (top line) while CPU usage fluctuates near the bottom. This combined view is impossible in Prometheus's native UI.

### 🎨 Visualization Styles

Grafana offers multiple graph styles:
- **Lines** — classic time-series
- **Bars** — interval-based
- **Points** — scatter plot
- **Stacked Lines** — cumulative view
- **Stacked Bars** — stacked interval view

Each style reveals different patterns in the same data. Experiment to find what works best for your use case.

---

## What Makes Grafana Better Than Prometheus's UI?

| Feature | Prometheus UI | Grafana |
|---------|--------------|---------|
| Multiple metrics in one graph | ❌ | ✅ |
| Visualization styles | Time series only | Lines, bars, gauges, heatmaps, etc. |
| Saveable dashboards | ❌ | ✅ |
| Pre-built community dashboards | ❌ | ✅ (millions of downloads) |
| Alerting & notifications | Basic | Slack, email, webhooks, Teams, etc. |
| Data source flexibility | Prometheus only | Loki, Prometheus, Tempo, and more |

---

## ✅ Key Takeaways

- Grafana connects to Prometheus as a data source and provides a far richer visualization experience
- Use the **Explore** page for ad-hoc metric queries
- Overlay multiple metrics using **Add Query** for correlated analysis
- Grafana supports many visualization styles — choose based on what story the data tells
- The Prometheus + Grafana combination is the industry standard for metrics monitoring

### 💡 Pro Tip

When querying metrics, always search for **one metric at a time** first. Multi-metric graphs are powerful but can be confusing until you understand what each individual metric looks like.
