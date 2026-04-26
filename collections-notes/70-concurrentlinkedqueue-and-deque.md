# 📘 ConcurrentLinkedQueue and ConcurrentLinkedDeque

---

## 📌 Introduction

### 🧠 What is this about?

We've already seen `BlockingQueue` and its implementations — queues that **block** threads when the queue is full or empty. But what if you don't want blocking at all? What if you want threads to add and remove elements **without ever waiting**?

That's where **ConcurrentLinkedQueue** and **ConcurrentLinkedDeque** come in. These are **non-blocking, lock-free** concurrent data structures that allow multiple threads to operate on a queue simultaneously — without locks, without blocking, and without threads stepping on each other.

### ❓ Why does it matter?

- **Blocking is expensive.** When a thread blocks, it sits idle, consuming resources while waiting for a condition to be met. In high-throughput systems, you want threads to do their work and move on — not wait in line.
- These collections use a clever technique called **Compare-And-Swap (CAS)** to achieve thread safety without locks, making them **highly scalable** under heavy concurrent access.
- If your use case is a simple concurrent queue where producers and consumers work independently without needing coordination, these are the go-to choices.

---

## 🧩 Concept 1: ConcurrentLinkedQueue

### 🧠 What is it?

`ConcurrentLinkedQueue` is a **thread-safe, unbounded, non-blocking queue** from `java.util.concurrent`. It follows **FIFO** (First-In, First-Out) ordering — elements are removed in the same order they were added.

Key characteristics:
- **Non-blocking** — unlike `BlockingQueue`, calling `poll()` on an empty queue returns `null` immediately instead of making the thread wait
- **Lock-free** — uses CAS (Compare-And-Swap) operations instead of traditional locks like `synchronized` or `ReentrantLock`
- **Unbounded** — no fixed capacity; it grows dynamically as elements are added
- **Linked-node structure** — internally uses a chain of linked nodes (not an array)

### ❓ Why do we need it?

Think about when you'd use a `BlockingQueue` vs. a `ConcurrentLinkedQueue`:

| Scenario | Use |
|---|---|
| Producer must wait when queue is full | `BlockingQueue` (bounded, blocking) |
| Consumer must wait when queue is empty | `BlockingQueue` (blocking take) |
| Threads just add/remove without waiting | `ConcurrentLinkedQueue` (non-blocking) |
| High-throughput, many threads accessing simultaneously | `ConcurrentLinkedQueue` (lock-free, scalable) |

If you don't need the "wait for me" coordination that `BlockingQueue` provides, `ConcurrentLinkedQueue` gives you better performance because threads never block — they either succeed or get `null` and move on.

### ⚙️ How it works

#### The Self-Checkout Analogy

Imagine a **self-checkout line at a grocery store**:
- Multiple customers can **join** and **leave** the line without waiting for a cashier to manage the queue
- There's no single person controlling who enters or exits — customers manage themselves
- If the line is empty and you try to leave, you just... don't. There's nothing to do. You don't stand there waiting for someone to appear.

That's exactly how `ConcurrentLinkedQueue` works. Threads add and remove elements independently. No thread blocks. No thread waits. If there's nothing to remove, `poll()` returns `null` immediately.

#### The CAS (Compare-And-Swap) Mechanism

Instead of locking the entire queue when a thread wants to add or remove, CAS works like this:

1. Thread reads the current value of a pointer (e.g., the tail of the queue)
2. Thread prepares its update (e.g., "I want to set the new tail to my node")
3. Thread says: "If the tail is **still** what I read in step 1, apply my update"
4. If another thread changed the tail in the meantime, the operation fails and the thread **retries**

This means no thread ever holds a lock. Multiple threads can attempt operations simultaneously, and the hardware-level CAS instruction ensures correctness without blocking.

### 🧪 Example

```java
import java.util.concurrent.ConcurrentLinkedQueue;

public class ConcurrentLinkedQueueDemo {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();

        // Add tasks to the queue
        queue.offer("Task 1");
        queue.offer("Task 2");
        queue.offer("Task 3");

        // Three threads removing elements concurrently
        new Thread(() -> System.out.println("Thread 1 removed: " + queue.poll())).start();
        new Thread(() -> System.out.println("Thread 2 removed: " + queue.poll())).start();
        new Thread(() -> System.out.println("Thread 3 removed: " + queue.poll())).start();
    }
}
```

