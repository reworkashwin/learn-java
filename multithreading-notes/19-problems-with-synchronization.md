# Problems with Synchronization

## Introduction

We've learned that `synchronized` solves race conditions by ensuring only one thread accesses a critical section at a time. Problem solved, right? Not quite. While synchronization is essential, it introduces its own set of problems. If overused or misused, it can turn your concurrent program into something **slower than single-threaded code**. Let's explore what can go wrong.

---

## Concept 1: Performance Overhead

### 🧠 What is it?

Every time a thread enters a `synchronized` block, it must:

1. **Acquire** the intrinsic lock (monitor)
2. **Flush** CPU caches to ensure visibility
3. **Execute** the critical section
4. **Release** the lock
5. **Notify** waiting threads

This overhead is small for a single call, but compounds quickly in tight loops or high-contention scenarios.

### 🧪 Example — Over-synchronized code

```java
// ❌ Synchronizing too much
public synchronized void process(List<Integer> data) {
    // The entire method is locked — even parts that don't need it
    int sum = 0;
    for (int val : data) {
        sum += val;         // This doesn't need synchronization
    }
    this.totalSum = sum;    // Only THIS line needs protection
}

// ✅ Synchronize only the critical section
public void process(List<Integer> data) {
    int sum = 0;
    for (int val : data) {
        sum += val;           // No lock needed — local variable
    }
    synchronized (this) {
        this.totalSum = sum;  // Lock only for the shared write
    }
}
```

### 💡 Insight

The golden rule: **Synchronize the minimum amount of code necessary.** Hold locks for the shortest possible time.

---

## Concept 2: Thread Contention and Bottlenecks

### 🧠 What is it?

When many threads compete for the same lock, they form a queue. While one thread is inside the `synchronized` block, all others are **blocked** — doing nothing, wasting CPU time.

### ⚙️ The serialization effect

```
Thread 1: [===WORKING===]
Thread 2:                 [===WORKING===]
Thread 3:                                 [===WORKING===]
Thread 4:                                                 [===WORKING===]
```

If all threads need the same lock, they execute **one after another** — effectively sequential execution with the added overhead of lock management. This can be **slower** than single-threaded code.

### 🧪 Real-World Analogy

Imagine a highway with 8 lanes, but there's a single-lane bridge in the middle. All traffic must squeeze through that one lane. The more cars (threads), the worse the traffic jam (contention). The bridge is your `synchronized` block.

---

## Concept 3: Deadlocks

### 🧠 What is it?

A deadlock occurs when two or more threads are each waiting for a lock that another thread holds. Neither can proceed.

```java
// Thread 1
synchronized (lockA) {
    synchronized (lockB) { /* work */ }
}

// Thread 2
synchronized (lockB) {
    synchronized (lockA) { /* work */ }
}
```

If Thread 1 grabs `lockA` while Thread 2 grabs `lockB`, both wait forever for the other lock.

⚠️ **Common Mistake:** Nested `synchronized` blocks with inconsistent ordering are the #1 cause of deadlocks. Always acquire locks in the **same order** across all threads.

---

## Concept 4: No Fairness Guarantee

### 🧠 What is it?

When a `synchronized` block is released, the JVM doesn't guarantee which waiting thread gets the lock next. A thread could wait indefinitely while others keep getting picked — this is called **starvation**.

```java
// 10 threads competing for the same lock
synchronized (sharedLock) {
    // Thread 7 might starve — no guarantee it ever gets the lock
}
```

### ❓ Why is `synchronized` unfair?

The intrinsic lock mechanism uses an internal queue, but the JVM is free to pick **any** waiting thread (not necessarily the one that's been waiting longest). This is non-deterministic and cannot be controlled.

### ⚙️ The fix: ReentrantLock with fairness

```java
Lock lock = new ReentrantLock(true);  // true = fair
```

A fair `ReentrantLock` guarantees FIFO ordering — the thread that has waited the longest gets the lock first.

---

## Concept 5: The `wait()`/`notify()` Shortcomings

### 🧠 What are the problems?

The `synchronized` approach uses `wait()` and `notify()`/`notifyAll()` for inter-thread communication. These have several issues:

1. **`notify()` wakes a random thread** — you can't choose which thread to wake
2. **`notifyAll()` wakes ALL threads** — but only one can proceed (wasted wake-ups)
3. **Spurious wakeups** — a thread can wake up without being notified (JVM specification allows this)
4. **Must be inside a `synchronized` block** — can't use them with `Lock`

```java
// ❌ Which thread gets notified? Nobody knows
synchronized (lock) {
    lock.notify();  // Picks one random waiting thread
}

// ✅ With ReentrantLock + Condition — precise control
Condition condition = lock.newCondition();
condition.signal();  // Can have multiple Conditions for different purposes
```

---

## Summary

✅ **Key Takeaways:**

- Synchronization adds **performance overhead** — acquire/release lock, cache flushing
- High contention turns parallel execution into **serial execution** (plus overhead)
- Nested locks with inconsistent ordering cause **deadlocks**
- `synchronized` provides **no fairness** — threads can starve
- `wait()`/`notify()` is imprecise — can't target specific threads, allows spurious wakeups
- Modern alternative: `ReentrantLock` with `Condition` objects provides fairness, flexibility, and precision

💡 **Pro Tip:** These limitations are why Java introduced `java.util.concurrent` — the `Lock` interface, `ReentrantLock`, `Semaphore`, atomic variables, and concurrent collections all address the shortcomings of basic `synchronized` blocks.
