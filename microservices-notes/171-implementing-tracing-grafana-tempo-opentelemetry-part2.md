# Implementing Tracing with Grafana, Tempo & OpenTelemetry — Part 2

## Introduction

You've set up the OpenTelemetry Java Agent and configured your microservices — but does it actually work? In this section, we roll up our sleeves and run the full distributed tracing setup end-to-end. We'll start all containers, fix health check issues, invoke APIs, and confirm that tracing data is flowing correctly through the system.

This is the moment where theory becomes reality.

---

## Fixing Container Health Check Issues

### The Problem

When you try to start all your microservices using `docker compose up -d` with the production profile, something unexpected happens — containers like accounts, loans, and cards keep failing and restarting.

Why? Because the OpenTelemetry Java Agent adds overhead at startup. The agent JAR (around 20-30 MB) needs to be loaded into memory before the application can start. This loading takes extra time.

### The Root Cause

If you check the container logs, the application itself starts successfully — but it takes longer than before. The health check configuration in your Docker Compose file was set with:
- **Interval:** 10 seconds
- **Retries:** 10

That's only 100 seconds total, which isn't enough when the OpenTelemetry agent is loading.

### The Fix

Increase the health check tolerance in your Docker Compose file for **all microservices** (config server, Eureka, accounts, loans, cards):

```yaml
healthcheck:
  interval: 20s
  retries: 20
```

This gives each container up to 400 seconds to prove its health — more than enough headroom for the agent to load.

⚠️ **Common Mistake:** Only updating the health check for one microservice. You need to update it for **every** service that uses OpenTelemetry — including the config server and Eureka.

After fixing, run:
```bash
docker compose down
docker compose up -d
```

Wait about 4+ minutes for everything to start. It takes longer now because of the increased health check intervals.

---

## Verifying the OpenTelemetry Agent

Once all containers are running, open any microservice in Docker Desktop (say, the accounts service). The very first log line will show something like:

```
Loading Java Agent Library from /app/libs/opentelemetry-javaagent-x.x.x.jar
```

This confirms the agent JAR is being loaded via the `JAVA_TOOL_OPTIONS` environment variable you defined in Docker Compose. You can even browse the container's file system under `/app/libs/` to see the JAR file physically present.

💡 **Pro Tip:** If you don't see this log line, your `JAVA_TOOL_OPTIONS` configuration in Docker Compose is likely wrong — double-check the path.

---

## Testing APIs End-to-End

With all containers up:

1. **Create Account** → `POST` to accounts microservice → 201 (account created successfully)
2. **Create Card** → `POST` to cards microservice → card details created successfully
3. **Create Loan** → `POST` to loans microservice → successful response
4. **Fetch Customer Details** → `GET` to the aggregator API → returns combined account, loan, and card details

All APIs work correctly, which means the OpenTelemetry agent hasn't broken any functionality. The tracing data should now be flowing to Tempo in the background.

---

## ✅ Key Takeaways

- The OpenTelemetry Java Agent adds startup overhead — adjust health check intervals accordingly (20s interval, 20 retries is a safe starting point)
- Always run `docker compose down` before `docker compose up` when changing health check configurations
- Verify the agent is loaded by checking the first line in container logs
- Test all APIs after adding the agent to ensure nothing is broken
- The tracing data flows automatically to Tempo — you'll see it in Grafana in the next step
