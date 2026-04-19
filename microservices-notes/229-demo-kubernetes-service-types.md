# Demo of Kubernetes Service Types

## Introduction

We've covered the theory behind ClusterIP, NodePort, and LoadBalancer. Now let's see them in action — switching between service types for the accounts microservice and observing exactly how access changes.

---

## Current State: LoadBalancer

Check all services:

```bash
kubectl get services
```

All microservices currently have `type: LoadBalancer` with `EXTERNAL-IP: localhost` (since it's a local cluster). Each has a randomly assigned NodePort behind the scenes.

Access the accounts API in the browser:

```
http://localhost:8080/api/contact-info
```

Result: **Successful response** — the service is publicly accessible through the LoadBalancer.

### How the Request Flows

```
Browser → LoadBalancer (localhost:8080)
    → NodePort (30175)
        → ClusterIP (internal IP)
            → Pod (accounts container)
```

---

## Switching to ClusterIP

Update `accounts.yaml` to use ClusterIP:

```yaml
spec:
  type: ClusterIP
```

Apply the change:
```bash
kubectl apply -f 5_accounts.yaml
```

Check services:
```bash
kubectl get services
```

Accounts now shows `ClusterIP` as the type, with **no external IP** (`EXTERNAL-IP: <none>`).

### Testing Access

Try the same URL in the browser:
```
http://localhost:8080/api/contact-info
```

Result: **"This site can't be reached"** — the service is completely blocked from external access. It can only be reached by other services within the Kubernetes cluster using the service name `accounts` at port `8080`.

---

## Switching to NodePort

Update `accounts.yaml`:

```yaml
spec:
  type: NodePort
```

No need to specify a `nodePort` value — Kubernetes auto-generates one (e.g., `31182`).

Apply:
```bash
kubectl apply -f 5_accounts.yaml
```

Check services:
```bash
kubectl get services
```

Accounts now shows `NodePort` type, exposed at a randomly generated port like `31182`.

### Testing Access

Try the original port:
```
http://localhost:8080/api/contact-info
```
Result: **Fails** — port 8080 isn't directly exposed in NodePort mode.

Try the NodePort:
```
http://localhost:31182/api/contact-info
```
Result: **Success** — the service is accessible through the NodePort.

The problem? If the worker node changes, the IP changes, and clients break. That's why NodePort isn't suitable for production.

---

## Summary of Behavior

| Service Type | `localhost:8080` | `localhost:31182` (NodePort) | Internal (`accounts:8080`) |
|-------------|:---:|:---:|:---:|
| **LoadBalancer** | ✅ | ✅ (auto-assigned) | ✅ |
| **ClusterIP** | ❌ | ❌ | ✅ |
| **NodePort** | ❌ | ✅ | ✅ |

---

## Two Reasons to Avoid LoadBalancer for All Services

1. **Security** — All client traffic should flow through the Gateway Server (edge server). Exposing individual microservices bypasses authentication and authorization.

2. **Cost** — In cloud environments, each LoadBalancer-type Service provisions a real cloud load balancer with a **public IP address**. Public IPs aren't free. With 100 microservices, that's 100 load balancers — a significant recurring cost.

---

## What We'll Do Later

When we revisit deployment with Helm charts in the next section, we'll:
- Set **Gateway Server** → `LoadBalancer` (the only public entry point)
- Set **everything else** → `ClusterIP` (internal only)

For now, we keep LoadBalancer everywhere for learning convenience.

---

## ✅ Key Takeaways

- **LoadBalancer**: accessible at the exposed port (e.g., 8080) from outside — production-ready with stable IP
- **ClusterIP**: completely blocks external traffic — only reachable inside the cluster
- **NodePort**: accessible only through the auto-assigned port (30000–32767 range) — fragile for production
- Switching between types is as simple as changing `type` in the YAML and running `kubectl apply`
- In production: **only the Gateway uses LoadBalancer**, everything else uses **ClusterIP**

---

## 💡 Pro Tip

When debugging connectivity issues in Kubernetes, always check the service type first with `kubectl get services`. If your service is ClusterIP but you're trying to access it from outside the cluster, that's your problem — not a bug.
