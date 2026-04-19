# How Client-Side Service Discovery and Load Balancing Works

## Introduction

We've established the *why* behind service discovery. Now let's dig deep into *how* it works — specifically the **client-side** approach. This is where the calling microservice takes responsibility for discovering instances and balancing load across them. Understanding this flow is essential before we implement it.

---

## The Step-by-Step Flow

Let's walk through a concrete scenario: Accounts microservice wants to call Loans microservice.

### Step 1: Service Registry is Running

Before any microservice starts, the **service registry** (a separate centralized server) must be up and running. It's the phone book — it needs to exist before anyone can look up numbers.

### Step 2: Microservices Register During Startup

When Loans microservice starts (say, two instances), each instance connects to the service registry and registers:
- Instance 1: IP = `192.168.1.10`, Port = `8090`
- Instance 2: IP = `192.168.1.11`, Port = `8090`

Both instances also begin sending **heartbeat signals** at regular intervals (default: every 30 seconds).

### Step 3: Client Queries the Registry (Service Discovery)

Accounts microservice needs to call Loans. It sends a request to the service registry:
> "Give me all healthy instances of the Loans service."

The registry responds with the list of IPs and ports.

### Step 4: Client-Side Load Balancing

Accounts now has multiple IP addresses. It applies a **load balancing algorithm** (e.g., round robin) and picks one instance to send the request to.

### Step 5: Actual Invocation

Accounts calls the selected Loans instance directly using the IP and port from the registry.

### ❓ Why is this called "client-side"?

Because the **client** (Accounts — the one making the call) is responsible for both discovering services AND choosing which instance to call. The registry just provides information; it doesn't route traffic.

---

## Caching: Reducing Registry Load

### ❓ What if 100 microservices each query the registry for every single request?

That would crush the registry. So here's the optimization:

1. **First request**: Accounts queries the registry and gets Loans instance details
2. **Cache**: Accounts stores these details in local memory
3. **Subsequent requests**: Accounts uses the cached details — no registry call needed
4. **Cache refresh**: Every 10-30 seconds (configurable), the cache is refreshed with the latest data
5. **Error-triggered refresh**: If a cached IP fails (connection error), the cache is immediately invalidated and fresh data is fetched

This is brilliant because:
- Normal operation = no registry load
- Changes are picked up within seconds
- Failures trigger immediate refresh

---

## The Service Discovery Layer

In production, you don't run a single registry server — you run multiple **service discovery nodes** forming a **service discovery layer**.

### Gossip Protocol

These nodes communicate with each other using a **gossip protocol**. When one node receives a registration, it immediately shares it with all other nodes. This ensures:
- All nodes have the same, up-to-date information
- No single point of failure
- Any node can answer discovery queries

### Logical Names

Microservices don't need to know which specific registry node to call. They use **logical service names** (like `loans` or `cards`), and the service discovery layer resolves them to actual IP addresses.

```
accounts → "I need loans service" → Service Discovery Layer → [192.168.1.10, 192.168.1.11]
```

---

## Advantages and Drawbacks

### ✅ Advantages

- **Flexible load balancing** — you can use round robin, weighted round robin, least connections, or custom algorithms
- **No manual IP management** — everything is automatic
- **Fault tolerant** — caching + automatic refresh handles failures gracefully
- **Scalable** — multiple discovery nodes prevent bottlenecks

### ⚠️ Drawbacks

- **More developer responsibility** — microservices need code to interact with the registry and perform load balancing
- **Extra infrastructure** — you need to maintain the service registry servers

### The Server-Side Alternative

In Kubernetes environments, the platform itself handles discovery and load balancing (server-side approach). No extra code needed in microservices, but it requires Kubernetes infrastructure + a dedicated ops team + budget.

---

## ✅ Key Takeaways

- In client-side discovery, the **calling microservice** is responsible for querying the registry and load balancing
- Instance details are **cached locally** to reduce registry load, with periodic refreshes
- Multiple registry nodes use the **gossip protocol** to stay synchronized
- Microservices use **logical service names**, not raw IP addresses
- Client-side caching + error-triggered invalidation ensures both performance and accuracy
- Client-side = more developer control; Server-side (Kubernetes) = more infrastructure dependency

## 💡 Pro Tip

When choosing between client-side and server-side discovery, consider your team's capabilities and budget. If you can afford Kubernetes, server-side is simpler for developers. If not, Spring Cloud makes client-side discovery remarkably easy to implement.
