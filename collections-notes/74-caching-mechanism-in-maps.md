# 📘 Caching Mechanism in Maps

---

## 📌 Introduction

### 🧠 What is this about?

Caching is one of the most powerful performance optimization techniques in software development — and Java's `Map` interface is perfectly designed to implement it. In this section, we'll explore how to use `HashMap` and `LinkedHashMap` to build caching systems that dramatically reduce computation time.

### ❓ Why does it matter?

- Some operations are **expensive** — computing Fibonacci numbers, querying a database, or fetching a web page takes time and resources.
- Without caching, your application **repeats the same work** over and over again, wasting CPU cycles and slowing things down.
- With caching, you compute once, store the result, and return it instantly the next time — turning O(2^n) problems into O(n).
- Every serious production application uses caching in some form. Understanding how it works at its core will make you a better developer.

---

## 🧩 Concept 1: What is Caching?

### 🧠 What is it?

Caching is the practice of **storing the results of expensive computations** so you can retrieve them quickly later without redoing the work.

Think of it like a notebook where you write down answers to math problems. The first time someone asks "What's 47 × 83?", you calculate it and write it down. The next time someone asks the same question, you just look at your notebook — no calculation needed.

In Java, a `Map` is the perfect data structure for caching:
- The **key** is the input (the question)
- The **value** is the cached result (the answer)

### ❓ Why do we need it?

Without caching, your application:
- Recalculates results it has already computed
- Makes redundant database queries for the same data
- Re-fetches web pages it already downloaded

This wastes time, memory, and CPU. Caching eliminates this redundancy.

### ⚙️ How it works

The caching pattern follows a simple flow:

1. **Check the cache** — Does the map already have a result for this input?
2. **Cache hit** — If yes, return the stored result immediately. No computation needed.
3. **Cache miss** — If no, compute the result, store it in the map, and then return it.

```
Request comes in with key K
    ↓
Is K in the cache (map)?
    ├── YES → Return cached value (cache hit) ✅
    └── NO  → Compute result, store in map, return result (cache miss) ❌→✅
```

Every subsequent request for the same key becomes a **cache hit** — an O(1) lookup instead of an expensive computation.

### 🧪 Example

```java
Map<String, String> cache = new HashMap<>();

public String getWebPage(String url) {
    if (cache.containsKey(url)) {
        System.out.println("Cache hit for: " + url);
        return cache.get(url);  // Return instantly
    }
    
    // Expensive operation — fetch from internet
    String content = fetchFromInternet(url);
    cache.put(url, content);  // Store for next time
    return content;
}
```

First call to `getWebPage("https://example.com")` → fetches from the internet (slow).  
Second call to `getWebPage("https://example.com")` → returns from cache (instant).

---

## 🧩 Concept 2: Fibonacci Caching with HashMap (Memoization)

### 🧠 What is it?

Memoization is a specific form of caching applied to **recursive functions**. The idea is simple: before computing a recursive call, check if you've already computed it before. If yes, return the stored result. If no, compute it, store it, and return it.

The classic example is the **Fibonacci sequence**, where each number is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, 13, 21...

### ❓ Why do we need it?

Without caching, a naive recursive Fibonacci implementation is **catastrophically slow**. Why? Because it recalculates the same values over and over.

```
fibonacci(5)
├── fibonacci(4)
│   ├── fibonacci(3)
│   │   ├── fibonacci(2)
│   │   │   ├── fibonacci(1) → 1
│   │   │   └── fibonacci(0) → 0
│   │   └── fibonacci(1) → 1
│   └── fibonacci(2)         ← REPEATED!
│       ├── fibonacci(1) → 1
│       └── fibonacci(0) → 0
└── fibonacci(3)              ← REPEATED!
    ├── fibonacci(2)          ← REPEATED AGAIN!
    │   ├── fibonacci(1) → 1
    │   └── fibonacci(0) → 0
    └── fibonacci(1) → 1
```

Look at how many times `fibonacci(2)` and `fibonacci(3)` are calculated! For `fibonacci(5)`, this is manageable. But for `fibonacci(50)`? The time complexity is **O(2^n)** — that's over 1 quadrillion operations. Your program will never finish.

### ⚙️ How it works

With memoization using a `HashMap`:

1. Before computing `fibonacci(n)`, check if `n` is already in the cache.
2. If it is → return the cached value immediately (no recursion needed).
3. If it isn't → compute it recursively, store the result in the cache, then return it.

This way, each Fibonacci number is computed **exactly once**. Time complexity drops from O(2^n) to **O(n)** — a massive improvement.

### 🧪 Example

