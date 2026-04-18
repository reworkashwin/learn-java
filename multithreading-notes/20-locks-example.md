# Locks — ReentrantLock Example

## Introduction

We've seen that `synchronized` blocks and `wait()`/`notify()` get the job done, but with significant drawbacks — no fairness, non-deterministic thread selection, and limited flexibility. Java's `Lock` interface and its primary implementation `ReentrantLock` solve these problems. Let's see how they work with a concrete example.

---

## Concept 1: The Lock Interface and ReentrantLock

### 🧠 What is it?

The `Lock` interface (from `java.util.concurrent.locks`) provides a more flexible alternative to `synchronized`. `ReentrantLock` is its most common implementation.

### ❓ Why use it over `synchronized`?

- **Fairness** — you can guarantee that the longest-waiting thread gets the lock
- **Flexibility** — you can lock and unlock in different parts of the code
- **Multiple conditions** — supports `Condition` objects for more precise thread coordination
- **Try-lock** — attempt to acquire a lock without blocking forever

### ⚙️ Creating a ReentrantLock

```java
// Non-fair lock (default) — faster, but no ordering guarantee
Lock lock = new ReentrantLock();

// Fair lock — threads acquire lock in FIFO order
Lock lock = new ReentrantLock(true);
```

The `true` parameter enables **fairness**, meaning threads get the lock in the order they requested it. No more random selection.

---

## Concept 2: Basic Lock/Unlock Pattern

### 🧪 Example — Protecting a shared counter

```java
private static int counter = 0;
private static Lock lock = new ReentrantLock(true);

public static void increment() {
    lock.lock();
    try {
        counter++;
    } finally {
        lock.unlock();
    }
}
```

### ⚙️ How it works

1. `lock.lock()` — the thread acquires the lock. If another thread holds it, the current thread waits.
2. The critical operation executes inside the `try` block
3. `lock.unlock()` — the thread releases the lock, always executed in `finally`

### 🧪 Using it with threads

```java
Thread t1 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) increment();
});

Thread t2 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) increment();
});

t1.start();
t2.start();
t1.join();
t2.join();

System.out.println("Counter: " + counter);  // Always 20000 ✓
```

---

## Concept 3: Why Use `try-finally` with Locks

### 🧠 What is it?

Unlike `synchronized` (which automatically releases the lock when the block exits), `ReentrantLock` requires **manual unlock**. If an exception occurs between `lock()` and `unlock()`, the lock would never be released — causing a **deadlock**.

### ⚙️ The safe pattern

```java
lock.lock();
try {
    // critical section — might throw exceptions
    performOperation();
} finally {
    lock.unlock();  // ALWAYS releases the lock, even if an exception is thrown
}
```

### ⚠️ Never do this

```java
// ❌ DANGEROUS — if increment() throws, lock is never released
lock.lock();
counter++;
lock.unlock();
```

### 💡 Insight

The `finally` block is your insurance policy. No matter what happens — normal execution, exceptions, even runtime errors — the lock gets released.

---

## Concept 4: Flexibility — Unlocking from Elsewhere

### 🧠 What is it?

With `synchronized`, the lock is automatically released when you exit the block. You can't unlock from a different method. With `ReentrantLock`, you can — the lock object tracks which thread acquired it.

```java
public static void doWork() {
    lock.lock();
    try {
        // critical work
    } finally {
        // Instead of unlocking here, we could
        // call a method that unlocks
    }
}

public static void releaseLock() {
    lock.unlock();  // unlock from a different method
}
```

### ⚠️ Caution

While this flexibility exists, it's generally **not recommended** for everyday use. It makes code harder to reason about and debug. The standard pattern of locking and unlocking in the same method is almost always preferred.

---

## Concept 5: Comparison — `synchronized` vs. `ReentrantLock`

| Feature | `synchronized` | `ReentrantLock` |
|---|---|---|
| Lock acquisition | Implicit (entering block) | Explicit (`lock.lock()`) |
| Lock release | Automatic (exiting block) | Manual (`lock.unlock()` in `finally`) |
| Fairness | No guarantee | Optional — `new ReentrantLock(true)` |
| Multiple conditions | No (`wait`/`notify` only) | Yes — `lock.newCondition()` |
| Try-lock | No | Yes — `lock.tryLock()` |
| Lock in one method, unlock in another | Not possible | Possible |
| Risk of forgetting to unlock | None | Must use `try-finally` |

---

## Key Takeaways

- ✅ `ReentrantLock` provides explicit `lock()`/`unlock()` with more control than `synchronized`
- ✅ Enable **fairness** with `new ReentrantLock(true)` — threads get the lock in FIFO order
- ✅ **Always** use `try-finally` to ensure `unlock()` is called even if exceptions occur
- ⚠️ Forgetting to call `unlock()` causes **deadlocks** — the `finally` block prevents this
- ⚠️ While you can unlock from different methods, it's generally not recommended for maintainability
- 💡 `ReentrantLock` is the preferred approach when you need fairness, multiple conditions, or try-lock semantics — use `synchronized` for simpler cases