#### What happens here?

- We add three tasks in order: Task 1 → Task 2 → Task 3
- Three threads each call `poll()`, which **retrieves AND removes** the head element
- Since the queue is FIFO, the **removal order** is guaranteed: Task 1 is removed first, then Task 2, then Task 3
- But here's the catch — the **print order is NOT guaranteed**

You might see:
```
Thread 2 removed: Task 1
Thread 1 removed: Task 2
Thread 3 removed: Task 3
```

Why? Because `poll()` removes elements in FIFO order, but **which thread gets CPU time first** is up to the OS thread scheduler. Thread 2 might execute before Thread 1, so Thread 2 prints first — even though it may have grabbed Task 1 (the first element).

> 💡 **Key insight:** FIFO ordering applies to the **data**, not to the **threads**. The queue guarantees that elements come out in order. It does NOT guarantee which thread picks up which element first.

---

## 🧩 Concept 2: ConcurrentLinkedDeque

### 🧠 What is it?

`ConcurrentLinkedDeque` is an extension of the same idea — a **thread-safe, non-blocking, lock-free double-ended queue (deque)**. While `ConcurrentLinkedQueue` only allows adding at the tail and removing from the head, `ConcurrentLinkedDeque` allows insertion and removal from **both ends**.

Key characteristics:
- Everything `ConcurrentLinkedQueue` has: non-blocking, lock-free, unbounded, linked-node based
- **Plus:** you can add/remove from both the **front** and the **back**
- Uses `offerFirst()` / `offerLast()` to add, and `pollFirst()` / `pollLast()` to remove

### ❓ Why do we need it?

Sometimes FIFO isn't enough. You might need:
- A **work-stealing** algorithm where threads steal tasks from both ends of a queue
- A scenario where **high-priority items** go to the front while normal items go to the back
- A structure that can act as **both a queue and a stack** depending on which end you operate on

`ConcurrentLinkedDeque` gives you that flexibility — all while being lock-free and thread-safe.

### ⚙️ How it works

Think of it as a **two-door hallway**:
- People can enter from the **front door** (`offerFirst()`) or the **back door** (`offerLast()`)
- People can exit from the **front door** (`pollFirst()`) or the **back door** (`pollLast()`)
- Multiple people can enter and exit simultaneously without anyone holding a key (lock)

The same CAS mechanism powers this. Each end of the deque has its own pointer, and threads use CAS to atomically update the head or tail pointers.

### 🧪 Example

```java
import java.util.concurrent.ConcurrentLinkedDeque;

public class ConcurrentLinkedDequeDemo {
    public static void main(String[] args) {
        ConcurrentLinkedDeque<String> deque = new ConcurrentLinkedDeque<>();

        // Add elements from both ends
        deque.offerFirst("Front Task 1");   // [Front Task 1]
        deque.offerLast("Back Task 1");     // [Front Task 1, Back Task 1]
        deque.offerFirst("Front Task 2");   // [Front Task 2, Front Task 1, Back Task 1]
        deque.offerLast("Back Task 2");     // [Front Task 2, Front Task 1, Back Task 1, Back Task 2]

        // Four threads removing from both ends concurrently
        new Thread(() -> System.out.println("Thread 1 removed from front: " + deque.pollFirst())).start();
        new Thread(() -> System.out.println("Thread 2 removed from back: " + deque.pollLast())).start();
        new Thread(() -> System.out.println("Thread 3 removed from front: " + deque.pollFirst())).start();
        new Thread(() -> System.out.println("Thread 4 removed from back: " + deque.pollLast())).start();
    }
}
```

#### What happens here?

After all four `offer` calls, the deque looks like this:

```
[Front Task 2] ↔ [Front Task 1] ↔ [Back Task 1] ↔ [Back Task 2]
   (head)                                              (tail)
```

- `pollFirst()` removes from the head → "Front Task 2" first, then "Front Task 1"
- `pollLast()` removes from the tail → "Back Task 2" first, then "Back Task 1"
- But again, the **thread execution order is not guaranteed** — you might see Thread 3's output before Thread 1's

