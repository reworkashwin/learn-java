# Introduction to Server-Side Service Discovery and Load Balancing

## Introduction

Remember Eureka Server? We set it up as our service registry, and all microservices had to register themselves, send heartbeats, and handle client-side load balancing. It worked — but it put a lot of burden on developers. Now that we're in the Kubernetes world, there's a smarter approach: **server-side service discovery and load balancing**. Let's understand what it is, why it exists, and how it changes the game.

---

## Client-Side Discovery Recap (Eureka Approach)

Before we appreciate the new approach, let's recall what we were doing:

1. **Startup**: Every microservice registers itself with Eureka Server (hostname, port, instance details)
2. **Heartbeats**: Each service sends regular heartbeats to prove it's alive
3. **Shutdown**: Each service must unregister itself
4. **Communication**: When Accounts wants to talk to Loans, it first asks Eureka for the list of Loans instances
5. **Load Balancing**: Accounts receives multiple instance addresses and uses **Spring Cloud Load Balancer** to decide which one to call

So the **client** (Accounts) is responsible for discovering services and performing load balancing. Hence the name: client-side discovery and client-side load balancing.

### Disadvantages of This Approach

- Developers must manually maintain the Eureka Server (create a Spring Boot app, configure it as Eureka Server)
- Every microservice needs Eureka client configuration
- Every service must handle registration, heartbeats, and deregistration
- That's a lot of boilerplate and maintenance overhead

### Advantage

- The client application has **complete control** over load balancing strategies through Spring Cloud Load Balancer

---

## Server-Side Discovery and Load Balancing

Now here's the question: if we're already deploying microservices into Kubernetes, why should each service bother registering with a separate discovery server? Kubernetes *already knows* about every pod running in the cluster. Can't it handle discovery for us?

That's exactly the idea behind server-side service discovery.

### How It Works

```
Step 1: Discovery Server monitors all pods
   └── Uses Kubernetes APIs to fetch service/endpoint details
   └── No explicit registration needed from microservices!

Step 2: Client sends request to Kubernetes Service URL
   └── e.g., http://loans:8090/api/fetch

Step 3: Kubernetes Service + Discovery Server decide load balancing
   └── They pick an appropriate instance

Step 4: Request is forwarded to the selected pod
```

The critical difference: **microservices don't register themselves**. The Discovery Server proactively queries the Kubernetes API to know what's running. And the load balancing happens at the **server side** — inside the Kubernetes cluster — not at the client.

### The Client's Perspective

From the Accounts microservice's viewpoint, life becomes much simpler:
- No Eureka dependency
- No registration code
- No heartbeat configuration
- Just send requests to the service name (e.g., `http://loans:8090`)
- Kubernetes handles the rest

---

## Comparing the Two Approaches

| Aspect | Client-Side (Eureka) | Server-Side (Kubernetes) |
|--------|---------------------|-------------------------|
| Registration | Services must register explicitly | Discovery Server fetches from K8s API |
| Heartbeats | Required from every service | Not needed |
| Load Balancing | Done by client using Spring Cloud LB | Done by Kubernetes internally |
| Developer Effort | High (configure Eureka, LB, etc.) | Low (just use service URLs) |
| Control over LB | Full control on strategy | No control — K8s decides |
| Extra Server | Eureka Server must be maintained | Discovery Server deployed once |
| Prerequisite | Works anywhere | Requires Kubernetes cluster |

### When to Use Which?

- **Server-side** (Kubernetes): When you're already on Kubernetes and want minimal developer overhead. This is the common choice for production K8s deployments.
- **Client-side** (Eureka): When you need fine-grained control over load balancing strategies, or when you're not using Kubernetes.

Neither is inherently better — it depends on your deployment environment and requirements.

---

## Critical Constraint

Server-side service discovery and load balancing **only works if you're using Kubernetes**. If your microservices run on VMs, bare metal, or Docker Compose without Kubernetes, you cannot use this approach. You'd need Eureka or a similar client-side solution.

---

## ✅ Key Takeaways

- Server-side discovery removes the burden of service registration, heartbeats, and client-side load balancing from developers
- The Discovery Server uses Kubernetes APIs to track running services — no explicit registration needed
- Load balancing happens inside the Kubernetes cluster, not at the client
- The trade-off: you lose control over load balancing strategies
- This approach **requires Kubernetes** — it's not available for non-K8s deployments
- In the upcoming lectures, we'll implement this by replacing Eureka Server with Kubernetes Discovery Server using Spring Cloud Kubernetes

## ⚠️ Common Mistake

Don't think of server-side discovery as "better" than client-side. They're different tools for different situations. If your team needs custom load balancing strategies (weighted, zone-aware, etc.), client-side with Eureka gives you that control.
