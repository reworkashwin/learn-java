# 📘 Concurrent Collections

## 📌 Introduction

Synchronized collections get the job done for basic thread safety, but they use a **single lock** for the entire collection — creating a bottleneck when many threads compete for access. Concurrent collections are the answer. They're part of the `java.util.concurrent` package and are specifically engineered for **high-concurrency environments** using techniques like lock striping, non-blocking algorithms, and optimistic concurrency.

The result? Multiple threads can read and write **simultaneously** without stepping on each other's toes.

---

## 🧩 Concept 1: ConcurrentHashMap

### 🧠 What is it?

`ConcurrentHashMap` is a **thread-safe version of HashMap** that achieves much better performance than `Collections.synchronizedMap()` in concurrent environments. Instead of locking the entire map for every operation, it divides the map into **segments** and locks only the segment being modified.

### ❓ Why do we need it?

With `Collections.synchronizedMap()`, if Thread A is updating key "Alice", Thread B must wait — even if it wants to update an unrelated key "Bob". `ConcurrentHashMap` allows both operations to happen **simultaneously** because they're in different segments.

### ⚙️ How it works

- The map is internally divided into segments (buckets)
- Read operations (`get`) generally require **no locking at all**
- Write operations (`put`, `remove`) only lock the **specific segment** being modified
- Multiple threads can read and write to different segments concurrently

### 🧪 Example

```java
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashMapTest {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        map.put("Alice", 23);
        map.put("Bob", 21);
        map.put("Charlie", 22);

        System.out.println("Age of Alice: " + map.get("Alice")); // 23

        // Add elements concurrently from two threads
        Runnable task1 = () -> map.put("David", 24);
        Runnable task2 = () -> map.put("Eve", 25);

        Thread t1 = new Thread(task1);
        Thread t2 = new Thread(task2);
        t1.start();
        t2.start();

        t1.join();
        t2.join();

        System.out.println("Final map: " + map);
        // Output: Final map: {Alice=23, Bob=21, Charlie=22, David=24, Eve=25}
    }
}
```

### 💡 Insight

Key advantages over `synchronizedMap`:
- **No explicit synchronization needed** — `ConcurrentHashMap` handles it internally
- **No `ConcurrentModificationException`** during iteration
- **Better throughput** under high concurrency due to segment-level locking
- Does **not** allow `null` keys or values (unlike `HashMap`)

---

## 🧩 Concept 2: CopyOnWriteArrayList

### 🧠 What is it?

`CopyOnWriteArrayList` is a thread-safe version of `ArrayList` where every **write operation** (add, set, remove) creates a **new copy** of the underlying array. Reads operate on the existing array without any locking.

### ❓ Why do we need it?

This collection is optimized for the **many reads, few writes** pattern. Since reads never lock, multiple threads can read simultaneously with zero contention. The trade-off is that writes are expensive because they copy the entire array.

### ⚙️ How it works

- **Read**: Directly accesses the array — no locking, no copying, instant
- **Write**: Creates a complete copy of the array, makes the modification on the copy, then atomically replaces the reference

This means:
- Iterators always see a **consistent snapshot** — even if another thread modifies the list during iteration
- No `ConcurrentModificationException` ever

### 🧪 Example

```java
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class CopyOnWriteDemo {
    public static void main(String[] args) throws InterruptedException {
        List<String> list = new CopyOnWriteArrayList<>();
        list.add("Alice");
        list.add("Bob");

        System.out.println("Initial list: " + list);

        // Add elements concurrently
        Runnable task1 = () -> list.add("Charlie");
        Runnable task2 = () -> list.add("David");

        Thread t1 = new Thread(task1);
        Thread t2 = new Thread(task2);
        t1.start();
        t2.start();

        t1.join();
        t2.join();

        System.out.println("Updated list: " + list);
        // Output: Updated list: [Alice, Bob, Charlie, David]
    }
}
```

### 💡 Insight

**When to use it:** Think of a news website — millions of users **read** articles, but only a few editors **write** new ones. That's the perfect use case for `CopyOnWriteArrayList`. Don't use it when writes are frequent — the constant array copying becomes a performance killer.

---

## 🧩 Concept 3: BlockingQueue

### 🧠 What is it?

`BlockingQueue` is an interface designed for the **producer-consumer pattern**. It provides built-in thread synchronization:
- **Blocks the producer** when the queue is full (waits for space)
- **Blocks the consumer** when the queue is empty (waits for items)

### ❓ Why do we need it?

The producer-consumer problem is one of the most common concurrency patterns. Without `BlockingQueue`, you'd have to manually coordinate between producers and consumers with wait/notify — error-prone and complex. `BlockingQueue` handles all of this automatically.

### ⚙️ How it works

Java provides several implementations:

| Implementation | Description |
|---------------|-------------|
| `ArrayBlockingQueue` | Fixed-capacity queue backed by an array |
| `LinkedBlockingQueue` | Optionally bounded queue backed by linked nodes |
| `PriorityBlockingQueue` | Unbounded priority queue |

