# LinkedHashMap Example

## Introduction

We know that `HashMap` gives us O(1) performance for insert, delete, and lookup. But it has one frustrating property — it **doesn't preserve the order** of insertion. If you put items in as A, B, C, D, you might get them back as C, A, D, B. What if insertion order matters? That's exactly what `LinkedHashMap` solves.

---

## Concept 1: The Problem — HashMap Doesn't Preserve Order

### 🧪 Example

```java
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);
map.put("d", 4);
map.put("e", 5);
// ... more items

for (String key : map.keySet()) {
    System.out.println(key + " " + map.get(key));
}
```

The output order is **unpredictable** — it depends on the hash function and the internal array structure. You might get `a, c, b, d, g, f` instead of the order you inserted them.

### ❓ Why doesn't HashMap maintain order?

Because the position of each item is determined by its **hash code**, not by when it was inserted. Hash codes don't have any relationship to insertion order.

---

## Concept 2: LinkedHashMap — Order-Preserving HashMap

### 🧠 What is it?

`LinkedHashMap` is a `HashMap` with an additional **doubly linked list** that connects all entries in the order they were inserted.

```java
Map<String, Integer> map = new LinkedHashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);
map.put("d", 4);
map.put("e", 5);

for (String key : map.keySet()) {
    System.out.println(key + " " + map.get(key));
}
// Output: a 1, b 2, c 3, d 4, e 5  ← insertion order preserved!
```

### ⚙️ How it works under the hood

Internally, `LinkedHashMap` maintains:
1. The standard **hash table** (array + buckets) — for O(1) lookups
2. A **doubly linked list** threading through all entries — to track insertion order

Every time you insert a new entry, it's:
- Placed in the appropriate bucket (just like HashMap)
- **And** appended to the end of the linked list

When you iterate, Java follows the linked list — not the array — so you get items in insertion order.

---

## Concept 3: LinkedHashMap vs HashMap — When to Choose Which

### The tradeoff: **memory**

The doubly linked list requires **extra memory** for two additional pointers (previous and next) per entry.

| Feature | HashMap | LinkedHashMap |
|---|---|---|
| Insertion order preserved? | ❌ No | ✅ Yes |
| Memory usage | Lower | Higher (linked list overhead) |
| Performance (get/put) | O(1) | O(1) |
| Use when... | Order doesn't matter | Insertion order matters |

### Decision guide

- **Default choice**: `HashMap` — less memory, same speed
- **Need insertion order**: `LinkedHashMap` — slightly more memory, preserves order
- **Need sorted order**: `TreeMap` — O(log n) but keys are always sorted

---

## Concept 4: What LinkedHashMap is NOT

### ⚠️ It does NOT sort

`LinkedHashMap` preserves **insertion order**, not **sorted order**. If you insert `"c"`, `"a"`, `"b"`, you'll iterate in that exact order — `c, a, b` — not alphabetical.

For sorted keys, you need `TreeMap`:

```java
Map<String, Integer> sorted = new TreeMap<>();  // keys always in sorted order
```

---

## ✅ Key Takeaways

- `LinkedHashMap` = HashMap + doubly linked list for **insertion order preservation**
- Same O(1) performance as HashMap for get/put operations
- Uses **more memory** than HashMap due to the linked list pointers
- Use it only when insertion order matters — otherwise, stick with `HashMap`
- For **sorted** keys, use `TreeMap` instead

## ⚠️ Common Mistakes

- Using `LinkedHashMap` when you don't need insertion order — wastes memory for no benefit
- Confusing "insertion order" with "sorted order" — they are different concepts
- Choosing `LinkedHashMap` for sorting — use `TreeMap` for that

## 💡 Pro Tips

- `LinkedHashMap` also supports **access-order** mode (most recently accessed items move to the end) — useful for building LRU caches: `new LinkedHashMap<>(capacity, loadFactor, true)`
- When iterating over a HashMap, never rely on the order — it can change between Java versions or even between runs
