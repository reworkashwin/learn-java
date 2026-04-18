# Spring Caching Essentials — `@Cacheable`, `@CachePut`, `@CacheEvict`

## Introduction

So far in our job portal application, we've built REST APIs for the admin. Now before diving into employer functionality, we're going to learn a powerful backend concept — **Caching**.

As a backend developer, knowing how to implement caching is essential. It's one of those things that separates a good backend from a *great* one. Why? Because caching can improve the performance of your application by **thousands of times** in the right scenarios.

Let's break it down from scratch.

---

## What Is Caching?

### 🧠 What is it?

Caching means **storing frequently used data in memory** so the application can reuse it instead of recalculating or refetching from the database every time.

Think of it like a notebook on your desk. Instead of walking to the library every time you need a phone number, you jot down the numbers you use often. Next time — you just glance at your notebook. That's caching.

### ❓ Why do we need it?

In a typical backend architecture:
- Your **application server** and **database server** are on different machines — possibly in different cities or even continents.
- Every database call has to **travel over the network**, and the database reads data from the **disk** (file system).
- This takes **milliseconds** (50ms, 100ms, etc.).

Now imagine your app handles thousands of requests per second. Each one hitting the database? That's a recipe for slowdowns.

With caching:
- On the **first request**, data is fetched from the database and **stored in RAM** (memory).
- On **subsequent requests**, data is served from the cache — taking only **microseconds**.

> 📊 Disk read = milliseconds. RAM read = microseconds. That's a **1000x improvement**.

### ⚙️ How it works

```
First Request:
  Client → Backend → Database → Store in Cache → Return response

Subsequent Requests:
  Client → Backend → Cache (HIT!) → Return response (no database call)
```

The client never knows whether the data came from the database or from the cache — it's completely transparent.

---

## Why Caching Matters — The Advantages

Here are the key benefits of implementing caching in your backend:

| Benefit | Explanation |
|---------|------------|
| **Performance** | Avoids repeated database/API calls |
| **Faster Response** | Client applications get responses in microseconds instead of milliseconds |
| **Reduced Load** | Fewer unnecessary database queries = less stress on DB servers |
| **Better UX** | UI pages load faster since backend APIs respond quicker |

---

## Enabling Caching in Spring Boot

### ⚙️ How to set it up

**Step 1:** Add the caching starter dependency in `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

**Step 2:** Add `@EnableCaching` on any configuration class (typically the main application class):

```java
@SpringBootApplication
@EnableCaching
public class JobPortalApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobPortalApplication.class, args);
    }
}
```

That's it! Spring Boot is now ready to handle caching.

---

## The Three Core Caching Annotations

Spring provides three essential annotations for caching. Think of them like database CRUD operations:

| Annotation | Purpose | Analogy |
|-----------|---------|---------|
| `@Cacheable` | Read from cache; if not present, fetch and store | **GET / POST** (read + save) |
| `@CachePut` | Always execute the method and update the cache | **PUT / PATCH** (update) |
| `@CacheEvict` | Remove entry from cache or reset entire cache | **DELETE** (remove) |

---

## `@Cacheable` — Read and Store

### 🧠 What is it?

`@Cacheable` tells Spring: *"Before executing this method, check if the result is already in the cache. If yes, return the cached result. If not, execute the method, cache the result, and then return it."*

### 🧪 Example 1: Expensive Computation

```java
@Cacheable("piDecimals")
public double computePiDecimal(int precision) {
    // Complex calculation — takes ~100ms
    return calculatePi(precision);
}
```

How the cache works here:

```
First call with precision=10:
  → Cache MISS → Execute method (100ms) → Store result with key=10

Second call with precision=10:
  → Cache HIT → Return cached result (0ms) → Skip method entirely!

Call with precision=20:
  → Cache MISS → Execute method → Store with key=20
```

Behind the scenes, the cache uses a **Map structure**:
- **Key** = method input parameter (`10`, `20`)
- **Value** = method return value

### 🧪 Example 2: Static Database Lookups

```java
@Cacheable("roles")
Role findRoleByName(String name);
```

Our roles table has only three records (`ROLE_JOB_SEEKER`, `ROLE_EMPLOYER`, `ROLE_ADMIN`) — they almost never change. Perfect caching scenario!

- First call with `ROLE_JOB_SEEKER` → DB query fires → result cached with key `ROLE_JOB_SEEKER`
- Next call with same role → cached result returned instantly, no DB query

---

## `@CachePut` — Update the Cache

### 🧠 What is it?

`@CachePut` tells Spring: *"Always execute this method AND update the cache with the new result."*

Use this when the underlying data is being **updated**, so the cache stays in sync with the database.

### 🧪 Example

```java
@CachePut(value = "roles", key = "#role.name")
Role save(Role role);
```

When someone updates a role record:
1. The method executes (database update happens)
2. The cache entry for that specific key (`role.name`) gets updated with the new data

---

## `@CacheEvict` — Remove from Cache

### 🧠 What is it?

`@CacheEvict` tells Spring: *"When this method runs, remove the specified entry from the cache (or clear the entire cache)."*

### 🧪 Example: Delete a specific entry

```java
@CacheEvict(value = "roles", key = "#name")
void deleteRoleByName(String name);
```

When a role is deleted from the database, the corresponding cache entry is also removed.

### 🧪 Example: Clear the entire cache

```java
@CacheEvict(value = "roles", allEntries = true)
void deleteAll();
```

When all roles are deleted, the entire `roles` cache is wiped clean by using `allEntries = true`.

---

## When Should You Use Caching?

⚠️ **You should NOT use caching everywhere.** Only use it in specific, well-suited scenarios:

### ✅ Good Candidates for Caching

| Scenario | Why |
|----------|-----|
| **Expensive computations** | Methods that take significant time (e.g., complex math) |
| **Static/rarely-changing data** | Tables like roles, categories, configurations |
| **Read-heavy operations** | Data that's read far more often than written |
| **Database lookups** | Repeated queries for the same record |

### ❌ Bad Candidates for Caching

| Scenario | Why |
|----------|-----|
| Frequently changing data | Cache gets stale very quickly |
| Write-heavy operations | You'd be constantly invalidating the cache |
| User-specific dynamic data | Too many cache entries, low hit rate |

---

## Tips for Effective Caching

| Annotation | When to Use |
|-----------|-------------|
| `@Cacheable` | On **read-only** or static lookup methods |
| `@CachePut` | When **updating** records — keeps cache in sync with DB |
| `@CacheEvict` | When **deleting** data — removes stale entries |

⚠️ **Common Mistakes:**
- Using `@Cacheable` on write/update operations — this is wrong! `@Cacheable` is for reads.
- Forgetting `@EnableCaching` — without this, none of the caching annotations work.
- Using the entire object as a cache key — always use a specific identifier field.
- Forgetting that same method + different params = different cache keys.

---

## ✅ Key Takeaways

1. **Caching = storing data in memory** to avoid repeated DB calls — can improve performance by 1000x.
2. **Three annotations** — `@Cacheable` (read), `@CachePut` (update), `@CacheEvict` (delete).
3. Spring uses a **Map structure** internally — method params become keys, return values become values.
4. Add `spring-boot-starter-cache` dependency and `@EnableCaching` to get started.
5. **Don't cache everything** — only cache static, read-heavy, or expensive-to-compute data.
6. Always think about **cache invalidation** — when data changes, the cache must be updated or cleared.

💡 **Pro Tip:** Before implementing caching, ask yourself: *"Does this data change frequently? Is it expensive to fetch? Is it read far more than written?"* If the answers are No, Yes, Yes — cache it!
