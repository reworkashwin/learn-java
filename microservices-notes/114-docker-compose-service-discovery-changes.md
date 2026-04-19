# Updating Docker Compose for Service Discovery

## Introduction

Now that we have Docker images with Eureka support, we need to update our Docker Compose configuration so that all services start in the right order and can discover each other. This involves defining the Eureka Server as a service, setting up health checks, and ensuring every microservice knows how to find Eureka.

---

## Adding Eureka Server to Docker Compose

### ⚙️ Setting Up the Service

In your `docker-compose.yml`, add the Eureka Server service between Config Server and the individual microservices:

```yaml
eurekaserver:
  image: eazybytes/eurekaserver:s8
  container_name: eurekaserver-ms
  ports:
    - "8070:8070"
  healthcheck:
    test: "curl --fail --silent localhost:8070/actuator/health/readiness | grep UP || exit 1"
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 10s
  environment:
    SPRING_APPLICATION_NAME: "eurekaserver"
  depends_on:
    configserver:
      condition: service_healthy
```

### ❓ Why the Health Check Matters

We want accounts, loans, and cards to start **only after** both Config Server AND Eureka Server are healthy. Without the health check, Docker Compose might start a microservice before Eureka is ready, causing registration failures.

---

## Updating the Common Config

### 🧠 The Layered Approach

Instead of duplicating Eureka-related config in every microservice, put it in the shared `commonconfig.yml`:

**Add Eureka dependency** — Under the service config that individual microservices extend, add:

```yaml
depends_on:
  eurekaserver:
    condition: service_healthy
```

**Add Eureka environment variable** — Tell each microservice where to find Eureka:

```yaml
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: "http://eurekaserver:8070/eureka/"
```

Notice: we use `eurekaserver` (the Docker Compose service name) instead of `localhost`. Inside a Docker network, containers communicate using service names, not `localhost`.

### ⚙️ Cleaning Up

- Remove any RabbitMQ-related services and dependencies if no longer needed
- Update all image tags from the old section to `s8`
- Remove RabbitMQ environment variables from common configs

---

## Replicating Across Profiles

Copy the updated `docker-compose.yml` and `commonconfig.yml` to all profile directories (default, qa, prod). This gives you the flexibility to customize per-environment later while keeping the base configuration consistent.

For each profile, update the `SPRING_PROFILES_ACTIVE` value accordingly:
- default → `default`
- qa → `qa`
- prod → `prod`

---

## ✅ Key Takeaways

- Eureka Server needs its own health check in Docker Compose so dependent services wait for it
- Use **Docker service names** (not `localhost`) for inter-container communication
- Centralize common config (Eureka URL, dependency ordering) in shared config files to avoid duplication
- Maintain separate Docker Compose profiles for different environments even if they start identical

## ⚠️ Common Mistakes

- Using `localhost` instead of the Docker Compose service name for Eureka URL — containers can't reach each other via `localhost`
- Forgetting to add the `depends_on` for Eureka Server — microservices may start before Eureka is ready
- Not providing the health check for Eureka — Docker Compose won't know when it's actually ready

## 💡 Pro Tip

The startup order in Docker Compose is: **Config Server → Eureka Server → Individual Microservices**. Each layer waits for the previous one to be healthy. This cascading dependency ensures stable startup.
