# Updating Docker Compose for Spring Cloud Gateway

## Introduction

Docker images are built and pushed. Now we update the Docker Compose file to include the Gateway Server and add proper health checks so services start in the right order. This completes the containerized setup of our entire microservices network.

---

## Adding Gateway Server to Docker Compose

The Gateway Server service configuration follows the same pattern as other services:

```yaml
gatewayserver:
  image: eazybytes/gatewayserver:s9
  container_name: gatewayserver-ms
  ports:
    - "8072:8072"
  environment:
    SPRING_APPLICATION_NAME: gatewayserver
  extends:
    service: microservice-eureka-config
```

### Key points:
- **Port mapping**: `8072:8072` — the Gateway's external-facing port
- **Extends**: `microservice-eureka-config` — inherits Eureka and Config Server connection details from the common config

---

## Adding Health Checks to Microservices

The Gateway Server should only start **after** Accounts, Loans, and Cards are healthy. Docker Compose achieves this with `healthcheck` + `depends_on`.

### Health check configuration for each service:

```yaml
accounts:
  # ... other config
  healthcheck:
    test: "curl --fail --silent localhost:8080/actuator/health/readiness | grep UP || exit 1"
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 10s

loans:
  healthcheck:
    test: "curl --fail --silent localhost:8090/actuator/health/readiness | grep UP || exit 1"
    # ... same intervals

cards:
  healthcheck:
    test: "curl --fail --silent localhost:9000/actuator/health/readiness | grep UP || exit 1"
    # ... same intervals
```

### Gateway's dependency declaration:

```yaml
gatewayserver:
  depends_on:
    accounts:
      condition: service_healthy
    loans:
      condition: service_healthy
    cards:
      condition: service_healthy
```

This means: "Don't start the Gateway until all three microservices report healthy."

---

## The Complete Startup Order

```
Config Server → Eureka Server → [Accounts, Loans, Cards] → Gateway Server
```

Each layer waits for the previous to be healthy before starting. This prevents race conditions where the Gateway tries to route to services that haven't registered with Eureka yet.

---

## Running and Validating

### Start everything:

```bash
cd docker-compose/default
docker compose up -d
```

Wait 1-2 minutes for the full startup chain.

### Validation steps:

1. Check all containers are running in Docker Desktop
2. Create test data via Gateway (POST to create accounts, cards, loans)
3. Call `fetchCustomerDetails` through the Gateway
4. Verify the response includes account, loan, and card details
5. Check response headers for `eazybank-correlation-id`
6. Search each container's logs for the same correlation ID

### Copy to other profiles:

After validating the default compose file, copy the same configuration to:
- `prod/docker-compose.yml` (with `spring.profiles.active: prod`)
- `qa/docker-compose.yml` (with `spring.profiles.active: qa`)

---

## ✅ Key Takeaways

- Health checks with `condition: service_healthy` ensure proper startup ordering
- The readiness endpoint (`/actuator/health/readiness`) is the right probe for "ready to accept traffic"
- Always update the image tag across **all** services when moving to a new section (replace `s8` → `s9` everywhere)
- Test correlation ID tracing in the Docker environment — it should work identically to local

## ⚠️ Common Mistakes

- Forgetting to update the image tag for *all* services — one stale image can cause confusing behavior
- Using wrong port numbers in health check URLs — each service has its own port inside the container
- Not cleaning container logs before testing — old log entries make correlation ID searches confusing

## 💡 Pro Tip

Use `docker compose up -d` and then `docker compose logs -f gatewayserver` to tail only the Gateway logs. This way you can watch it start and begin routing without noise from other services.
