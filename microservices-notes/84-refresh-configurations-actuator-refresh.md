# Refresh Configurations at Runtime Using Actuator Refresh

## Introduction

Everything seems perfect — microservices connect to the config server, load their properties, and serve traffic. But what happens when you need to **change a property without restarting** hundreds of microservice instances? That's the challenge we tackle here.

---

## The Problem: Static Configuration After Startup

Microservices load their properties from the config server **only during startup**. Once started, they hold those values in memory. If you update a property in GitHub, the config server picks it up — but your running microservices still have the old values.

Why not just restart?

In a microservices environment with **hundreds of services** and **multiple instances each**, restarting means:
- Manual coordination across teams
- Downtime or traffic disruption
- Operational overhead that doesn't scale

What you really need is a way to **push configuration updates to running microservices without restarting them**.

---

## The Solution: Actuator's `/refresh` Endpoint

Spring Boot Actuator provides a `/refresh` endpoint. When invoked (via HTTP POST), it tells the microservice: "Hey, go back to the config server, check for changes, and reload any properties that have been updated."

---

## Setting It Up

### Step 1: Ensure Actuator Dependency Exists

Every microservice needs `spring-boot-starter-actuator` in its `pom.xml`. We added this long ago, so it should already be there.

### Step 2: Switch from Record to Class for Config DTOs

Here's a subtle but important requirement. If you're using Java `record` classes to hold configuration properties (like `AccountsContactInfoDto`), you have a problem: records are **immutable**. Once created, their fields can't change.

To allow runtime property refresh, convert records to regular classes with `@Getter` and `@Setter` (from Lombok):

```java
@Getter
@Setter
@ConfigurationProperties(prefix = "accounts")
public class AccountsContactInfoDto {
    private String message;
    private Map<String, String> contactDetails;
    private List<String> onCallSupport;
}
```

Do this for **all** microservices' configuration DTOs.

### Step 3: Expose the Refresh Endpoint

In each microservice's `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

Using `*` exposes **all** management endpoints, including `refresh`. You could be more selective with `include: "refresh"`, but we'll need other endpoints later.

---

## How It Works in Practice

### The Flow

1. **Push new config** to the GitHub repo (e.g., change a message from "prod" to "production")
2. The config server **automatically** picks up the latest from GitHub (no restart needed)
3. **Invoke** `POST /actuator/refresh` against a specific microservice instance
4. The microservice contacts the config server, fetches changed properties, and reloads them
5. The response tells you **which properties changed**: e.g., `["accounts.message", "config.client.version"]`

### Testing It

Before refresh:
```
GET /api/contact-info → message: "prod APIs"
```

Invoke refresh:
```
POST /actuator/refresh → ["accounts.message"]
```

After refresh (no restart!):
```
GET /api/contact-info → message: "production APIs"
```

---

## The Drawback: It Doesn't Scale

This approach works, but has a **serious limitation**. 

Imagine 100 microservices with 5 instances each = **500 instances**. You'd need to invoke `/actuator/refresh` on each one individually. That's 500 HTTP POST calls!

Some teams automate this with scripts or CI/CD jobs, but it's still cumbersome and error-prone. What if you miss an instance? What if some calls fail?

There has to be a better way — and there is. That's where **Spring Cloud Bus** comes in (next lecture).

---

## ✅ Key Takeaways

- Actuator's `/refresh` endpoint lets you reload config **without restarting** the microservice
- Config DTOs must use mutable classes (not records) with getters and setters
- Expose the refresh endpoint via `management.endpoints.web.exposure.include`
- The config server always reads the latest from GitHub — no restart needed there
- The catch: you must invoke `/refresh` on **every single instance** individually

---

## ⚠️ Common Mistakes

- Using `record` classes for config properties — they're immutable and can't be refreshed
- Forgetting to expose the actuator endpoints — the `/refresh` path won't be accessible
- Sending a GET request instead of POST to `/actuator/refresh` — it only supports POST
