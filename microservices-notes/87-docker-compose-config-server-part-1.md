# Updating Docker Compose for Config Server — Part 1

## Introduction

Everything works beautifully in local development, but our clients won't test against `localhost`. We need to containerize all microservices — including the config server — and run them together with Docker Compose. This lecture covers building the Docker Compose file and handling the challenges that come with running config-dependent containers.

---

## Creating Environment-Specific Docker Compose Files

Instead of one monolithic Docker Compose file, we create **separate files for each environment**:

```
docker-compose/
├── default/
│   └── docker-compose.yml
├── qa/
│   └── docker-compose.yml
└── prod/
    └── docker-compose.yml
```

This gives flexibility to customize settings per environment — different memory limits, different profiles, different configurations.

---

## Adding the Config Server Service

The Docker Compose file now includes four services:

```yaml
services:
  configserver:
    image: "eazybytes/configserver:s6"
    container_name: "configserver-ms"
    ports:
      - "8071:8071"
    deploy:
      resources:
        limits:
          memory: 700m
    networks:
      - eazybank

  accounts:
    image: "eazybytes/accounts:s6"
    # ... ports, deploy, networks

  loans:
    image: "eazybytes/loans:s6"
    # ...

  cards:
    image: "eazybytes/cards:s6"
    # ...

networks:
  eazybank:
    driver: "bridge"
```

---

## The Localhost Problem in Docker

Here's the critical challenge. In `application.yml`, microservices connect to the config server via:

```yaml
spring:
  config:
    import: "optional:configserver:http://localhost:8071"
```

This works locally, but **not in Docker**. Each container has its own isolated network. When the accounts container says `localhost`, it refers to *itself* — not the config server container.

### The Fix: Use Service Names

In Docker Compose, containers on the same network can communicate using **service names**. Override the config import via environment variables:

```yaml
accounts:
  environment:
    SPRING_CONFIG_IMPORT: "configserver:http://configserver:8071"
    SPRING_PROFILES_ACTIVE: "default"
    SPRING_APPLICATION_NAME: "accounts"
```

Key points:
- Replace `localhost` with the **service name** (`configserver`)
- Remove `optional:` — in Docker, failing to connect to the config server should be a hard failure
- The `configserver:` prefix before the URL is the Spring Cloud Config protocol prefix (always required)
- Environment variable names use **UPPER_CASE with underscores** instead of dots

### Why `SPRING_APPLICATION_NAME`?

There's a known bug in Spring Cloud Config Server that requires re-specifying the application name in Docker Compose, even though it's already in `application.yml`. This is a workaround — try without it in future versions to see if it's been fixed.

---

## The Startup Order Problem

Docker Compose creates containers in the order listed, but it **doesn't wait** for one to fully start before creating the next. If accounts starts before the config server is ready, it fails.

We need to tell Docker:
1. **How to check** if the config server is healthy
2. **Which services depend** on the config server

This requires understanding **liveness and readiness probes** — covered in the next lecture.

---

## ✅ Key Takeaways

- Create separate Docker Compose files per environment (`default/`, `qa/`, `prod/`)
- Replace `localhost` with Docker service names for inter-container communication
- Remove `optional:` from config import in Docker — fail fast if config server is unavailable
- Docker doesn't wait for services to fully start — you need health checks and dependency ordering
- Use `UPPER_CASE_UNDERSCORES` for environment variables in Docker Compose
