# TreeMap and HashMap Performance Comparison

## Introduction

We know `TreeMap` uses a red-black tree (O(log n) operations) and `HashMap` uses a hash table (O(1) average case). But how much does that difference matter in practice? Let's measure it with real numbers.

---

## Concept 1: The Performance Experiment

### ⚙️ Setup

The test is straightforward:

1. Insert **500,000 items** into a `TreeMap`, then retrieve all 500,000 items → measure time
2. Insert **500,000 items** into a `HashMap`, then retrieve all 500,000 items → measure time
3. Compare the results

### 🧪 Results

| Operation | HashMap | TreeMap |
|-----------|---------|---------|
| Insert + Get 500K items | ~32 ms | ~130 ms |

`HashMap` is roughly **4x faster** than `TreeMap` on average for standard insert and get operations.

### 💡 Why the difference?

It comes down to time complexity:

- **HashMap**: O(1) average — a hash function computes the index directly
- **TreeMap**: O(log n) — every operation must traverse the tree from root to the correct node

For 500,000 items, `log₂(500,000) ≈ 19`. So each TreeMap operation does ~19 comparisons while HashMap ideally does just 1.

---

## Concept 2: When TreeMap Can Win

### ❓ If HashMap is faster, why does TreeMap exist?

`HashMap`'s O(1) is the **average** case. In the **worst case** (many collisions), it degrades — though modern Java mitigates this by converting long chains to red-black trees, bringing worst case to O(log n).

`TreeMap` is **guaranteed** O(log n). There is no worst case surprise. It's predictable and deterministic.

### Scenarios where TreeMap is preferable:

- You need keys in **sorted order**
- You need **range queries** (e.g., "give me all keys between 5 and 20")
- You want **guaranteed** performance with no dependency on hash function quality
- You need `firstKey()`, `lastKey()`, `headMap()`, `tailMap()` operations

---

## ✅ Key Takeaways

- **HashMap is faster on average** — O(1) vs O(log n)
- **TreeMap is more predictable** — guaranteed O(log n), no dependency on hash function quality
- For pure speed with unordered data, prefer `HashMap`
- For sorted data or deterministic performance guarantees, prefer `TreeMap`
- The performance gap grows with data size — the bigger the dataset, the more O(1) wins over O(log n)

## ⚠️ Common Mistakes

- Assuming TreeMap is always slow — for small datasets, the difference is negligible
- Choosing HashMap purely for speed when you actually need sorted iteration — you'd end up sorting manually, which could be slower overall

## 💡 Pro Tips

- If you need both fast lookup **and** sorted iteration, consider maintaining both a `HashMap` and a sorted structure — it trades memory for speed
- For read-heavy workloads with sorted output, `TreeMap` can save you from repeatedly sorting a `HashMap`'s entries