```java
public class FibonacciCache {
    private Map<Integer, Integer> cache = new HashMap<>();

    public int fibonacci(int n) {
        if (n <= 1) return n;  // Base cases: fib(0)=0, fib(1)=1

        // Check the cache first
        if (cache.containsKey(n)) {
            System.out.println("Fetching from cache for " + n);
            return cache.get(n);
        }

        // Cache miss — compute and store
        int result = fibonacci(n - 1) + fibonacci(n - 2);
        cache.put(n, result);
        return result;
    }
}
```

Let's trace what happens when we call `fibonacci(5)`:

```
fibonacci(5) → not cached → compute fibonacci(4) + fibonacci(3)
  fibonacci(4) → not cached → compute fibonacci(3) + fibonacci(2)
    fibonacci(3) → not cached → compute fibonacci(2) + fibonacci(1)
      fibonacci(2) → not cached → compute fibonacci(1) + fibonacci(0)
        fibonacci(1) → returns 1 (base case)
        fibonacci(0) → returns 0 (base case)
      fibonacci(2) = 1 → STORED in cache
      fibonacci(1) → returns 1 (base case)
    fibonacci(3) = 2 → STORED in cache
    fibonacci(2) → CACHE HIT! Returns 1 ✅
  fibonacci(4) = 3 → STORED in cache
  fibonacci(3) → CACHE HIT! Returns 2 ✅
fibonacci(5) = 5 → STORED in cache
```

Notice how `fibonacci(2)` and `fibonacci(3)` are only computed **once** — every subsequent call hits the cache. During the recursive backtracking, intermediate results like `fib(2)`, `fib(3)`, and `fib(4)` are stored and immediately reused.

Now, if you call `fibonacci(5)` **again**:

```java
fibonacci(5) → CACHE HIT! Returns 5 instantly ✅
```

No recursion at all. The entire result is already cached.

---

## 🧩 Concept 3: LRU Cache with LinkedHashMap

### 🧠 What is it?

An **LRU (Least Recently Used) Cache** is a cache that has a **fixed size**. When the cache is full and a new entry needs to be added, it **removes the least recently accessed entry** to make room.

Why not just let the cache grow forever? Because memory is finite. An unlimited cache will eventually consume all available memory, causing your application to crash with an `OutOfMemoryError`.

Java's `LinkedHashMap` provides a built-in mechanism to implement LRU caching — you don't even need a third-party library.

### ❓ Why do we need it?

Think about a web browser's cache. It stores recently visited web pages so they load faster on revisit. But it can't store every page you've ever visited — that would fill up your hard drive. So it removes the **oldest, least-used pages** when space runs out.

The same principle applies in server applications:
- **Database query caching** — cache recent queries, but don't let the cache grow unbounded
- **Session caching** — keep active user sessions in memory, evict inactive ones
- **API response caching** — cache recent API responses, remove stale ones

### ⚙️ How it works

Here's the key insight: `LinkedHashMap` can maintain entries in **access order** (not just insertion order). This means every time you `get()` or `put()` an entry, it moves to the **end** of the internal linked list. The **beginning** of the list always holds the **least recently accessed** entry.

The implementation involves three critical pieces:

**1. The constructor — `super(capacity, 0.75f, true)`:**
- `capacity` — initial capacity of the map
- `0.75f` — load factor (when to resize internally; 75% is the default)
- `true` — **this is the magic flag**: it enables **access-order** instead of insertion-order. Without this, LRU doesn't work.

**2. The `removeEldestEntry()` method:**
- This method is called automatically **after every `put()`** operation
- If it returns `true`, the eldest (least recently used) entry is removed
- By overriding it to return `size() > capacity`, we enforce the size limit

**3. Access-order behavior:**
- Every `get()` or `put()` moves the entry to the end of the list
- The entry at the beginning is always the one accessed longest ago — the LRU entry

### 🧪 Example

```java
public class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);  // true = access order
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity;  // Remove oldest when over capacity
    }
}
```

Let's trace through a demo with `capacity = 3`:

```java
LRUCache cache = new LRUCache(3);

cache.put(1, 100);  // Cache: {1=100}
cache.put(2, 200);  // Cache: {1=100, 2=200}
cache.put(3, 300);  // Cache: {1=100, 2=200, 3=300}  — Full!

// Now add a 4th entry — cache is full, so LRU entry (key=1) gets evicted
cache.put(4, 400);  // Cache: {2=200, 3=300, 4=400}  — key 1 removed!

System.out.println(cache.get(1));  // null — it was evicted
System.out.println(cache.get(2));  // 200  — still in cache
```

What if we access key `2` before adding key `4`?

```java
LRUCache cache = new LRUCache(3);
cache.put(1, 100);  // Cache: {1=100}
cache.put(2, 200);  // Cache: {1=100, 2=200}
cache.put(3, 300);  // Cache: {1=100, 2=200, 3=300}

cache.get(1);       // Access key 1 — moves to end
                    // Internal order: {2=200, 3=300, 1=100}

cache.put(4, 400);  // Now key 2 is the LRU, not key 1!
                    // Cache: {3=300, 1=100, 4=400}  — key 2 removed!
```

