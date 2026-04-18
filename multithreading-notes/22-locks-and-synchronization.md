# Locks vs Synchronized — Key Differences

## Introduction

We've now seen both `synchronized` and `ReentrantLock` in action. They solve the same core problem — controlling access to shared resources — but `ReentrantLock` comes with several additional capabilities. Let's compare them side by side.

---

## Concept 1: Feature Comparison

| Feature | `synchronized` | `ReentrantLock` |
|---|---|---|
| **Try-lock (non-blocking)** | ❌ Not possible | ✅ `tryLock()` — attempt without blocking |
| **Timeout** | ❌ Not possible | ✅ `tryLock(timeout, unit)` — wait with a time limit |
| **Interruptible lock** | ❌ Thread blocks until lock is acquired | ✅ `lockInterruptibly()` — thread can be interrupted while waiting |
| **Fairness** | ❌ No guarantee | ✅ `new ReentrantLock(true)` — FIFO order |
| **Multiple conditions** | ❌ One wait-set per object | ✅ Multiple `Condition` objects on one lock |
| **Lock management** | Automatic (JVM manages) | Manual (`lock()` / `unlock()`) |

---

## Concept 2: Walking Through Each Advantage

### 🔓 tryLock() — Non-blocking Acquisition

With `synchronized`, if a thread can't get the lock, it **blocks** indefinitely. With `ReentrantLock`, you can *try* to acquire the lock and do something else if it's not available:

```java
if (lock.tryLock()) {
    try {
        // critical section
    } finally {
        lock.unlock();
    }
} else {
    // do something else — lock was not available
}
```

### ⏱️ Timeout

You can wait for a lock for a specific duration:

```java
if (lock.tryLock(2, TimeUnit.SECONDS)) {
    // acquired within 2 seconds
} else {
    // gave up after 2 seconds
}
```

### 🔔 Interruptible Waiting

With `lockInterruptibly()`, a thread waiting for a lock can be interrupted by another thread — useful for avoiding situations where a thread waits forever.

### ⚖️ Fairness

```java
Lock lock = new ReentrantLock(true);  // fair lock
```

A fair lock grants access in the **order requests were made** (FIFO). This prevents **thread starvation**, where one thread keeps getting the lock while others wait indefinitely.

### 📋 Multiple Conditions

```java
Condition notFull = lock.newCondition();
Condition notEmpty = lock.newCondition();
```

With `synchronized`, there's only **one** wait-set per object. With locks, you can have separate conditions for different waiting scenarios — much cleaner for producer-consumer patterns with bounded buffers.

---

## Concept 3: When to Use What?

### Use `synchronized` when:
- You need simple mutual exclusion
- You don't need fairness, timeouts, or interruptibility
- You prefer less code (no manual lock/unlock management)

### Use `ReentrantLock` when:
- You need `tryLock()` or timeout-based locking
- You need fairness guarantees
- You need multiple conditions on the same lock
- You want to avoid deadlocks and livelocks more easily

💡 **Pro Tip:** ReentrantLock makes it **easier to avoid deadlocks** because of `tryLock()` and timeouts. If a thread can't get a lock within a timeout, it can back off and retry — a strategy impossible with `synchronized`.

---

## Summary

- `ReentrantLock` can do **everything** `synchronized` can, plus more
- Key extras: `tryLock()`, timeouts, `lockInterruptibly()`, fairness, and multiple conditions
- `synchronized` is simpler — the JVM handles locking/unlocking automatically
- For complex concurrency scenarios, prefer `ReentrantLock`
- The ability to avoid deadlocks and livelocks is a major practical advantage of `ReentrantLock`
