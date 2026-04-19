# Starting All Microservices with Docker Compose

## Introduction

We've updated our Docker Compose files to include Eureka Server. Now it's time to fire everything up with a single command and validate that service discovery works inside the Docker environment. Along the way, we'll troubleshoot some common YAML issues that can trip you up.

---

## Running Docker Compose

Navigate to the Docker Compose folder for the default profile and run:

```bash
docker compose up -d
```

Before running, make sure:
- No other containers are running or stopped (free up memory)
- Docker server is running on your local system
- You're in the directory containing the `docker-compose.yml` file

### ⚙️ The Startup Sequence

Watch the containers start in order:

1. **Config Server** starts first → Docker waits for its health check to pass
2. **Eureka Server** starts next → depends on Config Server being healthy
3. **Accounts, Loans, Cards** start last → depend on both Config Server and Eureka Server being healthy

---

## Troubleshooting Common Issues

### Issue 1: Eureka Server Can't Connect to Config Server

If Eureka Server fails with connection errors to Config Server, check the `commonconfig.yml` structure. The problem is often about how the Eureka Server extends the common configs.

**The fix:** Create a dedicated config service for Eureka in `commonconfig.yml`. Eureka needs Config Server properties (like `SPRING_CONFIG_IMPORT`) but does NOT need the `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` variable (since Eureka doesn't need to register with itself in this setup).

Create separate extension services:
- `microservice-configserver-config` — for Eureka Server (has Config Server dependency only)
- `microservice-eureka-config` — for individual microservices (has both Config Server and Eureka dependency)

### Issue 2: YAML Indentation Errors

If Eureka Server still can't start after the structural fix, check your **YAML indentation**. Environment variables must be child elements of the `environment` key — one tab/indent level deeper.

```yaml
# ❌ Wrong — same level as environment
environment:
SPRING_PROFILES_ACTIVE: "default"

# ✅ Correct — indented under environment
environment:
  SPRING_PROFILES_ACTIVE: "default"
```

This is one of the most frustrating YAML issues because it's easy to miss visually.

---

## Validating the Setup

Once all containers are running:

1. **Check the Eureka dashboard** at `http://localhost:8070` — all microservices should be listed as registered
2. **Create test data** using Postman — create account, card, and loan records with the same mobile number
3. **Test the `fetchCustomerDetails` API** — this triggers cross-service Feign Client calls through Eureka

If the fetchCustomerDetails API returns a consolidated response with customer, account, loans, and cards data, your Docker setup is working correctly.

---

## Updating All Profiles

After validating the default profile, copy the corrected `docker-compose.yml` and `commonconfig.yml` to:
- `qa/` directory (change `SPRING_PROFILES_ACTIVE` to `qa`)
- `prod/` directory (change `SPRING_PROFILES_ACTIVE` to `prod`)

---

## Cleanup

When done testing, stop and remove all containers:

```bash
docker compose down
```

---

## ✅ Key Takeaways

- Docker Compose enforces startup order via `depends_on` with health check conditions
- Eureka Server needs a *different* common config than individual microservices (it doesn't need `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE`)
- YAML indentation is critical — environment variables must be properly nested
- Always test the full flow (create data → fetch across services) to verify service discovery works in Docker

## ⚠️ Common Mistakes

- Using the same common config service for both Eureka Server and individual microservices
- Incorrect YAML indentation for environment variables — always double check
- Not waiting long enough for containers to start (they can take 3-4 minutes on limited hardware)

## 💡 Pro Tip

When debugging Docker Compose startup failures, click on the container in Docker Desktop and read the logs. The error messages will tell you exactly what's failing — connection refused means the target service isn't ready, and class/bean errors mean there's a configuration problem.
