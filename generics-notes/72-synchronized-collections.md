# Synchronized Collections

## Introduction

Most Java collections — `ArrayList`, `LinkedList`, `HashMap`, `HashSet` — are **not thread-safe**. They work perfectly in single-threaded applications, but if multiple threads try to modify the same collection at the same time, you get unpredictable behavior: corrupted data, exceptions, or silent bugs. The `Collections` class provides a quick way to make any collection thread-safe using **synchronized wrappers**.

---

## Concept 1: The Thread-Safety Problem

### 🧠 What goes wrong with unsynchronized collections?

When two or more threads modify the same `ArrayList` concurrently, the internal array can get into an inconsistent state. Operations like `add()` involve checking the array size and then inserting — if two threads do this simultaneously, one may overwrite the other's work or access an invalid index.

### 🧪 Example — The problem in action

```java
List<Integer> nums = new ArrayList<>();

Thread t1 = new Thread(() -> {
    for (int i = 0; i < 1000; i++) {
        nums.add(i);
    }
});

Thread t2 = new Thread(() -> {
    for (int i = 0; i < 1000; i++) {
        nums.add(i);
    }
});

t1.start();
t2.start();
t1.join();
t2.join();

System.out.println("Size: " + nums.size());
// Expected: 2000
// Actual: ArrayIndexOutOfBoundsException or incorrect size!
```

Both threads are trying to insert 1000 items each into the same `ArrayList`. Without synchronization, this leads to exceptions or data corruption.

### 💡 Insight

The root cause is that `ArrayList.add()` is **not atomic** — it involves multiple internal steps (check capacity, resize if needed, set element, increment size). If two threads interleave these steps, things break.

---

## Concept 2: Which Collections Are Already Synchronized?

Before reaching for wrappers, know what's already thread-safe:

| Collection | Synchronized? | Notes |
|-----------|---------------|-------|
| `Vector` | ✅ Yes | Legacy class, rarely used |
| `Stack` | ✅ Yes | Extends `Vector` |
| `Hashtable` | ✅ Yes | Legacy, prefer `ConcurrentHashMap` |
| `ArrayList` | ❌ No | Most commonly used list |
| `LinkedList` | ❌ No | |
| `HashMap` | ❌ No | Most commonly used map |
| `HashSet` | ❌ No | |
| `TreeMap` | ❌ No | |
| `TreeSet` | ❌ No | |

---

## Concept 3: Creating Synchronized Collections

### ⚙️ How to make a collection thread-safe

The `Collections` class provides synchronized wrapper methods:

- `Collections.synchronizedList(list)`
- `Collections.synchronizedMap(map)`
- `Collections.synchronizedSet(set)`
- `Collections.synchronizedCollection(collection)`
- `Collections.synchronizedSortedMap(sortedMap)`
- `Collections.synchronizedSortedSet(sortedSet)`

### 🧪 Example — Fixing the problem

```java
List<Integer> nums = Collections.synchronizedList(new ArrayList<>());

Thread t1 = new Thread(() -> {
    for (int i = 0; i < 1000; i++) {
        nums.add(i);
    }
});

Thread t2 = new Thread(() -> {
    for (int i = 0; i < 1000; i++) {
        nums.add(i);
    }
});

t1.start();
t2.start();
t1.join();
t2.join();

System.out.println("Size: " + nums.size()); // Always 2000!
```

With `synchronizedList`, each `add()` and `remove()` operation acquires the **intrinsic lock** of the collection. Only one thread can execute a synchronized method at a time — the other must wait.

---

## Concept 4: Limitations of Synchronized Collections

### ⚠️ Performance concern

Synchronized collections use a **single lock** (the intrinsic lock) for all operations. This means:

- Even if two threads want to do **completely independent** operations, one must wait for the other
- This becomes a bottleneck in high-concurrency scenarios

### ❓ What's the better alternative?

**Concurrent collections** from `java.util.concurrent`:

- `ConcurrentHashMap` — far more efficient than `Collections.synchronizedMap()`
- `CopyOnWriteArrayList` — great for read-heavy workloads
- `ConcurrentLinkedQueue` — lock-free queue implementation

These use finer-grained locking strategies (or lock-free algorithms) that allow higher throughput.

---

## ✅ Key Takeaways

- Most Java collections (`ArrayList`, `HashMap`, `HashSet`, etc.) are **not thread-safe**
- `Collections.synchronizedList()`, `.synchronizedMap()`, `.synchronizedSet()` wrap collections with synchronized access
- Under the hood, synchronized wrappers use the **intrinsic lock** to ensure only one thread accesses the collection at a time
- For high-performance multi-threaded applications, prefer **concurrent collections** (`ConcurrentHashMap`, etc.)

## ⚠️ Common Mistakes

- Assuming `ArrayList` is thread-safe — it is not
- Using `Hashtable` or `Vector` in modern code — these are legacy; use `ConcurrentHashMap` or `Collections.synchronizedList()` instead
- Forgetting that compound operations (check-then-act) still require explicit synchronization even with synchronized wrappers. For example, `if (!syncList.contains(x)) syncList.add(x)` — each call is individually synchronized, but **another thread can insert `x` between the `contains()` and `add()` calls**, resulting in duplicates. Wrap compound operations in a `synchronized (syncList) { ... }` block to make them atomic

## 💡 Pro Tips

- Use `Collections.synchronizedList()` for quick thread safety, but switch to concurrent collections if performance matters
- Always call `join()` after `start()` to ensure threads complete before you read results
- If you need to iterate over a synchronized collection, wrap the iteration in a `synchronized` block on the collection itself
