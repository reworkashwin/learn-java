# Concurrent Maps

## Introduction

We know `HashMap` isn't thread-safe. We saw that `Collections.synchronizedMap()` wraps it with a single lock — which works but isn't efficient. **`ConcurrentHashMap`** is the production-grade solution: it uses fine-grained locking that allows multiple threads to read and write simultaneously without blocking each other unnecessarily.

---

## Concept 1: The Problem with Synchronized Maps

### 🧠 Why not just use `Collections.synchronizedMap()`?

```java
Map<String, Integer> map = Collections.synchronizedMap(new HashMap<>());
```

This uses a **single intrinsic lock** for the entire map. The problems:

- If Thread A reads key "X", Thread B can't read key "Y" — it must wait
- If Thread A writes to bucket 0, Thread B can't write to bucket 999
- **Every operation locks the entire data structure** — reads block writes, writes block reads

For high-concurrency applications, this is unacceptable.

---

## Concept 2: ConcurrentHashMap — The Smart Solution

### 🧠 How It Works (Pre-Java 8: Segment Locking)

The original approach divided the internal array into **segments** (default size: 16 items each). Each segment had its own lock:

```
Segment 1 [Lock A]  │  Segment 2 [Lock B]  │  Segment 3 [Lock C]
   bucket 0-15       │     bucket 16-31      │     bucket 32-47
```

Different threads could modify different segments simultaneously because they use **different locks**.

### 🧠 How It Works (Java 8+: Bin-Level Locking)

After Java 8, the implementation became even more granular — it locks at the **individual bucket level**.

---

## Concept 3: Read Operations — Lock-Free

### ⚙️ No Locks Needed for Reads

Reading from a `ConcurrentHashMap` requires **no lock at all**. This is achieved through:

1. **`volatile` fields** — The node values and the table array itself are declared `volatile`, ensuring threads always see the most up-to-date values from main memory
2. **Happens-before relationship** — The Java Memory Model guarantees that writes made before a volatile write are visible to threads that subsequently read that volatile variable

```java
// From the actual ConcurrentHashMap source code:
static class Node<K,V> {
    volatile V val;      // volatile — visible across threads
    volatile Node<K,V> next;
}

transient volatile Node<K,V>[] table; // volatile array
```

> 💡 **Key Insight:** Any thread can read from any bucket at any time without acquiring any lock. This is a massive performance advantage over synchronized maps.

---

## Concept 4: Write Operations — Fine-Grained Locking

### ⚙️ Empty Buckets: Compare-And-Swap (CAS)

When inserting into an **empty** bucket, `ConcurrentHashMap` uses a **lock-free** atomic operation called CAS:

```
if (current value == expected null) {
    set value to new node  // Atomic operation
} else {
    // Another thread already inserted — fall back to locking
}
```

CAS is a CPU-level instruction — no lock is needed, making this extremely fast.

### ⚙️ Non-Empty Buckets: Synchronized on First Node

If the bucket already has an item (collision), the map **synchronizes on the first node** of that bucket:

```java
synchronized (firstNodeOfBucket) {
    // Add new node to the linked list chain
}
```

This means only threads accessing the **same bucket** block each other. Threads writing to different buckets proceed without interference.

### ⚙️ Red-Black Trees: TreeBin Synchronization

When a bucket's collision chain exceeds **8 elements**, the linked list is converted to a **red-black tree** for better performance. Since tree rotations can change the root node, synchronizing on the root would be unsafe. Instead, Java uses a stable **TreeBin** wrapper object:

```
Bucket → TreeBin (stable object for synchronization)
           ↓
         Root Node (may change due to rotations)
```

All threads synchronize on the `TreeBin` — not the root node — ensuring thread safety even during tree restructuring.

---

## Concept 5: Practical Example

### ⚙️ Producer and Consumer Threads

```java
import java.util.concurrent.*;

class MapProducer implements Runnable {
    private ConcurrentMap<String, Integer> map;

    public MapProducer(ConcurrentMap<String, Integer> map) {
        this.map = map;
    }

    @Override
    public void run() {
        try {
            map.put("B", 12);
            Thread.sleep(1000);
            map.put("Z", 5);
            map.put("A", 25);
            Thread.sleep(2000);
            map.put("D", 19);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class MapConsumer implements Runnable {
    private ConcurrentMap<String, Integer> map;

    public MapConsumer(ConcurrentMap<String, Integer> map) {
        this.map = map;
    }

    @Override
    public void run() {
        try {
            Thread.sleep(5000);
            System.out.println(map.get("A")); // 25
            Thread.sleep(2000);
            System.out.println(map.get("Z")); // 5
            System.out.println(map.get("B")); // 12
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### ⚙️ Main Method

```java
public class App {
    public static void main(String[] args) {
        ConcurrentMap<String, Integer> map = new ConcurrentHashMap<>();

        Thread t1 = new Thread(new MapProducer(map));
        Thread t2 = new Thread(new MapConsumer(map));

        t1.start();
        t2.start();
    }
}
```

No synchronization code needed — `ConcurrentHashMap` handles everything internally.

---

## Concept 6: Synchronized Map vs ConcurrentHashMap

| Feature | `Collections.synchronizedMap()` | `ConcurrentHashMap` |
|---------|-------------------------------|---------------------|
| Lock granularity | Entire map (single lock) | Per-bucket |
| Reads block other reads | ✅ Yes | ❌ No (lock-free reads) |
| Reads block writes | ✅ Yes | ❌ No |
| Writes in different buckets block | ✅ Yes | ❌ No |
| Performance under concurrency | Poor | Excellent |
| Empty bucket insertion | Locked | Lock-free (CAS) |

---

## Key Takeaways

✅ `ConcurrentHashMap` is the go-to thread-safe map for production code

✅ **Read operations are completely lock-free** — any number of threads can read simultaneously

✅ Writes use **bucket-level locking** — threads only block when writing to the same bucket

✅ Empty buckets use **CAS (Compare-And-Swap)** — a lock-free atomic operation

✅ Linked list chains exceeding 8 nodes convert to **red-black trees** for better O(log n) performance

⚠️ Avoid `Collections.synchronizedMap()` in high-concurrency scenarios — it locks the entire map for every operation

💡 You don't need to manage any synchronization yourself — `ConcurrentHashMap` has been extensively tested and optimized by the Java team. Trust the built-in implementation over hand-rolled synchronization
