# Running Microservices and MySQL Containers with Docker Compose

## Introduction

You've set up the Docker Compose file with MySQL databases and microservices — now it's time to validate that everything actually works. This lecture walks through running the full stack, encountering a real networking pitfall, debugging it, and ultimately achieving successful end-to-end communication between microservices and their databases inside Docker.

---

## First Attempt: Finding and Fixing Configuration Issues

### Issue 1: Stale Docker Image Tags

Before running Docker Compose, make sure the image tags in your `docker-compose.yml` match the latest images you built. If you built `S7` images but your compose file still references `S6`, you'll get the old H2-based images — and nothing will work.

### Issue 2: Leftover RabbitMQ Dependency

If your config server still has a `depends_on` pointing to a RabbitMQ service that no longer exists in your compose file, Docker Compose will throw an error:

```
config server depends on undefined service rabbit
```

Remove the stale dependency, save, and retry.

---

## The Real Surprise: Port Mapping vs Internal Ports

After fixing the obvious issues, you run `docker compose up` and... loans and cards microservices crash. Accounts works fine. Why?

Here's the critical insight:

### ❓ What went wrong?

The data source URLs for loans and cards used ports `3307` and `3308`:

```
jdbc:mysql://loansdb:3307/loansdb
jdbc:mysql://cardsdb:3308/cardsdb
```

But here's the thing — **port mapping is for EXTERNAL access**. When containers talk to each other inside Docker's network, they use the **internal port**, which is `3306` for all MySQL containers.

### ⚙️ How container networking actually works

```
External World → 3307 → loansdb container (internal: 3306)
Container-to-Container → loansdb:3306 (directly)
```

The `ports: "3307:3306"` mapping means "expose internal port 3306 as 3307 to the host machine." But inside the Docker network, the database is still on port 3306.

### The Fix

Change all data source URLs to use port `3306`:

```yaml
SPRING_DATASOURCE_URL: "jdbc:mysql://loansdb:3306/loansdb"
SPRING_DATASOURCE_URL: "jdbc:mysql://cardsdb:3306/cardsdb"
```

### ❓ Then why keep the port mapping at all?

You don't *need* it for container-to-container communication. But it's useful for **external tools** like SQL Electron or DBeaver that run on your host machine and need to connect to the databases. Without port mapping, you couldn't inspect the data from outside Docker.

---

## Running Successfully

After fixing the port issue:

```bash
docker compose down    # remove old containers
docker compose up -d   # start in detached mode
```

All seven containers start: three databases, config server, and three microservices.

### Validating

1. **REST APIs** — Hit create endpoints for accounts, cards, and loans. All return successful responses.
2. **Database Verification** — Connect via SQL Electron using the exposed ports (3306, 3307, 3308) and confirm data exists in each database.

---

## Replicating for QA and Prod Profiles

The Docker Compose changes are the same for other profiles — just copy the content and update:
- `spring.profiles.active` to `qa` or `prod` in `common-config.yml`
- Everything else stays identical

---

## ✅ Key Takeaways

- **Internal container communication uses internal ports** (3306), not the host-mapped ports (3307, 3308)
- Port mapping (`"3307:3306"`) is only for accessing containers **from outside Docker**
- Always use `docker compose down` before restarting to cleanly remove old containers
- Use `-d` flag for detached mode so your terminal stays free
- Validate both the REST APIs and the database contents after starting

## ⚠️ Common Mistakes

- Using host-mapped ports in data source URLs between containers — this is the #1 Docker networking mistake for beginners
- Forgetting to update image tag versions in `docker-compose.yml`
- Leaving stale `depends_on` references to removed services

## 💡 Pro Tip

If your database lives outside Docker (cloud, shared dev server), just pass the external URL directly as `SPRING_DATASOURCE_URL`. No database containers needed.
