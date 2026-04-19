# Configuring H2 Database & YAML Properties

## Introduction

Before we can build REST APIs that perform CRUD operations, we need a database layer in place. In this lecture, we set up the **H2 in-memory database** for our accounts microservice, learn why **YAML** is the preferred configuration format over `.properties`, and write the SQL schema that creates our tables automatically on startup.

This is foundational work — every microservice you build will need database configuration, and mastering YAML early pays off across Docker, Kubernetes, and cloud platforms.

---

## Why YAML Over `.properties`?

Spring Boot supports two configuration formats: the traditional `application.properties` (key=value pairs) and `application.yml` (YAML format). So why choose YAML?

### The `.properties` Way

```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
```

Notice how `spring` is repeated on almost every line? And `spring.datasource` appears four times? That's a lot of redundancy.

### The YAML Way

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: ''
  h2:
    console:
      enabled: true
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: update
    show-sql: true
```

YAML is **hierarchical** — you define `spring` once, and everything nested under it inherits that prefix. It's more readable, less repetitive, and mirrors how we think about configuration groups.

### How YAML Indentation Works

YAML relies entirely on **indentation** (spaces, not tabs) to define hierarchy:

- `server.port` becomes `server:` → (indent) `port: 8080`
- `spring.datasource.url` becomes `spring:` → `datasource:` → `url: value`
- After the final key, you put a colon, a space, then the value

⚠️ **Common Mistakes**
- Messing up indentation breaks the entire file — YAML is strict about spacing
- Mixing tabs and spaces causes invisible parsing errors
- Forgetting the space after the colon (`key:value` ❌ vs `key: value` ✅)

💡 **Pro Tip**: YAML is the universal configuration language for Docker, Kubernetes, AWS, GCP, and Azure. Learning it here means you're ready for all of them.

---

## Setting Up `application.yml`

First, rename `application.properties` to `application.yml`. Then configure the following:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: ''
  h2:
    console:
      enabled: true
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: update
    show-sql: true
```

### What Each Property Does

| Property | Purpose |
|---|---|
| `server.port` | Port the embedded server listens on (8080 is default) |
| `spring.datasource.url` | JDBC connection string — `mem:testdb` means in-memory |
| `spring.h2.console.enabled` | Enables the browser-based H2 console at `/h2-console` |
| `spring.jpa.hibernate.ddl-auto: update` | Auto-creates/updates tables from SQL scripts on startup |
| `spring.jpa.show-sql: true` | Logs all SQL queries to the console (great for debugging) |

---

## Creating the Database Schema

Since H2 is in-memory, all tables and data vanish when the server stops. To auto-create tables on startup, create a file called `schema.sql` under `src/main/resources/`:

```sql
CREATE TABLE IF NOT EXISTS customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    created_at DATE NOT NULL,
    created_by VARCHAR(20) NOT NULL,
    updated_at DATE DEFAULT NULL,
    updated_by VARCHAR(20) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    customer_id INT NOT NULL,
    account_number INT PRIMARY KEY,
    account_type VARCHAR(100) NOT NULL,
    branch_address VARCHAR(200) NOT NULL,
    created_at DATE NOT NULL,
    created_by VARCHAR(20) NOT NULL,
    updated_at DATE DEFAULT NULL,
    updated_by VARCHAR(20) DEFAULT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);
```

### Key Design Decisions

- **`customer_id`** is auto-incremented in the `customer` table and serves as the primary key
- **`account_number`** is the primary key in `accounts` (not auto-generated — we'll generate it in code)
- **Foreign key** links `accounts.customer_id` → `customer.customer_id`
- **Four metadata columns** appear in every table: `created_at`, `created_by`, `updated_at`, `updated_by` — this is a real-world standard for audit tracking

💡 **Pro Tip**: `schema.sql` handles table structure (DDL). If you also need seed data, create a `data.sql` file with INSERT statements. Spring Boot auto-executes both on startup.

---

## Verifying with the H2 Console

Once the app starts, navigate to `http://localhost:8080/h2-console`. Enter the credentials matching your YAML config, click **Connect**, and you'll see both `CUSTOMER` and `ACCOUNTS` tables in the sidebar. You can run SQL queries directly here to inspect data.

---

## ✅ Key Takeaways

- **YAML is preferred** over `.properties` for Spring Boot configuration — it's hierarchical, less repetitive, and used everywhere in modern DevOps
- **H2 is an in-memory database** — perfect for development, but all data is lost on server restart
- **`schema.sql`** auto-creates tables on startup with `ddl-auto: update`
- **`show-sql: true`** prints all JPA-generated SQL queries — invaluable for debugging
- Every table should include **audit metadata columns** (`created_at`, `created_by`, `updated_at`, `updated_by`)

⚠️ **Common Mistakes**
- Forgetting to rename the file from `.properties` to `.yml`
- Breaking YAML indentation — use a YAML plugin in your IDE to catch errors
- Not enabling H2 console — you won't be able to visually verify your data
