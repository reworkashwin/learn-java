# Peeking Inside Spring — Beans, Config & Environment with Actuator

## Introduction

So far, Actuator has shown us health information. But Actuator is **much** more powerful than that. It can expose your application's **beans**, **auto-configuration decisions**, **property values**, and **environment variables** — all through simple REST API calls.

Think of it as a **window into the internals** of your Spring Boot application, without ever needing to open a single Java file.

---

## Exposing All Actuator Endpoints

### The Problem: Only Health Is Visible

By default, only `/actuator/health` is exposed. For security reasons, Spring Boot hides everything else.

### The Solution: The `include` Property

```properties
management.endpoints.web.exposure.include=*
```

The `*` wildcard exposes **all** Actuator endpoints. After a rebuild, you'll see dozens of endpoints.

### ⚠️ Don't Use `*` in Production!

Using `*` in production needlessly exposes internal details. Instead, list only what you need:

```properties
management.endpoints.web.exposure.include=beans,health,metrics,env,info
```

### Excluding Specific Endpoints

You can also exclude specific endpoints:

```properties
management.endpoints.web.exposure.include=*
management.endpoints.web.exposure.exclude=beans
```

This exposes everything **except** the `beans` endpoint.

💡 **Pro Tip:** Different profiles can have different exposure settings. Define stricter rules in `application-prod.properties` and more relaxed ones in `application-dev.properties`.

---

## The Beans Endpoint — `/actuator/beans`

### 🧠 What Does It Show?

This endpoint lists **every bean** created by Spring Framework and Spring Boot in your application.

### Why Is This Useful?

Imagine you're debugging a production issue and suspect a bean isn't being created properly. Instead of digging through code, just hit:

```
/actuator/beans
```

You'll see every bean — including your controllers, services, and repositories — along with:
- The class that defines the bean
- The scope (singleton, prototype, etc.)
- Dependencies

For example, searching for `ContactController` shows you that this bean was created from the `ContactController` class.

---

## The Conditions Endpoint — `/actuator/conditions`

### 🧠 What Does It Show?

This is the **auto-configuration report**. It reveals *why* certain beans were created and *why* others weren't.

### Three Categories:

| Category | Meaning |
|----------|---------|
| **Negative matches** | Beans that were **not** created — the condition wasn't met (e.g., a required library wasn't on the classpath) |
| **Positive matches** | Beans that **were** created by auto-configuration based on your dependencies |
| **Unconditional classes** | Beans that are **always** created, regardless of your setup |

This is the same report you'd see with `--debug` flag at startup, but available at runtime via REST API.

---

## The ConfigProps Endpoint — `/actuator/configprops`

### 🧠 What Does It Show?

All **configuration properties** used by your application, along with their current values.

### Default Behavior: Values Are Masked

For security, property values are **sanitized** (hidden) by default.

### Showing Property Values

```properties
management.endpoint.configprops.show-values=always
```

Now you can see exactly what values your application is using — `base-path`, `include` lists, JPA settings like `show-sql`, and more.

💡 **Singular vs Plural — It Matters!**

- `management.endpoint.configprops` (singular) → affects only the configprops endpoint
- `management.endpoints.web.base-path` (plural) → affects ALL endpoints

---

## The Env Endpoint — `/actuator/env`

### 🧠 What Does It Show?

All **environment properties** — application properties, system environment variables, JVM arguments.

### What You'll See:

- `server.port` = 8080
- `management.server.port` = 9090
- Java classpath, timezone, user details
- Every environment variable on your machine/server

### Showing Values (Also Sanitized by Default)

```properties
management.endpoint.env.show-values=always
```

### ❓ ConfigProps vs Env — What's the Difference?

| ConfigProps | Env |
|-------------|-----|
| Shows properties **bound to `@ConfigurationProperties` classes** | Shows **all** environment sources |
| Organized by property prefix | Organized by property source (system, application, etc.) |
| Focused on **application configuration** | Includes **system-level** variables too |

---

## ✅ Key Takeaways

- Use `management.endpoints.web.exposure.include` to control which endpoints are visible
- Never use `*` in production — be explicit about what you expose
- `/actuator/beans` shows every bean in your application context
- `/actuator/conditions` reveals auto-configuration decisions (positive/negative matches)
- `/actuator/configprops` displays bound configuration properties
- `/actuator/env` shows all environment properties including system-level variables
- Property values are **sanitized by default** — enable with `show-values=always` only when needed

---

## ⚠️ Common Mistakes

- Using `*` for endpoint exposure in production environments
- Confusing `endpoint` (singular — one endpoint) with `endpoints` (plural — all endpoints)
- Setting `show-values=always` in production and accidentally leaking sensitive data like passwords
- Forgetting to update security paths when changing Actuator base path

---

## 💡 Pro Tips

- QA and operations teams love `configprops` — they can verify which configuration is active without asking developers
- Use `env` to debug "why isn't my property being picked up?" issues
- The `conditions` endpoint is invaluable when an auto-configuration you expected isn't kicking in
