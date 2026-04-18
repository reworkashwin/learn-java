# Powerful Actuator Use Cases — Shutdown, Cache & Log Control

## Introduction

So far, we've been **reading** data from Actuator — health, beans, metrics, config. But Actuator can do more than just expose information. You can **give instructions** to your application through Actuator endpoints — shut down the server remotely, invalidate caches on-demand, and change logging levels at runtime.

These are the **power features** that developers use on a daily basis in production.

---

## Use Case 1: Remote Shutdown

### 🧠 The Scenario

A developer needs to shut down the application during off-hours to save cloud costs. Instead of SSH-ing into the server, they want to invoke a REST API.

### Enabling Shutdown

By default, the shutdown endpoint is **disabled**. Enable it with:

```properties
management.endpoints.shutdown.access=unrestricted
```

**Valid values:**
| Value | Behavior |
|-------|----------|
| `none` (default) | Shutdown disabled |
| `unrestricted` | Anyone can invoke shutdown |

### Invoking Shutdown

Shutdown requires a **POST** request — you can't trigger it from a browser:

```
POST /actuator/shutdown
```

**Response:**
```json
{
  "message": "Shutting down, bye..."
}
```

Your application will stop immediately.

### Handling CSRF with Actuator

If you're using Spring Security with CSRF protection, POST requests to Actuator will return **403 Forbidden**. Fix this by telling Spring Security to ignore CSRF for Actuator paths:

```java
csrf.ignoringRequestMatchers("/actuator/**")
```

Add this in your `SecurityConfig` class, right after your existing CSRF configuration.

### ⚠️ Important Limitations

- There is **no Actuator endpoint to start** the application — only shutdown
- To restart, someone must manually start the application on the server

---

## Use Case 2: Cache Invalidation

### 🧠 The Scenario

Your application caches company and job data. Something goes wrong with the cache — stale data, corruption, or you just need a fresh start. Instead of restarting the application or waiting for TTL expiration, you want to **clear the cache immediately**.

### Viewing Caches

```
GET /actuator/caches
```

Returns all configured caches — e.g., `jobs`, `companies`, `roles`.

### Clearing ALL Caches

```
DELETE /actuator/caches
```

**Response:** `204 No Content` — all caches are invalidated.

The next request to your application will hit the database instead of the cache.

### Clearing a Specific Cache

```
DELETE /actuator/caches/jobs
```

This clears only the `jobs` cache, leaving `companies` and `roles` intact.

### How to Verify

1. Invoke a REST API (e.g., `GET /api/companies`) — first call hits the database (SQL shows in logs)
2. Invoke again — data comes from cache (no SQL)
3. Delete the cache via Actuator
4. Invoke again — SQL appears again, confirming data was fetched from the database

---

## Use Case 3: Changing Log Levels at Runtime

### 🧠 The Scenario

You have a production issue and need to see **DEBUG** logs for a specific class. But production runs at **ERROR** level to minimize log noise. You can't redeploy just to change a logging level.

### Checking Current Log Level

```
GET /actuator/loggers
```

Find your package:
```json
"com.eazybytes.jobportal.aspects": {
    "configuredLevel": null,
    "effectiveLevel": "INFO"
}
```

### Setting a New Log Level

```
POST /actuator/loggers/com.eazybytes.jobportal.aspects.LoggingAndPerformanceAspect
```

**Body:**
```json
{
  "configuredLevel": "ERROR"
}
```

Now only ERROR-level logs will appear for that class. All INFO statements are suppressed.

### Targeting Scope

- **Package level:** `/actuator/loggers/com.eazybytes.jobportal` — affects all classes in the package
- **Class level:** `/actuator/loggers/com.eazybytes.jobportal.aspects.LoggingAndPerformanceAspect` — affects only that class

### Resetting to Default

```
POST /actuator/loggers/com.eazybytes.jobportal.aspects.LoggingAndPerformanceAspect
```

**Body:**
```json
{}
```

Sending an empty body resets the log level to the original default.

### The Workflow

1. Change log level to DEBUG for the problematic class
2. Reproduce the issue
3. Analyze the detailed logs
4. Reset the log level back to the default
5. No redeployment needed!

---

## Summary of Actuator Actions

| Action | Method | Endpoint | Purpose |
|--------|--------|----------|---------|
| Shutdown | POST | `/actuator/shutdown` | Remotely stop the application |
| View caches | GET | `/actuator/caches` | List all caches |
| Clear all caches | DELETE | `/actuator/caches` | Invalidate all caches |
| Clear one cache | DELETE | `/actuator/caches/{name}` | Invalidate a specific cache |
| View log levels | GET | `/actuator/loggers` | See configured/effective levels |
| Change log level | POST | `/actuator/loggers/{package.or.class}` | Set a new log level |
| Reset log level | POST | `/actuator/loggers/{package.or.class}` with `{}` | Restore default |

---

## ✅ Key Takeaways

- Actuator isn't just for reading — you can **perform actions** on your running application
- **Shutdown** lets you stop the app remotely (POST only, no start equivalent)
- **Cache invalidation** can be done instantly without restarting or waiting for TTL
- **Log level changes** happen at runtime — debug production issues without redeployment
- Always handle **CSRF** exemptions for Actuator POST/DELETE endpoints in Spring Security
- Refer to the [Spring Boot Actuator documentation](https://docs.spring.io/spring-boot/reference/actuator/) for the complete list of endpoints

---

## ⚠️ Common Mistakes

- Enabling shutdown without proper security — anyone with access can kill your app
- Clearing all caches when you only needed to clear one — use the specific path
- Forgetting to reset log levels after debugging — leaving DEBUG on wastes disk and performance
- Not excluding CSRF for Actuator paths and getting 403 errors on POST/DELETE

---

## 💡 Pro Tips

- Use shutdown to save cloud costs during off-peak hours (e.g., dev/staging environments at night)
- Combine cache invalidation with Actuator in your debugging workflow — suspect stale data? Clear and retry
- Keep a Postman collection with all your Actuator requests ready for quick access
