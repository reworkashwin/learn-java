# Generating and Pushing Docker Images with Gateway Server Changes

## Introduction

We've built and tested the Gateway Server locally. Now it's time to package everything into Docker images so we can test the entire microservices ecosystem in containers. This section covers enabling health probes, generating Docker images for all six services, and pushing them to Docker Hub.

---

## Step 1: Enable Health Probes

Before containerizing, we need health check endpoints in Accounts, Loans, and Cards. Why? Because in the Docker Compose file, the Gateway Server should only start *after* the other services are healthy. Docker uses these health endpoints to determine readiness.

### What to add in each microservice's `application.yml`:

Under `management.endpoint`:
```yaml
management:
  endpoint:
    health:
      probes:
        enabled: true
```

Under `management.health`:
```yaml
management:
  health:
    readiness-state:
      enabled: true
    liveness-state:
      enabled: true
```

These properties enable:
- **Liveness probe** — "Is the service alive?" (`/actuator/health/liveness`)
- **Readiness probe** — "Is the service ready to accept traffic?" (`/actuator/health/readiness`)

These probes already existed in the Config Server's `application.yml`. Now we're adding them to Accounts, Loans, and Cards directly.

---

## Step 2: Generate Docker Images

### Pre-checks:
- Ensure `pom.xml` has the correct tag (e.g., `S9`) for each microservice
- Remove any existing Docker images from previous sections

### The command:

```bash
mvn compile jib:dockerBuild
```

Run this inside each project directory — Accounts, Loans, Cards, Config Server, Eureka Server, and Gateway Server.

**Why Jib?** Jib builds Docker images without requiring a Dockerfile or even a running Docker daemon for the build. It's significantly faster than Buildpacks (seconds vs. minutes).

### Verify the images:

```bash
docker images
```

You should see 6 images with the `S9` tag.

---

## Step 3: Push to Docker Hub

```bash
docker image push docker.io/<your-username>/accounts:s9
docker image push docker.io/<your-username>/loans:s9
docker image push docker.io/<your-username>/cards:s9
docker image push docker.io/<your-username>/configserver:s9
docker image push docker.io/<your-username>/eurekaserver:s9
docker image push docker.io/<your-username>/gatewayserver:s9
```

Replace `<your-username>` with your Docker Hub username.

---

## ✅ Key Takeaways

- Health probes (`liveness` and `readiness`) are essential for container orchestration — Docker Compose uses them for dependency ordering
- `mvn compile jib:dockerBuild` generates Docker images quickly without a Dockerfile
- Always tag images per section/milestone (S9, S10, etc.) so you can test any version independently
- Push images to Docker Hub at regular milestones for easy access later

## 💡 Pro Tip

Get into the habit of generating and pushing Docker images at every significant milestone. When something breaks in Section 12, being able to pull and run Section 9 images instantly is invaluable for isolating issues.
