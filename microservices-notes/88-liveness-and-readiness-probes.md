# Introduction to Liveness and Readiness Probes

## Introduction

In cloud-native environments, containers are managed by orchestrators like Kubernetes or Docker. These platforms need to know: **Is this container working properly? Is it ready to accept traffic?** That's where liveness and readiness probes come in — two fundamental concepts you'll encounter in Docker, Kubernetes, and every cloud platform.

---

## Why Do We Need Health Probes?

When you deploy a container, the platform can't just "hope" it's running correctly. It needs to:

- **Detect failures** — restart containers that crash or hang
- **Prevent premature traffic** — don't send requests to a container that's still starting up
- **Enable self-healing** — automatically replace unhealthy containers
- **Support safe scaling** — only add instances to the load balancer when they're truly ready

Without probes, the platform is blind. With probes, it can make intelligent decisions.

---

## Liveness: "Is This Container Alive?"

Liveness answers a simple yes/no question: **Is this container alive and functioning?**

- **Alive** → No action needed. Leave it running.
- **Dead** → Take corrective action: restart the container, or create a new one.

Think of it like a heartbeat monitor. As long as there's a heartbeat, the patient is alive. But "alive" doesn't mean "ready to run a marathon."

### Real-World Analogy

A boxer sitting in the corner of the ring — warming up, drinking water, taking instructions from the coach. He's **alive** (liveness = true), but he's **not ready to fight** yet.

---

## Readiness: "Is This Container Ready for Traffic?"

Readiness answers: **Can this container accept network requests right now?**

A container can be alive but not ready. This happens especially during:
- **Startup** — still initializing, loading configurations, warming caches
- **Database migrations** — running schema updates
- **Dependency warmup** — connecting to downstream services

If readiness is false, the platform **won't route traffic** to this container. It waits until readiness becomes true.

### Real-World Analogy

The boxer stands up and walks to the center of the ring. He's not just alive — he's announcing "I'm ready to fight." That's readiness.

---

## Both Probes Together

Platforms like Kubernetes check **both** before sending traffic:

| Liveness | Readiness | Action |
|----------|-----------|--------|
| ✅ Up | ✅ Up | Route traffic to this container |
| ✅ Up | ❌ Down | Container exists but don't send traffic yet |
| ❌ Down | — | Restart or replace the container |

---

## Spring Boot Actuator Health Endpoints

Spring Boot provides these probes out of the box via Actuator:

| Endpoint | Purpose |
|----------|---------|
| `/actuator/health` | Overall health status |
| `/actuator/health/liveness` | Liveness probe |
| `/actuator/health/readiness` | Readiness probe |

### Enabling Them in `application.yml`

```yaml
management:
  health:
    readinessstate:
      enabled: true
    livenessstate:
      enabled: true
  endpoint:
    health:
      probes:
        enabled: true
```

### Testing

After starting the config server:

```
GET /actuator/health           → {"status": "UP"}
GET /actuator/health/liveness  → {"status": "UP"}
GET /actuator/health/readiness → {"status": "UP"}
```

If a dependency (like RabbitMQ) is unavailable:

```
GET /actuator/health           → {"status": "DOWN"}
GET /actuator/health/readiness → {"status": "UP"}  (config server treats MQ as optional)
```

---

## Why This Matters for Docker Compose

We need Docker Compose to:
1. Start the config server
2. **Wait** until it's healthy (readiness = UP)
3. Only then start accounts, loans, cards

Without liveness/readiness, Docker has no way to know when the config server is truly ready. The health probe endpoints give Docker the information it needs to orchestrate the startup sequence correctly.

---

## ✅ Key Takeaways

- **Liveness** = "Is it alive?" → If no, restart it
- **Readiness** = "Is it ready for traffic?" → If no, don't send requests to it
- Spring Boot Actuator exposes both via `/actuator/health/liveness` and `/actuator/health/readiness`
- Enable them with `management.health.readinessstate.enabled` and `management.health.livenessstate.enabled`
- These probes are essential for Docker Compose dependency ordering and Kubernetes pod management
