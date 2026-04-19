# Demo of Server-Side Service Discovery and Load Balancing

## Introduction

Everything is configured — the Discovery Server is running, our microservices are updated, and the Helm charts are deployed. Two replicas of the Accounts service are running, each with its own in-memory H2 database. Now it's time to see server-side service discovery and load balancing in action.

---

## The Test Plan

The strategy is clever:

1. **Create** an account via the Gateway Server (it goes to one of the two Accounts pods)
2. **Fetch** the same account repeatedly — at some point, Kubernetes will route the request to the *other* pod, which doesn't have that account in its H2 database
3. When we get a "not found" error, it **proves** load balancing is working — the request went to a different instance

---

## Testing Steps

### Step 1: Get an Access Token

Since the Gateway Server still has Keycloak security enabled, first grab an access token from Keycloak using the `easybank-callcenter-cc` client.

### Step 2: Create an Account

Send a POST request to create a new account through the Gateway:

```
POST http://localhost:8072/easybank/accounts/api/create
```

Response: `Account created successfully`

This account now lives in only **one** of the two Accounts pods' H2 databases.

### Step 3: Fetch Repeatedly

Hit the fetch API multiple times:

```
GET http://localhost:8072/easybank/accounts/api/fetch?mobileNumber=...
```

Keep sending requests. Eventually, you'll get a "not found" error. This means Kubernetes routed the request to the other Accounts pod — the one that doesn't have this account. **Load balancing confirmed!**

---

## Sticky Sessions: A Surprise Behavior

Here's something interesting: you might notice that Kubernetes keeps routing your requests to the **same pod** from the same client. This is called **sticky sessions**.

When requests come from the same client (same IP address, same system), Kubernetes tends to forward them to the same pod that processed the initial request. It "remembers" the client.

### How to Work Around Sticky Sessions for Testing

- **Wait 1-2 minutes** between requests
- **Use an incognito/private browser window** — this presents as a new client
- **Use different tools** (Postman vs. browser) to simulate different clients

In the demo, requesting from the browser returned results from one pod, and then switching to Postman eventually hit the other pod. This confirmed that both pods are being used, and the load balancing is indeed happening — just in a smart, session-aware way.

---

## What This Proves

The successful test demonstrates several things:

1. **Discovery Server works** — the Gateway Server found the Accounts service through the Kubernetes Discovery Server, not Eureka
2. **Load balancing works** — requests are distributed across multiple Accounts pods
3. **No Eureka needed** — we completely removed Eureka Server and everything still functions
4. **No client-side load balancing** — the Gateway Server isn't using Spring Cloud Load Balancer; Kubernetes handles distribution internally

---

## Advantages Revisited

After seeing it in action:

- **Developers are freed** from maintaining Eureka Server
- **No registration code** — microservices don't register themselves or send heartbeats
- **Discovery Server handles everything** — it monitors and tracks running instances via the Kubernetes API
- **Smart load balancing** — Kubernetes includes session awareness by default

### The Trade-Off

You cannot control the load balancing strategy. With Eureka + Spring Cloud Load Balancer, you could implement round-robin, weighted, zone-aware strategies. With Kubernetes server-side load balancing, the algorithm is decided by the cluster.

If you need custom load balancing control, stick with the client-side approach (Eureka + Spring Cloud Load Balancer).

---

## ✅ Key Takeaways

- Server-side service discovery and load balancing works correctly after removing Eureka
- Kubernetes may use **sticky sessions** — the same client often gets routed to the same pod
- To verify load balancing, use different clients or wait between requests
- The Discovery Server monitors services via the Kubernetes API — no explicit registration from services
- The trade-off remains: convenience (server-side) vs. control (client-side)
- Both approaches are valid — choose based on your project's requirements

## 💡 Pro Tip

In production, sticky sessions can actually be beneficial — they help with caching and reduce the chance of inconsistent experiences during a session. But if you need strict round-robin distribution, explore Kubernetes Service configurations like session affinity settings.
