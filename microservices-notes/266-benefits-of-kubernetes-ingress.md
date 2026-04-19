# Benefits of Kubernetes Ingress & Traffic Types

## Introduction

We know what Ingress is and how it works. But why would an organization choose it? What specific benefits does it bring? And what do those jargon terms — "ingress traffic," "egress traffic," "north-south" — actually mean? This section covers benefits, capabilities, and the vocabulary you need for real-world microservices discussions.

---

## Benefits of Kubernetes Ingress

### 1. Single Entry Point

Ingress provides one unified entry point for all external traffic into your Kubernetes cluster. Instead of managing multiple public IPs (one per LoadBalancer service), you have one gateway that routes to the correct backend.

This simplifies external access management dramatically.

### 2. TLS/SSL Termination

When data travels from a client to your server over the internet, it must be **encrypted** (HTTPS). But continuing HTTPS encryption *inside* the cluster is wasteful — no hacker can reach your internal services directly.

**TLS termination** means:
- Traffic enters the cluster as HTTPS (encrypted)
- At the Ingress layer, HTTPS is converted to HTTP (unencrypted)
- Internal traffic runs as plain HTTP (faster)

This avoids the performance overhead of encryption within a secured cluster boundary.

### 3. Path-Based Routing

Route based on URL paths:
- `example.com/accounts` → accounts service
- `example.com/loans` → loans service
- `example.com/cards` → cards service

### 4. Host-Based Routing

Route based on subdomains:
- `accounts.example.com` → accounts service
- `loans.example.com` → loans service

### 5. Load Balancing

Ingress distributes traffic among multiple pods of the same service automatically through the ClusterIP service behind it.

### 6. Annotations for Custom Behavior

Using annotations, you can configure:
- URL rewriting rules
- Custom headers
- Authentication/authorization integration (e.g., Keycloak, Okta)
- Rate limiting
- CORS policies

---

## Ingress vs. LoadBalancer: When to Use Which?

| Criteria | LoadBalancer | Ingress |
|---|---|---|
| **Complexity** | Simple | More complex setup |
| **Routing** | One service per IP | Path/host-based routing |
| **Cost** | One LB per service (expensive) | One entry point (cost-effective) |
| **TLS termination** | Per service | Centralized |
| **Best for** | Small setups, few services | Production, many services |

If your organization has a limited number of low-criticality microservices, LoadBalancer is fine. For anything production-grade, Ingress is the standard.

---

## Traffic Jargon: What You Need to Know

These terms come up constantly in microservices discussions. Know them.

### Ingress Traffic

Any traffic **entering** the Kubernetes cluster from outside.

### Egress Traffic

Any traffic **leaving** the Kubernetes cluster to external systems.

### North-South Traffic

A combined term for ingress + egress traffic — data flowing in and out of the cluster. Ingress/Ingress Controllers handle this.

### East-West Traffic

Traffic flowing **between microservices** inside the cluster. This is NOT handled by Ingress — it's handled by **Service Mesh** (covered next).

> Think of a compass: North-South = external (in/out), East-West = internal (side to side).

---

## ✅ Key Takeaways

- Ingress provides a **single entry point**, **TLS termination**, **path/host routing**, and **load balancing**
- **TLS termination** improves performance by stopping encryption at the cluster boundary
- **Annotations** enable advanced features like auth integration and URL rewriting
- Use **LoadBalancer** for simple setups; use **Ingress** for production-grade deployments
- **North-South traffic** = external (handled by Ingress); **East-West traffic** = internal (handled by Service Mesh)
- Everything Ingress can do, Spring Cloud Gateway can also do — and vice versa

---

## 💡 Pro Tip

In interviews, if asked "How do you handle external traffic into your Kubernetes cluster?", mention both Ingress and Spring Cloud Gateway, explain the trade-offs, and note which one your organization uses. This shows production maturity and awareness of the DevOps perspective.
