# Install EazyBank Microservices in Kubernetes Using Helm Chart

## Introduction

This is the moment everything comes together. All infrastructure components are running — KeyCloak, Kafka, Prometheus, Grafana, Loki, Tempo. Now we deploy **all our microservices** into the Kubernetes cluster with a single Helm command, exactly as promised.

---

## One Command to Rule Them All

Navigate to the `environments` folder and pick your environment:

```bash
cd environments
helm install eazybank prod-env
```

That's it. One command. Behind the scenes, Helm:
1. Reads the `prod-env` chart's dependencies (all 7 microservice charts + common chart)
2. Generates Kubernetes manifests for each microservice using templates + values
3. Creates the shared ConfigMap with production profile settings
4. Applies everything to the Kubernetes cluster

---

## The Startup Dance: Ordered Chaos

Here's what happens right after installation — and it can look alarming if you're not expecting it.

All microservices start **simultaneously**. But they have dependencies:
- Accounts, Loans, Cards need **Config Server** to fetch properties
- They also need **Eureka Server** to register
- Config Server and Eureka need time to boot up

So what happens? **Pods fail and restart multiple times.** This is completely normal.

Kubernetes handles this gracefully through its restart policy:
- First restart: wait ~2 seconds
- Second restart: wait ~4 seconds
- Third restart: wait ~8 seconds
- And so on (**exponential backoff**)

Eventually, Config Server starts first, then Eureka, then the remaining services connect successfully.

### Monitoring the startup

Check pod status:
```bash
kubectl get pods
```

You'll see restart counts increase. To check logs for a specific service:
```bash
kubectl logs <pod-name>
```

Or use the Kubernetes Dashboard — click on a pod → View Logs. Look for the "Started [ServiceName] application" message.

### Expected startup order:
1. **Config Server** — starts first (no dependencies on other microservices)
2. **Message** — starts quickly (only needs Kafka, no Config Server or Eureka dependency)
3. **Eureka Server** — needs Config Server
4. **Accounts, Cards, Loans** — need both Config Server and Eureka
5. **Gateway Server** — needs Config Server, Eureka, and KeyCloak

⚠️ On a local machine with limited resources, the full startup can take **5-10 minutes**. Be patient.

---

## Verifying the Deployment

### API Testing

Once all pods show `Running` with no recent restarts:

**Test read APIs (no auth needed for some endpoints):**
```
GET http://localhost:8072/accounts/contact-info
GET http://localhost:8072/cards/java-version
GET http://localhost:8072/loans/build-info
```

The properties returned should match the **prod** profile, confirming `SPRING_PROFILES_ACTIVE=prod` is working.

**Test write APIs (requires OAuth2 token):**

1. Get an access token from KeyCloak (port 80, not 7080!):
```
POST http://localhost:80/realms/master/protocol/openid-connect/token
```

2. Use the token for authenticated requests:
```
POST http://localhost:8072/api/create-account
POST http://localhost:8072/api/create-card
POST http://localhost:8072/api/create-loan
```

3. Test the aggregate endpoint:
```
GET http://localhost:8072/api/fetchCustomerDetails?mobileNumber=...
```

This returns accounts, loans, and cards information — proving inter-service communication works through the Gateway Server.

---

## Verifying Observability

### Logs (Loki)

Port-forward Grafana:
```bash
kubectl port-forward svc/grafana 3000:3000
```

In Grafana → Explore → Select **Loki** → Choose a container (e.g., `gatewayserver`) → Run query.

You should see real-time log entries from your microservice.

### Distributed Tracing (Tempo)

Click on any log entry that contains a `traceId`. The Loki-Tempo integration creates a clickable link that takes you directly to the **full distributed trace** in Tempo — showing the request flow across all microservices.

### Metrics (Prometheus)

In Grafana → Explore → Select **Prometheus** → Search for the `up` metric → Filter by container → Run query.

This shows uptime graphs for all running containers, confirming Prometheus is successfully scraping metrics from your microservices.

---

## The Complete Picture

With `helm ls`, you can see the full state of your cluster:

```
NAME        STATUS      CHART
eazybank    deployed    prod-env-0.1.0
grafana     deployed    grafana-x.x.x
kafka       deployed    kafka-x.x.x
keycloak    deployed    keycloak-x.x.x
loki        deployed    grafana-loki-x.x.x
prometheus  deployed    kube-prometheus-x.x.x
tempo       deployed    grafana-tempo-x.x.x
```

Seven Helm releases managing your entire production-like environment — microservices, security, messaging, and full observability.

---

## ✅ Key Takeaways

- **One command** (`helm install eazybank prod-env`) deploys all microservices at once
- Pod restarts during startup are **normal** — Kubernetes uses exponential backoff until dependencies are available
- Full startup on a local machine can take **5-10 minutes** due to resource constraints
- Verify with API calls that the correct **profile** is active (dev/QA/prod)
- The complete observability stack works end-to-end: Loki (logs) → Tempo (traces) → Prometheus (metrics) → Grafana (visualization)
- KeyCloak runs on port **80** in Kubernetes (not 7080) — update your Postman/API client accordingly

💡 **Pro Tip:** If the aggregate `fetchCustomerDetails` endpoint times out on first call, try again. The first request triggers lazy initialization across services. Subsequent calls should be fast.

⚠️ **Common Mistake:** Don't panic when you see pod restarts after `helm install`. It's Kubernetes doing its job — restarting containers until their dependencies (Config Server, Eureka) come online. The restart count will stabilize once everything is running.
