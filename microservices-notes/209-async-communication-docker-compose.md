# Event-Driven Microservices with RabbitMQ in Docker Compose

## Introduction

Everything works locally — but microservices live in containers. Let's containerize the whole setup including RabbitMQ and verify that async communication works in a Docker network.

---

## Docker Image Updates

Generate Docker images for all 7 applications with the tag `s13` (since this is section 13 content). The new addition is the `message` microservice — its first Docker image.

Push all images to Docker Hub so they're available for deployment.

---

## Key Docker Compose Changes

### Adding RabbitMQ Service

```yaml
rabbit:
  image: rabbitmq:3-management
  hostname: rabbit
  ports:
    - "5672:5672"
    - "15672:15672"
  healthcheck:
    test: rabbitmq-diagnostics check_port_connectivity
    interval: 10s
    timeout: 5s
    retries: 10
  networks:
    - eazybank
```

The health check uses `rabbitmq-diagnostics check_port_connectivity` to verify RabbitMQ is ready before dependent services start.

### Updating Accounts Service

```yaml
accounts:
  depends_on:
    rabbit:
      condition: service_healthy
  environment:
    SPRING_RABBITMQ_HOST: rabbit
```

Two critical changes:
1. `depends_on` with health check — accounts won't start until RabbitMQ is healthy
2. `SPRING_RABBITMQ_HOST: rabbit` — overrides `localhost` with the Docker service name

### Adding Message Service

```yaml
message:
  image: eazybytes/message:s13
  depends_on:
    rabbit:
      condition: service_healthy
  environment:
    SPRING_RABBITMQ_HOST: rabbit
  networks:
    - eazybank
```

Same pattern: depend on rabbit, override the host with the service name.

### Why `rabbit` and not `localhost`?

Inside a Docker network, containers communicate using **service names** as hostnames. `localhost` would refer to the container itself, not RabbitMQ. The service name `rabbit` resolves to the RabbitMQ container.

---

## Testing in Docker

Start everything:
```bash
docker compose up -d
```

### Verify RabbitMQ Console

Access `http://localhost:15672` — you'll see clean exchanges and queues (no orphan entries since this is a fresh container).

### Set Up Keycloak

Since this is a fresh Keycloak container, create the client credentials setup:
1. Create client `eazybank-callcenter-cc`
2. Enable client authentication + service account roles
3. Create `accounts` realm role
4. Assign role to the client

### Create an Account

Send the POST request through the gateway with a valid access token.

### Verify via Container Logs

Since H2 console isn't accessible from outside the Docker network, check the container logs:

**Message service container:**
```
Sending email with the details: AccountsMessageDto[...]
Sending sms with the details: AccountsMessageDto[...]
```

**Accounts service container:**
```
Sending communication request...
Is the communication request successfully triggered? : true
Updating communication status for account number: ...
```

The full two-way async flow works in Docker.

---

## 💡 Pro Tip

If your laptop struggles to run all containers, remove Grafana/Prometheus-related services. They're from a previous section and not needed here. This frees up resources for the containers that matter in this section.

---

## ✅ Key Takeaways

- RabbitMQ in Docker needs port mappings for both messaging (5672) and management UI (15672)
- Use health checks with `depends_on` so services only start after RabbitMQ is ready
- Override `SPRING_RABBITMQ_HOST` with the Docker service name — not `localhost`
- Docker service names act as DNS hostnames within the Docker network
- All other properties (port, username, password) can remain at default values from `application.yml`
