# Replacing H2 Database with MySQL in Microservices

## Introduction

We have MySQL containers running. Now let's update our microservices code to **drop H2 and connect to MySQL**. This involves dependency changes, YAML configuration, and schema initialization — all straightforward once you know the pattern.

---

## Step 1: Swap the Database Dependency

In every microservice's `pom.xml`, **remove** the H2 dependency:

```xml
<!-- DELETE THIS -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Add** the MySQL connector:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

Do this for `accounts`, `loans`, and `cards`. The config server doesn't use a database, so no changes there.

---

## Step 2: Update `application.yml`

### Before (H2)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: update
    show-sql: true
```

### After (MySQL)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/accountsdb
    username: root
    password: root
    sql:
      init:
        mode: always
  jpa:
    show-sql: true
```

### Key Changes

| What Changed | Why |
|-------------|-----|
| URL format: `jdbc:mysql://host:port/dbname` | MySQL connection string format |
| Removed `driver-class-name` | Spring Boot auto-detects the MySQL driver |
| Removed H2 console config | No more H2 |
| Removed `hibernate.ddl-auto` | Not recommended for MySQL; we use SQL scripts |
| Added `sql.init.mode: always` | Forces execution of `schema.sql` on every startup |

### Per-Service URLs

| Service | Port | Database | URL |
|---------|------|----------|-----|
| Accounts | 3306 | accountsdb | `jdbc:mysql://localhost:3306/accountsdb` |
| Loans | 3307 | loansdb | `jdbc:mysql://localhost:3307/loansdb` |
| Cards | 3308 | cardsdb | `jdbc:mysql://localhost:3308/cardsdb` |

---

## Step 3: Fix Schema Initialization

### The `sql.init.mode` Placement Gotcha

⚠️ This is a common mistake: `sql.init.mode` must be under `spring.datasource`, **not** under `spring.jpa`:

```yaml
# ✅ CORRECT
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/accountsdb
    sql:
      init:
        mode: always

# ❌ WRONG — Spring Boot won't recognize it
spring:
  jpa:
    sql:
      init:
        mode: always
```

### Why `mode: always`?

With H2, Spring Boot automatically executed `schema.sql` on startup. With MySQL (and other real databases), this doesn't happen by default. Setting `mode: always` tells Spring Boot: "Always run `schema.sql` at startup."

### Use `IF NOT EXISTS` in Your SQL

Your `schema.sql` should use `CREATE TABLE IF NOT EXISTS`:

```sql
CREATE TABLE IF NOT EXISTS customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    ...
);
```

Without `IF NOT EXISTS`, the second startup will fail because the tables already exist.

---

## Step 4: Handling Credentials in Production

We're hardcoding `root`/`root` in `application.yml`. This is fine for local development but **never for production**. In production, credentials are injected via:

- **Environment variables** (Docker Compose, CI/CD)
- **Docker Compose environment section**
- **Kubernetes ConfigMaps and Secrets**
- **JVM system properties** (`-D` flags)
- **Cloud secret managers** (AWS Secrets Manager, Azure Key Vault)

---

## Testing

After restarting all microservices:

1. **Check the database** — tables should be created automatically
2. **Create an account**: `POST /api/create` → Success
3. **Fetch the account**: `GET /api/fetch?mobileNumber=...` → Data returned from MySQL
4. **Verify in SQL client** — data is visible in the `customer` and `accounts` tables

Repeat for loans and cards to confirm all three databases work.

---

## The Container Data Lifecycle

A practical warning demonstrated with containers:

| Action | Result |
|--------|--------|
| **Stop** a container | Data survives. Restart it and everything is there |
| **Delete** a container | Data is **gone forever**. You need to recreate and re-populate |

If you delete the `cardsdb` container and recreate it, the database is empty — no tables, no data. You'd need to restart the cards microservice to recreate the tables, and all previous data is lost.

---

## ✅ Key Takeaways

- Replace `h2` dependency with `mysql-connector-j` in all microservices
- Update `application.yml` with MySQL JDBC URL, username, and password
- Set `spring.datasource.sql.init.mode: always` to auto-execute `schema.sql`
- Use `CREATE TABLE IF NOT EXISTS` in SQL scripts to handle repeated startups
- Never hardcode database credentials for production — use external configuration
- Docker containers: **stop** preserves data, **delete** destroys it

---

## ⚠️ Common Mistakes

- Placing `sql.init.mode` under `jpa` instead of `datasource` — Spring Boot won't recognize it
- Forgetting `IF NOT EXISTS` in DDL scripts — causes startup failures on subsequent runs
- Using H2-specific SQL syntax in `schema.sql` that doesn't work with MySQL
- Deleting a MySQL Docker container and losing all data
