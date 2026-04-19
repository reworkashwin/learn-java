# Demo: Resiliency Patterns with Docker Compose

## Introduction

We've implemented and tested all the resiliency patterns locally — Circuit Breaker, Retry, Rate Limiter. Now it's time to verify that everything works in a **Docker container environment** with Docker Compose. This lecture walks through the Docker image updates, Docker Compose configuration changes, and live testing.

---

## Preparing Docker Images

### Tagging Convention

Since we're in **Section 10** of the course, all Docker images are tagged with `s10`:

```bash
# Build Docker images with Jib
mvn compile jib:dockerBuild -Dimage=eazybytes/accounts:s10

# Push to Docker Hub
docker push eazybytes/accounts:s10
```

Repeat for all six services (Config Server, Eureka, Gateway, Accounts, Loans, Cards).

---

## Docker Compose Changes

### New Service: Redis

The Redis RateLimiter in the Gateway needs a Redis container. Add it to `docker-compose.yml`:

```yaml
redis:
  image: redis
  ports:
    - "6379:6379"
  healthcheck:
    test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
    timeout: 10s
    retries: 10
  extends:
    file: common-config.yml
    service: network-deploy-service
```

### Gateway Server Updates

The Gateway now depends on Redis and needs Redis connection properties:

```yaml
gatewayserver:
  # ... existing config ...
  depends_on:
    redis:
      condition: service_healthy
    # ... other dependencies ...
  environment:
    SPRING_DATA_REDIS_CONNECT-TIMEOUT: 2s
    SPRING_DATA_REDIS_HOST: redis        # service name, NOT localhost
    SPRING_DATA_REDIS_PORT: 6379
    SPRING_DATA_REDIS_TIMEOUT: 1s
```

⚠️ **Important:** In Docker Compose, use the **service name** (`redis`) as the hostname, not `localhost`. Containers communicate via Docker's internal DNS.

### Image Tags

Update all service image tags from `s9` to `s10`.

---

## Starting the Environment

```bash
cd docker-compose/prod
docker compose up -d
```

Wait for all containers (Config Server → Eureka → individual services → Gateway) to start in order. Check logs:

```bash
docker compose logs gatewayserver
```

Look for: `GatewayserverApplication started successfully`

---

## Testing the Resiliency Patterns

### Test 1: Rate Limiter in Accounts Microservice

Invoke the `java-version` API:

```
GET http://localhost:8072/eazybank/accounts/api/java-version
```

- First request → actual Java version ✅
- Rapid repeated clicks → fallback response `"Java 17"` 🔄

This confirms the Resilience4j `@RateLimiter` pattern works inside Docker containers.

### Test 2: Redis Rate Limiter in Gateway (for Cards)

Using Apache Benchmark:

```bash
ab -n 10 -c 2 -v 3 http://localhost:8072/eazybank/cards/api/contact-info
```

**Results:**
- 10 total requests sent
- 8 failed (HTTP 429 — Too Many Requests)
- 2 succeeded (HTTP 200)

This confirms the Gateway's Redis-backed rate limiter is functioning correctly in the Docker environment.

### Why Not Test Retry and Circuit Breaker?

Testing those requires intentionally introducing `RuntimeException` or timeouts — which means building modified Docker images with error-throwing code. Since we've already verified them locally and the patterns are configuration-driven (not environment-dependent), they'll work identically in Docker.

---

## Section 10 Wrap-Up

At this point, our microservices are significantly more mature:

| Pattern | Where Implemented | Purpose |
|---------|-------------------|---------|
| **Circuit Breaker** | Gateway (Accounts) | Prevent cascade failures |
| **Retry** | Gateway (Loans) + Accounts microservice | Handle transient failures |
| **Rate Limiter** | Gateway/Redis (Cards) + Accounts microservice | Control request throughput |
| **Bulkhead** | Theory only | Isolate resource pools |

All patterns are tested locally and validated in Docker Compose.

---

## ✅ Key Takeaways

- Docker images should be tagged per section/version for traceability (`s10`)
- Redis runs as a separate container in Docker Compose
- Use Docker **service names** (not `localhost`) for inter-container communication
- Apache Benchmark (`ab`) is great for quick load testing in Docker environments
- Resiliency patterns are configuration-driven — if they work locally, they work in Docker
- All code for this section is checked into the GitHub repo under `section_10`

💡 **Pro Tip:** Take breaks between sections when learning. Cramming too many concepts leads to burnout and poor retention. Come back fresh for the next challenge!
