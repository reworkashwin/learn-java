# 📘 Map Interface — Key-Value Pairs for Fast Lookups

## 📌 Introduction

We've explored `List`, `Set`, and `Queue` — all of which store individual elements. Now we're entering a completely different territory: the **Map interface**. Instead of storing standalone items, a Map stores data in **key-value pairs** — like a dictionary where every word (key) has a definition (value).

Why is this important? Maps are everywhere in real-world programming — storing user profiles by ID, caching responses by URL, counting word frequencies, mapping country codes to country names. If you've ever needed to "look something up," you've needed a Map.

---

## 🧩 Concept 1: What is a Map?

### 🧠 What is it?

A `Map` is a collection that associates **keys** with **values**. Each key maps to exactly one value, forming a key-value pair. You use the key to store, retrieve, and remove data.

```
Key    →  Value
"US"   →  "United States"
"BR"   →  "Brazil"
"ES"   →  "Spain"
```

### ❓ Why do we need it?

Lists and Sets store individual elements, but they don't naturally support **lookups by identifier**. If you have a list of users and want to find user #42, you'd have to iterate through the entire list. With a Map, you just say `map.get(42)` — instant access.

### ⚙️ How it's different from other collections

Here's the crucial distinction: **Map does NOT extend the Collection interface**. Unlike `List`, `Set`, and `Queue` which all sit under the `Collection` hierarchy, `Map` has its own separate hierarchy where `Map` is the root interface.

```
Collection (root)          Map (separate root)
├── List                   ├── HashMap
├── Set                    ├── LinkedHashMap
└── Queue                  └── TreeMap
```

### 💡 Insight

Even though `Map` doesn't extend `Collection`, it's still part of the Java Collections Framework. It lives in `java.util` alongside everything else and provides its own set of methods tailored specifically for key-value operations.

---

## 🧩 Concept 2: Essential Map Methods

### 🧠 The Core Operations

The `Map` interface provides a focused set of methods for working with key-value pairs:

| Method | Description |
|---|---|
| `put(K key, V value)` | Adds a key-value pair (or replaces the value if the key exists) |
| `get(Object key)` | Returns the value associated with the key, or `null` if not found |
| `remove(Object key)` | Removes the key-value pair for the given key |
| `containsKey(Object key)` | Checks if the map contains the specified key |
| `containsValue(Object value)` | Checks if the map contains the specified value |
| `size()` | Returns the number of key-value pairs |
| `isEmpty()` | Returns `true` if the map has no entries |
| `clear()` | Removes all key-value pairs |

### 💡 Insight

Notice that `get()`, `remove()`, `containsKey()`, and `containsValue()` all accept `Object` — not the generic type. This is for backward compatibility and allows using any object type for lookups.

---

## 🧩 Concept 3: Map Methods in Action

Let's see each method working with a `HashMap` — the most commonly used `Map` implementation.

---

### 3a: `put()` — Adding Key-Value Pairs

```java
Map<Integer, String> map = new HashMap<>();

map.put(1, "Apple");
map.put(2, "Banana");
map.put(3, "Cherry");

System.out.println(map); // {1=Apple, 2=Banana, 3=Cherry}
```

Notice the output format: `key=value`, separated by commas inside curly braces.

---

### 3b: `get()` — Retrieving Values by Key

```java
String value = map.get(2);
System.out.println("Value for key 2: " + value); // Banana
```

If the key doesn't exist, `get()` returns `null`. Be careful — this can lead to `NullPointerException` if you auto-unbox.

---

### 3c: `remove()` — Deleting Key-Value Pairs

```java
map.remove(3); // Removes the "Cherry" entry
System.out.println(map); // {1=Apple, 2=Banana}
```

You pass the **key**, and the entire key-value pair gets removed.

---

### 3d: `containsKey()` and `containsValue()` — Existence Checks

```java
System.out.println(map.containsKey(3));       // false — we just removed it
System.out.println(map.containsKey(2));       // true

System.out.println(map.containsValue("Cherry")); // false — removed
System.out.println(map.containsValue("Banana")); // true
```

#### 💡 Insight

`containsKey()` is typically O(1) on `HashMap` (hash lookup), while `containsValue()` is O(n) because it must scan through all values. Prefer key-based lookups whenever possible.

---

### 3e: `size()` and `isEmpty()`

```java
System.out.println(map.size());    // 2
System.out.println(map.isEmpty()); // false
```

---

### 3f: `clear()` and `isEmpty()` Together

```java
map.clear();
System.out.println(map);           // {}
System.out.println(map.isEmpty()); // true
```

---

## 🧩 Concept 4: HashMap — The Default Implementation

### 🧠 What is it?

`HashMap` is a **hash table-based** implementation of the `Map` interface. It's the most commonly used `Map` and provides the fastest performance for most use cases.

### ⚙️ How it works

- Uses hashing to store and retrieve entries in O(1) average time.
- **Does NOT guarantee** the order of entries during iteration.
- Allows one `null` key and multiple `null` values.

### 🧪 Declaration

```java
import java.util.Map;
import java.util.HashMap;

Map<Integer, String> map = new HashMap<>();
```

### 💡 Insight

Just like `HashSet` is backed by a `HashMap` internally (keys with dummy values), `HashMap` is the engine that drives most hash-based collections. Understanding how hashing works (hash codes, buckets, collisions) is key to understanding `HashMap` performance.

---

## 🧩 Concept 5: Methods We Haven't Explored Yet

The `Map` interface has several additional methods that we'll explore when diving into individual implementations:

- `putAll(Map<? extends K, ? extends V> m)` — Copies all entries from another map
- `keySet()` — Returns a `Set` of all keys
- `values()` — Returns a `Collection` of all values
- `entrySet()` — Returns a `Set` of `Map.Entry<K,V>` pairs (great for iteration)
- `getOrDefault(Object key, V defaultValue)` — Returns the value or a default if key is absent
- `putIfAbsent(K key, V value)` — Only adds if the key isn't already present
- `replace(K key, V value)` — Replaces the value for an existing key

These will be covered in detail in upcoming sessions on `HashMap`, `LinkedHashMap`, and `TreeMap`.

---

## ✅ Key Takeaways

- `Map` stores data in **key-value pairs** — each key maps to exactly one value.
- `Map` does **NOT** extend `Collection` — it has its own separate hierarchy.
- Core methods: `put()`, `get()`, `remove()`, `containsKey()`, `containsValue()`, `size()`, `isEmpty()`, `clear()`.
- `HashMap` is the default, go-to implementation — O(1) average time for basic operations.
- `get()` returns `null` if the key doesn't exist — handle this to avoid `NullPointerException`.

## ⚠️ Common Mistakes

- **Assuming Map extends Collection** — It does NOT. This is a common interview question.
- **Not handling `null` from `get()`** — Always check or use `getOrDefault()` to avoid null pointer issues.
- **Using `containsValue()` in performance-critical code** — It's O(n) because it scans all values. Use `containsKey()` (O(1)) whenever possible.
- **Confusing `put()` behavior** — If the key already exists, `put()` **replaces** the old value silently and returns it.

## 💡 Pro Tips

- Use `getOrDefault(key, defaultValue)` instead of checking `containsKey()` + `get()` — it's cleaner and null-safe.
- `keySet()`, `values()`, and `entrySet()` return **live views** — modifying them modifies the underlying map.
- For iterating over a map, prefer `entrySet()` over separately iterating keys and calling `get()` — it avoids redundant lookups.
