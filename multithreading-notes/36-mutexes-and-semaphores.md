# Mutexes and Semaphores

## Introduction

We've encountered both `synchronized`/`ReentrantLock` (which allow one thread at a time) and `Semaphore` (which can allow multiple threads). But what's the **formal relationship** between these concepts? In computer science, they're known as **mutexes** and **semaphores** — two fundamental synchronization primitives. Let's clarify the theory and see how Java implements both.

---

## Concept 1: What is a Mutex?

### 🧠 Definition

A **mutex** (MUTual EXclusion) is a synchronization object that allows only **one thread** to access a critical section at a time. It has two states: **locked** and **unlocked**.

### 🧪 Real-World Analogy

A bathroom with a lock:
- Person enters → locks the door (acquire)
- Person leaves → unlocks the door (release)
- Only the person who locked it can unlock it (**ownership**)
- If someone else tries to enter, they wait outside

### ⚙️ Key Properties

| Property | Mutex |
|---|---|
| Max concurrent threads | **1** |
| Ownership | **Yes** — only the thread that locked it can unlock it |
| Use case | Protecting critical sections (shared data) |
| Java equivalents | `synchronized`, `ReentrantLock` |

### 🧪 Java implementation with ReentrantLock

```java
// ReentrantLock acts as a mutex
Lock mutex = new ReentrantLock();

public void criticalSection() {
    mutex.lock();       // Acquire the mutex
    try {
        // Only ONE thread can be here at a time
        sharedData++;
    } finally {
        mutex.unlock();  // Release — must be the same thread
    }
}
```

---

## Concept 2: What is a Semaphore?

### 🧠 Definition

A **semaphore** is a synchronization object that maintains a **counter** (called permits). It allows up to **N threads** to access a resource concurrently.

### 🧪 Real-World Analogy

A parking lot with 10 spaces:
- Car enters → takes a space (acquire permit, count decreases)
- Car leaves → frees a space (release permit, count increases)
- **Any** car can take or free a space (no ownership)
- If all 10 spaces are taken, cars wait in line

### ⚙️ Key Properties

| Property | Semaphore |
|---|---|
| Max concurrent threads | **N** (configurable) |
| Ownership | **No** — any thread can release |
| Use case | Limiting concurrent access to a resource pool |
| Java class | `java.util.concurrent.Semaphore` |

### 🧪 Java implementation

```java
// Allow up to 3 threads to access simultaneously
Semaphore semaphore = new Semaphore(3);

public void accessResource() {
    try {
        semaphore.acquire();   // Decrement permit count (blocks if 0)
        
        // Up to 3 threads can be here concurrently
        useSharedResource();
        
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    } finally {
        semaphore.release();   // Increment permit count
    }
}
```

---

## Concept 3: Mutex vs Semaphore — Key Differences

### ⚙️ Side-by-side comparison

| Feature | Mutex | Semaphore |
|---|---|---|
| Permits | 1 (always) | N (configurable) |
| Ownership | ✅ Thread that locks must unlock | ❌ Any thread can release |
| Purpose | Mutual exclusion (protecting data) | Resource counting (limiting access) |
| Reentrant | Yes (ReentrantLock can be re-acquired) | No (acquiring twice consumes two permits) |
| Binary? | Always binary | Can be binary (N=1) or counting (N>1) |

### ⚠️ Common Confusion: Binary Semaphore ≠ Mutex

A semaphore with `permits = 1` **looks like** a mutex but isn't quite the same:

```java
// Semaphore with 1 permit — NOT the same as a mutex
Semaphore binarySem = new Semaphore(1);

// Thread A acquires
binarySem.acquire();

// Thread B can release — this is ALLOWED (no ownership)
binarySem.release();   // ⚠️ A mutex would NOT allow this
```

With a mutex (`ReentrantLock`), only the thread that called `lock()` can call `unlock()`. A semaphore has **no such restriction**, which can lead to bugs if misused.

---

## Concept 4: When to Use Each

### ⚙️ Decision guide

| Scenario | Use |
|---|---|
| Protect a shared counter or variable | **Mutex** (synchronized / ReentrantLock) |
| Limit database connections to 10 | **Semaphore(10)** |
| Ensure only one thread writes to a file | **Mutex** |
| Rate-limit API requests to 5 concurrent | **Semaphore(5)** |
| Implement a producer-consumer queue | **Semaphore** (count tracks available items) |
| Guard a single shared resource | **Mutex** |

### 🧪 Semaphore example — Connection pool

```java
public class ConnectionPool {
    private Semaphore semaphore;
    private Queue<Connection> pool;

    public ConnectionPool(int maxConnections) {
        this.semaphore = new Semaphore(maxConnections);
        this.pool = new LinkedList<>();
        for (int i = 0; i < maxConnections; i++) {
            pool.add(createConnection());
        }
    }

    public Connection getConnection() throws InterruptedException {
        semaphore.acquire();   // Wait if no connections available
        synchronized (pool) {
            return pool.poll();
        }
    }

    public void releaseConnection(Connection conn) {
        synchronized (pool) {
            pool.offer(conn);
        }
        semaphore.release();   // Signal that a connection is available
    }
}
```

---

## Concept 5: Historical Context

### 💡 The Origins

Both primitives were formalized by **Edsger Dijkstra** in 1965. The original semaphore operations were called:

- **P** (from Dutch *proberen* = "to try") → `acquire()`
- **V** (from Dutch *verhogen* = "to increment") → `release()`

Mutexes emerged as a specialization of semaphores — a semaphore with exactly 1 permit and ownership semantics. They became so important that modern languages provide them as first-class constructs (`synchronized` in Java, `lock` in C#, `Mutex` in Python/Go).

---

## Summary

✅ **Key Takeaways:**

- A **mutex** allows only 1 thread at a time and has ownership (the locker must be the unlocker)
- A **semaphore** allows N threads at a time with no ownership
- Java's `synchronized` and `ReentrantLock` act as mutexes
- Java's `Semaphore` class implements counting semaphores
- A binary semaphore (count=1) is **similar** to a mutex but lacks ownership
- Use mutexes for protecting shared data, semaphores for limiting concurrent access to resources
