# Microservices Security with Docker Compose — Setup

## Introduction

Everything works locally. But what about in Docker? This is where things get *really* interesting. Not only do we containerize Keycloak alongside our microservices, but we also **lock down** the individual microservices so they're completely inaccessible from the outside world. Only the Gateway can reach them.

---

## Docker Compose Changes for Security

### Adding Keycloak as a Service

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:latest
  container_name: keycloak
  ports:
    - "7080:8080"
  environment:
    KEYCLOAK_ADMIN: admin
    KEYCLOAK_ADMIN_PASSWORD: admin
  command: "start-dev"
  extends:
    service: network-deploy-service
```

Key details:
- **Port mapping:** `7080:8080` — Keycloak runs on 8080 *inside* Docker, but is exposed on 7080 *outside*
- **`start-dev` command** — Uses Keycloak's built-in H2 database (fine for development, NOT for production)
- **Extends `network-deploy-service`** — Places Keycloak in the same Docker network as all other services

### Removing Port Mappings from Microservices

This is the most important security change:

```yaml
# BEFORE (in previous sections)
accounts:
  ports:
    - "8080:8080"

# AFTER (in this section)
accounts:
  # No ports mapping!
```

The same change applies to **cards** and **loans**. By removing port mappings:
- These services are **invisible** to the outside world
- Only services **inside the Docker network** can reach them
- The Gateway (which retains its port mapping) is the **only entry point**

### Updating the Gateway's JWK Set URI

In `application.yml`, the Gateway connects to Keycloak on `localhost:7080`. But inside Docker, services communicate by **service name**, not localhost:

```yaml
# Environment variable in docker-compose
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI: 
  http://keycloak:8080/realms/master/protocol/openid-connect/certs
```

Two critical differences from the local config:
1. **`keycloak`** instead of `localhost` — uses Docker's internal DNS
2. **`8080`** instead of `7080` — uses the internal port, not the externally mapped one

---

## Why Internal Port Matters

| Context | Host | Port |
|---------|------|------|
| From your laptop | `localhost` | `7080` (external mapping) |
| From Gateway container | `keycloak` | `8080` (internal port) |

Inside the Docker network, services connect directly — the port mapping (`7080:8080`) only applies for traffic crossing the Docker network boundary.

---

## Updating Tag Versions

All `pom.xml` files need their image tag updated from `S11` to `S12` to match the new section's images. The same tag change applies in the Docker Compose file.

---

## Starting Everything Up

```bash
docker compose up -d
```

Before running this:
- Stop all locally running IDE instances
- Stop any standalone Keycloak container from previous testing

If there's a port conflict (e.g., an existing Keycloak on 7080), the new Keycloak service won't start.

---

## ✅ Key Takeaways

- Removing port mappings from microservices makes them **invisible** to the outside world — only accessible within the Docker network
- Gateway retains its port mapping as the single entry point (edge server)
- Inside Docker, use **service names** (not `localhost`) and **internal ports** (not mapped ports)
- Keycloak's `start-dev` command uses an embedded H2 database — all data is lost when the container is recreated
- This is a significant security improvement: attackers can't bypass the Gateway by hitting microservices directly

⚠️ **Common Mistake:** Using `localhost:7080` in the Gateway's JWK URI inside Docker Compose. Inside the Docker network, `localhost` refers to the container itself, not the host machine. Use the service name `keycloak` with port `8080`.
