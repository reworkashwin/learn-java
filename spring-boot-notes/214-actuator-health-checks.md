# Health Checks Made Easy with Spring Boot Actuator

## Introduction

You've added the Actuator dependency. Now let's actually **use it**. The first and most fundamental Actuator feature is the **health check endpoint**. This is exactly what DevOps teams rely on to know if your application is alive and kicking — or in trouble.

In this section, we'll explore how to access Actuator endpoints, handle Spring Security, view detailed health information, configure a custom port, and customize the base path.

---

## Accessing the Actuator Endpoints

### The Default Path

After adding the Actuator dependency, all its REST APIs are available under:

```
http://localhost:8080/actuator
```

### 🔒 But Wait — 403 Forbidden?

If you hit that URL and get a **403 error**, that's Spring Security doing its job. By default, Spring Security secures **every** endpoint — including Actuator's.

### The Fix: Allow Public Access to Actuator Paths

In your security configuration (e.g., `PathsConfig`), add the Actuator path to your public paths:

```java
"/actuator/**"
```

The `**` wildcard ensures all sub-paths under `/actuator` are also accessible without authentication.

After this change, rebuild and refresh — you'll see the Actuator response.

---

## The Health Endpoint

### 🧠 What Does It Show?

By default, Actuator **only exposes the health endpoint**. When you access:

```
http://localhost:8080/actuator/health
```

You get:

```json
{
  "status": "UP"
}
```

This single word — `UP` — tells the operations team that your application is running fine.

### How DevOps Uses This

Operations teams configure their monitoring tools (Nagios, Prometheus, custom scripts) to **invoke this API every 5–10 minutes**. If the status is `UP`, everything's fine. If not — alerts and notifications fire immediately.

---

## Viewing Detailed Health Information

### ❓ Why Just "UP" Isn't Enough

Your app depends on a **database**, **disk space**, and potentially other services. What if the database goes down but the app is still "up"? You need to see the health of **each dependent component**.

### Enabling Detailed Health Info

Add this to `application.properties`:

```properties
management.endpoint.health.show-details=always
```

**Options:**
| Value | Behavior |
|-------|----------|
| `never` (default) | Only shows overall status |
| `always` | Shows full component details for everyone |
| `when-authorized` | Shows details only to authenticated users |

### What You See Now

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP", "details": { "database": "MySQL", ... } },
    "diskSpace": { "status": "UP", "details": { "total": ..., "free": ..., "threshold": ... } },
    "ping": { "status": "UP" },
    "ssl": { "status": "UP" }
  }
}
```

You can now see:
- **Database** connectivity and type
- **Disk space** — total, free, and threshold
- **SSL** certificate details (populated in production environments)
- **Liveness** and **readiness** probes (useful for Kubernetes)

### Checking a Specific Component

Want only the database health? Append the component path:

```
/actuator/health/db
```

This returns just the database health details.

---

## Configuring a Separate Actuator Port

### ❓ Why Use a Different Port?

In production, you might want Actuator endpoints on a **separate port** so they're not exposed alongside your business APIs.

```properties
management.server.port=9090
```

Now your business APIs run on `8080`, and Actuator runs on `9090`:

```
http://localhost:9090/actuator/health
```

⚠️ **Important:** After adding this property, you must **restart** your application.

---

## Customizing the Base Path

### Default Base Path

All Actuator endpoints share the prefix `/actuator`.

### Changing It

```properties
management.endpoints.web.base-path=/job-portal/actuator
```

Now all Actuator endpoints are under:

```
http://localhost:9090/job-portal/actuator/health
```

Don't forget to **update your security configuration** to match the new path:

```java
"/job-portal/actuator/**"
```

💡 **Pro Tip:** Note the **plural** `endpoints` in the property name — this affects all Actuator endpoints globally.

---

## ✅ Key Takeaways

- Actuator exposes **only the health endpoint** by default — for security reasons
- Use `management.endpoint.health.show-details=always` to see dependent component health
- You can check individual components via `/actuator/health/{component}`
- Use `management.server.port` to run Actuator on a separate port
- Use `management.endpoints.web.base-path` to change the URL prefix
- Always update Spring Security config when changing Actuator paths

---

## ⚠️ Common Mistakes

- Forgetting to add `/actuator/**` to public paths in Spring Security
- Not restarting the application after changing the management port
- Using `endpoint` (singular) when you mean `endpoints` (plural) — they target different scopes
- Exposing detailed health info with `always` in production when `when-authorized` is more secure

---

## 💡 Pro Tips

- The `liveness` and `readiness` probes become essential in **Kubernetes deployments**
- In production, prefer `when-authorized` over `always` for `show-details`
- Monitoring tools like Prometheus can scrape the health endpoint automatically
