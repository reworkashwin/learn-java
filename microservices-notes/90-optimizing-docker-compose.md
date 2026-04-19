# Optimizing Docker Compose with Common Configurations

## Introduction

Our Docker Compose file works, but it's full of **repeated content** — the same network config, the same deploy limits, the same environment variables appearing under every service. Let's extract the common parts into a shared file using Docker Compose's `extends` feature.

---

## The Problem: Repetition

Look at what's duplicated across services:

- `networks: eazybank` — every single service
- `deploy.resources.limits.memory: 700m` — every microservice
- `SPRING_PROFILES_ACTIVE` — every microservice
- `SPRING_CONFIG_IMPORT` — accounts, loans, and cards
- `depends_on: configserver` — accounts, loans, and cards

If you need to change the memory limit, you'd edit it in **four places**. That's error-prone and violates DRY (Don't Repeat Yourself).

---

## The Solution: `common-config.yml`

Create a `common-config.yml` in the same folder as `docker-compose.yml`. Define reusable service templates:

### Layer 1: Network Configuration

```yaml
services:
  network-deploy-service:
    networks:
      - eazybank
```

Used by: **everything** (including RabbitMQ).

### Layer 2: Base Microservice Configuration

```yaml
  microservice-base-config:
    extends:
      service: network-deploy-service
    deploy:
      resources:
        limits:
          memory: 700m
```

Inherits networks from Layer 1, adds deploy limits. Used by: **config server** and all microservices.

### Layer 3: Config-Server-Dependent Services

```yaml
  microservice-configserver-config:
    extends:
      service: microservice-base-config
    environment:
      SPRING_PROFILES_ACTIVE: "default"
      SPRING_CONFIG_IMPORT: "configserver:http://configserver:8071"
    depends_on:
      configserver:
        condition: service_healthy
```

Inherits everything from Layer 2, adds config server dependency and environment variables. Used by: **accounts, loans, cards**.

---

## The Layered Architecture

```
network-deploy-service
  └── networks: eazybank
         ↑
microservice-base-config  (extends network-deploy-service)
  └── + deploy limits (700m)
         ↑
microservice-configserver-config  (extends microservice-base-config)
  └── + SPRING_CONFIG_IMPORT
      + SPRING_PROFILES_ACTIVE
      + depends_on: configserver
```

Each layer inherits from the previous one and adds more specifics.

---

## Using `extends` in Docker Compose

### RabbitMQ — needs only network:

```yaml
rabbit:
  image: "rabbitmq:3.13-management"
  hostname: rabbitmq
  ports:
    - "5672:5672"
    - "15672:15672"
  healthcheck:
    test: rabbitmq-diagnostics check_port_connectivity
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 10s
  extends:
    file: common-config.yml
    service: network-deploy-service
```

### Config Server — needs network + deploy limits:

```yaml
configserver:
  image: "eazybytes/configserver:s6"
  container_name: "configserver-ms"
  ports:
    - "8071:8071"
  healthcheck:
    test: "curl --fail --silent localhost:8071/actuator/health/readiness | grep UP || exit 1"
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 10s
  depends_on:
    rabbit:
      condition: service_healthy
  extends:
    file: common-config.yml
    service: microservice-base-config
```

### Microservices — need everything:

```yaml
accounts:
  image: "eazybytes/accounts:s6"
  container_name: "accounts-ms"
  ports:
    - "8080:8080"
  environment:
    SPRING_APPLICATION_NAME: "accounts"
  extends:
    file: common-config.yml
    service: microservice-configserver-config
```

Notice how **clean** this is. The accounts service only specifies what's unique to it — image, name, port, and application name. Everything else is inherited.

---

## Switching Environments

The beauty of this approach: changing the profile for a different environment means editing **one line** in `common-config.yml`:

```yaml
# default/common-config.yml
SPRING_PROFILES_ACTIVE: "default"

# qa/common-config.yml
SPRING_PROFILES_ACTIVE: "qa"

# prod/common-config.yml
SPRING_PROFILES_ACTIVE: "prod"
```

One variable controls the behavior of all containers. Same immutable Docker images, different environments.

---

## ✅ Key Takeaways

- Extract repeated configurations into `common-config.yml` using layered service templates
- Use `extends` in Docker Compose to import shared configurations
- Three layers: network → base microservice → config-server-dependent
- Changing environment-specific values happens in **one place**
- This keeps your Docker Compose files short, readable, and maintainable

---

## 💡 Pro Tip

This pattern scales well. As you add more microservices, each one is just a few lines in `docker-compose.yml` — the shared configs handle the rest. If you later need different memory limits for production, change it once in `common-config.yml`.
