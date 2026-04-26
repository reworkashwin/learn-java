# Hashtables Introduction — Basics

## Introduction

What if you could look up any piece of data **instantly** — not by scanning through a list, but by jumping directly to it? That's the promise of **hash tables**. They're the data structure behind `HashMap`, `HashSet`, and many other high-performance collections. Understanding how they work under the hood is essential for any serious Java developer.

---

## Concept 1: What Is a Hash Table?

### 🧠 What is it?

A hash table is a data structure that maps **keys** to **values** using a special function called a **hash function**. The hash function converts a key into an **array index**, allowing near-instant lookups.

### 🧪 Real-world analogy

Think of a **library index card system**:
- Each book (value) has a unique catalog number (key)
- The catalog number tells you exactly which shelf and slot to go to
- You don't search through every book — you go **directly** to the right location

That's what a hash function does — it converts a key into a location.

---

## Concept 2: How Hash Functions Work

### ⚙️ Step by step

1. You have a key (e.g., `"Alice"`)
2. The hash function converts the key to an integer: `hashCode("Alice")` → `63555629`
3. The integer is mapped to an array index: `63555629 % arraySize` → `5`
4. The value is stored at index `5`

```
Key: "Alice"  →  hashCode: 63555629  →  index: 5 (63555629 % 10)
Key: "Bob"    →  hashCode: 66965     →  index: 5 (66965 % 10) ← collision!
```

### 💡 Insight

In Java, every object has a `hashCode()` method inherited from `Object`. This is the hash function. The `HashMap` uses this value to determine where to store each entry.

---

## Concept 3: Collisions — When Two Keys Map to the Same Index

### 🧠 What is it?

A **collision** occurs when two different keys produce the same array index. This is inevitable — you're mapping an infinite space of possible keys down to a finite number of array slots.

### ❓ How does Java handle collisions?

Java's `HashMap` uses **chaining** — each array slot holds a **linked list** (or a **red-black tree** for long chains) of all entries that hashed to that index.

```
Index 0: → null
Index 1: → [("Bob", 25)]
Index 2: → null
Index 3: → [("Alice", 30) → ("Charlie", 22)]  ← collision chain
Index 4: → [("Diana", 28)]
```

When you look up `"Charlie"`, Java:
1. Computes the hash → index 3
2. Walks the chain at index 3
3. Checks each key using `.equals()` until it finds `"Charlie"`

### 💡 Insight

This is why **both** `hashCode()` and `equals()` matter for hash-based collections:
- `hashCode()` finds the **bucket** (which slot)
- `equals()` finds the **exact entry** within that bucket

If two objects are `.equals()`, they MUST have the same `hashCode()`. But the reverse isn't required.

---

## Concept 4: Performance — O(1) Average Case

### ⚙️ Time complexity

| Operation | Average | Worst (all collisions) |
|-----------|---------|----------------------|
| `put(key, value)` | O(1) | O(n) |
| `get(key)` | O(1) | O(n) |
| `remove(key)` | O(1) | O(n) |
| `containsKey(key)` | O(1) | O(n) |

In practice, with a good hash function and a properly sized array, operations are essentially **constant time**.

### 🧠 Load factor and resizing

- **Load factor** = number of entries / array size — it measures how "full" the hash table is. A load factor of 0.5 means half the buckets are occupied; 1.0 means as many entries as buckets.

- Java's `HashMap` default load factor is **0.75** — but why 0.75 specifically? It's a **tradeoff between memory waste and collision probability**:
  - **Lower load factor (e.g., 0.5):** Resize when only 50% full → more empty buckets → fewer collisions → faster lookups, BUT you waste ~50% of your array as empty slots
  - **Higher load factor (e.g., 0.9):** Resize when 90% full → less wasted memory, BUT buckets become crowded → more collisions → chains grow → lookups slow toward O(n)
  - **0.75 is the sweet spot:** Statistically, at 75% capacity, the average chain length stays close to 1 (most buckets have 0 or 1 entry), so O(1) holds. Go beyond ~80%, and collision chains start growing noticeably.

- When 75% of the array is filled, it **doubles** the array size and rehashes all entries. Why double? Doubling is a geometric growth strategy — it means resizing happens less and less frequently as the map grows. If you only added 10 slots each time, a map growing to 1 million entries would resize ~100,000 times. Doubling means it resizes only ~17 times (16 → 32 → 64 → ... → 1,048,576).

- **How resizing keeps chains short:** When the array doubles from 16 to 32 slots, entries that were sharing the same bucket (because `hash % 16` was the same) now get split — `hash % 32` uses the extra bit to distribute them across two buckets instead of one. So chains that were 2-3 entries long drop back to 1-2.

**Worked example:** Your HashMap starts with an internal array of size 16. Resizing triggers when entries exceed `16 × 0.75 = 12`. At that point, the array doubles to 32, and the new threshold becomes `32 × 0.75 = 24`. The next resize happens at 24 entries (array grows to 64, threshold = 48), and so on. Every existing entry must be **rehashed** during resizing — its `hashCode() % newArraySize` may map to a different bucket, so Java recalculates each entry's position.

---

## Concept 5: Hash Tables in Java

### ⚙️ The implementations

| Class | Thread-safe? | Null keys? | Ordering |
|-------|-------------|------------|----------|
| `HashMap` | No | Yes (one) | No order |
| `Hashtable` | Yes (legacy) | No | No order |
| `LinkedHashMap` | No | Yes | Insertion order |
| `TreeMap` | No | No | Sorted by key |
| `ConcurrentHashMap` | Yes (modern) | No | No order |

### ⚠️ Important

`Hashtable` is a legacy class from Java 1.0. In modern Java:
- Use `HashMap` for single-threaded code
- Use `ConcurrentHashMap` for multi-threaded code — it uses segment-level (bucket-level) locking instead of locking the entire table, allowing multiple threads to read/write concurrently without blocking each other
- Never use `Hashtable` in new code — it locks the entire table on every operation, creating a bottleneck where all threads must wait for a single lock

---

## ✅ Key Takeaways

- Hash tables map keys to values using a hash function for near-instant lookup
- `hashCode()` determines the bucket; `equals()` finds the exact match within it
- Collisions are handled by chaining (linked lists / trees)
- Average time complexity is O(1) for all major operations
- `HashMap` is the modern, go-to implementation; `Hashtable` is legacy

## ⚠️ Common Mistakes

- Not overriding both `hashCode()` and `equals()` when using custom objects as keys
- Modifying an object's fields after using it as a key — the hash changes, so `get()` computes a different bucket than where the entry was originally stored, and the entry becomes unreachable even though it's still in the map
- Using `Hashtable` in modern code — use `HashMap` or `ConcurrentHashMap`
- Assuming iteration order in `HashMap` — it's unordered (use `LinkedHashMap` for order)
