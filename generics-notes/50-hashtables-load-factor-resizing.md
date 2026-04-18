# Hashtables — Load Factor & Dynamic Resizing

## Introduction

We know collisions degrade hash table performance. But how do we know **when** collisions are becoming a problem? And what do we do about it? The answer lies in two connected concepts: the **load factor** (which tells us how full the table is) and **dynamic resizing** (which fixes it). Together, they represent one of the classic **memory vs. speed tradeoffs** in computer science.

---

## Concept 1: The Probability of Collision

### 🧠 The intuition

Think of a parking lot:
- When it's almost empty, finding a spot is easy — low chance of "collision"
- As it fills up, finding an empty spot gets harder — high chance of collision
- When it's almost full, you're circling the lot endlessly

Hash tables work exactly the same way. The **more items** already in the table, the **higher the probability** that the next insertion will collide with an existing item.

---

## Concept 2: What is the Load Factor?

### 🧠 Definition

$$\text{Load Factor} = \frac{n}{m}$$

Where:
- $n$ = number of items currently in the hash table
- $m$ = size of the underlying array

The load factor is always between **0** (empty) and **1** (full).

### ⚙️ What does it tell us?

| Load Factor | Meaning | Collision Probability | Memory Usage |
|---|---|---|---|
| **Low** (close to 0) | Table is mostly empty | Low | Wasteful — many empty slots |
| **High** (close to 1) | Table is mostly full | High | Efficient — few empty slots |

### 💡 The tradeoff

This is a **classic memory vs. speed tradeoff**:

- **Want speed?** Keep the load factor low → fewer collisions → faster operations → but more wasted memory
- **Want memory efficiency?** Let the load factor get high → less wasted memory → but more collisions → slower operations

You can't have both — you must choose your balance point.

---

## Concept 3: Dynamic Resizing

### ❓ When does resizing happen?

Programming languages define a **threshold** for the load factor. When the table exceeds this threshold, it triggers a resize:

| Language | Resize Threshold |
|---|---|
| **Java** | Load factor > **0.75** (75% full) |
| **Python** | Load factor > **0.66** (66% full) |

So in Java, when 75% of the array slots are occupied, the underlying array is **doubled** in size.

### ⚙️ Why is resizing expensive?

Here's the catch — resizing is an **O(n) operation**. Why?

Because the **hash function depends on the array size** (via the modulo operator):

```
hash(key) = transformedKey % arraySize
```

When the array size changes, **every existing item's hash value changes**. You can't just copy items to new positions — you must:

1. Create a new, larger array
2. **Rehash every single item** using the new array size
3. Insert each item into its new position

This means touching all $n$ items — hence O(n).

### 🧪 Example

```
Old array size: 8
hash("alice") = 55 % 8 = 7    → stored at index 7

New array size: 16  (after resize)
hash("alice") = 55 % 16 = 7   → still index 7 (lucky!)
hash("bob")   = 42 % 8 = 2    → was at index 2
hash("bob")   = 42 % 16 = 10  → now at index 10 (moved!)
```

Every item must be recalculated and reinserted.

---

## Concept 4: The Implications

### ⚠️ Real-time applications

Because resizing is O(n), hash tables can cause **unpredictable latency spikes**. Most operations are O(1), but occasionally a single insertion triggers a resize that takes O(n) time.

This makes dynamically-resized hash tables **potentially unsuitable for real-time systems** where consistent, predictable response times are critical.

### 💡 When to prefer balanced BSTs

If you need **guaranteed** worst-case performance:

| | Hash Table | Balanced BST (TreeMap) |
|---|---|---|
| Average case | O(1) | O(log n) |
| Worst case | O(n) — collisions or resize | O(log n) — always |
| Sorting | Not supported | Supported |

Balanced BSTs (like Red-Black trees used in Java's `TreeMap`) provide O(log n) **guaranteed** — no worst-case surprises, no expensive resizing.

---

## Concept 5: Summary of Hash Table Challenges

1. **No perfect hash function** → collisions are inevitable
2. **Load factor** → the fuller the table, the more collisions occur
3. **Dynamic resizing** → necessary to keep collisions manageable, but costs O(n) when triggered

Despite these challenges, hash tables remain the **fastest data structure on average** for insert, delete, and lookup — which is why `HashMap` is one of the most used classes in Java.

---

## ✅ Key Takeaways

- Load factor = $n/m$ — measures how full the hash table is
- Low load factor = fast but wastes memory; high load factor = memory-efficient but slow
- Java resizes at **0.75** load factor; Python at **0.66**
- Resizing is **O(n)** because all items must be rehashed with the new array size
- For guaranteed performance without resize spikes, consider balanced BSTs (TreeMap)

## ⚠️ Common Mistakes

- Assuming hash table operations are always O(1) — resize events are O(n)
- Setting initial capacity too low — causes frequent, expensive resizes
- Ignoring load factor when choosing between HashMap and TreeMap

## 💡 Pro Tips

- If you know the approximate size of your data, set the **initial capacity** of the HashMap to avoid unnecessary resizes: `new HashMap<>(expectedSize)`
- Java's default initial capacity is 16 with a load factor of 0.75 — the first resize happens at 12 items
- You can customize the load factor: `new HashMap<>(capacity, loadFactor)` — a lower value trades memory for speed
