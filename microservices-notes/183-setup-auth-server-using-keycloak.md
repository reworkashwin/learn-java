# Setup Auth Server Using KeyCloak

## Introduction

Theory is great, but let's get our hands dirty. In this section, we spin up a real Keycloak authorization server using Docker and explore its admin console. By the end of this, you'll have a fully functional auth server running in your microservices stack.

---

## Starting Keycloak with Docker

Keycloak offers multiple installation options, but since we already have Docker in our stack, that's the natural choice.

### The Docker Command

```bash
docker run -d \
  -p 7080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

Let's break down each part:

| Flag/Parameter | Purpose |
|----------------|---------|
| `-d` | Run in detached mode (background) |
| `-p 7080:8080` | Map port 7080 (host) to 8080 (container) |
| `-e KEYCLOAK_ADMIN=admin` | Set the admin username |
| `-e KEYCLOAK_ADMIN_PASSWORD=admin` | Set the admin password |
| `start-dev` | Run in development mode (uses internal H2 database) |

### Why Port 7080 Instead of 8080?

Keycloak internally runs on port 8080. But our accounts microservice is already exposing port 8080. If we map both to the same host port, we get a port conflict. So we expose Keycloak on port **7080** externally.

### Development Mode vs. Production

The `start-dev` flag starts Keycloak in development mode, which:
- Uses an **internal H2 database** for storing credentials
- Has relaxed security settings
- Is perfect for local development

⚠️ **Common Mistake:** Never use `start-dev` in production! In production, you'd configure an external database (PostgreSQL, MySQL) and use `start` instead.

### Prerequisites

Keycloak requires **Java 17 or higher**. Since we're running it in Docker, the container includes the JDK, so you shouldn't have issues. But if running locally outside Docker, ensure Java 17+ is installed.

---

## Accessing the Admin Console

1. Open your browser and navigate to `http://localhost:7080`
2. Click **Administration Console**
3. Log in with the credentials you set: `admin` / `admin`

You'll see the Keycloak admin console — your command center for managing clients, users, roles, and everything security-related.

---

## Understanding Realms

When you first log in, you'll see a single realm called **master**.

### What is a Realm?

A realm is a **security boundary** — an isolated container of users, clients, roles, and configurations. Think of it like an environment or a tenant.

Why would you need multiple realms?

- **Dev Realm** — with test users and relaxed settings
- **QA Realm** — with QA-specific clients and users
- **Prod Realm** — with production credentials and strict security

The `master` realm is created by default and is typically used for managing Keycloak itself. For this course, we'll use the master realm, but in production you'd likely create separate realms for your application.

💡 **Pro Tip:** In a multi-tenant SaaS application, you could create a separate realm per tenant, giving each tenant completely isolated identity management.

---

## ✅ Key Takeaways

- Start Keycloak with Docker using `docker run` with admin credentials as environment variables
- Use a different port (7080) to avoid conflicts with existing services
- `start-dev` mode uses an internal database — fine for development, not for production
- Access the admin console at `http://localhost:7080` with your admin credentials
- A **realm** is a security boundary/namespace for isolating users, clients, and configurations
- The `master` realm is created by default — in production, create application-specific realms