Key methods:
- `put(E e)` — Adds an element, **blocks** if queue is full
- `take()` — Retrieves and removes the head, **blocks** if queue is empty
- `offer(E e)` — Adds if space available, returns `false` otherwise (non-blocking)
- `poll()` — Retrieves and removes if available, returns `null` otherwise (non-blocking)

### 🧪 Example — Producer-Consumer Pattern

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class BlockingQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(3); // Capacity: 3

        // Producer: adds items to the queue
        Runnable producer = () -> {
            try {
                queue.put("Item 1");
                queue.put("Item 2");
                queue.put("Item 3");
                System.out.println("Produced all items");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        // Consumer: takes items from the queue
        Runnable consumer = () -> {
            try {
                Thread.sleep(1000); // Simulate processing delay
                System.out.println("Consumed: " + queue.take());
                System.out.println("Consumed: " + queue.take());
                System.out.println("Consumed: " + queue.take());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        Thread producerThread = new Thread(producer);
        Thread consumerThread = new Thread(consumer);
        producerThread.start();
        consumerThread.start();

        producerThread.join();
        consumerThread.join();
    }
}
```

**Output:**
```
Produced all items
Consumed: Item 1
Consumed: Item 2
Consumed: Item 3
```

### 💡 Insight

Real-world use cases for `BlockingQueue`:
- **E-commerce platforms** — order processing pipelines where orders are produced by users and consumed by fulfillment systems
- **Message queues** — decoupling producers (senders) from consumers (receivers)
- **Thread pools** — `ThreadPoolExecutor` internally uses a `BlockingQueue` to hold pending tasks

---

## 🧩 Concept 4: Advantages of Concurrent Collections

### 🧠 Why choose concurrent collections over synchronized collections?

| Advantage | Explanation |
|-----------|-------------|
| **Better scalability** | Reduced lock contention allows more threads to operate simultaneously |
| **Non-blocking reads** | Collections like `ConcurrentHashMap` and `CopyOnWriteArrayList` allow multiple threads to read without blocking |
| **Optimized for concurrency** | Use techniques like lock striping and non-blocking algorithms instead of coarse-grained locks |
| **No ConcurrentModificationException** | Safe to iterate and modify concurrently |

---

## 🧩 Concept 5: When to Use Which Concurrent Collection

| Use Case | Recommended Collection |
|----------|----------------------|
| High-performance key-value storage with many threads | `ConcurrentHashMap` |
| Many reads, few writes on a list | `CopyOnWriteArrayList` |
| Producer-consumer pattern | `BlockingQueue` (`ArrayBlockingQueue`, `LinkedBlockingQueue`) |
| Sorted concurrent map | `ConcurrentSkipListMap` |
| Concurrent set | `ConcurrentSkipListSet` or `CopyOnWriteArraySet` |

---

## 🧩 Synchronized vs Concurrent Collections

| Feature | Synchronized Collections | Concurrent Collections |
|---------|------------------------|----------------------|
| Locking | Single lock (entire collection) | Fine-grained / segment-level locks |
| Read performance | Threads must wait for lock | Multiple threads read simultaneously |
| Write performance | One writer at a time | Multiple writers (different segments) |
| Iteration | Manual synchronization required | Safe without extra synchronization |
| Package | `java.util.Collections` | `java.util.concurrent` |
| Best for | Low concurrency | High concurrency |

---

## ✅ Key Takeaways

- **`ConcurrentHashMap`** uses segment-level locking for high-performance concurrent map operations
- **`CopyOnWriteArrayList`** creates a new array copy on every write — ideal for read-heavy, write-light scenarios
- **`BlockingQueue`** provides built-in producer-consumer synchronization with blocking `put()` and `take()` methods
- Concurrent collections are in `java.util.concurrent` and outperform `Collections.synchronizedXxx()` in high-concurrency environments
- No explicit `synchronized` blocks needed — concurrency is handled internally

## ⚠️ Common Mistakes

- Using `CopyOnWriteArrayList` in write-heavy scenarios — every write copies the entire array
- Assuming `ConcurrentHashMap` allows `null` keys or values — it doesn't (unlike `HashMap`)
- Using `synchronized` wrappers when concurrent collections would be more appropriate
- Forgetting that `BlockingQueue.put()` blocks indefinitely — use `offer()` with a timeout if you need to avoid infinite blocking

## 💡 Pro Tips

- `ConcurrentHashMap` supports atomic compound operations like `putIfAbsent()`, `computeIfAbsent()`, and `merge()` — use these instead of check-then-act patterns
- For a concurrent `Set`, use `ConcurrentHashMap.newKeySet()` — it's simpler than `Collections.synchronizedSet()`
- In interviews, highlight the key difference: synchronized collections use **one lock for everything**; concurrent collections use **fine-grained locking** or **copy-on-write** strategies
