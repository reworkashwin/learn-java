# Demo of EazyBank Microservices on Google Cloud Kubernetes

## Introduction

You've built your Helm charts, pushed your images, and fired off the install commands. Now comes the moment of truth — does everything actually work in the cloud? This section walks through **validating a full microservices deployment** on Google Kubernetes Engine (GKE), from checking pod health to invoking APIs through a public gateway.

This is where theory meets reality. If something fails here, you'll learn to diagnose it. If everything works, you'll gain confidence that your entire stack — Kafka, Keycloak, Prometheus, Loki, and your custom microservices — can run in production.

---

## Patience First: Wait Before You Validate

After running `helm install`, don't immediately start checking things. The cluster needs time to pull images, schedule pods across nodes, and initialize containers.

**Wait at least 10 minutes** before investigating. Sometimes it finishes in 5, but give it the full 10 to avoid false alarms.

> Think of it like deploying a fleet of ships — they don't all dock at the same time.

---

## Validating Pod Health in GKE Console

### Checking Nodes and Pods

Once you're in the GKE console:

1. Click on your cluster
2. Navigate to **Nodes** — you'll see all nodes (e.g., 3 nodes in a typical setup)
3. Click into any node to see running pods — Prometheus pods, Loki pods, Kafka pods, etc.

A **green tick** next to every pod means all containers deployed successfully.

### Finding the Gateway Server Pod

The Gateway Server is your entry point. Without it, you can't test anything. To find which node it's on:

```bash
kubectl get pods
```

Look for the pod name containing "gateway-server". Then run:

```bash
kubectl describe pod <gateway-server-pod-name>
```

In the output, look for the `Node:` field — this tells you exactly which node hosts your gateway server.

---

## Verifying Deployments, Services, and Config

### Workloads (Deployments)

Under **Workloads** in the GKE console, you can see all active deployments. These are the instructions Kubernetes uses to create replicas, pods, and containers.

### Services and Ingress

Under **Services & Ingress**, you'll see all Kubernetes services:

- Most services use **ClusterIP** (internal only)
- **Keycloak** and **Gateway Server** use **LoadBalancer** — because they need to be accessible from outside the cluster

When a service type is `LoadBalancer` in a cloud environment, Kubernetes automatically provisions a **public IP**. Your Kubernetes admins can map this IP to a domain name if needed.

### Secrets and ConfigMaps

Verify these are created correctly — they hold environment-specific configuration your microservices depend on.

---

## Setting Up Keycloak in the Cloud

### Accessing the Keycloak Admin Console

1. Copy the public IP of the Keycloak service
2. Open it in an incognito browser tab
3. Log in with the admin credentials (configured in your Helm chart — e.g., `user` / `password`)

### Creating the Client

1. Go to **Clients** → Create a new client named `easybank-callcenter-cc`
2. Enable **Client Authentication**, disable other options, enable **Service Account Roles**
3. Save, then go to **Credentials** → copy the client secret
4. Update Postman with the new secret and the **public IP of Keycloak** as the access token URL

### Creating Roles

Create three roles: `accounts`, `cards`, `loans`. Then assign all three to the `easybank-callcenter-cc` client under **Service Account Roles**.

---

## Testing the APIs via Postman

### GET Requests

Replace `localhost` with the **Gateway Server's public IP** in all Postman requests.

- `/contact-info` on accounts → ✅ successful response
- Cards API → ✅ successful response
- Loans API → ✅ successful response

### POST Requests (Creating Data)

1. First, get an access token from Keycloak using the client credentials
2. Replace localhost with the Gateway Server's public IP
3. Send `POST` to create account → `201 Account created successfully`
4. Create card → ✅ successful
5. Create loan → ✅ successful

### Aggregate API

Call `fetchCustomerDetails` — this aggregates accounts, loans, and cards data in a single response. If this works, it confirms inter-service communication is healthy.

---

## ✅ Key Takeaways

- **Always wait 10 minutes** after `helm install` before validating — pods need time to schedule and pull images
- Use `kubectl get pods` and `kubectl describe pod` to locate and diagnose specific pods
- **LoadBalancer** service type is used for components that need external access (Keycloak, Gateway Server)
- **Keycloak setup in the cloud** mirrors local setup — create client, roles, assign roles, get secret
- **Replace localhost** with public IPs everywhere — Postman, token URLs, API endpoints
- A successful `fetchCustomerDetails` call proves the entire microservice chain is working

---

## 💡 Pro Tip

If your Kubernetes admins map the LoadBalancer public IPs to DNS names, your Postman requests become much cleaner. Instead of `34.68.159.112:8072/accounts/api/fetch`, you'd use `gateway.eazybank.com/accounts/api/fetch`. This is exactly how production environments are configured.
