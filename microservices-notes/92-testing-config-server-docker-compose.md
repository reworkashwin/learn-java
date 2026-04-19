# Testing Config Server Changes End-to-End with Docker Compose

## Introduction

We've built the Docker Compose file, generated the images, pushed them to Docker Hub. Now comes the real test — does everything work together in a Docker environment? Let's start all containers and validate the entire configuration management pipeline.

---

## Starting the Containers

Clean slate — ensure no containers are running. Then from the `default/` folder:

```bash
docker compose up -d
```

Docker Compose orchestrates the startup:
1. **RabbitMQ** starts first (no dependencies)
2. Once RabbitMQ's health check passes → **Config Server** starts
3. Once Config Server's health check passes → **Accounts, Loans, Cards** start in parallel

Verify with:
```bash
docker ps
```

You'll see all five containers running. RabbitMQ and Config Server show `(healthy)` status.

---

## The RabbitMQ Connection Issue

### What Went Wrong

On the first attempt, the automatic config refresh via webhooks returned a `500` error. Checking the config server logs revealed:

```
Attempting to connect to RabbitMQ at localhost:5672
```

The problem? The config server was trying to connect to RabbitMQ at **localhost** — but in Docker, each container has its own `localhost`. The RabbitMQ container is a separate service.

### The Fix

We forgot to override the RabbitMQ host in the Docker Compose environment. Add this to `common-config.yml` under `microservice-base-config`:

```yaml
environment:
  SPRING_RABBITMQ_HOST: "rabbit"
```

Where `rabbit` is the Docker Compose **service name** for the RabbitMQ container. Since all services share the same network, they can resolve each other by service name.

### Why Did the Microservices Start Anyway?

Even though RabbitMQ wasn't properly connected, the config server's **readiness probe** returned "UP". The config server treats RabbitMQ as optional — it can serve configuration without it. So the readiness check passed, and the microservices started successfully.

The APIs worked for basic operations. Only the **automatic refresh** (which needs RabbitMQ) was broken.

---

## After the Fix

Tear down and restart:

```bash
docker compose down
docker compose up -d
```

Now the config server logs show:
```
Successfully connected to RabbitMQ at rabbit:5672
```

And `/actuator/health` returns `"status": "UP"` (not "DOWN" like before).

---

## Testing the Full Pipeline

### Basic API Test

```
GET /api/build-info → version 3.0 (default profile)
GET /api/contact-info → default profile properties ✅
```

### Automatic Refresh Test

1. **Change** a property in GitHub (e.g., `accounts.yml`: change "local" to "docker")
2. The webhook fires automatically
3. **Check** the hookdeck terminal — should show `200` status (not `500` like before)
4. **Verify** in Postman: `GET /api/contact-info` → shows the updated value immediately
5. **Revert** the change in GitHub
6. **Verify** again — value reverts automatically

No manual refresh calls. No container restarts. Fully automated config propagation across all containers.

---

## ✅ Key Takeaways

- Always override `localhost` references with Docker service names in environment variables
- **`SPRING_RABBITMQ_HOST: "rabbit"`** is critical for Spring Cloud Bus to work in Docker
- The readiness probe can return "UP" even when optional dependencies (like RabbitMQ) are down
- After fixing the connection, the full webhook → config monitor → bus refresh → microservice pipeline works seamlessly in Docker
- Test with `docker compose down` and `docker compose up -d` after making Compose changes

---

## ⚠️ Common Mistakes

- Forgetting to override RabbitMQ's host from `localhost` to the Docker service name
- Assuming that because APIs work, everything is connected — specifically test the refresh flow
- Not checking container logs when debugging Docker issues (`docker logs <container-name>`)
