# Introduction to Spring Boot Profiles

## Introduction

So far, we've learned how to read configuration properties in Spring Boot. But here's a critical question: what happens when you deploy the same microservice to dev, QA, and production — and each environment needs **different** values?

Your dev database has one set of credentials. Your QA database has another. Production has the real thing. You can't use the same `application.yml` values everywhere. This is where **Spring Boot Profiles** come in — one of the most important concepts for any microservices developer.

---

## The Problem: Same Code, Different Configs

Picture this scenario. You have an accounts microservice with properties like:

```yaml
build:
  version: "3.0"
accounts:
  message: "Welcome to local dev APIs"
  contactDetails:
    name: "Developer"
```

When you deploy to production, you need:

```yaml
build:
  version: "1.0"
accounts:
  message: "Welcome to production APIs"
  contactDetails:
    name: "Product Owner"
```

Without profiles, you'd have to change these values and **rebuild** your application for every environment. In a monolith, that's annoying. In microservices with hundreds of services? That's a nightmare.

---

## What Are Spring Boot Profiles?

### 🧠 The Concept

A profile is a **named group of configuration** that gets activated based on the current environment. Think of it like wardrobe outfits — you have one closet (your codebase), but you pick different outfits (property sets) depending on where you're going (dev, QA, production).

Spring Boot lets you create multiple configuration files, one per profile:

| File | Profile | When Used |
|------|---------|-----------|
| `application.yml` | `default` | Always loaded — your local dev baseline |
| `application-qa.yml` | `qa` | Activated for QA/testing environment |
| `application-prod.yml` | `prod` | Activated for production environment |

The naming convention is critical: `application-{profileName}.yml`

### ❓ What Happens When a Profile Is Activated?

When you activate the `prod` profile:

1. Spring first loads `application.yml` (default — always loaded)
2. Then loads `application-prod.yml`
3. Any property defined in **both** files? The profile-specific value **overrides** the default

This means your `application.yml` serves as the baseline, and profile files only need to contain the properties that **differ** from the default.

---

## How to Activate a Profile

The simplest way (which we'll improve upon later) is through a property:

```yaml
spring:
  profiles:
    active: prod
```

This tells Spring Boot: "Load the `prod` profile on startup."

You can even activate **multiple profiles** simultaneously:

```yaml
spring:
  profiles:
    active: prod, metrics, security
```

---

## Why Profiles Matter for Microservices

Here's the key principle profiles enable:

> **Once your application is built and packaged, it should NOT be modified.**

This is a core tenet of the Twelve-Factor App methodology and microservices architecture. You build your Docker image once, and the exact same image runs in dev, QA, staging, and production. The only thing that changes is which profile is activated.

Without profiles, every environment change means:
1. Modify config → 2. Rebuild → 3. Repackage → 4. Redeploy

With profiles:
1. Same package → 2. Activate different profile → Done ✅

---

## Profiles Can Also Control Bean Creation

Profiles aren't just for properties. You can conditionally create beans:

```java
@Bean
@Profile("prod")
public DataSource productionDataSource() {
    // Real database connection
}

@Bean
@Profile("dev")
public DataSource devDataSource() {
    // In-memory H2 database
}
```

This means your application's **behavior** can change based on the active profile, not just its configuration values.

---

## What Profiles Don't Solve

Profiles get us partway there, but they have a limitation: how do you activate a profile **without** hardcoding it in `application.yml`? If you write `active: prod`, you'd need to change it back to `qa` before deploying to QA — defeating the whole purpose.

The answer involves **externalized configuration** — passing the profile as a command-line argument, JVM property, or environment variable. We'll cover that next.

---

## ✅ Key Takeaways

- Profiles group configuration by environment (dev, QA, prod, etc.)
- File naming convention: `application-{profile}.yml`
- The `default` profile (`application.yml`) is always loaded first
- Profile-specific properties **override** default values when activated
- Activate with `spring.profiles.active` property
- Profiles ensure the same build artifact works across all environments
- They can also control which beans get created via `@Profile` annotation

💡 **Pro Tip:** Think of your default `application.yml` as containing everything that's **common** across environments. Profile files should only contain what **differs**.
