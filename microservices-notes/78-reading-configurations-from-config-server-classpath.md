# Reading Configurations from Config Server Classpath

## Introduction

Our Config Server is built and ready, but it has nothing to serve yet. In this section, we move all microservice configuration files into the Config Server's classpath and configure it to read from there. This is the simplest storage approach — perfect for understanding how the Config Server works before moving to more production-ready options like Git.

---

## Step 1: Move Properties to the Config Server

### Creating the Storage Directory

Inside the Config Server's `src/main/resources`, create a `config` folder. This folder will hold all configuration files for all microservices.

### File Naming Convention (Critical!)

Here's the key insight: each file must be named after its **microservice's application name**, not `application.yml`.

Why? Because the Config Server needs to know which properties belong to which microservice. If every file is called `application.yml`, there's no way to distinguish accounts properties from loans properties.

The naming convention:

| File Name | Microservice | Profile |
|-----------|-------------|---------|
| `accounts.yml` | accounts | default |
| `accounts-prod.yml` | accounts | prod |
| `accounts-qa.yml` | accounts | qa |
| `loans.yml` | loans | default |
| `loans-prod.yml` | loans | prod |
| `loans-qa.yml` | loans | qa |
| `cards.yml` | cards | default |
| `cards-prod.yml` | cards | prod |
| `cards-qa.yml` | cards | qa |

⚠️ **Use hyphens, not underscores!** `accounts-prod.yml` is correct. `accounts_prod.yml` will silently fail.

### What Goes Into These Files?

Only the properties that need externalization — the ones that change between environments. **Not** server config like ports or database settings:

```yaml
# accounts-prod.yml
build:
  version: "1.0"

accounts:
  message: "Welcome to EazyBank accounts prod APIs"
  contactDetails:
    name: "Product Owner"
    email: "prod@eazybank.com"
  onCallSupport:
    - "(555) 666-7777"
    - "(555) 888-9999"
```

Remove any `spring.config.activate.on-profile` entries — the Config Server determines the profile from the file name (the `-prod` suffix), not from properties within the file.

---

## Step 2: Configure the Config Server to Read from Classpath

In the Config Server's `application.yml`, add:

```yaml
server:
  port: 8071

spring:
  application:
    name: "configserver"
  profiles:
    active: "native"
  cloud:
    config:
      server:
        native:
          search-locations: "classpath:/config"
```

Let's break this down:

- `spring.profiles.active: native` — Activates the **native** profile, which tells Spring Cloud Config Server to read from a local location (classpath or file system) instead of Git
- `spring.cloud.config.server.native.search-locations` — Specifies where to look for configuration files
- `classpath:/config` — Points to the `config` folder inside `src/main/resources`

---

## Step 3: Validate the Config Server

Start the Config Server and access its REST endpoints. The URL pattern is:

```
http://localhost:8071/{application-name}/{profile}
```

### Testing All Combinations

| URL | Returns |
|-----|---------|
| `localhost:8071/accounts/prod` | accounts prod + default properties |
| `localhost:8071/accounts/qa` | accounts QA + default properties |
| `localhost:8071/accounts/default` | accounts default properties only |
| `localhost:8071/loans/prod` | loans prod + default properties |
| `localhost:8071/cards/qa` | cards QA + default properties |

### Understanding the Response

When you hit `localhost:8071/accounts/prod`, you get both:
1. Properties from `accounts-prod.yml` (profile-specific)
2. Properties from `accounts.yml` (default)

Why both? Because the default profile always loads as a baseline. The profile-specific properties **override** matching defaults — same behavior as Spring Boot profiles, just served remotely.

### JSON Response Format

The Config Server returns configuration as JSON:

```json
{
  "name": "accounts",
  "profiles": ["prod"],
  "propertySources": [
    {
      "name": "classpath:/config/accounts-prod.yml",
      "source": {
        "build.version": "1.0",
        "accounts.message": "Welcome to prod APIs",
        ...
      }
    },
    {
      "name": "classpath:/config/accounts.yml",
      "source": {
        "build.version": "3.0",
        "accounts.message": "Welcome to local APIs",
        ...
      }
    }
  ]
}
```

The `propertySources` array is ordered by precedence — profile-specific first, default second.

---

## The Magic Moment

Think about what's happening here. Your Config Server knows nothing about Java controllers, business logic, or microservice architecture. It simply:
1. Reads YAML files from a folder
2. Serves them as JSON via REST endpoints
3. Matches files to microservices by name
4. Matches profiles by the suffix in the filename

Your microservices will call these REST endpoints during startup and load their configuration. The Config Server is a pure configuration distribution service.

---

## ✅ Key Takeaways

- Store config files in `src/main/resources/config/` of the Config Server
- Files must be named `{application-name}.yml` and `{application-name}-{profile}.yml`
- Use **hyphens** in file names, not underscores
- Activate the `native` profile to read from classpath or file system
- Validate via REST: `http://localhost:8071/{app-name}/{profile}`
- Default profile properties always load alongside profile-specific ones

⚠️ **Common Mistake:** Using underscore (`accounts_prod.yml`) instead of hyphen (`accounts-prod.yml`). The Config Server won't recognize the file as a profile-specific configuration, and your profile properties will silently not load.

💡 **Pro Tip:** Install a JSON viewer extension in your browser (like "JSON Viewer") to see the Config Server responses in a readable, formatted layout.
