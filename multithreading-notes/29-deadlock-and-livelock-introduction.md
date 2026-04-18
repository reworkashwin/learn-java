# Deadlock and Livelock — Introduction

## Introduction

We've already seen a deadlock example — two threads stuck forever, each holding a lock the other needs. But deadlock has a lesser-known cousin: **livelock**. While deadlock means threads are frozen, livelock means threads are actively running but making **no progress**. Both are devastating in production. Let's understand the formal definitions, conditions, and key differences.

---

## Concept 1: Deadlock Revisited

### 🧠 What is it?

A **deadlock** occurs when two or more threads are permanently blocked, each waiting for a resource held by another thread in the cycle.

### 🧪 Real-World Analogy

Two cars meet at a narrow bridge from opposite directions. Neither can pass because the other is blocking the way. Neither will back up. Both wait forever.

### ⚙️ The Four Coffman Conditions

A deadlock can only occur if **all four** of these conditions hold simultaneously:

1. **Mutual Exclusion** — at least one resource can be held by only one thread at a time
2. **Hold and Wait** — a thread holding one resource is waiting to acquire another
3. **No Preemption** — resources cannot be forcibly taken from a thread
4. **Circular Wait** — there exists a circular chain of threads, each waiting for a resource held by the next

### 💡 Insight

To **prevent** deadlock, you only need to break **one** of these four conditions. The most practical approach is to eliminate **Circular Wait** by always acquiring locks in a consistent, predefined order.

---

## Concept 2: Deadlock Prevention Strategies

### ⚙️ Strategy 1: Lock Ordering

Always acquire locks in the **same order** across all threads:

```java
// ✅ Both threads acquire lock1 first, then lock2
public void worker1() {
    lock1.lock();
    lock2.lock();
    // work
    lock2.unlock();
    lock1.unlock();
}

public void worker2() {
    lock1.lock();    // Same order — no circular wait possible
    lock2.lock();
    // work
    lock2.unlock();
    lock1.unlock();
}
```

### ⚙️ Strategy 2: tryLock with Timeout

```java
public void safeWorker() {
    while (true) {
        if (lock1.tryLock()) {
            try {
                if (lock2.tryLock()) {
                    try {
                        // Got both locks — do work
                        return;
                    } finally {
                        lock2.unlock();
                    }
                }
            } finally {
                lock1.unlock();  // Release lock1 if lock2 unavailable
            }
        }
        // Retry after a short sleep
        Thread.sleep(100);
    }
}
```

---

## Concept 3: What is Livelock?

### 🧠 What is it?

A **livelock** occurs when threads are **not blocked** — they're actively running and responding to each other — but they make **no actual progress**. It's like deadlock but with movement.

### 🧪 Real-World Analogy

Two people walking toward each other in a narrow hallway. They both step to the left to let the other pass. Then both step to the right. Then both step to the left again. They're not stuck — they're moving — but they **never get past each other**.

### ❓ How is it different from deadlock?

| Property | Deadlock | Livelock |
|---|---|---|
| Thread state | **Blocked** (WAITING/TIMED_WAITING) | **Running** (RUNNABLE) |
| CPU usage | 0% — threads are sleeping | High — threads are using CPU |
| Progress | None — threads are frozen | None — threads are spinning |
| Detection | Easier (JVM can detect blocked threads) | Harder (threads appear active) |

### ⚙️ How livelock happens in code

```java
public void politeWorker(Lock lock1, Lock lock2) {
    while (true) {
        lock1.lock();
        if (!lock2.tryLock()) {
            lock1.unlock();     // "I'll back off, you go first"
            continue;           // The other thread does the same thing
        }
        // Do work
        break;
    }
}
```

If both threads run this simultaneously, they keep acquiring and releasing `lock1` in sync, never managing to get both locks.

---

## Concept 4: Livelock Prevention

### ⚙️ Add randomness to break the symmetry

```java
public void smartWorker(Lock lock1, Lock lock2) {
    Random random = new Random();
    while (true) {
        lock1.lock();
        if (!lock2.tryLock()) {
            lock1.unlock();
            // Random backoff — breaks the symmetry
            Thread.sleep(random.nextInt(100));
            continue;
        }
        // Do work
        break;
    }
}
```

By introducing **random delays**, the threads get out of sync and one eventually succeeds.

### 💡 Pro Tip

This random backoff strategy is used in real-world systems. Ethernet networks use **exponential backoff** when multiple devices try to transmit simultaneously — it's the same principle applied to network packets instead of threads.

---

## Concept 5: Starvation — The Third Concurrency Problem

### 🧠 What is it?

**Starvation** occurs when a thread is ready to run but **never gets CPU time** because other threads keep taking priority.

### ❓ When does it happen?

- **Unfair locks** — low-priority threads keep losing to high-priority ones
- **Thread priority abuse** — setting one thread to `MAX_PRIORITY` while others are at `MIN_PRIORITY`
- **Long-held locks** — a thread holds a lock for extended periods, starving others

### 🧪 All three compared

```
Deadlock:    Thread A waits for B, B waits for A → Both frozen
Livelock:    Thread A yields to B, B yields to A → Both running, no progress
Starvation:  Thread A always gets the lock, Thread B never does → B waits indefinitely
```

---

## Summary

✅ **Key Takeaways:**

- **Deadlock** = threads blocked forever in a circular wait — CPU idle
- **Livelock** = threads running but making no progress — CPU busy
- **Starvation** = a thread never gets its turn — system is unfair
- Deadlock requires all four Coffman conditions — break any one to prevent it
- Lock ordering is the simplest deadlock prevention strategy
- Livelock is solved by adding **random backoff** to break symmetry
- Starvation is solved by using **fair locks** (`new ReentrantLock(true)`)
