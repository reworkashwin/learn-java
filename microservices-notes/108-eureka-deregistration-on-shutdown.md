# De-registration from Eureka Server on Microservice Shutdown

## Introduction

We've seen registration and heartbeats. But what happens when a microservice shuts down? Does it just disappear from the registry? The answer is: **no** — it actively *deregisters* itself. In this lecture, we demo the graceful shutdown process and verify that Eureka's registry stays clean and accurate.

---

## Graceful Shutdown vs Force Kill

### ❓ Why not just click "Stop" in the IDE?

When you click the stop button in IntelliJ or any IDE, it **kills the process immediately**. There's no time for cleanup. This is not how you'd stop a service in production.

In real environments, you stop services **gracefully** — giving them time to:
1. Finish in-flight requests
2. Close database connections
3. **Deregister from the Eureka Server**

### The Actuator Shutdown Endpoint

We already enabled the shutdown endpoint in our microservices:

```yaml
management:
  endpoint:
    shutdown:
      enabled: true
```

This exposes a POST endpoint that triggers graceful shutdown:

```
POST http://localhost:8080/actuator/shutdown
```

⚠️ This only works with **HTTP POST** — a GET request will return an error.

---

## Demo: Shutting Down Microservices

### Accounts (Port 8080)

```
POST http://localhost:8080/actuator/shutdown
→ Response: { "message": "Shutting down, bye..." }
```

After sending this request, the Accounts microservice:
1. Begins the shutdown sequence
2. Deregisters itself from Eureka Server
3. Stops accepting new requests
4. Completes shutdown

### Checking Eureka Dashboard

Refresh `http://localhost:8070` — Accounts is **gone** from the registered instances. Only Loans and Cards remain.

### What the Logs Show

In the Accounts console:

```
Stopping service...
Unregistering...
ACCOUNTS - de-registered, status: 200
```

The `200` from Eureka confirms the deregistration was successful.

### Repeat for Cards and Loans

```
POST http://localhost:9000/actuator/shutdown  # Cards
POST http://localhost:8090/actuator/shutdown  # Loans
```

After both shut down, the Eureka dashboard shows **zero registered instances**. The registry is completely clean.

---

## The Complete Lifecycle

Here's the full picture of a microservice's lifecycle with Eureka:

```
Startup → Register with Eureka → Send heartbeats (every 30s) → Shutdown → Deregister from Eureka
```

Every step is **automatic**. You don't write any code for registration, heartbeats, or deregistration. The Spring Cloud Netflix Eureka Client library handles everything behind the scenes.

---

## ✅ Key Takeaways

- Microservices **deregister** from Eureka during graceful shutdown — keeping the registry accurate
- Use the `/actuator/shutdown` POST endpoint for graceful shutdown (not IDE stop buttons)
- Deregistration returns a `200` status from Eureka, confirming successful removal
- The entire lifecycle — registration, heartbeats, deregistration — is **fully automatic**
- Always shut down services gracefully in higher environments (dev, QA, prod)

## ⚠️ Common Mistakes

- Force-killing a microservice (Ctrl+C, IDE stop) without graceful shutdown — the instance may remain in the registry until its heartbeat lease expires (90 seconds by default)
- Trying to invoke `/actuator/shutdown` with GET instead of POST

## 💡 Pro Tip

If a microservice crashes without graceful shutdown, don't worry. Eureka has a safety net: if it stops receiving heartbeats from an instance, it will automatically remove that instance after the lease expiration period (default: 90 seconds).