---

## 🧩 Concept 3: Why Thread Execution Order Is Unpredictable

### 🧠 What is it?

This is a critical concept that trips up many developers. When you call `.start()` on multiple threads, the **JVM does NOT guarantee** the order in which those threads actually execute.

### ❓ Why does this happen?

Thread scheduling is handled by the **operating system and the JVM together**:
- The OS decides which thread gets CPU time and when
- Factors like CPU load, number of cores, and OS scheduling policies all affect this
- Even if you call `thread1.start()` before `thread3.start()`, the OS might give Thread 3 CPU time first

### ⚙️ How it works

1. `.start()` tells the JVM: "This thread is **ready** to run"
2. The JVM hands it to the OS thread scheduler
3. The scheduler decides **when** to actually run it based on available resources
4. Different runs of the same program may produce different thread execution orders

### 💡 Can you force an order?

Yes — using synchronization primitives like `Thread.join()`, locks, or barriers. **But that defeats the entire purpose** of using lock-free collections.

> ⚠️ If you enforce locks on a `ConcurrentLinkedQueue` or `ConcurrentLinkedDeque`, you're removing the very benefit that makes them useful. At that point, just use a regular `BlockingQueue` or a `synchronized` collection instead.

The whole advantage of these lock-free collections is that threads operate **independently and concurrently**. Accepting unpredictable thread ordering is part of the deal.

---

## ✅ Key Takeaways

| Feature | ConcurrentLinkedQueue | ConcurrentLinkedDeque |
|---|---|---|
| Thread-safe | ✅ | ✅ |
| Non-blocking | ✅ | ✅ |
| Lock-free (CAS) | ✅ | ✅ |
| Unbounded | ✅ | ✅ |
| FIFO ordering | ✅ | ✅ (per end) |
| Double-ended | ❌ | ✅ |
| Add methods | `offer()` | `offerFirst()`, `offerLast()` |
| Remove methods | `poll()` | `pollFirst()`, `pollLast()` |

- Use `ConcurrentLinkedQueue` when you need a simple, high-performance concurrent FIFO queue
- Use `ConcurrentLinkedDeque` when you need insertion/removal from both ends
- Both use **CAS** instead of locks — no thread ever blocks
- `poll()` returns `null` on empty (doesn't block like `take()` in `BlockingQueue`)
- Thread execution order ≠ thread start order — the OS scheduler decides

---

## ⚠️ Common Mistakes

1. **Expecting thread output in start order** — Just because you call `start()` on Thread 1 before Thread 2 doesn't mean Thread 1 runs first. Thread scheduling is non-deterministic.

2. **Confusing with BlockingQueue** — `ConcurrentLinkedQueue` does NOT block. If the queue is empty, `poll()` returns `null`. If you need blocking behavior, use `LinkedBlockingQueue` or `ArrayBlockingQueue` instead.

3. **Adding locks on top of lock-free collections** — If you wrap `ConcurrentLinkedQueue` in `synchronized` blocks or use explicit locks, you lose all the performance benefits. Use a different collection if you need locking.

4. **Not handling `null` from `poll()`** — Since `poll()` returns `null` when the queue is empty, always check the return value before using it.

---

## 💡 Pro Tips

- **Choose based on your coordination needs:** If producers and consumers need to wait for each other → `BlockingQueue`. If they work independently → `ConcurrentLinkedQueue`/`ConcurrentLinkedDeque`.

- **CAS is not free.** While lock-free sounds magical, under extreme contention (many threads fighting over the same element), CAS can lead to high retry rates. These collections shine in moderate-to-high concurrency, not extreme contention scenarios.

- **`size()` is O(n), not O(1).** Unlike `ArrayList` or `ArrayBlockingQueue`, calling `size()` on a `ConcurrentLinkedQueue` requires traversing the entire linked list. Avoid calling it in tight loops — use `isEmpty()` instead if you just need to check emptiness.

- **Perfect for task distribution.** `ConcurrentLinkedQueue` is ideal for scenarios like thread pools distributing work items — producers add tasks, worker threads pick them up, and nobody needs to wait.
