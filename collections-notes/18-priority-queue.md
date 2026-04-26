# 📘 Priority Queue

## 📌 Introduction

We've seen how regular queues work — **first in, first out (FIFO)**. The first element added is the first to be removed. But what if some elements are more important than others? What if you need the "highest priority" item processed first, regardless of when it arrived?

That's exactly what **Priority Queue** solves. In this note, we explore how `PriorityQueue` works in Java, how it differs from a regular queue, and what's happening under the hood with binary heaps.

---

## 🧩 Concept 1: Regular Queue vs Priority Queue

### 🧠 What is a regular Queue?

A regular queue follows the **FIFO principle** — the first element added is the first one removed. Think of a line at a ticket counter: whoever arrives first gets served first.

```java
Queue<String> queue = new LinkedList<>();
queue.add("B");
queue.add("A");
queue.add("C");

System.out.println(queue);       // [B, A, C]
System.out.println(queue.poll()); // B — first added, first removed
System.out.println(queue);       // [A, C]
```

"B" was added first, so "B" is removed first. Simple FIFO.

### 🧠 What is a Priority Queue?

A `PriorityQueue` changes this behavior. Instead of FIFO, elements are removed based on their **priority**. The element with the highest priority is always at the **head** of the queue.

```java
Queue<String> pq = new PriorityQueue<>();
pq.add("B");
pq.add("A");
pq.add("C");

System.out.println(pq);       // [A, B, C] — sorted by natural order
System.out.println(pq.poll()); // A — highest priority (smallest), not first added
System.out.println(pq);       // [B, C]
```

Even though "B" was added first, **"A"** is removed first because it has the highest priority (smallest value in natural ordering).

### 💡 Insight

The key difference: a regular queue cares about **when** you arrived. A priority queue cares about **how important** you are.

---

## 🧩 Concept 2: Natural Ordering and Custom Comparators

### 🧠 What is natural ordering?

By default, `PriorityQueue` orders elements by their **natural ordering**:
- **Numbers** → ascending order (smallest has highest priority)
- **Strings** → lexicographic/alphabetical order ("A" before "B")

```java
Queue<Integer> pq = new PriorityQueue<>();
pq.add(3);
pq.add(1);
pq.add(2);

System.out.println(pq.poll()); // 1 — smallest number = highest priority
```

### ⚙️ Custom Comparators

What if you want the **largest** element to have the highest priority? Use `Comparator.reverseOrder()`:

```java
Queue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());
pq.add(3);
pq.add(1);
pq.add(2);

System.out.println(pq.poll()); // 3 — largest number = highest priority now
```

You can also define a completely custom comparator for complex priority logic:

```java
// Priority by string length (shorter strings = higher priority)
Queue<String> pq = new PriorityQueue<>(Comparator.comparingInt(String::length));
```

### 💡 Insight

Natural ordering uses a **min-heap** (smallest at top). `Comparator.reverseOrder()` effectively turns it into a **max-heap** (largest at top). Understanding this distinction is critical for interviews.

---

## 🧩 Concept 3: Binary Heap — The Engine Under the Hood

### 🧠 What is it?

Internally, Java's `PriorityQueue` uses a **binary heap** data structure to maintain element ordering efficiently. A binary heap is a complete binary tree where every parent node satisfies the heap property.

### ⚙️ Two Types of Binary Heaps

| Type | Rule | Java Default |
|---|---|---|
| **Min-Heap** | Parent is **smaller** than its children | ✅ Default |
| **Max-Heap** | Parent is **larger** than its children | With `Comparator.reverseOrder()` |

### ⚙️ How Insertion Works (Shift Up)

When you add an element:

1. The new element is placed at the **last position** in the heap (to maintain tree completeness).
2. It's then compared with its **parent**.
3. If the new element is smaller (in min-heap), it **swaps** with the parent.
4. This process repeats until the heap property is restored.

**Example: Adding 10, 30, 20, 5 step by step:**

```
Step 1: Add 10       Step 2: Add 30       Step 3: Add 20
     10                   10                   10
                         /                    /  \
                       30                   30    20
                                            ↓ (no swap needed, 20 > 10)

Step 4: Add 5
     10                    5
    /  \        →        /  \
  30    20             10    20
  /                    /
 5                   30
 ↑ 5 < 30, swap     ↑ 5 < 10, swap → 5 becomes root
```

After adding all four elements, the heap looks like: `5, 10, 20, 30` — the smallest element (5) is at the root.

### ⚙️ How Removal Works (Shift Down)

When you call `poll()`:

1. The **root** element (highest priority) is removed.
2. The **last** element in the heap replaces the root.
3. This element is then compared with its **children** and swapped with the smallest child.
4. This process repeats until the heap property is restored — called **"down-heaping"**.

