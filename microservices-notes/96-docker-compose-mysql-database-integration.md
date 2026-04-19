# Docker Compose: Integrating MySQL Databases with Microservices

## Introduction

You've got MySQL running locally and your microservices can connect to it — great. But what happens when everything runs inside Docker containers? Suddenly, `localhost` doesn't mean what it used to. In this section, we tackle the real-world challenge of wiring up microservices to MySQL databases within a Docker Compose environment — and along the way, you'll learn some critical lessons about container networking.

---

## The Core Problem: Localhost Doesn't Work in Containers

When your microservices run inside Docker containers, the `localhost` hostname in your `application.yml` points to the container itself — not your host machine, and not another container. So any hardcoded `localhost` database URL will fail.

### ❓ Why does this matter?

Think about it: each container is essentially its own isolated mini-computer. When your Accounts microservice says "connect to localhost:3306," it's looking for a MySQL instance *inside its own container* — which doesn't exist.

### ⚙️ The Solution: Environment Variables + Service Names

Instead of hardcoding database URLs, you pass them as **environment variables** in Docker Compose. And instead of `localhost`, you use the **Docker Compose service name** as the hostname — Docker's internal DNS resolves it automatically.

---

## Step-by-Step: Updating Docker Compose for MySQL

### Step 1: Regenerate Docker Images

Since your microservices now use MySQL (not H2), the existing Docker images are outdated. Update the tag in each `pom.xml` (e.g., from `S6` to `S7`) and regenerate:

```bash
mvn compile jib:dockerBuild
```

Do this for **all** microservices: accounts, loans, cards, and config server.

💡 **Pro Tip:** Regularly clean up unused Docker images and containers. They eat storage and memory, which can cause issues when running multiple containers.

### Step 2: Define Database Services in Docker Compose

Create three separate database services — one for each microservice:

```yaml
accountsdb:
  image: mysql
  container_name: accountsdb
  ports:
    - "3306:3306"
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    timeout: 10s
    retries: 10
    interval: 10s
    start_period: 10s
  environment:
    MYSQL_ROOT_PASSWORD: root
    MYSQL_DATABASE: accountsdb
```

Repeat for `loansdb` (port 3307) and `cardsdb` (port 3308), changing the database name and port accordingly.

### ❓ Why do we need health checks?

Your microservice should NOT start before its database is healthy. The `healthcheck` block tells Docker Compose to wait — only when the ping succeeds does it consider the database ready.

### Step 3: Connect Microservices to Their Databases

In `common-config.yml`, add shared database credentials:

```yaml
environment:
  SPRING_DATASOURCE_USERNAME: root
  SPRING_DATASOURCE_PASSWORD: root
```

Then in the main `docker-compose.yml`, define the unique data source URL for each microservice:

```yaml
accounts:
  environment:
    SPRING_DATASOURCE_URL: "jdbc:mysql://accountsdb:3306/accountsdb"
```

Notice: instead of `localhost`, we use `accountsdb` — the **service name** from Docker Compose. Docker resolves this to the correct container IP automatically.

### Step 4: Define Dependencies

Use `depends_on` with a health condition so microservices wait for their databases:

```yaml
accounts:
  depends_on:
    accountsdb:
      condition: service_healthy
```

### Step 5: Reduce Repetition with Shared Config

Health checks, image names, and root passwords are identical for all three databases. Move them to `common-config.yml` under a shared service like `microservice-db-config`, then extend it:

```yaml
accountsdb:
  extends:
    file: common-config.yml
    service: microservice-db-config
  container_name: accountsdb
  ports:
    - "3306:3306"
  environment:
    MYSQL_DATABASE: accountsdb
```

---

## ✅ Key Takeaways

- **Never hardcode `localhost`** in database URLs when running in Docker — use the Docker Compose service name instead
- **Health checks** ensure microservices don't start until their databases are ready
- **Environment variables** are the correct way to pass connection details in containerized environments
- **Shared configurations** in `common-config.yml` reduce duplication across services
- Regenerate Docker images whenever you change dependencies or configurations

## ⚠️ Common Mistakes

- Forgetting to update Docker image tags after code changes — you'll run stale images
- Using `localhost` as the database host inside containers — it won't resolve to another container
- Not defining `depends_on` with `condition: service_healthy` — your app may crash on startup

## 💡 Pro Tip

If your database lives outside Docker (a cloud DB, a shared dev server), skip the database containers entirely. Just pass the external database URL directly as the `SPRING_DATASOURCE_URL` environment variable in your microservice's Docker Compose entry.
