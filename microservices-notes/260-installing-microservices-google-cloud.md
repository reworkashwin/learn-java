# Installing Microservices and Supporting Components in Google Cloud Kubernetes

## Introduction

The Kubernetes cluster is running in Google Cloud with 3 nodes. Our local `kubectl` is connected. Now comes the moment of truth: deploying our entire microservices stack — all the supporting infrastructure and our own services — into a real cloud Kubernetes cluster. And here's the beautiful part: it's the **exact same process** as what we did locally.

---

## Step 1: Install the Discovery Server

First, set up the Discovery Server using the same Kubernetes manifest file from our local setup:

```bash
cd section_17/kubernetes
kubectl apply -f kubernetes-discoveryserver.yaml
```

This creates the Service, ServiceAccount, Role, RoleBinding, and Deployment for the Discovery Server — identical to what we did locally.

💡 **Tip**: If you get connection timeout errors, re-run the `gcloud container clusters get-credentials` command to refresh your connection. Network hiccups are common when working with remote clusters.

---

## Step 2: Install Supporting Components via Helm

Navigate to the Helm folder and install each component one by one:

```bash
cd section_17/helm

# 1. Keycloak
helm install keycloak keycloak

# 2. Kafka
helm install kafka kafka

# 3. Prometheus
helm install prometheus kube-prometheus

# 4. Loki
helm install loki grafana-loki

# 5. Tempo
helm install tempo grafana-tempo

# 6. Grafana
helm install grafana grafana
```

Each command installs the respective Helm chart into the cloud cluster. The same charts, the same configurations — just a different (and more powerful) cluster.

---

## Step 3: Deploy the Microservices

Finally, deploy the EasyBank microservices using the production environment Helm chart:

```bash
cd environments
helm install easybank prod-env
```

This single command deploys all microservices: Accounts (with 2 replicas), Cards, Loans, Config Server, Gateway Server, and Message service.

---

## What's Different in the Cloud?

### Nothing — Conceptually

The Helm charts, Docker images, manifest files, `kubectl` commands — all identical. That's the whole point of Kubernetes: **portability**. What works locally works in the cloud.

### Everything — Practically

- **More capacity**: 3 dedicated cloud nodes vs. 1 laptop node
- **Better performance**: Services start faster, less resource contention
- **External accessibility**: Cloud load balancers provide real public IPs
- **Higher reliability**: If a node fails, Kubernetes reschedules pods on remaining nodes

---

## Deployment Timeline

Expect the deployment to take **5-10 minutes** for everything to stabilize. The cloud nodes have more resources than your laptop, but there are also more components starting up simultaneously (Keycloak, Kafka, multiple microservices).

Monitor progress through:
- Google Cloud Console's Kubernetes workloads page
- `kubectl get pods --watch`
- `helm ls` to verify all releases are installed

---

## The Complete Installation Order

For reference, here's the full installation sequence:

| Order | Component | Helm Command |
|-------|-----------|-------------|
| 0 | Discovery Server | `kubectl apply -f kubernetes-discoveryserver.yaml` |
| 1 | Keycloak | `helm install keycloak keycloak` |
| 2 | Kafka | `helm install kafka kafka` |
| 3 | Prometheus | `helm install prometheus kube-prometheus` |
| 4 | Loki | `helm install loki grafana-loki` |
| 5 | Tempo | `helm install tempo grafana-tempo` |
| 6 | Grafana | `helm install grafana grafana` |
| 7 | Microservices | `helm install easybank prod-env` |

The order matters — Keycloak and Kafka should be healthy before the microservices try to connect to them.

---

## ✅ Key Takeaways

- Deploying to a cloud Kubernetes cluster uses the **exact same** commands, charts, and manifests as local deployment
- Install the Discovery Server first with `kubectl apply`, then supporting components via Helm, then microservices
- Cloud clusters have more capacity and reliability than local clusters
- Network timeouts may occur — refresh your cloud credentials if `kubectl` commands fail
- Always verify installations with `kubectl get pods` and `helm ls`
- Validation and testing happen in the next lecture once all pods are running

## ⚠️ Common Mistake

Forgetting to switch your Kubernetes context back to the cloud cluster. If you were testing locally, your context might still point to Docker Desktop. Always verify with `kubectl config current-context` or `kubectl get nodes` (3 nodes = cloud, 1 node = local) before deploying.

## 💡 Pro Tip

After you're done exploring the cloud deployment, **delete the Kubernetes cluster immediately** from the Google Cloud Console. The cluster costs $0.24/hour — leaving it running overnight burns through your free credits fast. You can always recreate it later.
