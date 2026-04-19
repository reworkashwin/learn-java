# Grafana: Pre-Built & Custom Dashboards

## Introduction

Querying metrics one at a time in Grafana's Explore page is useful for ad-hoc investigation. But for **ongoing monitoring**, you want dashboards — persistent, multi-panel views that your operations team can check at a glance.

Grafana shines here with two approaches: importing **community-built dashboards** (instant setup) and building **custom dashboards** tailored to your needs.

---

## Importing Pre-Built Community Dashboards

### 🧠 What Are Community Dashboards?

The Grafana community (and the Grafana team itself) have built thousands of pre-made dashboards for common monitoring scenarios. These are shared on [grafana.com/grafana/dashboards](https://grafana.com/grafana/dashboards) and can be imported in seconds.

### ⚙️ How to Import a Dashboard

1. Go to [grafana.com/grafana/dashboards](https://grafana.com/grafana/dashboards)
2. Search for your technology (e.g., "JVM" or "Spring Boot")
3. Look for dashboards with **high download counts** — they're battle-tested
4. Copy the dashboard URL or ID

Then in Grafana:
1. **Sign in** (default credentials: `admin` / `admin`)
2. Go to **Menu → Dashboards → New → Import**
3. Paste the dashboard URL and click **Load**
4. Select **Prometheus** as the data source
5. Click **Import**

### 🧪 Example: JVM Micrometer Dashboard (5M+ Downloads)

This dashboard gives you instant visibility into:
- **Uptime** and start time
- **Heap** and non-heap memory usage
- **Thread** counts and states
- **CPU usage** over time
- **Garbage collector** pressure
- **JVM memory pools** (Eden Space, Survivor Space, Tenured Gen)
- **Log events** by severity

Switch between microservices using the dropdown at the top (e.g., Accounts → Cards → Loans). Each selection refreshes all panels for that specific service.

### 🧪 Example: Spring Boot System Monitor (490K+ Downloads)

Import another dashboard for a different perspective. This one focuses on:
- System-level metrics
- HTTP request statistics
- Connection pool details

Having multiple dashboards gives different team members the views they need.

---

## Building Custom Dashboards

### ❓ When Do You Need Custom Dashboards?

Pre-built dashboards cover common scenarios, but your project may need specific views. Maybe you want a dashboard that shows only your **Accounts microservice** health with exactly the metrics that matter to your team.

### ⚙️ Step-by-Step: Creating a Custom Dashboard

**1. Create the Dashboard**
- Go to **Dashboards → New → New Dashboard**
- Save it with a name (e.g., "EasyBank")

**2. Add a Row (Optional but Recommended)**
- Click **Add → Row**
- Give it a title (e.g., "Accounts Microservice")
- Rows act as collapsible sections to organize panels

**3. Add a Visualization Panel**
- Click **Add → Visualization**
- Select **Prometheus** as the data source
- Choose a metric (e.g., `process_uptime_seconds`)
- Filter by label: `application = accounts`
- Give the panel a title (e.g., "Uptime")
- Choose a visualization type (Time Series, Gauge, Stat, Bar Chart, etc.)
- Click **Apply**

**4. Add More Panels**

Example: An "Up" panel using the `up` metric with `job = accounts` displayed as a **Gauge** — perfect for showing at-a-glance health status.

**5. Organize Panels**

Drag panels under their respective rows. Resize them by dragging the edges. Rows can be collapsed/expanded to focus on specific service groups.

### 🎨 Available Visualization Types

| Type | Best For |
|------|----------|
| Time Series | Trends over time (CPU, memory) |
| Stat | Single value display (current uptime) |
| Gauge | Health indicators (up/down) |
| Bar Chart | Comparing values across services |
| Pie Chart | Proportional breakdowns |
| Table | Detailed tabular data |
| Heatmap | Density visualization |

---

## Who Typically Builds These Dashboards?

Grafana is a deep topic. Usually the **platform team** or **operations team** are the dashboard experts. But as a developer, knowing how to:
- Import pre-built dashboards
- Create simple custom panels
- Understand what metrics mean

...makes you a significantly more valuable team member.

---

## ✅ Key Takeaways

- Import **community dashboards** for instant monitoring — search by technology and pick those with high download counts
- Build **custom dashboards** for project-specific monitoring needs
- Use **rows** to organize panels by microservice or concern
- Choose visualization types that match the metric (gauges for health, time series for trends)
- Multiple dashboards can coexist — import several for different perspectives
- Save dashboards so any team member can access them anytime

### ⚠️ Common Mistakes

- Forgetting to **sign in** before importing dashboards — you need authentication to save dashboards
- Not selecting the correct Prometheus data source during import — the dashboard will show no data
- Creating overly complex custom dashboards when a pre-built one already covers 90% of your needs

### 💡 Pro Tip

Bookmark the [Grafana Dashboards repository](https://grafana.com/grafana/dashboards). When starting a new project, search for dashboards matching your stack. In minutes, you'll have production-grade monitoring without building anything from scratch.
