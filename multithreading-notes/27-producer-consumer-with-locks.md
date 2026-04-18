# Producer-Consumer Pattern with Locks

## Introduction

We've already seen the producer-consumer pattern using `wait()` and `notify()`. But now that we know about **ReentrantLocks**, can we implement the same pattern with them?

Yes — and it actually gives us more flexibility. In this section, we'll implement the producer-consumer pattern using `Lock` and `Condition` objects from the `java.util.concurrent.locks` package.

---

## Concept 1: Why Locks Need Conditions

### 🧠 What's the problem?

When we use a `Lock`, we **cannot** call `wait()` and `notify()` on it — those methods belong to the intrinsic monitor of `Object`, not to the `Lock` interface.

So how do we make one thread wait and another thread signal it?

### ⚙️ The Solution: Condition Objects

A `Lock` can create a **Condition** object that is bound to it. This `Condition` replaces the role of `wait()` and `notify()`:

| Intrinsic Lock (`synchronized`) | ReentrantLock + Condition |
|---|---|
| `wait()` | `condition.await()` |
| `notify()` | `condition.signal()` |
| `notifyAll()` | `condition.signalAll()` |

```java
Lock lock = new ReentrantLock();
Condition condition = lock.newCondition();
```

The `newCondition()` method returns a **Condition instance bound to that lock**. You can even create multiple conditions on a single lock — something impossible with `synchronized`.

✅ **Key Takeaway:** `Condition` is the lock-based equivalent of `wait()`/`notify()`, but more powerful because you can have multiple independent conditions per lock.

---

## Concept 2: Implementing the Pattern

### ⚙️ Step-by-step

Here's the complete implementation:

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.Condition;

class Worker {
    private Lock lock = new ReentrantLock();
    private Condition condition = lock.newCondition();

    public void produce() throws InterruptedException {
        lock.lock();
        System.out.println("Producer method...");
        condition.await();  // hand execution to consumer
        System.out.println("Producer method resumed!");
        lock.unlock();
    }

    public void consume() throws InterruptedException {
        Thread.sleep(2000);  // ensure producer starts first
        lock.lock();
        System.out.println("Consumer method...");
        Thread.sleep(3000);  // simulate work
        condition.signal();  // wake up the producer
        lock.unlock();
    }
}
```

### 🔄 What happens at runtime?

1. **Producer** acquires the lock and prints "Producer method..."
2. **Producer** calls `condition.await()` → releases the lock and goes to sleep
3. **Consumer** wakes up (after 2-second sleep), acquires the now-available lock
4. **Consumer** prints "Consumer method...", sleeps 3 seconds, then calls `condition.signal()`
5. **Signal** wakes up the producer thread
6. **Producer** resumes and prints "Producer method resumed!"

### 🧪 Running it

```java
public static void main(String[] args) {
    Worker worker = new Worker();

    Thread t1 = new Thread(() -> {
        try { worker.produce(); } catch (InterruptedException e) { e.printStackTrace(); }
    });

    Thread t2 = new Thread(() -> {
        try { worker.consume(); } catch (InterruptedException e) { e.printStackTrace(); }
    });

    t1.start();
    t2.start();
}
```

**Output:**
```
Producer method...
Consumer method...
Producer method resumed!
```

---

## Concept 3: await() vs wait(), signal() vs notify()

| Feature | `await()` / `signal()` | `wait()` / `notify()` |
|---|---|---|
| Belongs to | `Condition` object | `Object` class |
| Used with | `ReentrantLock` | `synchronized` block |
| Multiple conditions? | ✅ Yes — create multiple `Condition` objects | ❌ No — one wait-set per object |
| Interruptible wait? | ✅ Yes — `await()` responds to interrupts | ⚠️ `wait()` also responds, but less control |

### 💡 Insight

The `await()` method does two things atomically:
1. **Releases** the lock (so the other thread can acquire it)
2. **Suspends** the current thread until `signal()` is called

The `signal()` method wakes up the waiting thread, but the awakened thread still needs to **re-acquire the lock** before it can proceed.

⚠️ **Common Mistake:** Forgetting to call `lock.unlock()` after you're done. Always unlock in a `finally` block in production code to avoid deadlocks if an exception occurs.

```java
lock.lock();
try {
    // critical section
    condition.await();
} finally {
    lock.unlock();
}
```

---

## Summary

- `Lock` objects cannot use `wait()`/`notify()` — they use `Condition` objects instead
- `condition.await()` = release lock + sleep (like `wait()`)
- `condition.signal()` = wake up one waiting thread (like `notify()`)
- You can create **multiple conditions** on a single lock — a major advantage over `synchronized`
- Always call `unlock()` after `lock()`, preferably in a `finally` block
