# Spring Boot Meets MySQL — Connecting via Docker

## Introduction

We've got MySQL running as a Docker container. Now comes the exciting part — connecting our Spring Boot application to this MySQL database. We need to swap out the H2 dependency for MySQL, update our configuration properties, and run the necessary SQL scripts to set up our tables and data.

This is a very practical, hands-on lecture. Let's walk through every step and understand *why* we're doing each thing.

---

## Step 1: Swap the Maven Dependency

### 🧠 What Needs to Change?

Our `pom.xml` currently has **two H2-related dependencies**. Since we're moving to MySQL, we need to:
1. **Remove** the H2 dependencies
2. **Add** the MySQL driver dependency

### ⚙️ How to Find the MySQL Dependency

You can find it in two ways:

**Option A: From Spring Initializr**
1. Go to [start.spring.io](https://start.spring.io)
2. Click **Add Dependencies**
3. Search for **"MySQL Driver"**
4. Click **Explore** to see the Maven dependency

**Option B: From IntelliJ (Premium)**
1. Click the **Add Starters** button in `pom.xml`
2. Search for MySQL

### The MySQL Dependency

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

The `scope` is `runtime` — meaning this driver is only needed when the application is *running*, not during compilation. Spring Data JPA handles the abstraction at compile time.

> After adding this dependency, **sync your Maven changes** by clicking the refresh button in IntelliJ.

---

## Step 2: Update `application.properties`

This is the most critical step. We need to tell Spring Boot *how* to connect to our MySQL database.

### Remove H2 Properties

Delete all H2-specific properties. They're no longer relevant.

### Add MySQL Connection Properties

```properties
spring.datasource.url=jdbc:mysql://${DATABASE_HOST:localhost}:${DATABASE_PORT:3306}/${DATABASE_NAME:jobportal}
spring.datasource.username=${DATABASE_USERNAME:root}
spring.datasource.password=${DATABASE_PASSWORD:root}
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=${FORMAT_SQL:true}
```

Let's break down each property:

### 📌 `spring.datasource.url` — The Connection URL

```
jdbc:mysql://${DATABASE_HOST:localhost}:${DATABASE_PORT:3306}/${DATABASE_NAME:jobportal}
```

This follows the JDBC URL format:

| Part | Meaning |
|------|---------|
| `jdbc:mysql://` | Protocol — we're using MySQL (not H2 anymore) |
| `${DATABASE_HOST:localhost}` | Hostname — defaults to `localhost` |
| `${DATABASE_PORT:3306}` | Port — defaults to `3306` (our Docker mapped port) |
| `${DATABASE_NAME:jobportal}` | Database schema name — matches what we set in Docker |

### 🧠 The Environment Variable Syntax

Notice the pattern: `${VARIABLE_NAME:default_value}`

This is Spring's **environment variable injection** syntax:
- If an environment variable named `DATABASE_HOST` exists → use its value
- If not → fall back to the default value `localhost`

**Why is this powerful?** In your local environment, the defaults work perfectly. But in production (QA, UAT, etc.), you can override these values by setting environment variables — no code changes needed!

#### How to set environment variables in IntelliJ:
1. Click the **three dots** next to your run configuration
2. Select **Edit**
3. Click **Modify Options** → **Environment Variables**
4. Add variables like `DATABASE_HOST=prod-db.example.com`

### 📌 `spring.datasource.username` and `password`

```properties
spring.datasource.username=${DATABASE_USERNAME:root}
spring.datasource.password=${DATABASE_PASSWORD:root}
```

- Default username: `root` (MySQL's default)
- Default password: `root` (what we set via `MYSQL_ROOT_PASSWORD` in Docker)

The password here **must match** the password you set when creating the Docker container.

### 📌 SQL Formatting Properties

```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=${FORMAT_SQL:true}
```

- `show-sql=true` — Prints generated SQL statements in the console
- `format_sql=true` — Formats those statements for readability

Why use an environment variable for `format_sql`? In **local development**, you want formatted SQL for debugging. In **production**, you don't want to print SQL at all — so you can override this to `false`.

---

## Step 3: Create Tables and Insert Data

### ❓ Why Do We Need This?

When we were using H2, Spring Boot auto-created tables from our entity classes. With MySQL, we've created a **brand new, empty database**. There are:
- No tables
- No data
- Just an empty `jobportal` schema

If you try to call the REST API now, you'll get an error:

> **No 'companies' table found**

### ⚙️ Executing SQL Scripts

You need to run two SQL files (available in the GitHub repo):

1. **`jobportal-schema.sql`** — Creates the `companies` table
2. **`jobportal-data.sql`** — Inserts company records

### Option A: Using IntelliJ Database Tool (Premium Version)

1. Look for the **database icon** next to `spring.datasource.url`
2. Click it → IntelliJ auto-creates a database connection
3. Or manually: click **+** → **Data Source** → **MySQL**
4. Click the **auto-populate** icon to fill in connection details from your properties
5. **Download MySQL driver** if prompted
6. Click **Test Connection** → should show success
7. Click **Apply** → **OK**

Now you can:
- Open the **Query Console** by right-clicking the schema
- Paste and execute the schema SQL first
- Then paste and execute the data SQL

### Option B: Using Sqlectron (Free Alternative)

If you don't have IntelliJ Premium:

1. Go to [sqlectron.github.io](https://sqlectron.github.io)
2. Download the **GUI version** for your OS
3. Create a new connection:
   - **Name:** jobportal database
   - **Database Type:** MySQL
   - **Hostname:** localhost
   - **Port:** 3306
   - **Username:** root
   - **Password:** root
   - **Initial Database:** jobportal
4. Test the connection → Save
5. Open the query console
6. Execute schema SQL, then data SQL

---

## Step 4: Verify Everything Works

After executing the SQL scripts:

1. **Start your Spring Boot application**
2. **Open Postman** (or any API client)
3. **Send a GET request** to your companies API
4. You should see all company records returned from MySQL! 🎉

The application is now reading data from a **real MySQL database** running inside a Docker container.

---

## The Complete Migration Checklist

```
✅ Remove H2 dependencies from pom.xml
✅ Add MySQL driver dependency
✅ Sync Maven changes
✅ Update application.properties with MySQL connection details
✅ Ensure Docker MySQL container is running
✅ Execute schema SQL (create tables)
✅ Execute data SQL (insert records)
✅ Start Spring Boot app and test APIs
```

---

## ✅ Key Takeaways

- Migrating from H2 to MySQL requires: **dependency swap**, **properties update**, and **SQL execution**
- Use the **environment variable syntax** (`${VAR:default}`) for all connection properties — it makes your app flexible across environments
- The MySQL password in `application.properties` **must match** what you set in the Docker container
- Tables and data are **not auto-created** in MySQL — you have to run SQL scripts manually (one-time setup)
- **Sqlectron** is a great free alternative to IntelliJ's built-in database tool

## ⚠️ Common Mistakes

- **Password mismatch** — The password in properties must match the Docker `MYSQL_ROOT_PASSWORD`
- **Port mismatch** — The port in properties must match the **host port** (first port) in your Docker `-p` mapping
- **Forgetting to run SQL scripts** — Your API will throw "table not found" errors
- **Not syncing Maven** after adding the MySQL dependency — The driver won't be downloaded

## 💡 Pro Tips

- Always use **environment variable syntax** in `application.properties` — even for local defaults. It's a professional habit that makes deployment easy
- The `runtime` scope on the MySQL driver means Spring Boot can switch databases just by changing the driver and properties — your JPA code stays the same!
- Keep your SQL scripts in a `sql/` folder in your project — they're useful for onboarding new developers
