# Updating Accounts Microservice to Read from Config Server

## Introduction

The Config Server is running and serving configuration via REST endpoints. Now comes the crucial step: connecting our accounts microservice so it fetches its configuration from the Config Server instead of its own local YAML files. This transforms the microservice into a **Config Client**.

---

## Step 1: Clean Up Local Profile Files

Since configuration now lives in the Config Server, remove the profile-specific files from the accounts microservice:

- Delete `application-qa.yml`
- Delete `application-prod.yml`

In `application.yml`, remove:
- `spring.config.import` entries for local profile files
- `build.version` property (now in Config Server)
- Any profile activation settings (handled differently now)

What remains in `application.yml` are only the properties the microservice needs locally — like the server port and database configuration.

---

## Step 2: Give the Microservice an Identity

Add `spring.application.name` to `application.yml`:

```yaml
spring:
  application:
    name: "accounts"
```

This name is **critical**. When the accounts microservice connects to the Config Server, it says: "My name is `accounts`, give me my configuration." The Config Server then looks for files named `accounts.yml`, `accounts-prod.yml`, etc.

If this name doesn't match your Config Server file names, you'll get no configuration — with no error, just missing properties.

---

## Step 3: Set a Default Profile

```yaml
spring:
  profiles:
    active: "prod"
```

By default, the microservice will request the `prod` profile's configuration from the Config Server. This can be overridden externally via CLI, JVM, or environment variables — same as before.

---

## Step 4: Add the Config Client Dependency

In `pom.xml`, add:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

Also add the Spring Cloud version property and dependency management (same as in the Config Server):

```xml
<properties>
    <spring-cloud.version>2022.0.3</spring-cloud.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

## Step 5: Point to the Config Server

In `application.yml`, tell the microservice where to find the Config Server:

```yaml
spring:
  config:
    import: "optional:configserver:http://localhost:8071/"
```

Let's break down this URI:

| Part | Meaning |
|------|---------|
| `optional:` | If the Config Server is unreachable, start anyway (with warnings, not errors) |
| `configserver:` | This is a Config Server connection (not a local file import) |
| `http://localhost:8071/` | The Config Server's URL |

### With vs. Without `optional:`

- **With `optional:`** — The microservice starts even if Config Server is down. Useful during development when you might not always have the Config Server running.
- **Without `optional:`** — The microservice **fails to start** if Config Server is unreachable. Use this when configuration is absolutely critical and the service shouldn't run without it.

---

## Step 6: Start and Validate

### Startup Sequence

1. **Start the Config Server first** (port 8071)
2. **Then start the accounts microservice** (port 8080)

During accounts startup, you'll see logs like:

```
Fetching config from server at: http://localhost:8071
Located environment: name=accounts, profiles=[prod]
```

This confirms the microservice connected to the Config Server and loaded the `prod` profile configuration.

### Testing the Integration

With `prod` profile active:
- **`GET /api/build-info`** → `1.0` (from Config Server's `accounts-prod.yml`)
- **`GET /api/contact-info`** → Product owner details (from Config Server)

Now override the profile externally:

```
--spring.profiles.active=qa
```

Restart and test:
- **`GET /api/build-info`** → `2.0` (from Config Server's `accounts-qa.yml`)
- **`GET /api/contact-info`** → QA lead details

The same externalized configuration approaches (CLI, JVM, env vars) still work — they just tell the microservice which profile to **request** from the Config Server.

---

## How the Integration Works

Here's the full flow during startup:

```
Accounts Microservice starts
    ↓
Reads local application.yml
    → Name: "accounts"
    → Active profile: "prod"
    → Config import: "configserver:http://localhost:8071/"
    ↓
Calls Config Server: GET http://localhost:8071/accounts/prod
    ↓
Config Server returns properties from:
    → accounts-prod.yml (profile-specific)
    → accounts.yml (default baseline)
    ↓
Accounts merges remote config with local properties
    ↓
Application fully initialized with all configuration
```

Local properties (like `server.port`) are kept from the local YAML. Remote properties (like `build.version`, contact info) come from the Config Server. If there's a conflict, Config Server values take precedence.

---

## ✅ Key Takeaways

- Add `spring-cloud-starter-config` dependency for Config Client
- `spring.application.name` must match your Config Server file names exactly
- `spring.config.import: "optional:configserver:http://..."` establishes the connection
- Use `optional:` during development, remove in production if config is critical
- Always start the Config Server **before** the microservices
- External profile activation (CLI, JVM, env vars) works the same — it just tells the client which profile to request

⚠️ **Common Mistake:** Forgetting to add the `dependencyManagement` block for Spring Cloud dependencies. Without it, Maven can't resolve the `spring-cloud-starter-config` dependency version.
