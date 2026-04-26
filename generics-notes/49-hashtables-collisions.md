# Hashtables Introduction — Collisions

## Introduction

We learned that hash tables achieve O(1) lookups by using hash functions to map keys to array indices. But here's the catch — what happens when two different keys produce the **same** array index? This is called a **collision**, and handling collisions is one of the most important problems in hash table design. There are no perfect hash functions in practice, so collisions **will** happen.

---

## Concept 1: What is a Collision?

### 🧠 What is it?

A collision occurs when the hash function maps **two or more different keys** to the **same array slot** (bucket).

```
hash("alice") = 3
hash("bob")   = 3   ← collision!
```

Both keys want to occupy index 3, but an array slot can only hold one item directly.

### ❓ Can we avoid collisions entirely?

In theory, a **perfect hash function** would produce a unique index for every key. In practice, **perfect hash functions don't exist** for arbitrary data. Collisions are inevitable — the question is how we handle them.

---

## Concept 2: Solution 1 — Chaining

### 🧠 What is it?

Chaining handles collisions by creating a **linked list** at each array slot. When multiple keys hash to the same index, their values are stored as nodes in a linked list starting from that slot.

### ⚙️ How it works — Step by step

1. `hash(K3) = 4` → insert value at index 4 ✓
2. `hash(K2) = 2` → insert value at index 2 ✓
3. `hash(K4) = 2` → **collision!** Index 2 is occupied → create a linked list at index 2, append K4's value
4. `hash(K1) = 2` → **another collision!** → append K1's value to the linked list at index 2

```
Index 0: [ ]
Index 1: [ ]
Index 2: [V2] → [V4] → [V1]    ← linked list handles collisions
Index 3: [ ]
Index 4: [V3]
```

### ⚠️ The worst case

If the hash function is terrible and maps **all** keys to the same bucket, you end up with a single linked list — and all operations degrade to **O(n)**.

### Pros and Cons

| Pros | Cons |
|---|---|
| Simple to implement | Extra memory for linked list references |
| No upper limit on items per bucket | Worst case: O(n) if all items collide |

---

## Concept 3: Solution 2 — Open Addressing

### 🧠 What is it?

Instead of creating a linked list, open addressing finds **another empty slot** in the array itself. If the target slot is occupied, we probe for the next available slot.

### ⚙️ Three probing strategies

#### 1. Linear Probing

If collision at index `k`, try `k+1`, then `k+2`, then `k+3`... until an empty slot is found.

```
hash(K2) = 2  → index 2 occupied
try index 3   → empty! Insert here.
```

**Advantage**: Great **cache performance** — consecutive slots are adjacent in memory, so the CPU can cache them efficiently.

**Disadvantage**: Creates **clusters** — groups of consecutive occupied slots. Clusters grow and slow down future insertions.

#### 2. Quadratic Probing

If collision at index `k`, try `k+1²`, then `k+2²`, then `k+3²`...

Steps away: 1, 4, 9, 16, 25...

**Advantage**: Avoids clustering because probes spread out.

**Disadvantage**: Poor cache performance — probed slots are far apart in memory.

#### 3. Double Hashing (Rehashing)

If collision at index `k`, use a **second hash function** to calculate a new index.

**Advantage**: Best distribution of items.

**Disadvantage**: Most complex to implement.

---

## Concept 4: Linear Probing — Concrete Example

```
1. hash(K3) = 4  →  Insert at index 4  ✓
2. hash(K2) = 1  →  Insert at index 1  ✓
3. hash(K4) = 1  →  Collision! Index 1 occupied
                     Try index 2 → empty! Insert at index 2  ✓
```

```
Index 0: [ ]
Index 1: [V2]
Index 2: [V4]  ← placed here due to linear probing
Index 3: [ ]
Index 4: [V3]
```

---

## Concept 5: Running Time Summary

| | Average Case | Worst Case |
|---|---|---|
| **Memory** | O(n) | O(n) |
| **Search** | O(1) | O(n) |
| **Insert** | O(1) | O(n) |
| **Delete** | O(1) | O(n) |

- **Average case** O(1) happens when the hash function distributes keys evenly
- **Worst case** O(n) happens when many collisions degrade the structure to a linked list

### 💡 Insight

If you need **guaranteed** O(log n) performance even in the worst case, use a **balanced binary search tree** (like TreeMap) instead of a hash table. Hash tables are faster on average but have no worst-case guarantees.

---

## ✅ Key Takeaways

- **Collisions** occur when two keys hash to the same index — they're unavoidable in practice
- **Chaining**: stores colliding items in a linked list at each bucket — simple but uses extra memory
- **Open addressing**: finds another slot in the array — three strategies: linear probing, quadratic probing, double hashing
- Linear probing has great cache performance but causes clustering
- Hash tables are O(1) on average but O(n) in the worst case

## ⚠️ Common Mistakes

- Assuming hash tables are always O(1) — worst case is O(n) due to collisions
- Ignoring the impact of a bad hash function — it can turn a hash table into a linked list
- Forgetting that open addressing has a capacity limit — when the array fills up, it must be resized

## 💡 Pro Tips

- Java's `HashMap` uses **chaining** (with linked lists that upgrade to balanced trees at 8+ items per bucket since Java 8)
- A good hash function minimizes collisions and avoids clustering
- Use **prime numbers** for array sizes and hash computations to reduce collision probability — prime-sized tables distribute keys more uniformly under modulo because they share no common factors with typical key patterns, avoiding clustering that powers-of-two or composite sizes can create
