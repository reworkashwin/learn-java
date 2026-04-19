# Grafana Alerts & Notifications — Approach 1 (Alert Rules)

## Introduction

Dashboards are great for when someone is *looking* at them. But what about 3 AM on a Saturday when nobody's watching? That's where **alerts** come in — Grafana can automatically detect when something goes wrong and send notifications to your team via email, Slack, Microsoft Teams, webhooks, and more.

In this lecture, we set up alerts using Grafana's **Alert Rules** — a direct, rules-based approach.

---

## Creating an Alert Rule

### ⚙️ Step-by-Step

1. Go to **Menu → Alerting → Alert Rules**
2. Click **Create Alert Rule**
3. Give it a name: `accounts`
4. Select **Grafana Managed Alert**

### Defining the Query (Section A)

- **Data source**: Prometheus
- **Metric**: `up`
- **Label filter**: `job = accounts`

This queries the `up` metric for the Accounts microservice. The value is `1` when the service is running and `0` when it's down.

### Defining the Reduce Function (Section B)

- **Function**: `Last`
- **Input**: A (the query above)
- **Mode**: Strict

We want to evaluate based on the **last known value** of the `up` metric.

### Defining the Threshold (Section C)

- **Condition**: IS BELOW `1`

When the `up` metric drops below 1 (i.e., the service is down), the alert fires. This section is marked as the **Alert Condition**.

### Setting Evaluation Behavior

- **Folder**: Create `accounts`
- **Group**: Create `accounts`
- **Evaluate every**: `10s` (minimum allowed)
- **For**: `30s`

The "for" period is crucial — it's a **cooldown window**. Grafana won't fire the alert immediately. Instead, it monitors for 30 seconds. If the condition persists beyond 30s, *then* it fires. This prevents false alarms from momentary blips.

### Adding Annotations

- **Summary**: "Account service is down"
- **Description**: "Please do something"

These appear in the notification when the alert fires.

---

## Alert Lifecycle: Normal → Pending → Firing → Resolved

### 🧠 Understanding the States

| State | Meaning |
|-------|---------|
| **Normal** | Service is healthy, no issues |
| **Pending** | Condition detected, waiting through the "for" period |
| **Firing** | Condition persisted beyond the "for" period — notifications are being sent |
| **Resolved** | Service recovered, resolved notification sent |

When you stop the Accounts microservice, the alert transitions: Normal → Pending (30s wait) → Firing (notifications begin). When you restart it, it goes back to Normal, and a "resolved" notification is sent.

---

## Setting Up a Contact Point

### ❓ Where Do Notifications Go?

By default, Grafana sends alerts via **email**, but this requires SMTP configuration. A simpler option for testing: **webhooks**.

### ⚙️ Creating a Webhook Contact Point

1. Go to **Alerting → Contact Points**
2. Click **Add Contact Point**
3. **Integration**: Select `Webhook`
4. **Name**: `EasyBankWebhook`
5. **URL**: Use a test webhook service like [hookdeck.com](https://hookdeck.com) or [webhook.site](https://webhook.site) to get a temporary URL
6. Click **Test** to verify — then **Save**

### ⚙️ Updating Notification Policies

1. Go to **Alerting → Notification Policies**
2. Edit the default policy
3. Change the **default contact point** to your webhook
4. Adjust timing options for testing:
   - **Group Wait**: `10s`
   - **Group Interval**: `10s`
   - **Repeat Interval**: `10s` (production default is 4 hours)

### 💡 Why Are There Timing Controls?

In production, you don't want 1000 emails for the same issue. The repeat interval ensures notifications are sent at a reasonable frequency (e.g., every 4 hours). For testing, we reduce everything to 10 seconds to see results quickly.

---

## Supported Notification Channels

Grafana supports a wide range of integrations:
- Email (SMTP required)
- Slack
- Microsoft Teams
- Discord
- PagerDuty
- Telegram
- Cisco Webex
- Google Chat
- Kafka REST Proxy
- Webhooks
- And many more

---

## Testing the Alert End-to-End

1. **Stop** the Accounts container in Docker Desktop
2. Watch the alert state change: Normal → **Pending** → **Firing**
3. Check the webhook — you'll see notifications with status "firing" and the summary "Account service is down"
4. **Start** the Accounts container
5. Watch the alert return to **Normal**
6. Check the webhook — a "resolved" notification arrives

---

## ✅ Key Takeaways

- Grafana alerts automatically detect when metrics breach thresholds and send notifications
- The **"for" period** prevents false alarms by requiring the condition to persist
- Alert states flow: Normal → Pending → Firing → Resolved
- **Contact points** define where notifications go (webhook, Slack, email, etc.)
- **Notification policies** control how often alerts repeat (avoid notification storms)
- Grafana supports a huge range of notification channels out of the box

### ⚠️ Common Mistakes

- Setting the "for" period too short in production — leads to false alarms from transient issues
- Setting repeat interval very low in production — floods your notification channel
- Forgetting to update the notification policy's default contact point — alerts fire but go nowhere useful

### 💡 Pro Tip

In production, set the repeat interval to a reasonable value like 1–4 hours. For critical alerts, use a shorter interval. For informational alerts, longer is fine. Always include meaningful summaries and descriptions so the on-call engineer knows exactly what's wrong.
