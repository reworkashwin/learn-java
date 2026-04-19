# Connecting Accounts Microservice to Eureka Server

## Introduction

The Eureka Server is up and running. Now it's time to make our first microservice — Accounts — register with it. After this, the Eureka dashboard will show Accounts as a registered instance, complete with heartbeat monitoring and info metadata.

---

## Step 1: Add the Eureka Client Dependency

In the Accounts microservice's `pom.xml`, add:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

⚠️ **This time, it's "Eureka Discovery Client"** — not "Eureka Server." The microservice is a client that registers *with* the Eureka Server.

---

## Step 2: Configure Eureka Properties

Add these properties to `application.yml`:

```yaml
eureka:
  instance:
    preferIpAddress: true
  client:
    fetchRegistry: true
    registerWithEureka: true
    serviceUrl:
      defaultZone: http://localhost:8070/eureka/
```

### ❓ Why `preferIpAddress: true`?

By default, microservices register with their **hostname**. This works when you have DNS mappings, but locally (and in many container environments) you don't. Setting this to `true` makes the microservice register with its **IP address**, which other services can use directly.

### ❓ Why `fetchRegistry: true`?

Unlike the Eureka Server (which was `false`), the Accounts microservice *will* need to discover other services — so it should fetch the registry. This is the default, but being explicit is clearer.

### ❓ Why `registerWithEureka: true`?

We want Accounts to register itself so other microservices can find it. Again, this is the default, but explicit is better.

---

## Step 3: Add Info Metadata

This metadata appears in the Eureka dashboard when you click on a registered service:

```yaml
info:
  app:
    name: "accounts"
    description: "Eazy Bank Accounts Application"
    version: "1.0.0"
```

To make this info accessible via the actuator:

```yaml
management:
  info:
    env:
      enabled: true
```

---

## Step 4: Enable Graceful Shutdown

For demoing deregistration later, enable the shutdown actuator endpoint:

```yaml
management:
  endpoint:
    shutdown:
      enabled: true

endpoints:
  shutdown:
    enabled: true
```

This exposes a POST endpoint at `/actuator/shutdown` that gracefully stops the microservice — including deregistering from Eureka.

⚠️ **Note:** The `endpoints.shutdown.enabled` property must be at the **root level** of your YAML, not nested under `management`.

---

## Step 5: Start and Verify

### Startup Order

1. Config Server (8071)
2. Eureka Server (8070)
3. Accounts Microservice (8080)

### What You'll See in Logs

```
DiscoveryClient_ACCOUNTS/... : registering service...
DiscoveryClient_ACCOUNTS/... - registration status: 204
Starting heartbeat executor with renewal interval: 30 seconds
```

The `204` status confirms successful registration. Heartbeats will be sent every **30 seconds** by default.

### Eureka Dashboard

Visit `http://localhost:8070` — under "Instances currently registered with Eureka," you'll see:

| Application | Status |
|------------|--------|
| ACCOUNTS | UP (1) |

Clicking the instance link shows the info metadata (name, description, version) fetched from the `/actuator/info` endpoint.

---

## ✅ Key Takeaways

- Add `spring-cloud-starter-netflix-eureka-client` to microservice dependencies
- Set `preferIpAddress: true` for environments without DNS (local, containers)
- `fetchRegistry: true` + `registerWithEureka: true` (defaults, but be explicit)
- Point `serviceUrl.defaultZone` to your Eureka Server's `/eureka/` endpoint
- Info metadata provides useful context in the Eureka dashboard
- Microservices automatically send heartbeats every 30 seconds after registration

## ⚠️ Common Mistakes

- Using the Eureka Server dependency instead of the Eureka Client dependency in microservices
- Forgetting to start Eureka Server before the microservice — registration will fail
- Confusing the root-level `endpoints.shutdown` with the nested `management.endpoint.shutdown`

## 💡 Pro Tip

The same changes apply to all your microservices (Loans, Cards, etc.). The pattern is identical — add the dependency, configure the Eureka properties, add info metadata. Try doing Loans and Cards yourself before the next lecture.
