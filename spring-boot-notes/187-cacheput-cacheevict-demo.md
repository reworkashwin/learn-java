# Keeping Cache in Sync — `@CachePut` & `@CacheEvict` Demo

## Introduction

In the previous lecture, we saw `@Cacheable` in action — it eliminated redundant database calls beautifully. But here's the catch: what happens when the underlying data **changes**? If someone updates or deletes a company record, our cache still serves the **old data**. That's stale, incorrect, and dangerous.

In this lecture, we'll fix that using `@CachePut` and `@CacheEvict`, and learn how Spring decides cache keys in different scenarios.

---

## The Problem: Stale Cache Data

We cached all company data using `@Cacheable("companies")` on the `getAllCompanies()` method. But our application also has:
- An **update** endpoint — admin can update company details
- A **delete** endpoint — admin can delete a company
- A **create** endpoint — admin can add a new company

After any of these operations, the cache is out of sync with the database. We need a strategy to **invalidate** or **update** the cache.

---

## Why `@CachePut` Didn't Work Here

You might think: *"Just use `@CachePut` on the update method!"* But there's a problem.

When we cached the company data, we used `@Cacheable("companies")` on a method with **no input parameters**. That means the cache key is `SimpleKey.EMPTY` — a single entry holding the entire list.

`@CachePut` works best when you can target a **specific key** in the cache. Since we don't have individual keys (just one giant list), we can't update a *specific* company in the cache.

> 💡 **Insight:** The choice of caching strategy depends on how you structured your cache keys in the first place. If you cached a list with no key, you'll likely need `@CacheEvict` with `allEntries = true` to reset.

---

## The Solution: `@CacheEvict` with `allEntries = true`

Instead of updating a specific entry, we **invalidate the entire cache** so the next request fetches fresh data from the database.

### Handling Update Scenario

When the admin updates a company, we evict the entire companies cache:

```java
// CompanyRepository
@CacheEvict(value = "companies", allEntries = true)
Company save(Company company);
```

What happens:
1. Admin updates company details → `save()` executes
2. `@CacheEvict` clears the entire `companies` cache
3. Next time someone requests company data → cache MISS → fresh DB query → cache repopulated

### Handling Delete Scenario

The `deleteById()` method lives in `CrudRepository` — it's framework code, so we can't annotate it directly. The solution is to **redeclare it** in our custom repository:

```java
// CompanyRepository
@CacheEvict(value = "companies", allEntries = true)
void deleteById(Long id);
```

By declaring this method in our repository interface, we can now add the `@CacheEvict` annotation. Note that we must use the concrete type (`Long`) instead of the generic placeholder.

### Handling Create Scenario

Same approach — redeclare the `save()` method with the concrete entity type:

```java
// CompanyRepository
@CacheEvict(value = "companies", allEntries = true)
Company save(Company company);
```

When a new company is created, the entire cache is invalidated, and the next request fetches all companies (including the new one) from the database.

---

## What About the Roles Cache?

For roles, we don't need `@CachePut` or `@CacheEvict` because:
- There's no UI functionality to create, update, or delete roles
- Roles are managed manually via SQL scripts
- The data is truly static in our application

The roles cache will naturally reset when the application restarts. And since roles almost never change, this is perfectly acceptable.

---

## Demo: Watching Cache Eviction in Action

### Update Scenario

1. Visit Company Management → SQL query fires (first time after restart)
2. Go back, come back → **No SQL** (cached!)
3. Edit a company: change rating from 4.5 to 4.4, employees to 15,000
4. Click Update → `@CacheEvict` fires → cache cleared
5. Page reloads → SQL query fires again (fresh data from DB)
6. Navigate away, come back → **No SQL** (re-cached with updated data!)

### Create Scenario

1. Add new company with some test data
2. Click Save → `@CacheEvict` fires → cache cleared
3. Company list reloads → SQL query fires (fetches all companies including the new one)
4. Navigate away, come back → **No SQL** (cached again!)

### Delete Scenario

1. Delete the test company
2. `@CacheEvict` fires → cache cleared
3. List reloads → SQL query fires (fresh data without deleted company)
4. Navigate away, come back → **No SQL** (cached!)

---

## How Spring Decides Cache Keys — Deep Dive

### Case 1: Single Input Parameter

```java
@Cacheable("users")
User findById(Long id);
```

| Input | Cache Key | Cache Value |
|-------|-----------|-------------|
| `id = 1` | `1` | `User1 object` |
| `id = 2` | `2` | `User2 object` |

### Case 2: Multiple Parameters

```java
@Cacheable("users")
User findByEmailAndRole(String email, String role);
```

The cache key becomes a **hash** of all parameter values combined. Spring calculates this internally using `SimpleKey`.

### Case 3: No Parameters

```java
@Cacheable("companies")
List<CompanyDto> getAllCompanies();
```

Key = `SimpleKey.EMPTY`. Only one cache entry exists. Method executes only once — all subsequent calls use the same cached result.

### Summary Table

| Params Count | Key Strategy |
|-------------|-------------|
| 0 | `SimpleKey.EMPTY` |
| 1 | Parameter value itself |
| 2+ | Hash of all parameter values |

---

## Custom Cache Keys

Sometimes the default key strategy isn't enough. Use the `key` attribute with **Spring Expression Language (SpEL)**:

```java
// Default behavior (explicit)
@Cacheable(value = "users", key = "#id")
User findById(Long id);

// Object parameter — use a specific field
@Cacheable(value = "users", key = "#user.email")
User findByUser(User user);
```

### Why Custom Keys Matter

If your method accepts an **object** as a parameter:
- Two different `User` objects with the same content have **different hash codes**
- Without a custom key, the cache treats them as different entries
- Solution: always specify a meaningful property as the key

### Common SpEL Key Expressions

| Expression | Meaning |
|-----------|---------|
| `#id` | Use the `id` parameter |
| `#user.email` | Use the `email` field of the `user` object |
| `#p0` | First parameter (positional) |
| `#result.id` | Use a field from the return value |

---

## ⚠️ Common Mistakes

1. **Forgetting to evict cache on data changes** — leads to stale data being served to users.
2. **Using `@Cacheable` on write operations** — `@Cacheable` is for reads only!
3. **Using entire objects as cache keys** — objects with same content can have different hash codes.
4. **Assuming same method = same cache entry** — different params = different keys.
5. **Not redeclaring framework methods** — you can't annotate `CrudRepository` methods directly; redeclare them in your custom repository.

---

## ✅ Key Takeaways

1. `@CacheEvict(allEntries = true)` clears the entire cache — use it when you can't target specific keys.
2. When data is truly static (like roles), you may not need `@CachePut` or `@CacheEvict` at all.
3. To annotate framework methods (like `deleteById`), **redeclare them** in your repository with concrete types.
4. Cache key strategy: 0 params → empty, 1 param → value, multiple → hash.
5. Always define **custom keys** when methods accept objects as parameters.
6. Think about **all the places** where your cached data might change — every create, update, and delete needs cache handling.

💡 **Pro Tip:** When designing your caching strategy, first sketch out all the methods that read, write, update, and delete data for a given entity. Then decide: which ones get `@Cacheable`? Which ones need `@CacheEvict`? This prevents the #1 caching bug — stale data.
