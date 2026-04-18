# Locks and ReentrantLocks — Introduction

## Introduction

We've been using `synchronized` for thread safety, and it works — but it has limitations. No fairness, no ability to try acquiring a lock without blocking, and no way to interrupt a waiting thread. Java's `java.util.concurrent.locks` package introduces the `Lock` interface and `ReentrantLock` to address all of these concerns. Think of it as `synchronized` on steroids.

---

## Concept 1: Why Do We Need the Lock Interface?

### 🧠 What is it?

The `Lock` interface provides a more **flexible** and **powerful** locking mechanism than the `synchronized` keyword. It's defined in `java.util.concurrent.locks`.

### ❓ What's wrong with `synchronized`?

| Problem | `synchronized` | `Lock` |
|---|---|---|
| Fairness | No guarantee — any thread may get the lock | Can enforce FIFO fairness |
| Timeout | Thread waits forever | `tryLock(timeout)` — give up after X seconds |
| Interruptibility | Can't interrupt a waiting thread | `lockInterruptibly()` — can be interrupted |
| Multiple conditions | Only one wait-set per object | Multiple `Condition` objects |
| Lock scope | Method or block only | Lock and unlock anywhere (more flexibility) |

### 💡 Insight

`synchronized` is simpler and good enough for many cases. But when you need fine-grained control over locking behavior, `Lock` is the right tool.

---

## Concept 2: The Lock Interface Methods

### ⚙️ Core methods

```java
public interface Lock {
    void lock();                        // Acquire the lock (blocks if unavailable)
    void unlock();                      // Release the lock
    boolean tryLock();                  // Try to acquire without blocking (returns immediately)
    boolean tryLock(long time, TimeUnit unit); // Try with timeout
    void lockInterruptibly();           // Acquire, but can be interrupted while waiting
    Condition newCondition();           // Create a Condition for wait/signal
}
```

### 🧪 Comparison with `synchronized`

```java
// synchronized — implicit lock/unlock
synchronized (obj) {
    // critical section
}   // lock released automatically

// Lock — explicit lock/unlock
lock.lock();
try {
    // critical section
} finally {
    lock.unlock();   // MUST unlock in finally
}
```

⚠️ **Common Mistake:** Forgetting to put `unlock()` in a `finally` block. If an exception is thrown inside the critical section and `unlock()` is not in `finally`, the lock is **never released** — causing all other threads to block forever.

---

## Concept 3: ReentrantLock — The Primary Implementation

### 🧠 What is it?

`ReentrantLock` is the most commonly used implementation of the `Lock` interface. "Reentrant" means a thread that already holds the lock **can acquire it again** without deadlocking itself.

### ❓ Why is reentrancy important?

Without reentrancy, calling a synchronized method from within another synchronized method on the same lock would cause a **self-deadlock**:

```java
ReentrantLock lock = new ReentrantLock();

public void methodA() {
    lock.lock();
    try {
        methodB();   // This calls lock.lock() again — same thread
    } finally {
        lock.unlock();
    }
}

public void methodB() {
    lock.lock();       // Without reentrancy, this would deadlock!
    try {
        // work
    } finally {
        lock.unlock();
    }
}
```

With `ReentrantLock`, the second `lock()` call simply increments a **hold count** instead of blocking. Each `unlock()` decrements it. The lock is fully released when the hold count reaches zero.

---

## Concept 4: Fairness Parameter

### ⚙️ Fair vs Non-Fair Locks

```java
// Non-fair lock (default) — faster, no ordering guarantee
Lock lock = new ReentrantLock();       // same as new ReentrantLock(false)

// Fair lock — threads are served in FIFO order
Lock lock = new ReentrantLock(true);
```

### 🧠 How fairness works

| Mode | Behavior | Performance |
|---|---|---|
| **Non-fair** | When lock is released, any competing thread may get it (even a newcomer) | Faster — less overhead |
| **Fair** | The thread that has been waiting the longest gets the lock | Slower — but prevents starvation |

### 💡 Pro Tip

Use **non-fair** locks by default (better throughput). Switch to **fair** locks only when you observe thread starvation in production.

---

## Concept 5: tryLock() — Non-Blocking Lock Acquisition

### 🧠 What is it?

Instead of blocking forever, `tryLock()` **attempts** to acquire the lock and returns immediately:

```java
if (lock.tryLock()) {
    try {
        // critical section
    } finally {
        lock.unlock();
    }
} else {
    // Lock is held by another thread — do something else
    System.out.println("Could not acquire lock — skipping");
}
```

### ⚙️ With timeout

```java
if (lock.tryLock(5, TimeUnit.SECONDS)) {
    try {
        // got the lock within 5 seconds
    } finally {
        lock.unlock();
    }
} else {
    // timed out — lock was not available
}
```

### ❓ When is this useful?

- **Deadlock avoidance** — if you can't get both locks, release the one you have and retry
- **Responsive applications** — don't hang forever waiting for a resource
- **Polling-style access** — periodically try to acquire shared resources

---

## Concept 6: Condition Objects — Better wait/notify

### 🧠 What are they?

A `Condition` is a replacement for `wait()` and `notify()` that's bound to a specific `Lock`:

```java
Lock lock = new ReentrantLock();
Condition notEmpty = lock.newCondition();
Condition notFull = lock.newCondition();
```

### ⚙️ Comparison

| `synchronized` | `Lock` + `Condition` |
|---|---|
| `wait()` | `condition.await()` |
| `notify()` | `condition.signal()` |
| `notifyAll()` | `condition.signalAll()` |

The key advantage: you can have **multiple conditions** on the same lock. In the producer-consumer pattern, you can separately signal "not empty" and "not full" instead of waking up all threads with `notifyAll()`.

---

## Summary

✅ **Key Takeaways:**

- The `Lock` interface provides more control than `synchronized` — fairness, timeout, interruptibility
- `ReentrantLock` is the primary implementation — allows the same thread to acquire the lock multiple times
- **Always** put `unlock()` in a `finally` block to prevent lock leaks
- Fair locks prevent starvation but have lower throughput than non-fair locks
- `tryLock()` enables non-blocking lock acquisition — useful for deadlock avoidance
- `Condition` objects replace `wait()`/`notify()` with more precision and multiple conditions per lock
