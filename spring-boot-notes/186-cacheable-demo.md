# Live Demo — How `@Cacheable` Avoids Database Calls

## Introduction

We've learned the theory behind Spring caching. Now it's time to see it in action. In this hands-on demo, we'll add caching to our job portal application and watch how `@Cacheable` completely eliminates unnecessary database queries — with real SQL logs as proof.

---

## Step 1: Add the Caching Dependency

Before anything else, we need the Spring Cache starter in our `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

You can find this by searching for "cache" on [start.spring.io](https://start.spring.io) — it shows up as **Spring Cache Abstraction**.

💡 **Pro Tip:** By default (without adding any cache provider like Redis or Caffeine), Spring Boot stores cache data **in the application's memory** using a `ConcurrentMap`. This means the cache is wiped every time the app restarts.

---

## Step 2: Enable Caching

Add `@EnableCaching` to the main application class:

```java
@SpringBootApplication
@EnableCaching
public class JobPortalApplication {
    // ...
}
```

⚠️ **Common Mistake:** Forgetting this annotation! Without `@EnableCaching`, all your `@Cacheable` annotations are silently ignored.

---

## Step 3: Identify Caching Scenarios

Not every method deserves caching. You need to ask: *"Is this data static or rarely changing?"*

### Scenario 1: Roles Table (Perfect Candidate)

In our `AuthController`, whenever a new user registers, we fetch the default role (`ROLE_JOB_SEEKER`) from the database:

```java
// RoleRepository
@Cacheable("roles")
Role findRoleByName(String name);
```

Why is this a good candidate?
- The roles table has **only 3 records** — they almost never change.
- Every registration triggers this query — that's a lot of repeated DB calls for the same data.

Since this method accepts a single parameter (`name`), the parameter value itself becomes the cache key.

### Scenario 2: Company Data for Admin (Good Candidate)

When the admin views all companies, we fetch from the database every time:

```java
// CompanyServiceImpl
@Cacheable("companies")
public List<CompanyDto> getAllCompanies() {
    // fetch from database
}
```

Why cache this?
- Company data is **relatively static** — new companies aren't onboarded frequently.
- The admin might visit this page multiple times.

Since this method has **no input parameters**, Spring uses `SimpleKey.EMPTY` as the cache key — meaning there's only one cache entry for this method.

---

## Understanding Cache Key Generation

This is important — Spring uses the `SimpleKeyGenerator` class to decide cache keys:

| Method Parameters | Cache Key Strategy |
|---|---|
| **0 params** | `SimpleKey.EMPTY` — only one cache entry |
| **1 param** | The parameter value itself |
| **Multiple params** | Hash of all parameter values combined |

The framework class responsible for this is `SimpleKeyGenerator`. It calculates keys like this:

```java
// Pseudo-code of what happens internally
if (params.length == 0) return SimpleKey.EMPTY;
if (params.length == 1) return params[0];
return new SimpleKey(params); // hash of all params
```

### The Internal Storage: `ConcurrentMapCacheManager`

When no external cache provider is configured, Spring uses `ConcurrentMapCacheManager`:
- Cache data is stored in a `ConcurrentMap` (thread-safe HashMap)
- The `getCache(name)` method returns a `Cache` object for a given cache name
- All operations (get, put, evict) happen on this map

---

## Step 4: The Demo — Watching SQL Queries Disappear

### Testing Company Cache

1. **First visit** to Company Management page:
   - Console shows: `SELECT * FROM companies ...` (SQL query fires)
   - Data is fetched from DB and cached

2. **Second visit** (navigate away and come back):
   - Console shows: **No SQL statement!**
   - Execution time: **0 milliseconds**
   - Data served entirely from cache

> 📊 From ~100ms database call to **0ms** cached response — that's the power of `@Cacheable`.

### Testing Role Cache

1. **First user registration** (via Postman):
   ```
   POST /register
   Body: { "email": "testing@gmail.com", "mobile": "..." }
   ```
   - Console shows: `SELECT * FROM roles WHERE name = 'ROLE_JOB_SEEKER'`
   - Role entity fetched from DB and cached

2. **Second user registration** (different user):
   ```
   POST /register
   Body: { "email": "testing1@gmail.com", "mobile": "..." }
   ```
   - Console shows: **No role SELECT query!**
   - Only the user validation query and INSERT appear
   - The role was served from cache

---

## The Problem We Haven't Solved Yet

Right now, we're caching company data — great! But what happens when:
- An admin **updates** a company's details?
- An admin **deletes** a company?
- An admin **adds** a new company?

The cache still holds the **old data**. It's stale. Outdated. Wrong.

We need `@CachePut` and `@CacheEvict` to keep the cache in sync with the database. That's what we'll tackle next.

---

## ✅ Key Takeaways

1. Add `spring-boot-starter-cache` + `@EnableCaching` to get started — default cache uses in-memory `ConcurrentMap`.
2. `@Cacheable` on a method = "check cache first, DB second" — subsequent calls skip the method entirely.
3. Cache key is derived from **method parameters**: 0 params → empty key, 1 param → param value, N params → hash.
4. The default cache is **simple but limited** — no TTL, no eviction policy, wiped on restart.
5. Always check your SQL logs to **verify** caching is working — no SQL statement = cache hit.
6. Caching reads is only half the story — you must handle **writes, updates, and deletes** too.

💡 **Pro Tip:** During development, keep your SQL logging enabled (`spring.jpa.show-sql=true`). It's the easiest way to confirm whether your cache is actually working — if you don't see a SQL query, the cache served the data.
