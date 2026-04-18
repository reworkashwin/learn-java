# Collections Homework Solution — Building a Cache

## Introduction

In this lecture, we build a **cache** from scratch using an `ArrayList`. A cache stores recently accessed items so that repeated lookups are fast. Think of your browser's cache — it keeps recently visited websites handy so it doesn't have to fetch them from the internet every time. We'll implement an **LRU-style cache** (Least Recently Used) where the most recently accessed items sit at the front, and when the cache is full, the oldest item gets evicted.

---

## Concept 1: The Data Model — The `Pair` Class

### 🧠 What is it?

Each cache entry stores two things: a **URL** and its **content** (the page data). We model this as a simple `Pair` class.

### 🧪 Implementation

```java
public class Pair {
    private String url;
    private String data;

    public Pair(String url, String data) {
        this.url = url;
        this.data = data;
    }

    public String getUrl() { return url; }
    public String getData() { return data; }

    @Override
    public String toString() {
        return "Pair: " + url + " - " + data;
    }
}
```

Each `Pair` represents a cached website — the URL is the key, and the data is the content.

---

## Concept 2: The Cache Class

### 🧠 What is it?

The `Cache` class manages a list of `Pair` objects with a fixed capacity. It supports:

1. **Searching** for a URL
2. **Reordering** — recently accessed items move to the front
3. **Eviction** — when the cache is full, the least recently used item is removed

### ⚙️ How it works

```java
public class Cache {
    private static final int CAPACITY = 5;
    private List<Pair> cache;

    public Cache() {
        this.cache = new ArrayList<>();
    }
}
```

The cache can hold at most 5 items. When a 6th item arrives, the last item (least recently used) is removed.

---

## Concept 3: The `search()` Method — Core Logic

### ⚙️ Step-by-step breakdown

When a URL is searched:

**Step 1 — Check if the URL already exists in the cache:**

```java
Pair searchedItem = null;
for (Pair pair : cache) {
    if (pair.getUrl().equals(url)) {
        searchedItem = pair;
    }
}
```

**Step 2 — If found, move it to the front:**

```java
if (searchedItem != null) {
    cache.remove(searchedItem);
    cache.add(0, searchedItem);
}
```

This ensures the most recently accessed item is always at index 0.

**Step 3 — If not found, create a new entry:**

```java
else {
    Pair newPair = new Pair(url, "random content for " + url);

    // Evict oldest if at capacity
    if (cache.size() >= CAPACITY) {
        cache.remove(CAPACITY - 1);
    }

    // Insert at front
    if (cache.size() == 0) {
        cache.add(newPair);
    } else {
        cache.add(0, newPair);
    }
}
```

### ❓ Why check `cache.size() == 0`?

You cannot call `cache.add(0, item)` on an **empty** list — index 0 doesn't exist yet. For the first item, you must use `cache.add(item)`. After that, `cache.add(0, item)` works fine to insert at the front.

### 💡 Insight

This is essentially an **LRU (Least Recently Used) cache** — a concept used everywhere from CPU caches to database query caches to web browser histories. The idea: keep recently used items close, evict the ones you haven't touched in a while.

---

## Concept 4: Testing the Cache

### 🧪 Example

```java
Cache cache = new Cache();
cache.search("www.facebook.com");
cache.search("www.google.com");
cache.search("www.amazon.com");
cache.search("www.google.com");    // already cached — moves to front
cache.search("www.facebook.com");  // already cached — moves to front
cache.search("www.twitter.com");
cache.search("www.globalsoftwaresupport.com");
cache.search("www.bbc.com");
cache.search("www.cnn.com");
cache.search("www.facebook.com");
cache.search("www.google.com");
cache.search("www.amazon.com");

cache.showCache();
```

**Output (with CAPACITY = 5):**
```
Pair: www.amazon.com - random content
Pair: www.google.com - random content
Pair: www.facebook.com - random content
Pair: www.cnn.com - random content
Pair: www.bbc.com - random content
```

The most recently searched URLs appear first. Older entries that exceeded the capacity were evicted.

**With CAPACITY = 3:**
```
Pair: www.amazon.com - random content
Pair: www.google.com - random content
Pair: www.facebook.com - random content
```

Only the 3 most recently accessed items are kept.

---

## ✅ Key Takeaways

- A cache stores recently accessed data for fast retrieval
- `ArrayList` can serve as a simple cache with manual index management
- Recently accessed items are moved to index 0 (front of the list)
- When capacity is reached, the last item (index `CAPACITY - 1`) is evicted
- You cannot use `add(0, item)` on an empty list — use `add(item)` for the first insertion

## ⚠️ Common Mistakes

- Calling `cache.add(0, item)` on an empty list — this throws an IndexOutOfBoundsException
- Forgetting to remove the item before re-inserting it at index 0 (leads to duplicates)
- Not handling the capacity check before inserting new items

## 💡 Pro Tips

- In production, use `LinkedHashMap` with `removeEldestEntry()` for a cleaner LRU cache implementation
- Java's `Deque` (e.g., `ArrayDeque`) is also a good fit for cache-like structures where you frequently add/remove from both ends
- For thread-safe caches, consider `ConcurrentHashMap` or libraries like Guava's `Cache`
