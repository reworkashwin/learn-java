# Service Discovery and Registration: The Pattern

## Introduction

We've seen why traditional load balancers fail for microservices. Now let's explore the solution — the **service discovery pattern**. This pattern elegantly addresses the dynamic nature of cloud-native applications by introducing a central registry where services announce themselves and find each other.

---

## What is the Service Discovery Pattern?

At its core, the service discovery pattern involves:

1. **A centralized server** (the Service Registry) that maintains a global view of all running service instances
2. **Microservices that register** their details (IP, port, hostname) when they start
3. **Microservices that deregister** when they shut down or become unhealthy
4. **Other microservices that query** the registry to discover backing services

Think of it as a phone directory that updates itself in real time. When a new restaurant opens, it adds itself to the directory. When it closes, it removes itself. And when you're hungry, you look up the directory to find options.

---

## The Three Pillars

### 1. Service Registration

When a microservice instance starts, it connects to the central server and says:
> "Hey, I'm the Loans microservice. My IP is 192.168.1.42, and I'm running on port 8090."

If five instances of Loans start, all five register independently. The registry now knows about all five.

### 2. Service Discovery

When Accounts needs to call Loans, it asks the registry:
> "What are the current addresses for the Loans service?"

The registry responds with all known healthy instances.

### 3. Load Balancing

With multiple instance addresses in hand, a load balancing strategy distributes requests across them, ensuring no single instance is overwhelmed.

---

## Two Approaches to Service Discovery

### Client-Side Service Discovery

The **client microservice** (e.g., Accounts) is responsible for:
- Querying the registry
- Choosing which instance to call (load balancing)
- Making the actual request

This is what we'll implement in this section.

### Server-Side Service Discovery

The **infrastructure** (e.g., Kubernetes) handles discovery and load balancing. The microservice just makes a request to a logical name, and the platform routes it to the right instance.

This approach is covered later when deploying to Kubernetes.

---

## Components of the Centralized Server

The service discovery server (service registry) is responsible for:

1. **Storing instance details** — IP addresses, ports, health status for all registered microservices
2. **Accepting registrations** — new instances connect and register during startup
3. **Handling deregistrations** — instances remove themselves during shutdown
4. **Monitoring heartbeats** — if an instance stops sending heartbeats, the registry assumes it's unhealthy and removes its details
5. **Responding to discovery queries** — returning the list of healthy instances for a given service name

### The Heartbeat Mechanism

After registering, each microservice sends regular **heartbeat signals** to the registry. If the registry stops receiving heartbeats from an instance, it automatically removes that instance from the registry.

This is how the system handles crashed containers — no manual intervention needed.

---

## ✅ Key Takeaways

- The **service discovery pattern** uses a centralized registry where microservices register and discover each other
- Three pillars: **registration** (during startup), **deregistration** (during shutdown), **heartbeats** (ongoing health confirmation)
- **Client-side** discovery puts load balancing responsibility on the calling service
- **Server-side** discovery delegates it to the infrastructure (Kubernetes)
- Heartbeats ensure the registry only contains **healthy, active** instances
- No more manual IP management — everything is automated

## 💡 Pro Tip

The service registry is similar in concept to the Config Server — both are centralized infrastructure components. Config Server centralizes configuration; the service registry centralizes service location information.
