# Preventing Stale Data with TTL-Based Caching

## Introduction

We've implemented caching with `@Cacheable` and `@CacheEvict` — and it works great for scenarios where we explicitly update or delete data through our application. But what about the **roles cache**? We never evict it because there's no UI to manage roles. So what happens if the app runs for a month without restarting and someone quietly updates a role via a SQL script?

The answer: **stale data**. The cache would serve outdated information indefinitely. That's where **TTL (Time To Live)** comes in.

---

## The Problem with Default In-Memory Cache

With Spring's default `ConcurrentMapCacheManager`:
- Cache data lives **forever** (until app restart)
- No expiration mechanism
- No size limits
- If the application runs for weeks or months, cached data never refreshes

In enterprise applications, this is unacceptable because:
- Data can be changed externally (SQL scripts, other applications, database admins)
- Memory can grow unbounded
- There's no safety net for stale data

---

## What is TTL (Time To Live)?

### 🧠 What is it?

TTL is an **automatic expiration timer** for your cache. After the specified duration, the cache entry is automatically invalidated — the next request fetches fresh data from the database.

Think of it like milk in your fridge — it has an expiry date. Even if it looks fine, after the date passes, you replace it with fresh milk. TTL works the same way for cache data.

### ❓ Why do we need it?

| Without TTL | With TTL |
|-------------|----------|
| Cache never expires | Cache auto-expires after set time |
| Stale data risk | Automatic refresh guaranteed |
| No memory control | Maximum size enforced |
| Only manual eviction | Self-healing cache |

---

## Cache Providers That Support TTL

The default `ConcurrentMapCacheManager` **does not** support TTL. You need a real cache provider. Spring Boot supports several:

| Provider | Type | Notes |
|----------|------|-------|
| **Redis** | External (requires installation) | Most popular in enterprise |
| **Hazelcast** | External | Distributed caching |
| **Couchbase** | External | Document-oriented |
| **Infinispan** | External | Java-based data grid |
| **Caffeine** | In-memory (no installation) | High-performance, lightweight |
| **EhCache** | In-memory | Older, being replaced |

For learning purposes, **Caffeine** is ideal — it requires no separate installation (unlike Redis, which needs a Redis server setup).

---

## Configuring Cache with TTL — The Bean Approach

### ⚙️ How it works

Instead of relying on Spring's default cache, we create a `CacheManager` bean that defines individual caches with their own TTL and size limits:

```java
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

### Breaking it down

Each cache has two key configurations:

1. **`expireAfterWrite(duration, timeUnit)`** — How long until the cache entry expires after being written
2. **`maximumSize(n)`** — Maximum number of key-value pairs the cache can hold

| Cache | TTL | Max Entries | Rationale |
|-------|-----|-------------|-----------|
| `jobs` | 10 minutes | 5,000 | Jobs change moderately; 10 min is acceptable |
| `companies` | 10 minutes | 500 | Companies are semi-static |
| `roles` | 1 day | 100 | Roles rarely change; daily refresh is enough |

> 💡 **Insight:** Each cache has its own TTL. This is the major advantage of the bean approach — you can fine-tune expiration per cache.

---

## Configuring via Properties (Alternative)

You can also configure caching through `application.properties`:

```properties
spring.cache.type=caffeine
spring.cache.cache-names=jobs,companies,roles
spring.cache.caffeine.spec=maximumSize=5000,expireAfterAccess=600s
```

### ⚠️ Disadvantage of Properties Approach

Whatever specifications you define apply to **ALL caches equally**. You can't set different TTLs for different caches.

With the bean approach, you have full flexibility:
- `jobs` = 10 minutes
- `roles` = 1 day
- `companies` = 10 minutes

With the properties approach, all three would share the same TTL.

> 💡 **Pro Tip:** Always prefer the **bean-based configuration** over properties for cache setup. The flexibility it provides is essential in real applications.

---

## `expireAfterWrite` vs `expireAfterAccess`

Caffeine offers two expiration strategies:

### `expireAfterWrite(10, TimeUnit.MINUTES)`
- Timer starts when the cache entry is **written**
- After 10 minutes, the entry expires — regardless of whether it was accessed
- ✅ **Recommended** — guarantees data freshness

### `expireAfterAccess(10, TimeUnit.MINUTES)`
- Timer **resets** every time the entry is **accessed**
- Entry only expires if it's **not accessed** for 10 minutes
- If someone keeps reading every 5 minutes, the cache **never expires**
- ⚠️ Use with caution — frequently accessed data never refreshes

```
expireAfterWrite:
  Write → 10 min → EXPIRED (regardless of reads)

expireAfterAccess:
  Write → Read at 5 min → Read at 8 min → Read at 12 min → ...
  Timer keeps resetting. Cache NEVER expires if accessed frequently!
```

For most scenarios, `expireAfterWrite` is the safe choice.

---

## How Cache Specifications Work

If you're curious about what specifications Caffeine supports, look at the `CaffeineSpec` class in the library. It supports options like:
- `maximumSize` — max entries
- `maximumWeight` — max weight (for weighted entries)
- `expireAfterWrite` — TTL after write
- `expireAfterAccess` — TTL after access
- `refreshAfterWrite` — async refresh after write
- `recordStats` — enable statistics

---

## ✅ Key Takeaways

1. **Default Spring cache has no TTL** — cache entries live forever until app restart.
2. **TTL = automatic expiration** — cache refreshes itself without manual intervention.
3. Use a real cache provider like **Caffeine** (in-memory, no installation) or **Redis** (external, production-grade).
4. **Bean-based configuration** allows different TTL per cache — prefer this over properties.
5. **`expireAfterWrite`** is safer than `expireAfterAccess` — it guarantees data freshness.
6. Always set **`maximumSize`** to prevent unbounded memory growth.
7. TTL values depend on business requirements — 10 minutes for semi-dynamic data, 1 day for static data, 30 seconds for highly dynamic data.

⚠️ **Common Mistake:** Setting TTL too short (e.g., 5 seconds) defeats the purpose of caching. Setting it too long (e.g., 1 week) risks serving stale data. Find the right balance based on how often your data actually changes.