### 🧪 Inside the Source Code

If you look at `PriorityQueue`'s source code:

```java
// When adding an element
public boolean offer(E e) {
    // ... calls siftUp()
}

// siftUp compares with parent and swaps upward
private void siftUp(int k, E x) {
    if (comparator != null)
        siftUpUsingComparator(k, x);  // Custom comparator
    else
        siftUpComparable(k, x);       // Natural ordering
}

// When removing an element
public E poll() {
    // ... calls siftDown()
}
```

The `siftUp` method handles insertion (bubbling up), and `siftDown` handles removal (bubbling down). If a custom comparator is provided, it uses `siftUpUsingComparator`; otherwise, it falls back to `siftUpComparable` (natural ordering).

### 💡 Insight

Both insertion and removal have a time complexity of **O(log n)** because, in the worst case, an element needs to travel from a leaf to the root (or vice versa), and the height of a binary heap is log n.

---

## 🧩 Concept 4: Key Features of Priority Queue

### 1. Ordering

- Default: **ascending order** (min-heap) — smallest element at the front.
- Custom: provide a `Comparator` to define your own priority rules.

### 2. No Null Elements

`PriorityQueue` does **not** allow `null` values. Attempting to add `null` throws a `NullPointerException`:

```java
Queue<Integer> pq = new PriorityQueue<>();
pq.add(null);  // ❌ NullPointerException!
```

### 3. Non-Synchronized (Not Thread-Safe)

`PriorityQueue` is **not thread-safe**. If multiple threads access it concurrently, you need to:
- Wrap it with `Collections.synchronizedQueue()`, or
- Use `PriorityBlockingQueue` from `java.util.concurrent`

### 4. Unbounded

The queue can grow dynamically as needed — there's no fixed capacity. However, it's still constrained by available heap memory.

---

## 🧩 Concept 5: Time Complexity

| Operation | Complexity | Why |
|---|---|---|
| `add()` / `offer()` | **O(log n)** | Element must be sifted up through the heap |
| `poll()` / `remove()` | **O(log n)** | Root removed, last element sifted down |
| `peek()` | **O(1)** | Just returns the root — no rearrangement needed |
| `contains()` | **O(n)** | Must search through the heap linearly |

### 💡 Insight

`peek()` is constant time because the highest-priority element is always sitting at the root of the heap. No traversal or rearrangement needed — just return it.

---

## 🧩 Concept 6: Real-World Use Cases

### 1. Task Scheduling
When certain tasks have higher priority and should be executed first. For example, an OS scheduler might use a priority queue to decide which process runs next.

### 2. Dijkstra's Algorithm
Heavily used in graph algorithms for finding the **shortest path**. The priority queue always gives you the next closest unvisited node.

### 3. Event-Driven Simulations
Events need to be processed based on their **time of occurrence**, not when they were created. A priority queue ensures events are processed in chronological order.

### 4. Merge K Sorted Lists
A classic interview problem — use a priority queue to efficiently merge multiple sorted lists into one.

---

## ✅ Key Takeaways

1. `PriorityQueue` is a queue where elements are removed based on **priority**, not insertion order.
2. By default, it uses a **min-heap** — the smallest element has the highest priority.
3. Use `Comparator.reverseOrder()` for a max-heap (largest first), or define a custom `Comparator`.
4. Internally powered by a **binary heap** — insertion and removal are both **O(log n)**, peek is **O(1)**.
5. Does **not** allow `null` elements and is **not thread-safe**.
6. It's **unbounded** — grows dynamically as needed.

---

## ⚠️ Common Mistakes

1. **Adding `null` to a PriorityQueue** — Throws `NullPointerException`. Always validate before adding.
2. **Assuming iteration order = priority order** — Iterating over a `PriorityQueue` (e.g., with a for-each loop) does **not** give elements in priority order. Only `poll()` guarantees priority-ordered removal.
3. **Using PriorityQueue in multi-threaded code without synchronization** — It's not thread-safe. Use `PriorityBlockingQueue` instead.
4. **Expecting FIFO behavior** — It's a priority queue, not a regular queue. Elements are not removed in insertion order.

---

## 💡 Pro Tips

- In interviews, always mention that `PriorityQueue` uses a **binary heap** internally — it demonstrates deeper understanding.
- To print elements in priority order, use a loop with `poll()` — don't just print the queue directly (the internal array representation doesn't reflect sorted order).
- `PriorityQueue` is your go-to for any problem that says "find the k-th smallest/largest" — it's the most efficient approach.
- Remember: `PriorityQueue` implements `Queue`, not `Deque`. You can't access elements from both ends.
