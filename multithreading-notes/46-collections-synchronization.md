# Collections Synchronization

## Introduction

Most Java collections (`ArrayList`, `HashMap`, `HashSet`) are **not thread-safe** by default. If multiple threads access and modify the same collection simultaneously, you'll get exceptions or corrupted data. Java provides a quick fix via `Collections.synchronizedXxx()` methods — but as we'll see, it's not the most efficient solution.

---

## Concept 1: The Problem — Unsynchronized Collections

### 🧠 What happens without synchronization?

If two threads simultaneously add elements to the same `ArrayList`, things go wrong:

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

System.out.println("Size: " + nums.size()); // Expected 2000, but...
```

### 🧪 What actually happens?

You'll likely get an `ArrayIndexOutOfBoundsException`. The internal array of the `ArrayList` isn't designed for concurrent modification — two threads resizing or writing to the same index causes corruption.

---

## Concept 2: The Quick Fix — `Collections.synchronizedList()`

### ⚙️ How it works

The `Collections` utility class provides wrapper methods that make any collection thread-safe:

```java
List<Integer> nums = Collections.synchronizedList(new ArrayList<>());
```

Now the same code works perfectly:

```java
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

System.out.println("Size: " + nums.size()); // 2000 ✅
```

### 🧠 What happens under the hood?

The `add()` and `remove()` methods become **synchronized** — they use the **intrinsic lock** of the wrapper object. When one thread is adding an element, any other thread must wait until that operation completes.

---

## Concept 3: Available Synchronization Wrappers

The `Collections` class provides wrappers for all major collection types:

| Unsynchronized | Wrapper Method |
|---------------|----------------|
| `ArrayList`, `LinkedList` | `Collections.synchronizedList()` |
| `HashMap`, `LinkedHashMap`, `TreeMap` | `Collections.synchronizedMap()` |
| `HashSet`, `LinkedHashSet`, `TreeSet` | `Collections.synchronizedSet()` |
| Any `SortedMap` | `Collections.synchronizedSortedMap()` |
| Any `Collection` | `Collections.synchronizedCollection()` |

---

## Concept 4: Why This Isn't the Best Solution

### ⚠️ The Intrinsic Lock Problem

`Collections.synchronizedList()` uses a **single intrinsic lock** for all operations. This means:

- If Thread A is calling `add()`, Thread B must wait — even if it wants to call `get()` (a read operation)
- If Thread A is calling `add()` at index 0, Thread B must wait to call `add()` at index 999 — even though these are totally independent
- **Every operation locks the entire collection**, regardless of what operation it is

### 💡 The Better Solution: Concurrent Collections

For high-performance multi-threaded applications, Java provides **concurrent collections** in `java.util.concurrent`:

- `ConcurrentHashMap` instead of synchronized `HashMap`
- `CopyOnWriteArrayList` instead of synchronized `ArrayList`
- `BlockingQueue` implementations instead of synchronized `Queue`

These use **fine-grained locking** or **lock-free algorithms**, allowing much higher throughput.

---

## Concept 5: Some Collections Are Already Synchronized

A few legacy collections are synchronized by default:

| Collection | Synchronized? |
|-----------|--------------|
| `Vector` | ✅ Yes (legacy — prefer `ArrayList` + sync) |
| `Stack` | ✅ Yes (extends `Vector`) |
| `Hashtable` | ✅ Yes (legacy — prefer `ConcurrentHashMap`) |

> 💡 These legacy synchronized classes use the same intrinsic lock approach, so they have the same performance limitations. Modern concurrent collections are almost always preferred.

---

## Key Takeaways

✅ Standard collections (`ArrayList`, `HashMap`, `HashSet`) are **not** thread-safe

✅ Use `Collections.synchronizedList()`, `synchronizedMap()`, or `synchronizedSet()` for a quick thread-safe wrapper

✅ The synchronized wrappers use a **single intrinsic lock** — simple but not efficient

⚠️ Two threads must wait for each other even for independent operations (read vs write, different indices)

💡 For production multi-threaded code, prefer **concurrent collections** (`ConcurrentHashMap`, `CopyOnWriteArrayList`, etc.) — they offer much better performance under high concurrency
