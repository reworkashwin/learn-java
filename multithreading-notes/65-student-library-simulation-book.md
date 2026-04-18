# Student Library Simulation — Book Implementation

## Introduction

In our library simulation, each **book is a shared resource** that multiple students compete to read. Just like chopsticks in the Dining Philosophers problem, we need synchronization to ensure only one student reads a given book at a time. The `Book` class wraps a `ReentrantLock` and provides a `read()` method.

---

## Concept 1: Book as a Lock

### 🧠 Why Is Each Book a Lock?

If two students try to read the same book simultaneously, we'd have inconsistent behavior. The solution: each book contains a `ReentrantLock`. When a student starts reading, they acquire the lock. When they finish, they release it.

```java
public class Book {

    private int id;
    private Lock lock;

    public Book(int id) {
        this.id = id;
        this.lock = new ReentrantLock();
    }

    @Override
    public String toString() {
        return "Book " + id;
    }
}
```

---

## Concept 2: The `read()` Method

### ⚙️ Implementation

```java
public void read(Student student) throws InterruptedException {
    if (lock.tryLock(10, TimeUnit.MINUTES)) {
        try {
            System.out.println(student + " starts reading " + this);
            Thread.sleep(2000); // Simulate 2 seconds of reading
        } finally {
            lock.unlock();
            System.out.println(student + " has finished reading " + this);
        }
    }
}
```

### ❓ Why `tryLock()` Instead of `lock()`?

We've seen this pattern before:

- **`lock()`** — blocks the thread **indefinitely** until the lock is available. If multiple students are waiting for each other's books, we could get deadlock or starvation.
- **`tryLock(10, TimeUnit.MINUTES)`** — the student tries to acquire the book for up to 10 minutes. If the book is still unavailable after that, the method returns `false` and the student moves on to try another book.

### ⚙️ Why `ReentrantLock`?

`ReentrantLock` offers important advantages over `synchronized`:

1. **`tryLock()` with timeout** — can give up after a specified time (prevents infinite blocking)
2. **Fairness parameter** — when constructed with `new ReentrantLock(true)`, the lock favors the **longest-waiting thread**, preventing starvation
3. **Explicit lock/unlock** — gives fine-grained control over when resources are acquired and released

### 💡 The Fairness Parameter

From the Java documentation:

> A ReentrantLock is owned by the thread last successfully locking but not yet unlocking it. When the fairness parameter is set to `true`, the lock favors granting access to the longest-waiting thread.

This is how we prevent one student from monopolizing a book.

---

## Concept 3: Thread Safety of the `read()` Method

### ⚙️ The Complete Flow

When a student calls `book.read(student)`:

1. **`tryLock(10, TimeUnit.MINUTES)`** — Try to acquire the lock
2. If successful:
   - Print that the student started reading
   - `Thread.sleep(2000)` — Simulate reading for 2 seconds  
   - `lock.unlock()` — Release the book (in `finally` to guarantee release)
   - Print that the student finished reading
3. If the lock is unavailable for 10 minutes → the method simply returns without reading

### ⚠️ Critical: Always Unlock in `finally`

```java
if (lock.tryLock(10, TimeUnit.MINUTES)) {
    try {
        // ... do work ...
    } finally {
        lock.unlock(); // ALWAYS release the lock
    }
}
```

If an exception occurs during `Thread.sleep()` (like an `InterruptedException`), the `finally` block ensures the lock is still released. Without this, the book would remain locked forever — a classic resource leak.

---

## Summary

✅ Each book wraps a `ReentrantLock` — this is the synchronization mechanism

✅ `tryLock(timeout)` prevents deadlock and starvation — students don't wait forever for a book

✅ Reading is simulated with `Thread.sleep(2000)` — 2 seconds per book

⚠️ Always release locks in a `finally` block — exceptions during reading must not leave books permanently locked

💡 The `ReentrantLock` fairness parameter ensures the longest-waiting student gets the book next, preventing starvation
