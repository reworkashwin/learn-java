# Demo: Client-Side Service Discovery and Load Balancing

## Introduction

So far, we've tested Eureka with single instances of each microservice. But the whole point of service discovery and load balancing is to handle **multiple instances**. How do we actually *see* load balancing in action? Let's spin up two instances of the loans microservice and watch the magic happen.

---

## Setting Up Multiple Instances in Docker Compose

### ⚙️ How to Create a Second Instance

In Docker Compose, each service must have a **unique service name** and **unique container name**. To add a second loans instance, duplicate the loans service config with different names:

```yaml
loans:
  image: eazybytes/loans:s8
  container_name: loans-ms
  ports:
    - "8090:8090"
  # ... rest of config

loans1:
  image: eazybytes/loans:s8
  container_name: loans-ms1
  ports:
    - "8091:8090"
  # ... rest of config (same as above)
```

Key changes for the second instance:
- Service name: `loans1` (must be unique)
- Container name: `loans-ms1` (must be unique)
- Port mapping: `8091:8090` (different host port to avoid conflicts)

---

## Verifying Registration

After running `docker compose up -d`, check the Eureka dashboard at `http://localhost:8070`.

You should see:
- **ACCOUNTS** — 1 instance
- **CARDS** — 1 instance
- **LOANS** — 2 instances (shown with "(2)" in the dashboard)

You can also verify at `http://localhost:8070/eureka/apps` — under the LOANS section, you'll see two separate instance entries with different hostnames.

---

## Observing Load Balancing in Action

### 🧠 The Clever Test Setup

Here's the trick: since each loans instance uses its own **H2 in-memory database**, data created on one instance doesn't exist on the other.

1. Create loan data using port `8090` (hits instance 1)
2. **Don't** create loan data on port `8091` (instance 2 has no data)
3. Now call `fetchCustomerDetails` through the accounts microservice

### ⚙️ What Happens

Each time you call `fetchCustomerDetails`, the Feign Client in accounts uses Spring Cloud Load Balancer to pick a loans instance:

- **Request hits Instance 1** (port 8090) → ✅ Success — returns loan data
- **Request hits Instance 2** (port 8091) → ❌ Error — "Loan not found"
- **Next request hits Instance 1** → ✅ Success
- **Next request hits Instance 2** → ❌ Error

The alternating success/failure pattern **proves** that load balancing is happening. The requests are being distributed across both instances in a round-robin fashion.

### 💡 In Production

In a real application, all instances would share the same database (MySQL, PostgreSQL, etc.), so data would be available on every instance. The alternating error pattern is just a testing artifact of using separate H2 databases.

---

## The Load Balancing Flow

```
Client → Accounts Microservice → Feign Client
         ↓
         Eureka: "Give me loans instances"
         ↓
         Eureka: "Here: Instance1 (8090), Instance2 (8091)"
         ↓
         Spring Cloud Load Balancer picks one
         ↓
         Request forwarded to selected instance
```

The **OpenFeign Client Library** handles this automatically. No code changes needed — just having multiple instances registered with Eureka is enough.

---

## Resource Considerations

Running many containers locally is resource-intensive. In this demo, CPU usage spiked to ~498% across 5 cores. For local testing:
- Keep instance counts low
- Close unnecessary applications
- Give Docker enough memory allocation

---

## ✅ Key Takeaways

- To run multiple instances in Docker Compose, duplicate the service config with unique names, container names, and port mappings
- Load balancing happens automatically when multiple instances register with Eureka
- Spring Cloud Load Balancer (used by Feign) distributes requests across available instances
- You can verify load balancing by observing request distribution patterns
- Server-side load balancing (with Kubernetes) will be covered later

## 💡 Pro Tip

The reason accounts microservice doesn't need code changes for load balancing is that Feign Client + Spring Cloud Load Balancer handle it transparently. Your `LoansFeignClient` interface stays the same whether there's 1 instance or 100 — the framework picks the right one.
