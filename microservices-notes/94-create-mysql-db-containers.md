# Creating MySQL Database Containers for Microservices

## Introduction

Time for a practical pivot. We've been using **H2** — an in-memory database — for convenience. But H2 is never used in production. In this section, we switch to **MySQL**, and we'll use Docker to spin up MySQL instances in seconds instead of going through traditional installation.

---

## Why Switch from H2 to MySQL?

H2 is great for learning and prototyping:
- Zero setup, runs in-memory
- Comes embedded with Spring Boot

But for production:
- H2 data is lost on restart
- H2 doesn't support production workloads
- Real projects use MySQL, PostgreSQL, or other production-grade databases

---

## The Microservices Database Pattern

A fundamental principle: **each microservice gets its own database**. No sharing.

- **Accounts** → `accountsdb`
- **Loans** → `loansdb`
- **Cards** → `cardsdb`

This ensures loose coupling — each service owns its data and schema independently.

---

## Creating MySQL Containers with Docker

Instead of installing MySQL on your system (which takes space, time, and setup), use Docker:

### Accounts Database (Port 3306)

```bash
docker run -p 3306:3306 \
  --name accountsdb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=accountsdb \
  -d mysql
```

### Loans Database (Port 3307)

```bash
docker run -p 3307:3306 \
  --name loansdb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=loansdb \
  -d mysql
```

### Cards Database (Port 3308)

```bash
docker run -p 3308:3306 \
  --name cardsdb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cardsdb \
  -d mysql
```

### Breaking Down the Command

| Flag | Purpose |
|------|---------|
| `-p 3306:3306` | Map host port to container's internal MySQL port |
| `--name accountsdb` | Give the container a recognizable name |
| `-e MYSQL_ROOT_PASSWORD=root` | Set the root user's password |
| `-e MYSQL_DATABASE=accountsdb` | Create a database/schema during initialization |
| `-d` | Run in detached (background) mode |
| `mysql` | The official MySQL Docker image |

### Why Different Ports?

Each container internally runs MySQL on port 3306. But since all three are exposed to the **same host system**, they need unique external ports:

- `3306` → accountsdb
- `3307` → loansdb
- `3308` → cardsdb

Inside Docker, there's no conflict — each container has its own network. The port difference is only for **host-level access**.

---

## Verifying with a Database Client

Use a lightweight client like **SQL Electron** (sqlelectron.github.io) to connect:

| Connection | Host | Port | User | Password | Database |
|------------|------|------|------|----------|----------|
| Accounts | localhost | 3306 | root | root | accountsdb |
| Loans | localhost | 3307 | root | root | loansdb |
| Cards | localhost | 3308 | root | root | cardsdb |

After connecting, you'll see empty databases — no tables yet. Tables will be created by the microservices on startup.

---

## ⚠️ Data Persistence Warning

Docker containers store data inside their container filesystem. This means:

- **Stop a container** → data is preserved (you can restart it later)
- **Delete a container** → **all data is lost forever**

This behaves like uninstalling a database — everything goes with it. Be careful:
- You can safely **stop** containers without losing data
- Never **delete** a database container unless you're okay losing all its data
- For persistent storage in production, use **Docker volumes** (covered later)

---

## ✅ Key Takeaways

- Each microservice gets its own MySQL database — **no shared databases**
- Docker eliminates the need for local MySQL installation — spin up a database in seconds
- Use different **host ports** (3306, 3307, 3308) for multiple MySQL containers
- Containers internally all use port 3306 — port conflicts only happen at the host level
- **Stopping** a container preserves data; **deleting** it destroys data permanently

---

## 💡 Pro Tip

In real projects, you typically don't run MySQL locally. The infrastructure team provides dev/QA database servers. But Docker containers let you **be self-sufficient** during development — no waiting for someone else to set up your database.
