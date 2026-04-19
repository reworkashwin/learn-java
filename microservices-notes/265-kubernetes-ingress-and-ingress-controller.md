# Deep Dive: Kubernetes Ingress & Ingress Controller

## Introduction

We know Ingress acts as a single entry point for your Kubernetes cluster. But how does it actually work? What does the configuration look like? And what's the difference between an **Ingress resource** and an **Ingress Controller**? This section covers the mechanics, the traffic flow, and when to choose Ingress over Spring Cloud Gateway.

---

## LoadBalancer vs. Ingress: The Core Difference

Let's make this crystal clear with an example:

**With LoadBalancer service type:**
- 5 microservices = 5 public IPs = 5 cloud load balancers
- Each microservice gets its own external endpoint
- Expensive and hard to manage

**With Ingress:**
- 5 microservices = 1 entry point with routing rules
- One central configuration decides where traffic goes
- Cost-effective and centrally managed

---

## Spring Cloud Gateway vs. Kubernetes Ingress

Both do the same job — act as an edge server. So why do both exist?

### When organizations choose Spring Cloud Gateway:
- They have talented **developers** who can build custom routing logic in Java
- They need **custom business logic** in the edge layer (something Ingress can't do)
- They want full control at the application code level

### When organizations choose Kubernetes Ingress:
- They have a strong **DevOps team** skilled in Kubernetes
- They prefer infrastructure-level configuration over application code
- They want to keep developers focused purely on business logic

> Neither approach is "better" — it depends on your team structure and technical capabilities. The project architect or leadership makes this call.

---

## Ingress Resource Configuration

An Ingress resource is a YAML manifest that defines routing rules:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: eazybank-ingress
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /accounts
            backend:
              service:
                name: accounts-service
                port:
                  number: 80
          - path: /loans
            backend:
              service:
                name: loans-service
                port:
                  number: 80
```

Key observations:
- `kind: Ingress` — tells Kubernetes this is an Ingress resource
- `rules` define hostname + path → backend service mappings
- Each path routes to a specific **ClusterIP service** inside the cluster

---

## Ingress Controller: The Engine Behind the Rules

Here's the crucial distinction:

- **Ingress resource** = the configuration (what you want)
- **Ingress Controller** = the component that implements it (how it happens)

An Ingress resource **does nothing** on its own. You need an Ingress Controller installed in your cluster to watch for Ingress resources and configure the network accordingly.

### Popular Ingress Controllers

| Controller | Notes |
|---|---|
| **NGINX Ingress** | Most commonly used, open-source |
| **Traefik** | Popular for its auto-discovery features |
| **HAProxy** | Known for performance |
| **AWS ALB Ingress** | Integrates with AWS Load Balancers |

The official Kubernetes documentation lists **30+ supported controllers**. Your Kubernetes admin selects one based on organizational requirements.

---

## Traffic Flow with Ingress

Here's how a request flows through the system:

```
External Client
    ↓
Ingress-Managed Load Balancer
    ↓
Ingress Controller (may have multiple instances)
    ↓
ClusterIP Service (accounts-service, loans-service, etc.)
    ↓
Pod → Container (your actual microservice)
```

1. External client sends request to `example.com/accounts`
2. The Ingress-managed load balancer receives it
3. It forwards to one of the Ingress Controller instances
4. The controller matches the path `/accounts` to the `accounts-service`
5. The ClusterIP service routes to a pod
6. The pod's container processes the request

This is architecturally identical to the Spring Cloud Gateway approach — just managed at the infrastructure level instead of the application level.

---

## ✅ Key Takeaways

- **Ingress resource** defines routing rules; **Ingress Controller** implements them
- Without a controller, Ingress configurations do nothing
- NGINX is the most popular open-source Ingress Controller
- Spring Cloud Gateway and Ingress are functionally equivalent — the choice depends on team skills
- Spring Cloud Gateway offers more flexibility for custom Java business logic
- All backend services behind Ingress use **ClusterIP** — they're never exposed directly

---

## ⚠️ Common Mistakes

- Confusing **Ingress resource** with **Ingress Controller** — they're different things
- Assuming Ingress replaces Spring Cloud Gateway entirely — sometimes you need both
- Thinking developers need to set up Ingress — it's a DevOps responsibility
