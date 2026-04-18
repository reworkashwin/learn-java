# Boosting Cache Performance with Caffeine (TTL Included)

## Introduction

In the previous lecture, we learned *why* we need TTL-based caching and saw the configuration code. Now it's time to **implement it** in our job portal application — adding the Caffeine dependency, writing the configuration class, identifying new caching opportunities, and testing everything with real timing comparisons.

---

## Step 1: Add the Caffeine Dependency

### 🧠 What is Caffeine?

Caffeine is a **high-performance, in-memory caching library** for Java. It was built by the makers of Google's Guava library as a modern replacement for `ConcurrentHashMap` and `EhCache`.

Key features:
- **Size-based eviction** — automatically removes entries when the cache is full
- **Time-based expiration** — TTL support out of the box
- **Asynchronous refresh** — can refresh entries in the background
- **Automatic loading** — can auto-populate cache entries
- **No installation required** — runs inside your JVM, no external server

You can find the official repo at [GitHub: ben-manes/caffeine](https://github.com/ben-manes/caffeine).

### Adding to `pom.xml`

```xml
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

> 💡 Spring Boot manages the Caffeine version, so you don't need to specify a version number.

---

## Step 2: Create the Cache Configuration Class

Create a new package called `cache` and add a configuration class:

```java
package com.example.jobportal.cache;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Configuration
public class CaffeineCacheConfig {

    @Bean
    public CacheManager cacheManager() {

        // Jobs cache - 10 min TTL, max 5000 entries
        CaffeineCache jobsCache = new CaffeineCache("jobs",
            Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(5000)
                .build());

        // Companies cache - 10 min TTL, max 500 entries
        CaffeineCache companiesCache = new CaffeineCache("companies",
            Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(500)
                .build());

        // Roles cache - 1 day TTL, max 100 entries
        CaffeineCache rolesCache = new CaffeineCache("roles",
            Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.DAYS)
                .maximumSize(100)
                .build());

        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(Arrays.asList(jobsCache, companiesCache, rolesCache));
        return manager;
    }
}
```

### Breaking Down the Configuration

Each `CaffeineCache` is created with:
1. **A name** — must match the name used in `@Cacheable("name")`
2. **`expireAfterWrite`** — auto-expire after this duration
3. **`maximumSize`** — cap on number of entries

| Cache | TTL | Max Size | Why |
|-------|-----|----------|-----|
| `jobs` | 10 min | 5,000 | Job listings change moderately |
| `companies` | 10 min | 500 | Company data is semi-static |
| `roles` | 1 day | 100 | Roles are very stable — daily refresh is enough |

You can use any `TimeUnit`: `SECONDS`, `MINUTES`, `HOURS`, `DAYS`.

---

## Step 3: Identify a New Caching Scenario — Homepage Jobs

In the `CompanyController`, there's a **public REST API** that loads all companies with their active job listings for the homepage. This is called every time a user visits the homepage.

```java
// CompanyRepository or ServiceImpl
@Cacheable("jobs")
List<CompanyDto> findAllCompaniesWithActiveJobs(String status);
```

Why cache this?
- The homepage is visited **very frequently** by end users
- Fetching companies + jobs involves a **JOIN query** — relatively expensive
- Showing data that's up to 10 minutes old is perfectly acceptable for a homepage

### Why Not Use `@CacheEvict` Here?

Since we set a 10-minute TTL, we're okay with slightly stale data on the homepage. Instead of manually evicting the cache on every job create/update/delete, we let the TTL handle it automatically.

> 💡 **Insight:** This is a design trade-off. `@CacheEvict` gives you **immediate consistency** but requires more code. TTL gives you **eventual consistency** with zero extra work. Choose based on your business requirements.

---

## Step 4: Important — Cache Names Must Match!

The cache name in `@Cacheable("jobs")` **must exactly match** the name configured in `CaffeineCacheConfig`:

```java
// In config:
new CaffeineCache("jobs", ...)

// In annotation:
@Cacheable("jobs")  // ✅ matches!
@Cacheable("Jobs")  // ❌ case-sensitive mismatch!
```

If names don't match, the TTL configurations won't apply, and you may get unexpected behavior.

---

## Step 5: Demo — Measuring the Performance Difference

### Test Setup
- Changed jobs cache TTL temporarily to **1 minute** for easier testing

### First API Call (Cache MISS)
```
GET /api/public/companies
Response time: 417 ms
Console: JOIN SELECT query visible
```

### Second API Call (Cache HIT)
```
GET /api/public/companies
Response time: 49 ms
Console: No SQL statement!
```

> 📊 **Performance improvement: 417ms → 49ms** — roughly **8.5x faster**, and that's just with a simple in-memory cache!

### After 1 Minute (Cache EXPIRED)
```
GET /api/public/companies
Response time: 158 ms
Console: JOIN SELECT query fires again
```

The cache auto-expired, and the next request fetches fresh data from the database. The cache is then repopulated for another minute.

### Subsequent Call After Refresh
```
GET /api/public/companies
Response time: 52 ms
Console: No SQL statement
```

Back to cached performance!

---

## Properties-Based Configuration (Know It, But Don't Prefer It)

Spring also supports configuring Caffeine via `application.properties`:

```properties
spring.cache.type=caffeine
spring.cache.cache-names=jobs,companies,roles
spring.cache.caffeine.spec=maximumSize=5000,expireAfterAccess=600
```

### Where to Find Supported Specs

If you open the `CaffeineSpec` class in the Caffeine library, you'll see all supported specification keys. Spring's `CacheProperties.java` connects these to the `spring.cache.caffeine.spec` property.

### Why Bean Approach is Better

| Aspect | Properties | Bean |
|--------|-----------|------|
| Different TTL per cache | ❌ No | ✅ Yes |
| Fine-grained control | Limited | Full |
| Complex configurations | ❌ No | ✅ Yes |
| Easy to change per cache | ❌ No | ✅ Yes |

---

## Backend Cache vs Frontend Cache

An important distinction:

| Aspect | Backend Cache | Frontend Cache |
|--------|--------------|----------------|
| Location | Server RAM | Browser/client |
| Control | Developer controlled | Can be disabled by user |
| Bypass | Cannot be bypassed by end user | Cleared via cookies, incognito mode |
| Scope | All users benefit | Per-user only |

> 💡 **Pro Tip:** Backend cache is the real safety net. Even if users clear their browser cache or use incognito mode, the backend cache still protects your database from unnecessary load.

---

## ✅ Key Takeaways

1. **Caffeine** is a lightweight, high-performance, in-memory cache — no external installation needed.
2. Create a `@Configuration` class with a `CacheManager` bean to define caches with individual TTL and size limits.
3. Cache names in `@Cacheable` must **exactly match** the names in your config.
4. TTL provides **automatic cache refresh** — no manual eviction needed for time-sensitive data.
5. Real-world performance improvement observed: **417ms → 49ms** (8.5x faster).
6. Prefer **bean-based configuration** over properties — it gives per-cache flexibility.
7. `expireAfterWrite` is preferred over `expireAfterAccess` — ensures data freshness even under heavy read load.
8. Backend cache cannot be bypassed by end users — it's your strongest performance tool.

⚠️ **Common Mistake:** Setting TTL to an extremely short duration like 1 minute or less in production. While great for testing, very short TTLs in production negate the benefits of caching. Find the sweet spot based on your data's change frequency.
