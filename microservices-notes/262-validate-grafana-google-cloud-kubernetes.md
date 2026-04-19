# Validating Grafana Components in Google Cloud Kubernetes

## Introduction

Your microservices are running. APIs respond. But can you **observe** them? Monitoring, logging, and distributed tracing are critical in production. This section validates that **Grafana, Loki, Prometheus, and Tempo** are all functional inside your GKE cluster.

There's a twist though — Grafana is deployed as a **ClusterIP** service, meaning it has no public IP. So how do you access it? Let's find out.

---

## The ClusterIP Challenge

When you check the services page in GKE, Grafana shows as **ClusterIP** — there's no external IP to access it. This is intentional: monitoring dashboards shouldn't be publicly exposed.

So how do developers access Grafana? Two options:

### Option 1: Change to LoadBalancer

Your Kubernetes admin can update the Helm chart to change the service type from `ClusterIP` to `LoadBalancer`, then run `helm upgrade`. This gives Grafana a public IP.

### Option 2: Port Forwarding (More Common)

From your local system, connect to the Kubernetes cluster using **gcloud CLI** credentials, then use `kubectl port-forward`:

```bash
kubectl port-forward service/grafana 8080:80
```

This makes Grafana accessible at `localhost:8080` on your local machine.

> This is how real-world teams access internal services — anyone with cluster credentials can reach ClusterIP services without exposing them publicly.

---

## Getting Grafana Credentials

When Helm installed Grafana, it printed instructions including commands to retrieve the admin password:

```bash
# Get username
echo "admin"

# Get password (from the Helm output commands)
kubectl get secret grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

Copy the decoded password — you'll need it to log in.

---

## Logging In and Verifying Integrations

1. Open `localhost:8080` in your browser
2. Log in with username `admin` and the password you retrieved
3. Go to the **Explorer** page
4. Open the data source dropdown — you should see **Loki**, **Prometheus**, and **Tempo**

If all three appear, the integrations are working correctly.

---

## Validating Loki (Centralized Logging)

1. Select **Loki** as the data source
2. Set label to `container`, value to `gateway-server`
3. Click **Run Query**

You'll see all Gateway Server logs. Click on any log entry — after the trace ID, there's a button to **navigate to Tempo** for distributed tracing details.

---

## Validating Tempo (Distributed Tracing)

When you click the Tempo link from a Loki log entry, the tracing details load automatically. You can see:

- The full request path across microservices
- Timing for each span
- Which service took the longest

This is invaluable for diagnosing **performance problems** in production.

---

## Validating Prometheus (Metrics)

1. Select **Prometheus** as the data source
2. Choose the metric `up` (available at the end of the list)
3. Under label filters, select `container`
4. Set duration to **Last 15 minutes**
5. Click **Run Query** and switch to the graph view

You should see uptime graphs for your containers — confirming Prometheus is scraping metrics successfully.

---

## ✅ Key Takeaways

- **ClusterIP services** are internal-only — use `kubectl port-forward` to access them from your local machine
- Grafana credentials are generated during Helm installation — retrieve them via `kubectl get secret`
- Verify all three integrations: **Loki** (logs), **Tempo** (traces), **Prometheus** (metrics)
- The **Loki → Tempo** link is powerful — jump from a log entry directly to its distributed trace
- Port forwarding is the standard way developers access internal cluster services in production

---

## 💡 Pro Tip

When troubleshooting in production, start with Loki logs, find the relevant trace ID, then jump to Tempo for the full picture. This logs-to-traces workflow is exactly how SRE teams diagnose issues in real microservice environments.
