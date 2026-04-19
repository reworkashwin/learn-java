# Kubernetes Service Types — ClusterIP, NodePort, and LoadBalancer

## Introduction

So far, we've exposed every microservice using `LoadBalancer`. But should all your microservices be publicly accessible? Absolutely not. Only the Gateway Server should face the outside world — everything else should be internal. To control this, you need to understand the three main **Service types** in Kubernetes.

---

## The Three Service Types

| Service Type | External Access | Internal Access | Use Case |
|-------------|----------------|-----------------|----------|
| **ClusterIP** | ❌ No | ✅ Yes | Internal microservices |
| **NodePort** | ✅ Yes (via node IP + port) | ✅ Yes | Testing / legacy |
| **LoadBalancer** | ✅ Yes (via public IP) | ✅ Yes | Public-facing services |

---

## 1. ClusterIP — Internal Communication Only

This is the **default** Service type. If you don't specify a type, Kubernetes uses ClusterIP.

### How It Works

Kubernetes assigns an **internal IP address** that's only reachable from within the cluster. External clients get nothing — the IP is meaningless outside the cluster.

```yaml
spec:
  selector:
    app: accounts
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 8080
```

In this example:
- The container starts at port **8080** inside the Pod
- Other services within the cluster access it at port **80** using either the ClusterIP or the **service name** (e.g., `http://accounts:80`)
- External requests? **Blocked.** The cluster does not expose this service.

### Load Balancing with ClusterIP

If you have 2 replicas of accounts (in two different Pods, possibly on two different worker nodes), Kubernetes **automatically load-balances** internal requests between them. The calling service just uses `http://accounts:80` — it doesn't need to know which Pod or which node serves the request.

### When to Use

Use ClusterIP for **every microservice that shouldn't be directly accessed from outside** — accounts, loans, cards, Eureka, Config Server. Only clients inside the cluster should reach these services.

---

## 2. NodePort — External Access via Worker Node Port

NodePort exposes your service on a specific port (range **30000–32767**) on every worker node.

### How It Works

```yaml
spec:
  selector:
    app: accounts
  type: NodePort
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 32593      # Optional — auto-generated if omitted
```

The traffic flow:
1. External client sends request to `<worker-node-IP>:32593`
2. NodePort receives it and forwards to ClusterIP at port 80
3. ClusterIP load-balances to the appropriate Pod at port 8080

### The Problem with NodePort

External clients must know the **IP address of specific worker nodes**. If a node goes down and Kubernetes replaces it, the IP changes — and all clients break. This makes NodePort unreliable for production use.

### When to Use

Rarely. NodePort is mainly used for quick testing or legacy setups. Most teams skip it entirely in favor of LoadBalancer.

---

## 3. LoadBalancer — Production-Grade External Access

LoadBalancer builds on top of NodePort but adds a **stable public IP or DNS name** that never changes.

### How It Works

```yaml
spec:
  selector:
    app: gateway
  type: LoadBalancer
  ports:
    - port: 8072
      targetPort: 8072
```

The traffic flow:
1. External client sends request to the **LoadBalancer's public IP** (or domain name)
2. LoadBalancer routes to the appropriate **NodePort** on a healthy worker node
3. NodePort forwards to the **ClusterIP**
4. ClusterIP delivers to the right **Pod**

### Why LoadBalancer Wins

- **Stable endpoint** — the public IP doesn't change, regardless of what happens to worker nodes internally
- **Automatic tracking** — the LoadBalancer automatically knows about new/removed worker nodes and replica changes
- **Map to a domain** — point your DNS at the LoadBalancer IP for a clean URL

### The Cost Problem

In cloud environments, each LoadBalancer-type Service creates an **actual cloud LoadBalancer** with a public IP — and **that costs money**. If you have 100 microservices all set to LoadBalancer, you're paying for 100 cloud load balancers. That's why only your Gateway Server should use LoadBalancer; everything else should use ClusterIP.

---

## The Layered Architecture

These service types are actually **layered on top of each other**:

```
LoadBalancer (public IP, stable endpoint)
    └── NodePort (port on each worker node)
        └── ClusterIP (internal IP, pod load balancing)
            └── Pod (running container)
```

Each higher layer adds more exposure:
- **ClusterIP** — internal only
- **NodePort** — adds external access via node ports
- **LoadBalancer** — adds a stable public endpoint on top of everything

---

## The Right Architecture

For a microservice network:
- **Gateway Server** → `LoadBalancer` (the only public entry point)
- **Everything else** (Accounts, Loans, Cards, Eureka, Config Server) → `ClusterIP` (internal only)

This provides **security** (no direct access to internal services) and **cost savings** (only one cloud load balancer).

---

## ✅ Key Takeaways

- **ClusterIP** — default type, internal-only traffic, automatic load balancing between pods
- **NodePort** — exposes services on worker node IPs (ports 30000–32767) — unreliable for production
- **LoadBalancer** — stable public IP, ideal for production-facing services, but each one costs money in the cloud
- Service types are **layered**: LoadBalancer → NodePort → ClusterIP → Pod
- Only expose the **Gateway Server** as LoadBalancer; everything else should be ClusterIP
- Two reasons to avoid LoadBalancer for all services: **security** and **cost**

---

## ⚠️ Common Mistake

Exposing every microservice with `LoadBalancer` type. This is a security risk (bypasses the Gateway) and a financial waste (each LoadBalancer creates a billing entry in cloud environments). Use ClusterIP for internal services.
