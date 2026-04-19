# Grafana Alerts & Notifications — Approach 2 (Dashboard-Based Alerts)

## Introduction

In the previous lecture, we created alerts directly from the **Alert Rules** page. But there's a second, more visual approach — creating alerts **directly from a dashboard panel**. This ties the alert to a specific visualization, making it easier to see the relationship between what you're monitoring and what triggers notifications.

---

## Creating an Alert from a Dashboard Panel

### ⚙️ Step-by-Step

**1. Create a New Dashboard and Panel**
- Go to **Dashboards → New Dashboard**
- Save it as "AlertsDemo"
- Add a new **Visualization** panel
- Data source: **Prometheus**
- Metric: `up`
- Label: `job = cards`
- Panel title: "Cards Up"
- Click **Apply**

**2. Create the Alert from the Panel**
- Edit the panel you just created
- Go to the **Alert** tab (next to the Query tab)
- Click **Create Alert Rule**
- Save the dashboard when prompted

**3. Configure the Alert Conditions**

The query (Section A) is pre-filled from your panel. Now configure:
- **Reduce function**: `Last`
- **Threshold**: IS BELOW `1`
- **Folder**: Create `cards`
- **Group**: Create `cards`
- **Evaluate every**: `10s`
- **For**: `30s`

**4. Add Annotations**
- Summary: "Cards microservice is down"
- Description: "Please do something"

Note: The **Dashboard UID** and **Panel ID** are automatically populated — this is the link between the alert and the dashboard panel.

**5. Save and Exit**

---

## The Heart Icon: Visual Alert Status

### 🧠 What's That Heart on the Panel?

Once an alert is attached to a dashboard panel, a **heart icon** appears on the panel:

| Heart Color | Meaning |
|-------------|---------|
| 💚 Green | Alert is in **Normal** state — everything is fine |
| 🟡 Yellow/Orange | Alert is in **Pending** state — condition detected, waiting through the "for" period |
| ❤️ Red | Alert is in **Firing** state — notifications are being sent |

This gives you **at-a-glance** health monitoring right on your dashboard, without navigating to the Alert Rules page.

---

## Testing the Dashboard-Based Alert

### 🧪 Triggering the Alert

1. **Stop** the Cards container in Docker Desktop
2. Refresh the dashboard — the metric drops from 1 to 0
3. The heart icon turns **yellow** (pending)
4. After 30 seconds, the heart turns **red** (firing)
5. Check the webhook — notifications arrive with "Cards microservice is down"

### 🧪 Resolving the Alert

1. **Start** the Cards container
2. The metric returns to 1
3. The heart icon turns back to **green** (OK)
4. The webhook receives a "resolved" notification

### 🧪 The Panel Timeline

The panel itself shows a visual timeline:
- A **yellow vertical line** marks when the alert entered pending state
- A **red zone** marks the firing period
- You can see exactly *when* the incident started and ended

---

## Approach 1 vs Approach 2: When to Use Each

| Aspect | Approach 1 (Alert Rules) | Approach 2 (Dashboard Panels) |
|--------|-------------------------|-------------------------------|
| Setup location | Alerting → Alert Rules | Dashboard → Panel → Alert tab |
| Visual feedback | Alert Rules page only | Heart icon directly on the panel |
| Best for | Standalone monitoring rules | Monitoring tied to visual dashboards |
| Dashboard integration | Manual | Automatic (linked by UID/Panel ID) |

Both approaches create the same type of alert with the same capabilities. The choice is about workflow preference and organizational style.

---

## Complete Metrics Monitoring Summary

Here's the full picture of what we've built for the **metrics pillar** of observability:

```
Microservices (with Actuator + Micrometer)
    ↓ expose /actuator/prometheus
Prometheus (scrapes every 5s, stores metrics)
    ↓ data source connection
Grafana (dashboards, graphs, alerts, notifications)
    ↓ sends to
Notification Channels (webhook, Slack, email, Teams, etc.)
```

As a developer, your responsibilities are:
1. Add Micrometer dependency
2. Add the application name tag property
3. Know the basics of Grafana to build simple dashboards and alerts

The platform/operations team takes it from there with advanced dashboards, production alerting policies, and notification channel management.

---

## ✅ Key Takeaways

- Dashboard-based alerts attach an alert **directly to a visualization panel**
- The **heart icon** provides instant visual feedback on the panel itself (green/yellow/red)
- The panel timeline shows exactly when incidents started and ended
- Both alert approaches (Rules page vs Dashboard panel) produce the same type of alert
- The complete metrics pipeline: Actuator → Micrometer → Prometheus → Grafana → Notifications
- Know the basics as a developer; master the details if you're on the platform team

### ⚠️ Common Mistakes

- Forgetting to save the dashboard before creating the alert from a panel — Grafana prompts for this
- Confusing the two approaches — they both create Grafana-managed alerts, just from different starting points

### 💡 Pro Tip

Dashboard-based alerts are especially useful for shared team dashboards. When someone opens the dashboard, the heart icons immediately show which services have active issues — no need to navigate to a separate alerts page.