This is the power of access-order: **using an entry keeps it alive**. Only truly unused entries get evicted.

---

## 🧩 Concept 4: Real-World Applications of Map-Based Caching

### 🧠 What is it?

Caching with Maps isn't just a textbook exercise — it's a fundamental pattern used across the entire software industry. Let's look at where and how this pattern appears in real applications.

### ❓ Why do we need it?

Every application has operations that are **slow but repeatable**. Caching turns these from performance bottlenecks into instant lookups.

### ⚙️ How it works in practice

| Use Case | Key | Value | Why Cache? |
|----------|-----|-------|------------|
| **Web page caching** | URL | Page HTML | Avoid re-fetching from server |
| **Database query caching** | Query string / parameters | Query result | Avoid hitting the database repeatedly |
| **Computed result caching** | Function input | Function output | Avoid re-computing expensive algorithms |
| **API response caching** | Request URL + params | Response body | Reduce API calls and latency |
| **DNS caching** | Domain name | IP address | Avoid DNS lookups on every request |
| **Session caching** | Session ID | User data | Keep active sessions in fast memory |

### 🧪 Example

A practical database query cache:

```java
public class QueryCache {
    private final Map<String, List<Map<String, Object>>> cache = new LinkedHashMap<>(100, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, List<Map<String, Object>>> eldest) {
            return size() > 100;  // Keep max 100 cached queries
        }
    };

    public List<Map<String, Object>> executeQuery(String sql) {
        if (cache.containsKey(sql)) {
            System.out.println("Cache hit: " + sql);
            return cache.get(sql);
        }

        // Expensive database call
        List<Map<String, Object>> result = database.query(sql);
        cache.put(sql, result);
        return result;
    }
}
```

---

## ✅ Key Takeaways

1. **Caching = storing results for quick reuse.** Maps are ideal because they provide O(1) key-based lookup.
2. **Memoization** is caching applied to recursive functions — it can reduce time complexity from O(2^n) to O(n).
3. **`HashMap`** gives you a simple, unlimited cache. Good for scenarios where the number of unique inputs is bounded.
4. **`LinkedHashMap` with access-order** gives you a bounded LRU cache — it automatically evicts the least recently used entries.
5. The **`removeEldestEntry()`** method is the hook that makes `LinkedHashMap` a ready-made LRU cache.
6. The third parameter in `LinkedHashMap`'s constructor (`true` for access-order) is the critical switch — without it, eviction is based on insertion order, not usage.

---

## ⚠️ Common Mistakes

1. **Forgetting the `true` flag in `LinkedHashMap`'s constructor** — Without `accessOrder = true`, the map uses insertion order. Your "LRU" cache will evict based on when items were added, not when they were last used. That's not LRU.

2. **Not considering thread safety** — `HashMap` and `LinkedHashMap` are **not thread-safe**. In a multi-threaded application, concurrent reads and writes will corrupt the cache. Use `Collections.synchronizedMap()` or `ConcurrentHashMap` for thread-safe caching.

3. **Using an unbounded cache for unbounded inputs** — If your cache key space is infinite (e.g., caching user-generated queries), an unlimited `HashMap` will eventually eat all your memory. Always use a bounded cache (like LRU) for unpredictable input sets.

4. **Caching mutable objects** — If you cache an object and then modify it, the cached version changes too (because Java stores references, not copies). This leads to subtle, hard-to-debug issues.

5. **Not invalidating stale cache entries** — Cached data can become outdated. If the underlying data changes (e.g., database update), the cache still serves the old value. Consider TTL (time-to-live) strategies for production caches.

---

## 💡 Pro Tips

1. **Use `computeIfAbsent()` for cleaner caching code** — Instead of the check-then-compute pattern, Java 8's `computeIfAbsent()` does it in one call:
   ```java
   cache.computeIfAbsent(n, key -> fibonacci(key - 1) + fibonacci(key - 2));
   ```

2. **For production caching, consider libraries like Caffeine or Guava Cache** — They offer features like TTL expiration, maximum size, statistics, and thread safety out of the box.

3. **LRU isn't the only eviction strategy** — There's also LFU (Least Frequently Used), FIFO (First In First Out), and TTL-based eviction. Choose based on your access pattern.

4. **`LinkedHashMap.removeEldestEntry()` is called after `put()`**, not after `get()`. The map grows by one, then the eldest is removed — so the actual size never exceeds `capacity + 1` for a brief moment during `put()`.

5. **For Fibonacci-style problems, bottom-up dynamic programming (iterative) is often better than top-down memoization** — it avoids recursion stack depth issues and is simpler to reason about. But memoization is a great general-purpose pattern for understanding caching.
