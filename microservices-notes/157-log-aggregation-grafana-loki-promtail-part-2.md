# Log Aggregation with Grafana, Loki & Promtail — Part 2

## Introduction

In the previous lecture, we broke down the three YAML files from Grafana's official documentation. Now it's time to **actually wire everything into our existing Docker Compose setup** — integrating Loki, Promtail, Minio, Grafana, and the Nginx gateway alongside our microservices.

This is where theory meets practice. Let's get our hands dirty.

---

## Organizing Config Files Under an Observability Folder

### ⚙️ Setting Up the Folder Structure

Rather than dumping all config files in one place, we create a clean structure:

```
docker-compose/
  └── prod/
      ├── docker-compose.yml
      └── observability/
          ├── loki/
          │   └── loki-config.yml
          └── promtail/
              └── promtail-local-config.yml
```

Why this structure? Because as you add more observability tools (Prometheus, Tempo, etc.), keeping configs organized under `observability/` prevents your project from becoming a mess.

---

## Integrating Into the Existing Docker Compose File

### ⚙️ Step-by-Step Changes

**1. Clean Up Unnecessary Services**

Since we're adding many new containers, remove services you've already tested and no longer need (like Redis for rate limiting). This frees up system resources.

**2. Update Docker Image Tags**

Replace all image tags from the previous section (e.g., `s10`) to the current section (e.g., `s11`).

**3. Copy Services from Official Docs**

Copy all services from the Grafana Docker Compose template **except** the `flog` service (which is just a sample log generator we don't need).

**4. Fix Volume Paths**

This is the most critical step. Since our config files live under `observability/loki/` and `observability/promtail/` — not in the same directory as the Docker Compose file — we must update the volume paths:

```yaml
# Before (from official docs):
volumes:
  - ./loki-config.yml:/etc/loki/config.yaml

# After (our structure):
volumes:
  - ./observability/loki/loki-config.yml:/etc/loki/config.yaml
```

Same treatment for Promtail:
```yaml
volumes:
  - ./observability/promtail/promtail-local-config.yml:/etc/promtail/config.yml:ro
```

**5. Align Network Configuration**

The official docs create a network called `loki`. But our microservices use a network called `easybank`. We need to update all the new services to use our existing network.

Instead of hardcoding the network name, extend from the shared config:
```yaml
extends:
  file: common-config.yml
  service: network-deploy-service
```

This applies to Promtail, Minio, Grafana, and the Gateway service.

**6. Update Anchor References**

When updating the network from `loki` to `easybank`, make sure the anchor variable (`&loki-dns`) now points to `easybank`. The read and write services that reference `*loki-dns` via merge keys will automatically pick up the change.

---

## Regenerating Docker Images

After making all changes to the Docker Compose file, remember: the microservice code changes (like increased timeout) are only in your local workspace. You must **regenerate all Docker images** with the new tag (`s11`) before running Docker Compose.

---

## ✅ Key Takeaways

- Organize observability configs under a dedicated `observability/` folder for clarity
- Always update volume paths when config files are not co-located with the Docker Compose file
- Use `extends` from `common-config.yml` to keep network configuration consistent across all services
- Remove unused services (like Redis) to conserve local system resources when testing
- Always regenerate Docker images after making code changes before testing with Docker Compose

### ⚠️ Common Mistakes

- Forgetting to update **volume paths** after moving config files into subdirectories — this causes containers to fail silently
- Leaving the network as `loki` instead of changing it to match your existing network (`easybank`)
- Not regenerating Docker images before running `docker compose up` — you'll be testing stale code

### 💡 Pro Tip

When you see alignment errors in YAML after copy-pasting, select the misaligned block and press `Shift+Tab` in your IDE to fix indentation. All services at the same level must be at the same indentation depth.
