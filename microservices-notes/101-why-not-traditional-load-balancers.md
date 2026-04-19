# Why Traditional Load Balancers Don't Work for Microservices

## Introduction

Before we jump into the modern solution, let's first understand *why the traditional approach fails*. If you've worked with monolithic applications, you've probably seen traditional load balancers in action. They work beautifully — in that world. But in the microservices world? They fall apart. Understanding why gives you a much deeper appreciation for service discovery.

---

## The Traditional Approach: Hardcoded IPs and DNS

In a simple scenario with one Accounts instance and one Loans instance, communication is straightforward:

- **Option 1:** Hardcode the IP address of Loans inside Accounts
- **Option 2:** Use a DNS name that maps to the IP address

### The DNS Approach

DNS works well for stable environments:
1. Map a domain name (e.g., `loans.easybank.internal`) to the Loans IP address
2. Accounts calls the DNS name instead of the raw IP
3. If Loans moves to a new server, update the DNS mapping — no code changes needed

This is perfectly fine when you have **one IP per service** and servers are **long-running and stable**.

### ❓ What breaks in microservices?

When you scale Loans to five instances, each with its own IP, someone has to maintain mappings for *all* of them. And when containers are created and destroyed every few minutes? Keeping DNS records accurate becomes an **impossible task**.

---

## How Traditional Load Balancers Work

In a traditional setup:

```
Client → DNS → Primary Load Balancer → Routing Table → Actual Service
                       ↕
              Secondary Load Balancer (backup)
```

- Clients call a DNS name (e.g., `services.easybank.com`)
- A load balancer checks routing tables to find the right IP
- Traffic is forwarded to the service
- A secondary (backup) load balancer exists in case the primary goes down

### The Routing Table Problem

Someone must **manually configure** the routing table with IP addresses. In a monolithic world with a handful of long-running servers, this is manageable. In microservices with dozens of services and dynamic container IPs? It's a nightmare.

---

## Why Traditional Load Balancers Fail for Microservices

### 1. Limited Horizontal Scalability

Traditional load balancers require manual routing table updates. You can't dynamically add or remove instances without someone (or something) updating these tables. This kills auto-scaling.

Plus, traditional load balancers from cloud providers come with **licensing costs** that add up.

### 2. Single Point of Failure

Even with a secondary backup, what if both fail? Traditional load balancers don't scale horizontally like a cluster. All incoming traffic gets choked at one centralized point.

### 3. Manual IP Management

This is the biggest problem. Containers are **ephemeral** — short-lived and disposable. They can spin up or shut down at any moment. Manually tracking their IP addresses in routing tables is simply not feasible.

### 4. Not Container-Friendly

Traditional load balancers were designed for physical servers and long-running VMs. Docker containers have fundamentally different lifecycle characteristics that these load balancers can't handle.

---

## The Core Issue: Ephemeral Nature of Containers

The word **ephemeral** captures everything:

> Containers are short-lived. They are created, serve their purpose, and can be destroyed at any point.

In monolithic apps, servers run for months or years with static IPs. In microservices:
- A health check fails → container is killed and replaced
- Traffic spikes → new containers are spun up
- Deployment happens → old containers are replaced with new ones

Each event creates new containers with new IP addresses. No manual process can keep up.

---

## ✅ Key Takeaways

- Traditional load balancers rely on **manually maintained routing tables** — impractical for dynamic container environments
- DNS-based approaches work for stable, long-running servers but not for ephemeral containers
- Containers are **ephemeral** — they can be created or destroyed at any moment, making IP management impossible
- Traditional load balancers introduce **single points of failure** and **licensing costs**
- We need a fundamentally different approach for microservices: **service discovery**

## ⚠️ Common Mistakes

- Trying to use traditional load balancers with containerized microservices — it creates an operational burden that doesn't scale
- Hardcoding IP addresses between services — this breaks the moment anything changes

## 💡 Pro Tip

Understanding *why* the old approach fails makes the new approach (service discovery + client-side load balancing) feel obvious rather than complex. Always learn the "why" before the "how."
