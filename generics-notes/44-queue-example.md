# Queue Example

## Introduction

While a stack works on the **Last-In, First-Out** principle, a **queue** works on **First-In, First-Out (FIFO)** — just like a line at a coffee shop. The first person in line is served first. Queues are essential in scheduling, task processing, breadth-first search, and anywhere order of arrival matters.

---

## Concept 1: What Is a Queue?

### 🧠 What is it?

A queue is a linear data structure where:
- Elements are added at the **rear** (enqueue)
- Elements are removed from the **front** (dequeue)

### 🧪 Real-world analogy

Think of a printing queue:
- Documents are added at the end of the queue
- The printer processes documents from the front
- The first document submitted is the first one printed

### ⚙️ Core operations

| Operation | Method (throws) | Method (returns null) |
|-----------|-----------------|----------------------|
| Add to rear | `add(e)` | `offer(e)` |
| Remove from front | `remove()` | `poll()` |
| View front | `element()` | `peek()` |

The two-column approach exists because sometimes you want an exception (hard failure) and sometimes you want a `null` return (soft failure).

---

## Concept 2: Queue with LinkedList

### ⚙️ How it works

`LinkedList` implements both `List` and `Queue` interfaces:

```java
import java.util.LinkedList;
import java.util.Queue;

Queue<String> queue = new LinkedList<>();

// Enqueue — add to the rear
queue.offer("Alice");
queue.offer("Bob");
queue.offer("Charlie");

System.out.println(queue); // [Alice, Bob, Charlie]

// Peek — view front without removing
System.out.println(queue.peek()); // Alice

// Dequeue — remove from front
String first = queue.poll();
System.out.println(first);  // Alice
System.out.println(queue);  // [Bob, Charlie]

// Size
System.out.println(queue.size()); // 2
```

---

## Concept 3: Queue with ArrayDeque (Recommended)

### ⚙️ How it works

`ArrayDeque` is faster than `LinkedList` for queue operations:

```java
import java.util.ArrayDeque;
import java.util.Queue;

Queue<Integer> queue = new ArrayDeque<>();

queue.offer(10);
queue.offer(20);
queue.offer(30);

while (!queue.isEmpty()) {
    System.out.println(queue.poll());
}
// Output: 10, 20, 30 (FIFO order)
```

### 💡 Insight

Why is `ArrayDeque` faster? It uses a **circular array** internally — no object overhead per node like `LinkedList`, and much better **cache locality** since elements are stored contiguously in memory.

---

## Concept 4: PriorityQueue — Queue with Natural Ordering

### 🧠 What is it?

A `PriorityQueue` doesn't follow strict FIFO. Instead, elements are dequeued based on their **natural ordering** (or a custom `Comparator`). The smallest (or highest-priority) element is always at the front.

### ⚙️ How it works

```java
import java.util.PriorityQueue;
import java.util.Queue;

Queue<Integer> pq = new PriorityQueue<>();

pq.offer(30);
pq.offer(10);
pq.offer(20);

while (!pq.isEmpty()) {
    System.out.println(pq.poll());
}
// Output: 10, 20, 30 (sorted — smallest first)
```

With a custom comparator (largest first):

```java
Queue<Integer> maxPQ = new PriorityQueue<>(Comparator.reverseOrder());
maxPQ.offer(30);
maxPQ.offer(10);
maxPQ.offer(20);

System.out.println(maxPQ.poll()); // 30 (largest first)
```

### 💡 Insight

`PriorityQueue` is implemented as a **min-heap** — a binary tree where the parent is always smaller than its children. This gives O(log n) insert and O(log n) removal, with O(1) peek.

---

## Concept 5: Practical Example — Task Scheduler

### 🧪 Example

```java
public class Task implements Comparable<Task> {
    String name;
    int priority; // lower = more urgent

    Task(String name, int priority) {
        this.name = name;
        this.priority = priority;
    }

    @Override
    public int compareTo(Task other) {
        return Integer.compare(this.priority, other.priority);
    }

    @Override
    public String toString() {
        return name + " (priority " + priority + ")";
    }
}
```

```java
Queue<Task> scheduler = new PriorityQueue<>();
scheduler.offer(new Task("Send email", 3));
scheduler.offer(new Task("Fix critical bug", 1));
scheduler.offer(new Task("Update docs", 5));
scheduler.offer(new Task("Deploy hotfix", 2));

while (!scheduler.isEmpty()) {
    System.out.println("Processing: " + scheduler.poll());
}
// Fix critical bug (priority 1)
// Deploy hotfix (priority 2)
// Send email (priority 3)
// Update docs (priority 5)
```

---

## ✅ Key Takeaways

- Queues are FIFO: first in, first out
- Use `offer`/`poll`/`peek` (return null) over `add`/`remove`/`element` (throw exceptions)
- `ArrayDeque` is the best general-purpose queue implementation
- `PriorityQueue` processes elements by priority, not insertion order
- Queues are essential for BFS, task scheduling, and event processing

## ⚠️ Common Mistakes

- Using `LinkedList` as a queue when `ArrayDeque` is faster and simpler
- Calling `poll()` or `peek()` without checking for `null` (empty queue returns `null`)
- Assuming `PriorityQueue` iteration order is sorted — only `poll()` guarantees ordering. The internal heap structure only guarantees the minimum is at the root; the rest of the underlying array is **not** fully sorted
- Forgetting that `PriorityQueue` does NOT allow `null` elements — `null` cannot be compared via `compareTo()` or a `Comparator`, so insertion would throw a `NullPointerException`
