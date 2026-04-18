# What Are Semaphores?

## Introduction

So far, we've used locks to let **one thread at a time** access a critical section. But what if we want to allow **multiple threads** — say, up to 10 — to access a resource simultaneously? That's where **semaphores** come in.

Semaphores were invented by **Edsger Dijkstra** in 1965 (the same computer scientist behind the famous shortest path algorithm) as a formal mechanism for synchronization in concurrent programming.

---

## Concept 1: Why Do We Need Semaphores?

Before semaphores, there was no clean, formal way to manage **how many threads** could access a shared resource at the same time. Locks give us binary control — either one thread gets in, or it doesn't. Semaphores give us **counting control**.

### Real-world analogy

Think of a parking lot with 10 spaces:
- Each car entering takes one space (decrement the count)
- Each car leaving frees one space (increment the count)
- If all 10 spaces are taken, new cars must **wait**

A semaphore works exactly like this — it maintains a **counter** (called permits) that tracks how many threads can currently access a resource.

---

## Concept 2: Types of Semaphores

### 🔒 Binary Semaphore (count = 0 or 1)

- Allows only **one** thread at a time
- Acts exactly like a lock / mutex
- Value `1` → resource is available
- Value `0` → resource is taken, other threads must wait

### 🔢 Counting Semaphore (count = any non-negative integer)

- Allows **N** threads at a time
- Used when you have **multiple identical resources**
- Examples:
  - Limiting database connections to 10
  - Limiting concurrent downloads to 5
  - Limiting threads in a custom thread pool

---

## Concept 3: How Semaphores Work

### ⚙️ Two core operations

| Operation | What it does |
|---|---|
| **acquire()** | Decrement the permit count by 1. If count is 0, the thread **blocks** until a permit becomes available. |
| **release()** | Increment the permit count by 1. If any threads are waiting, one of them is unblocked. |

### Step-by-step flow (semaphore with 3 permits)

```
Initial state: permits = 3

Thread A calls acquire() → permits = 2 (Thread A enters)
Thread B calls acquire() → permits = 1 (Thread B enters)
Thread C calls acquire() → permits = 0 (Thread C enters)
Thread D calls acquire() → permits = 0 (Thread D BLOCKS — no permits left)

Thread A calls release() → permits = 1 (Thread D is unblocked and enters)
```

---

## Concept 4: Key Properties

✅ **Key Takeaways:**
- Semaphores **only keep a count** of available resources — they don't track *which* resources are available
- They are used to **limit concurrent access** — not to protect specific data
- The producer-consumer problem can be solved with semaphores (this was Dijkstra's original motivation)

⚠️ **Common Mistake:** Confusing semaphores with locks. A lock is owned by a specific thread and must be released by the same thread. A semaphore has **no ownership** — any thread can call `release()`.

💡 **Pro Tip:** When the permit count is 1, a semaphore behaves like a lock but with a subtle difference — since there's no ownership, Thread A can acquire and Thread B can release. This can be useful but also dangerous if not handled carefully.

---

## Summary

- Semaphores control access to shared resources using a **counter** (permits)
- **Binary semaphore** (0 or 1) → acts like a lock (mutual exclusion)
- **Counting semaphore** (0 to N) → allows N concurrent threads
- `acquire()` decrements the count (blocks if 0)
- `release()` increments the count (unblocks waiting threads)
- Use cases: database connection pools, rate limiting, download managers, web server request limits
- Invented by Dijkstra in 1965 to solve the producer-consumer problem
