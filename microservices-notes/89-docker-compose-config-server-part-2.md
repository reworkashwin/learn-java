# Updating Docker Compose for Config Server — Part 2

## Introduction

Now that we understand liveness and readiness, let's wire everything together in Docker Compose. We need to define **health checks** for the config server and RabbitMQ, and establish **dependency chains** so containers start in the correct order.

---

## Adding Health Checks to Config Server

Under the config server service, add a `healthcheck` block:

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
```

### Breaking Down the Health Check

- **`test`**: Runs a `curl` command against the readiness endpoint. Uses `grep UP` to check for a positive health status. If "UP" isn't found, exits with code 1 (failure)
- **`start_period`**: Wait 10 seconds before the first check (gives the app time to start)
- **`interval`**: Run the check every 10 seconds
- **`timeout`**: Each check must respond within 5 seconds
- **`retries`**: Try up to 10 times before marking the container as unhealthy

---

## Adding Dependencies to Microservices

Each microservice must wait for the config server to be **healthy** (not just started):

```yaml
accounts:
  depends_on:
    configserver:
      condition: service_healthy
```

### `service_healthy` vs `service_started`

| Condition | Behavior |
|-----------|----------|
| `service_started` | Starts as soon as the dependency container begins starting |
| `service_healthy` | Waits until the dependency's health check passes |

Always use `service_healthy` when you have health check definitions. Otherwise Docker starts your microservice before the config server is ready, causing connection failures.

---

## Adding RabbitMQ as a Service

Since we're using Spring Cloud Bus, all services depend on RabbitMQ. Add it as a service:

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
  networks:
    - eazybank
```

- Two ports: **5672** (core messaging) and **15672** (management UI)
- The health check uses RabbitMQ's built-in diagnostic command
- The `hostname` property is specific to RabbitMQ containers

---

## The Dependency Chain

The config server depends on RabbitMQ:

```yaml
configserver:
  depends_on:
    rabbit:
      condition: service_healthy
```

Microservices depend on the config server:

```yaml
accounts:
  depends_on:
    configserver:
      condition: service_healthy
```

### Why Not Add RabbitMQ Dependency to Every Microservice?

Since accounts/loans/cards already depend on the config server, and the config server depends on RabbitMQ, there's an **implicit transitive dependency**. RabbitMQ will always start first, then config server, then the microservices.

Adding explicit RabbitMQ dependencies to each microservice is redundant (but harmless if you prefer being explicit).

### The Startup Sequence

```
rabbit (starts first)
  ↓ [health check passes]
configserver (starts second)
  ↓ [health check passes]
accounts, loans, cards (start in parallel)
```

---

## Don't Forget the Network

Every service — including RabbitMQ — must be on the same Docker network:

```yaml
rabbit:
  networks:
    - eazybank
```

Without this, RabbitMQ runs in its own isolated network and the config server can't connect to it.

---

## ✅ Key Takeaways

- Health checks let Docker Compose **wait** until a service is truly ready
- Use `condition: service_healthy` in `depends_on` for proper startup ordering
- RabbitMQ needs its own health check (`rabbitmq-diagnostics check_port_connectivity`)
- The dependency chain: RabbitMQ → Config Server → Microservices
- All services must share the same Docker network for inter-container communication
