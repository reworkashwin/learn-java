# CopyOnWriteArrays

## Introduction

We've seen that `ArrayList` is not thread-safe and that `Collections.synchronizedList()` is slow due to coarse-grained locking. But what if your use case involves **many reads and very few writes**? Java provides `CopyOnWriteArrayList` and `CopyOnWriteArraySet` — collections optimized for exactly this read-heavy scenario.

---

## Concept 1: What is CopyOnWriteArrayList?

### 🧠 What is it?

`CopyOnWriteArrayList` is a thread-safe variant of `ArrayList` where every **mutative operation** (add, set, remove) creates a **fresh copy** of the underlying array.

```java
import java.util.concurrent.CopyOnWriteArrayList;

List<String> list = new CopyOnWriteArrayList<>();
```

### ❓ Why copy the entire array?

Because reads **never need synchronization**. Since the array reference is replaced atomically, readers always see a consistent snapshot. No locks, no blocking, no `ConcurrentModificationException`.

### 🧪 Real-World Analogy

Think of a Wikipedia article. When someone edits it, theyre editing a **copy**. While the edit is being made, millions of readers continue reading the original version. Once the edit is complete, the new version replaces the old one atomically. Readers who were mid-read still see the old version (consistent snapshot), and new readers see the updated version.

---

## Concept 2: How It Works Under the Hood

### ⚙️ Write operation (add, remove, set)

```
Before add("D"):
  array → [A, B, C]         ← readers see this

During add("D"):
  newArray = copy of [A, B, C] + [D]    ← copy + modify
  
After add("D"):
  array → [A, B, C, D]      ← atomic swap
  old [A, B, C] → garbage collected
```

1. Lock the collection (writes are synchronized)
2. Copy the existing array to a new, larger array
3. Add the element to the new array
4. Replace the array reference atomically
5. Unlock

### ⚙️ Read operation (get, iterate, contains)

```java
// No locking needed — reads directly from the current array reference
public E get(int index) {
    return getArray()[index];   // Just array access — no synchronization
}
```

Reads are **lock-free** and extremely fast.

---

## Concept 3: When Iteration is King

### 🧠 The killer feature: Safe iteration

With `ArrayList`, modifying a list while iterating throws `ConcurrentModificationException`:

```java
// ❌ ArrayList — throws ConcurrentModificationException
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
for (String s : list) {
    if (s.equals("B")) {
        list.remove(s);   // BOOM — ConcurrentModificationException
    }
}
```

With `CopyOnWriteArrayList`, iteration works on a **snapshot** of the array at the time the iterator was created:

```java
// ✅ CopyOnWriteArrayList — no exception
List<String> list = new CopyOnWriteArrayList<>(Arrays.asList("A", "B", "C"));
for (String s : list) {
    if (s.equals("B")) {
        list.remove(s);   // Removes from the live list, not the snapshot
    }
}
System.out.println(list);  // [A, C]
```

### 💡 Insight

The iterator sees a **frozen snapshot**. Any modifications made during iteration affect the **underlying collection** but not the iterator's view. This means:
- No `ConcurrentModificationException`
- The iterator might not reflect the latest changes
- This is usually fine for read-heavy scenarios

---

## Concept 4: Performance Characteristics

### ⚙️ Time complexity

| Operation | CopyOnWriteArrayList | ArrayList |
|---|---|---|
| `get(i)` | **O(1)** — same as ArrayList | O(1) |
| `add(e)` | **O(n)** — copies entire array | O(1) amortized |
| `remove(i)` | **O(n)** — copies entire array | O(n) — shifts elements |
| `contains(e)` | **O(n)** — scans array | O(n) |
| Iteration | **O(n)** — no locking | O(n) |

⚠️ **Common Mistake:** Using `CopyOnWriteArrayList` for write-heavy workloads. Copying the entire array on every write is extremely expensive for large lists with frequent modifications.

### ⚙️ When to use vs when NOT to use

| ✅ Good fit | ❌ Bad fit |
|---|---|
| Observer/listener lists (add once, iterate often) | Shopping cart (add/remove frequently) |
| Configuration lists (set once, read forever) | Buffer/queue (constant writes) |
| Event handler registries | Large lists with frequent updates |
| Whitelist/blacklist (rarely modified) | Real-time data streams |

---

## Concept 5: CopyOnWriteArraySet

### 🧠 What is it?

`CopyOnWriteArraySet` is a `Set` backed by a `CopyOnWriteArrayList`. It has all the same properties — thread-safe reads without locking, writes create a copy.

```java
Set<String> listeners = new CopyOnWriteArraySet<>();
listeners.add("listener1");
listeners.add("listener2");

// Safe iteration — no ConcurrentModificationException
for (String listener : listeners) {
    notify(listener);
}
```

### ❓ How is it different from `ConcurrentHashMap.newKeySet()`?

| Feature | `CopyOnWriteArraySet` | `ConcurrentHashMap.newKeySet()` |
|---|---|---|
| Read performance | Excellent (no locks) | Good (segment locks) |
| Write performance | Poor (copies array) | Good (fine-grained locks) |
| Best for | Few writes, many reads | Balanced reads/writes |
| Ordering | Insertion order preserved | No ordering |

---

## Summary

✅ **Key Takeaways:**

- `CopyOnWriteArrayList` creates a new copy of the array on every write — reads are lock-free
- Iteration never throws `ConcurrentModificationException` — iterators work on frozen snapshots
- **Ideal for read-heavy, write-rare scenarios** — listener lists, configuration, event registries
- **Terrible for write-heavy scenarios** — O(n) copy on every write
- `CopyOnWriteArraySet` is the `Set` equivalent — backed by a `CopyOnWriteArrayList`
- Prefer `ConcurrentHashMap` for balanced read/write workloads
