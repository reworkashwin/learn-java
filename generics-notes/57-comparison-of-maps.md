# Comparison of Maps

## Introduction

We've studied three map implementations — `HashMap`, `LinkedHashMap`, and `TreeMap`. Each uses a fundamentally different internal structure. This chapter brings them all together in a clear, side-by-side comparison so you know exactly when to use which.

---

## Concept 1: Internal Structure

### 🧠 How they work under the hood

| Map | Internal Structure | How Keys Are Located |
|-----|-------------------|---------------------|
| **HashMap** | One-dimensional array + hash function | Hash function converts key → array index |
| **LinkedHashMap** | One-dimensional array + hash function + doubly linked list | Same as HashMap, but linked list tracks insertion order |
| **TreeMap** | Red-black tree (balanced BST) | Tree traversal based on key comparison |

**HashMap** and **LinkedHashMap** are siblings — both rely on a hash function. The only difference is that `LinkedHashMap` keeps a doubly linked list connecting entries in insertion order.

**TreeMap** is the odd one out — no hash function at all. It's a tree structure where items are organized by comparison.

---

## Concept 2: Time Complexity Comparison

### ⚙️ Running times at a glance

| Scenario | HashMap / LinkedHashMap | TreeMap |
|----------|------------------------|---------|
| **Best / Average case** | O(1) | O(log n) |
| **Worst case (old Java)** | O(n) — linked list chaining | O(log n) |
| **Worst case (modern Java)** | O(log n) — red-black tree on collision | O(log n) |

### 💡 The Modern Java Update

In older Java versions, when hash collisions occurred, items were stored in a **linked list** within the same bucket. Searching a linked list is O(n) — that was the worst case.

Modern Java improved this: when the number of items in a single bucket exceeds a threshold, Java converts that linked list into a **red-black tree**. This brings the worst case from O(n) down to **O(log n)**.

> This means that in modern Java, the worst case for HashMap is the **same** as TreeMap's guaranteed case.

---

## Concept 3: Feature Comparison

### 📊 Side-by-side

| Feature | HashMap | LinkedHashMap | TreeMap |
|---------|---------|---------------|---------|
| **Maintains order** | ❌ No | ✅ Insertion order | ✅ Sorted order (by key) |
| **Null keys** | ✅ One null key allowed | ✅ One null key allowed | ❌ Not allowed |
| **Average performance** | O(1) | O(1) | O(log n) |
| **Worst-case performance** | O(log n) | O(log n) | O(log n) |
| **Memory usage** | More (array larger than needed) | Most (array + doubly linked list) | Less (tree nodes only) |
| **Parameters to tune** | Load factor, initial capacity | Load factor, initial capacity | None |

TreeMap forbids `null` keys because it must call `compareTo()` (or `Comparator.compare()`) on every key to navigate the red-black tree and find the correct position — calling either method on `null` throws `NullPointerException`. Hash-based maps don't have this constraint because they simply assign null a hash code of 0.

---

## Concept 4: Memory and Load Factor

### ❓ Why do HashMaps need more memory?

A hash function works best when the underlying array is **sparsely populated**. If the array is nearly full, collisions skyrocket and performance tanks.

This is controlled by the **load factor** — typically **0.75** in Java. It means:

> When the array is 75% full, Java **resizes** (doubles) the array and rehashes all entries.

This resize operation is expensive, but it keeps future operations fast. The trade-off: you're always using an array **larger** than the number of items you're storing.

**TreeMap** doesn't have this problem. Each node stores exactly one key-value pair. No wasted space, no tuning needed.

---

## Concept 5: When to Use What

### 🧠 Decision guide

- **HashMap** — Default choice. Fastest on average. Use when order doesn't matter.
- **LinkedHashMap** — When you need to preserve **insertion order** (e.g., caching, maintaining sequence).
- **TreeMap** — When you need keys in **sorted order** or need range queries (`headMap()`, `tailMap()`, `subMap()`).
```java
// Same data, different ordering behavior:
Map<String, Integer> hash = new HashMap<>();
Map<String, Integer> linked = new LinkedHashMap<>();
Map<String, Integer> tree = new TreeMap<>();

for (Map<String, Integer> map : List.of(hash, linked, tree)) {
    map.put("Charlie", 3);
    map.put("Alice", 1);
    map.put("Bob", 2);
}

System.out.println(hash);    // {Bob=2, Alice=1, Charlie=3} (unpredictable order)
System.out.println(linked);  // {Charlie=3, Alice=1, Bob=2} (insertion order)
System.out.println(tree);    // {Alice=1, Bob=2, Charlie=3} (sorted by key)
```
In the 21st century, memory is cheap. Speed is what matters for most applications. This is why `HashMap` is the most commonly used map implementation despite its higher memory overhead.

---

## ✅ Key Takeaways

- HashMap and LinkedHashMap use **array + hash function**; TreeMap uses a **red-black tree**
- HashMap is **fastest on average** (O(1)), TreeMap is **most predictable** (guaranteed O(log n))
- Modern Java handles HashMap collisions with red-black trees, so worst case is now O(log n) — not O(n)
- TreeMap maintains **sorted key order**, HashMap does not
- HashMap allows one null key; TreeMap does not
- HashMap/LinkedHashMap need more memory due to the load factor requirement

## ⚠️ Common Mistakes

- Using TreeMap when you only need fast lookups — you're paying for sorting you don't need
- Forgetting that LinkedHashMap uses **more memory** than HashMap (doubly linked list overhead)
- Assuming HashMap worst case is O(n) — that was true before Java's red-black tree optimization

## 💡 Pro Tips

- If you're unsure, start with `HashMap` — it's the default choice for a reason
- Need sorted keys? `TreeMap`. Need insertion order? `LinkedHashMap`. Need speed? `HashMap`.
- The load factor of 0.75 is a well-tuned default — rarely needs changing
