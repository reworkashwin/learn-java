# DelayQueue

## Introduction

Imagine you have tasks that should only become available for processing **after a certain amount of time** has passed. For example, scheduling retries (wait 5 seconds before retrying), implementing cache expiration, or creating event schedulers. Java's `DelayQueue` is designed exactly for this — it's a blocking queue where elements can only be taken when their **delay has expired**.

---

## Concept 1: What is DelayQueue?

### 🧠 What is it?

`DelayQueue` is an **unbounded blocking queue** of `Delayed` elements. An element can only be removed from the queue when its delay has expired. The element with the **shortest remaining delay** is always at the head.

```java
import java.util.concurrent.DelayQueue;
```

### ❓ How is it different from other queues?

| Queue | Ordering | Blocking |
|---|---|---|
| `LinkedList` (as Queue) | FIFO | No |
| `PriorityQueue` | Priority-based | No |
| `ArrayBlockingQueue` | FIFO | Blocks when full/empty |
| **`DelayQueue`** | **Delay-based (shortest delay first)** | **Blocks until delay expires** |

### 🧪 Real-World Analogy

A restaurant kitchen where dishes have different cooking times. The `DelayQueue` is like a window where dishes only appear when they're ready. A waiter calling `take()` will wait until the next dish is cooked.

---

## Concept 2: The Delayed Interface

### 🧠 What is it?

Every element in a `DelayQueue` must implement the `Delayed` interface:

```java
public interface Delayed extends Comparable<Delayed> {
    long getDelay(TimeUnit unit);  // How much time before this element expires?
}
```

### ⚙️ Creating a Delayed element

```java
import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

public class DelayedTask implements Delayed {
    private String name;
    private long startTime;  // When this task becomes available

    public DelayedTask(String name, long delayMillis) {
        this.name = name;
        this.startTime = System.currentTimeMillis() + delayMillis;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        long remainingDelay = startTime - System.currentTimeMillis();
        return unit.convert(remainingDelay, TimeUnit.MILLISECONDS);
    }

    @Override
    public int compareTo(Delayed other) {
        return Long.compare(this.getDelay(TimeUnit.MILLISECONDS),
                           other.getDelay(TimeUnit.MILLISECONDS));
    }

    @Override
    public String toString() {
        return name;
    }
}
```

### 💡 Key Points

- `getDelay()` returns the **remaining time** before this element expires. When it returns 0 or negative, the element can be taken.
- `compareTo()` is required to keep elements ordered — shortest delay first.

---

## Concept 3: Using DelayQueue

### 🧪 Complete example

```java
import java.util.concurrent.DelayQueue;

public class App {
    public static void main(String[] args) throws InterruptedException {
        DelayQueue<DelayedTask> queue = new DelayQueue<>();

        // Add tasks with different delays
        queue.put(new DelayedTask("Task C (5s)", 5000));
        queue.put(new DelayedTask("Task A (1s)", 1000));
        queue.put(new DelayedTask("Task B (3s)", 3000));

        System.out.println("Waiting for tasks...");

        // Take tasks as they expire
        while (!queue.isEmpty()) {
            DelayedTask task = queue.take();  // Blocks until next task is ready
            System.out.println("Processing: " + task 
                + " at " + System.currentTimeMillis());
        }
    }
}
```

### 🧪 Output

```
Waiting for tasks...
Processing: Task A (1s) at 1713456001000    ← after 1 second
Processing: Task B (3s) at 1713456003000    ← after 3 seconds
Processing: Task C (5s) at 1713456005000    ← after 5 seconds
```

Notice: even though Task C was added first, Task A comes out first because it has the shortest delay.

---

## Concept 4: Use Cases

### ⚙️ When to use DelayQueue

1. **Retry mechanisms** — retry a failed operation after a delay
2. **Cache expiration** — remove items from cache when their TTL expires
3. **Event scheduling** — execute events at specific future times
4. **Session timeouts** — expire user sessions after inactivity
5. **Rate limiting** — throttle operations by delaying them

### 🧪 Example — Simple cache with TTL

```java
public class ExpiringCache<K, V> {
    private Map<K, V> cache = new ConcurrentHashMap<>();
    private DelayQueue<ExpiringKey<K>> expiryQueue = new DelayQueue<>();

    public void put(K key, V value, long ttlMillis) {
        cache.put(key, value);
        expiryQueue.put(new ExpiringKey<>(key, ttlMillis));
    }

    // Background thread removes expired entries
    public void startCleanup() {
        new Thread(() -> {
            while (true) {
                try {
                    ExpiringKey<K> expired = expiryQueue.take();
                    cache.remove(expired.getKey());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }).start();
    }
}
```

---

## Summary

✅ **Key Takeaways:**

- `DelayQueue` is a blocking queue where elements become available only after their delay expires
- Elements must implement the `Delayed` interface (`getDelay()` + `compareTo()`)
- `take()` blocks until the next element's delay has expired
- Elements are ordered by delay — shortest remaining delay is always at the head
- Use for: retry mechanisms, cache expiration, event scheduling, session timeouts

⚠️ **Common Mistake:** Returning an absolute timestamp instead of a **remaining delay** from `getDelay()`. The method must return `startTime - currentTime`, not just `startTime`.
