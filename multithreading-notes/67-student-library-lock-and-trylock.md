# Student Library Simulation V — lock() and tryLock()

## Introduction

This is where the library simulation gets interesting. The difference between `lock()` and `tryLock()` is the difference between a student who **waits forever** for a book and one who **gives up and tries a different book** after a timeout. Understanding when to use each is critical for building deadlock-free concurrent applications.

---

## Concept 1: The Two Approaches

### 🧠 What's the difference?

| Method | Behavior | Risk |
|--------|----------|------|
| `lock()` | Blocks **indefinitely** until the lock is available | Deadlock, starvation |
| `tryLock()` | Tries to acquire the lock, returns immediately if unavailable | None — graceful fallback |
| `tryLock(time, unit)` | Tries to acquire the lock, waits up to the specified time | Minimal — bounded wait |

### 💡 Real-World Analogy

- **`lock()`** = Standing in line at a library counter and refusing to leave until you get the book, no matter how long it takes. If two people do this for each other's books, neither will ever move — **deadlock**.
- **`tryLock()`** = Checking if the book is available. If not, immediately walking to a different shelf.
- **`tryLock(10, MINUTES)`** = Waiting up to 10 minutes for the book. If it's still unavailable, giving up and trying something else.

---

## Concept 2: Using lock() — The Dangerous Approach

### ⚙️ How it works

```java
public void read(Student student) {
    lock.lock();
    try {
        System.out.println(student + " starts reading " + this);
        Thread.sleep(Constants.READING_TIME);
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        lock.unlock();
        System.out.println(student + " has finished reading " + this);
    }
}
```

### ⚠️ Why this is dangerous

With `lock()`, the thread **blocks indefinitely**. In the library simulation, this might seem fine — eventually the other student will finish reading. But consider this scenario:

```
Student A holds Book 1, wants Book 2
Student B holds Book 2, wants Book 1

Student A: lock.lock() on Book 2 → blocked (Student B has it)
Student B: lock.lock() on Book 1 → blocked (Student A has it)

Neither can proceed → DEADLOCK
```

While our simple simulation might not trigger this exact scenario (because students pick books randomly), **any system using `lock()` on multiple resources is vulnerable to deadlock**.

---

## Concept 3: Using tryLock() — The Safe Approach

### ⚙️ Without timeout

```java
public void read(Student student) {
    if (lock.tryLock()) {
        try {
            System.out.println(student + " starts reading " + this);
            Thread.sleep(Constants.READING_TIME);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
            System.out.println(student + " has finished reading " + this);
        }
    } else {
        System.out.println(student + " couldn't get " + this + ", trying another book...");
    }
}
```

### ⚙️ With timeout

```java
public void read(Student student) throws InterruptedException {
    if (lock.tryLock(10, TimeUnit.MINUTES)) {
        try {
            System.out.println(student + " starts reading " + this);
            Thread.sleep(Constants.READING_TIME);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
            System.out.println(student + " has finished reading " + this);
        }
    } else {
        System.out.println(student + " gave up waiting for " + this);
    }
}
```

### 🧠 Why tryLock() prevents deadlock

Going back to the deadlock scenario:

```
Student A holds Book 1, wants Book 2
Student B holds Book 2, wants Book 1

Student A: tryLock() on Book 2 → returns false (Student B has it)
Student A: releases Book 1, picks a different book → NO DEADLOCK

Student B: continues reading Book 2
```

Because `tryLock()` doesn't block, neither thread gets stuck waiting forever. The system stays responsive.

---

## Concept 4: Integrating tryLock() in the Student's Run Loop

### ⚙️ The Student's behavior

In the `Student.run()` method, the student picks random books in a loop:

```java
@Override
public void run() {
    while (true) {
        int bookIndex = random.nextInt(books.length);
        try {
            books[bookIndex].read(this);
            Thread.sleep(500); // Brief pause before picking next book
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            break;
        }
    }
}
```

When `read()` uses `tryLock()`, the flow becomes:

1. Student picks a random book
2. Calls `book.read(this)`
3. Inside `read()`, `tryLock()` either succeeds (student reads) or fails (student moves on)
4. Student picks another random book
5. Repeat

### 💡 No deadlock possible

Since students never block indefinitely on a book, the system is **deadlock-free by design**. Students that can't get a book immediately try another one — mimicking real behavior in a library.

---

## Concept 5: lock() vs tryLock() — When to Use Each

### ⚙️ Decision Guide

| Scenario | Use | Why |
|----------|-----|-----|
| Single lock, no circular dependency possible | `lock()` | Simple and safe when deadlock is impossible |
| Multiple locks acquired in sequence | `tryLock()` | Prevents deadlock from circular waits |
| Time-critical operations | `tryLock(timeout)` | Ensures bounded wait time |
| Background tasks that can retry later | `tryLock()` | Fail fast, retry next cycle |
| Must guarantee the operation completes | `lock()` | When giving up is not an option |

### ⚠️ Common Mistake: Using lock() with multiple resources

```java
// DANGEROUS — potential deadlock
lockA.lock();
lockB.lock();
try {
    // ... critical section ...
} finally {
    lockB.unlock();
    lockA.unlock();
}
```

```java
// SAFE — deadlock-free
if (lockA.tryLock()) {
    try {
        if (lockB.tryLock()) {
            try {
                // ... critical section ...
            } finally {
                lockB.unlock();
            }
        }
    } finally {
        lockA.unlock();
    }
}
```

The second approach releases `lockA` if `lockB` can't be acquired — no circular wait.

---

## ✅ Key Takeaways

- `lock()` blocks forever — use only when deadlock is structurally impossible
- `tryLock()` returns immediately with `true` or `false` — deadlock-free
- `tryLock(timeout, unit)` provides a bounded wait — good compromise between patience and safety
- In the library simulation, `tryLock()` lets students gracefully move on when a book is unavailable
- Always release locks in a `finally` block — regardless of whether you use `lock()` or `tryLock()`
- When acquiring **multiple locks**, prefer `tryLock()` to prevent circular dependencies
