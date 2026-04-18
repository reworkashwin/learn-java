# Blocking Queue — LinkedBlockingQueue

## Introduction

We've seen `ArrayBlockingQueue` with its fixed-size array and single lock. Now let's look at `LinkedBlockingQueue` — a linked list-based implementation that offers **two independent locks** (one for puts, one for takes) and the option to be **unbounded**. These differences have significant performance implications.

---

## Concept 1: Bounded vs Unbounded

### 🧠 The Crucial Difference

`LinkedBlockingQueue` can be created in two ways:

```java
// Bounded — stores up to 10 items
BlockingQueue<String> bounded = new LinkedBlockingQueue<>(10);

// Unbounded — stores up to Integer.MAX_VALUE items
BlockingQueue<String> unbounded = new LinkedBlockingQueue<>();
```

### ⚠️ Unbounded Queue Danger

When you omit the capacity, it uses `Integer.MAX_VALUE` (~2.1 billion) as the upper bound. In practice, you'll run out of **memory** long before reaching this limit. If the producer is faster than the consumer, items accumulate without any backpressure, and you get an `OutOfMemoryError`.

> ✅ **Best Practice:** Always specify a capacity unless you have a good reason not to.

---

## Concept 2: Two Independent Locks

### 🧠 The Key Advantage

This is the fundamental difference from `ArrayBlockingQueue`:

| | ArrayBlockingQueue | LinkedBlockingQueue |
|---|-------------------|---------------------|
| Locks | **1** ReentrantLock | **2** ReentrantLocks |
| `put()` and `take()` | Block each other | Can run **simultaneously** |

`LinkedBlockingQueue` uses:
- One lock for the **head** (take operations)
- One lock for the **tail** (put operations)

This means a producer can insert while a consumer removes — they don't block each other because they operate on different ends of the linked list with different locks.

### ⚙️ Under the Hood

The underlying data structure is a **linked list**:
- Each node stores an item and a reference to the next node
- `take()` removes from the **head**
- `put()` adds at the **tail**
- The head and tail are independent — hence the two locks

---

## Concept 3: Practical Example

```java
import java.util.concurrent.*;

public class App {
    public static void main(String[] args) {
        BlockingQueue<String> queue = new LinkedBlockingQueue<>(5);

        // Producer
        Runnable producer = () -> {
            int i = 0;
            try {
                while (true) {
                    String item = "item" + i++;
                    queue.put(item);
                    System.out.println("Produced: " + item);
                    Thread.sleep(500);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        // Consumer
        Runnable consumer = () -> {
            try {
                while (true) {
                    String item = queue.take();
                    System.out.println("Consumed: " + item);
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        new Thread(producer).start();
        new Thread(consumer).start();
    }
}
```

Since the consumer (1000ms) is slower than the producer (500ms), the bounded queue (capacity 5) will fill up. Once full, the producer **blocks** on `put()` until the consumer removes an item.

---

## Concept 4: When to Use Which?

### Decision Guide

| Requirement | Recommended |
|------------|-------------|
| Unbounded or growing queue | `LinkedBlockingQueue` |
| Fixed-size queue with high throughput | `ArrayBlockingQueue` |
| Need fairness (no thread starvation) | `ArrayBlockingQueue` (supports fair lock) |
| Need producer and consumer to run simultaneously | `LinkedBlockingQueue` (two locks) |
| Lower garbage collection pressure | `ArrayBlockingQueue` (no node allocation) |
| Simple, predictable memory | `ArrayBlockingQueue` |

### 💡 Surprising Fact: ArrayBlockingQueue Is Often Faster

Despite having **two locks**, `LinkedBlockingQueue` is often slower than `ArrayBlockingQueue` because of **cache locality**:

- `ArrayBlockingQueue` stores items in a contiguous array → CPU cache-friendly
- `LinkedBlockingQueue` creates node objects scattered across memory → more cache misses and GC pressure

---

## Concept 5: Fairness

### ⚠️ LinkedBlockingQueue Has No Fairness Option

Unlike `ArrayBlockingQueue`, `LinkedBlockingQueue` does **not** support a fairness parameter. Threads are not guaranteed to acquire the lock in FIFO order.

If fairness is critical (preventing thread starvation), use `ArrayBlockingQueue` with the fair flag set to `true`.

---

## Key Takeaways

✅ `LinkedBlockingQueue` uses **two locks** — producer and consumer can operate simultaneously

✅ Can be **bounded** (specify capacity) or **unbounded** (no capacity = `Integer.MAX_VALUE`)

✅ Backed by a linked list — `take()` from head, `put()` at tail

⚠️ Unbounded queues can cause `OutOfMemoryError` if the producer outpaces the consumer

⚠️ No fairness support — threads may starve under contention

💡 Despite two locks, `ArrayBlockingQueue` often outperforms `LinkedBlockingQueue` due to better cache locality. Choose based on your specific requirements, not just lock count
