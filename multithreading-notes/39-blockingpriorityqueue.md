# PriorityBlockingQueue

## Introduction

What if you need a thread-safe queue where elements are processed **by priority** rather than insertion order? `PriorityBlockingQueue` combines the ordering of a priority queue with the thread-safety of a blocking queue. It's backed by a **heap data structure** and uses a single `ReentrantLock`.

---

## Concept 1: What is PriorityBlockingQueue?

### 🧠 The Concept

`PriorityBlockingQueue` is a concurrent, **unbounded** blocking queue that orders items based on their **priority** (natural ordering or a custom `Comparator`).

- It's essentially a thread-safe version of `PriorityQueue`
- The underlying data structure is a **binary heap** stored as a one-dimensional array
- The `take()` method always returns the **highest-priority** element (smallest value in a min-heap)

### ⚙️ Heap Data Structure — Quick Recap

A binary heap is a tree stored as an array:

```
         5
       /   \
     10     25
    /  \   /
   35  40 30
```

Array representation: `[5, 10, 25, 35, 40, 30]`

Parent-child relationships by index:
- Left child of index `i` → `2*i + 1`
- Right child of index `i` → `2*i + 2`

Most operations (insert, remove min) run in **O(log n)** time.

---

## Concept 2: Key Characteristics

### 🔒 Single ReentrantLock

Like `ArrayBlockingQueue`, `PriorityBlockingQueue` uses a **single lock** for all operations. This means:
- Only one thread can insert or remove at a time
- Read and write operations block each other
- The resize operation (when the array grows) is also blocking

### 📏 Unbounded — Never Blocks on `put()`

Unlike `ArrayBlockingQueue`, `PriorityBlockingQueue` is **unbounded**:
- `put()` **never blocks** — it always succeeds (unless you run out of memory)
- `take()` **blocks** when the queue is empty
- The internal array **resizes automatically** when full

### ⚠️ No Fairness

Threads are not guaranteed FIFO ordering when competing for the lock. Some threads may starve under high contention.

---

## Concept 3: Using Natural Ordering

### 🧪 With Integers

```java
import java.util.concurrent.*;

public class App {
    public static void main(String[] args) throws InterruptedException {
        PriorityBlockingQueue<Integer> queue = new PriorityBlockingQueue<>();

        queue.put(12);
        queue.put(50);
        queue.put(2);
        queue.put(1);
        queue.put(100);

        // Items come out in sorted order
        System.out.println(queue.take()); // 1
        System.out.println(queue.take()); // 2
        System.out.println(queue.take()); // 12
        System.out.println(queue.take()); // 50
        System.out.println(queue.take()); // 100
    }
}
```

Elements are returned in **natural ascending order** (min-heap).

### 🧪 With Strings

Strings are ordered alphabetically:
```java
queue.put("B");
queue.put("H");
queue.put("F");
queue.put("A");
queue.put("Z");

// Output: A, B, F, H, Z
```

---

## Concept 4: Custom Ordering with Comparable

### 🧠 How to Define Priority for Custom Objects

Implement the `Comparable` interface in your class:

```java
class Person implements Comparable<Person> {
    private int age;
    private String name;

    public Person(int age, String name) {
        this.age = age;
        this.name = name;
    }

    @Override
    public int compareTo(Person other) {
        return Integer.compare(this.age, other.age); // Sort by age
    }

    @Override
    public String toString() {
        return name + " (age " + age + ")";
    }
}
```

### 🧪 Using It

```java
PriorityBlockingQueue<Person> queue = new PriorityBlockingQueue<>();

queue.put(new Person(45, "Adam"));
queue.put(new Person(55, "Kevin"));
queue.put(new Person(27, "Anna"));
queue.put(new Person(31, "Daniel"));
queue.put(new Person(15, "Joe"));

// Output: Joe (15), Anna (27), Daniel (31), Adam (45), Kevin (55)
```

Change the `compareTo` method to sort differently:

```java
// Sort by name alphabetically
public int compareTo(Person other) {
    return this.name.compareTo(other.name);
}
// Output: Adam, Anna, Daniel, Joe, Kevin
```

---

## Concept 5: Producer-Consumer with PriorityBlockingQueue

```java
class Producer implements Runnable {
    private BlockingQueue<Integer> queue;

    public Producer(BlockingQueue<Integer> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        try {
            queue.put(50);
            queue.put(2);
            queue.put(100);
            queue.put(1);
            queue.put(12);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class Consumer implements Runnable {
    private BlockingQueue<Integer> queue;

    public Consumer(BlockingQueue<Integer> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        try {
            Thread.sleep(5000); // Wait for producer to finish
            for (int i = 0; i < 5; i++) {
                System.out.println(queue.take()); // 1, 2, 12, 50, 100
                Thread.sleep(1000);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

---

## Concept 6: Comparison of BlockingQueue Implementations

| Feature | ArrayBlockingQueue | LinkedBlockingQueue | PriorityBlockingQueue |
|---------|-------------------|---------------------|----------------------|
| Bounded | ✅ Fixed size | ✅ Optional | ❌ Unbounded |
| Locks | 1 ReentrantLock | 2 ReentrantLocks | 1 ReentrantLock |
| Ordering | FIFO | FIFO | Priority-based |
| Fairness | ✅ Supported | ❌ No | ❌ No |
| Blocks on `put()` | ✅ When full | ✅ When full (bounded) | ❌ Never |
| Auto-resize | ❌ No | N/A (linked list) | ✅ Yes |

---

## Key Takeaways

✅ `PriorityBlockingQueue` orders elements by priority — not insertion order

✅ Use `Comparable` or `Comparator` to define the priority for custom objects

✅ It's **unbounded** — `put()` never blocks, but you can still run out of memory

✅ `take()` blocks when the queue is empty and always returns the highest-priority element

⚠️ Uses a single lock — only one thread can insert or remove at a time

💡 Great for task scheduling where high-priority tasks should be processed first, regardless of when they were submitted
