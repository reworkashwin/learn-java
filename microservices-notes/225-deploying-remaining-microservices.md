# Deploying Remaining Microservices into Kubernetes

## Introduction

With all manifest files prepared, it's time to deploy the complete microservice ecosystem into our Kubernetes cluster. We'll deploy them in order, validate each step, and finally test the entire system end-to-end through the Gateway Server with Keycloak security.

---

## The Deployment Order

Deploy in this specific order due to dependencies:

1. **Keycloak** → needed for authentication
2. **ConfigMap** → environment variables for all services
3. **Config Server** → configuration provider for all services
4. **Eureka Server** → service registry
5. **Accounts, Loans, Cards** → business microservices
6. **Gateway Server** → edge server (depends on everything above)

---

## Deploying Step by Step

### 1. Keycloak
```bash
kubectl apply -f 1_keycloak.yaml
```

### 2. ConfigMap
```bash
kubectl apply -f 2_configmaps.yaml
```
If you've already created the ConfigMap, Kubernetes responds with `unchanged` — it's smart enough to detect no changes were made.

### 3. Config Server
```bash
kubectl apply -f 3_configserver.yaml
```
If the image tag changed (e.g., S14 → S12), you'll see `configured` instead of `unchanged`. Wait for Config Server to start completely before proceeding.

### 4. Eureka Server
```bash
kubectl apply -f 4_eurekaserver.yaml
```
Check the Pod logs in the Dashboard to confirm it started successfully.

### 5. Business Microservices
```bash
kubectl apply -f 5_accounts.yaml
kubectl apply -f 6_loans.yaml
kubectl apply -f 7_cards.yaml
```
Wait for all three to register with Eureka Server before proceeding.

### 6. Gateway Server
```bash
kubectl apply -f 8_gatewayserver.yaml
```

---

## Kubernetes Behavior: Unchanged vs Configured

When you run `kubectl apply`, Kubernetes compares your YAML with the current state:
- **`created`** — first-time deployment
- **`configured`** — changes detected, updates applied
- **`unchanged`** — no changes, nothing to do

This idempotent behavior is a feature of Kubernetes — you can safely re-apply the same manifest without side effects.

---

## A Note on Dependency Order

Unlike Docker Compose, Kubernetes **doesn't have a built-in `depends_on`** mechanism. There's no easy way to say "start Eureka only after Config Server is healthy."

What happens if you deploy out of order? Your container will **keep restarting** until its dependencies are available. Eventually it will succeed, but it causes unnecessary churn. The practical approach: deploy in order and wait for each service to start.

In production, DevOps teams use advanced approaches (init containers, readiness probes, custom operators) to handle ordering — but that's beyond the scope of microservice development.

---

## End-to-End Validation

### Setting Up Keycloak
1. Access Keycloak at `localhost:7080`
2. Create a client: `easybank-callcenter-cc`
   - Enable client authentication
   - Disable standard flow, direct access grants
   - Enable service account roles
3. Create roles: `accounts`, `cards`, `loans`
4. Assign all roles to the client via Service Account Roles

### Testing with Postman
1. Get an access token using the client credentials
2. Create accounts, cards, and loans data via POST requests through the Gateway
3. Fetch customer details via GET — all data (accounts, loans, cards) should return successfully

If everything returns successfully through the Gateway with proper authentication, your entire microservice ecosystem is working correctly inside Kubernetes.

---

## Understanding the Manifest Structure (Reference)

### Deployment Object
```
Deployment → ReplicaSet → Pod(s) → Container(s)
```

### Service Object
Links to Deployments via matching **labels** (`app: accounts` must match between Deployment metadata and Service selector).

### Service Types
- **LoadBalancer** — exposes to outside the cluster (used for all services in this section)
- **ClusterIP** — internal only (we'll switch to this later for non-gateway services)

---

## ✅ Key Takeaways

- Deploy microservices **in dependency order** — Config Server before Eureka, Eureka before business services, business services before Gateway
- `kubectl apply` is idempotent — re-applying unchanged manifests has no effect
- Kubernetes **doesn't have native `depends_on`** — containers restart until dependencies are available
- Validate the complete flow: Keycloak → Token → Gateway → Microservice → Response
- Both Deployment and Service configs can live in the **same YAML file** separated by `---`
- In production, DevOps teams handle deployment ordering with init containers and readiness probes

---

## ⚠️ Common Mistake

Deploying the Gateway Server before the business microservices have registered with Eureka. The Gateway may fail to route requests if it can't discover services. Always wait for Eureka registration to complete before starting the Gateway.
