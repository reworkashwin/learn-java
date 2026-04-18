# Dining Philosophers Problem — Chopstick Implementation

## Introduction

The `Chopstick` class is the **shared resource** in our simulation. Multiple philosophers compete for the same chopstick, so we need **synchronization** to ensure only one philosopher can hold a given chopstick at a time. The way we handle this locking determines whether our system deadlocks or runs smoothly.

---

## Concept 1: Why Each Chopstick Needs a Lock

### 🧠 The Core Problem

Consider Philosopher 0 and Philosopher 1 — they share Chopstick 0. If both try to pick up the same chopstick simultaneously, we've got a race condition. We need a lock per chopstick to ensure mutual exclusion.

```
P0 (left = C0)  ←→  C0  ←→  P4 (right = C0)
```

Chopstick 0 is P0's left chopstick **and** P4's right chopstick. Only one of them can hold it at a time.

### ⚙️ Class Structure

```java
public class Chopstick {

    private int id;
    private Lock lock;

    public Chopstick(int id) {
        this.id = id;
        this.lock = new ReentrantLock();
    }
}
```

Each chopstick gets its own `ReentrantLock` — this is the synchronization mechanism that prevents two philosophers from using the same chopstick simultaneously.

---

## Concept 2: The `pickUp()` Method — Where Deadlock Lives

### ⚙️ The Dangerous Approach: `lock()`

If we use `lock.lock()`, the thread **blocks indefinitely** until the lock becomes available:

```java
// ⚠️ DANGEROUS — can cause deadlock
public boolean pickUp(Philosopher philosopher, State state) {
    lock.lock(); // Blocks forever if lock is unavailable
    return true;
}
```

Why is this dangerous? Imagine all 5 philosophers pick up their left chopstick simultaneously. Now each one calls `lock.lock()` on their right chopstick — which is already held by their neighbor. **Everyone waits forever. Deadlock.**

### ✅ The Safe Approach: `tryLock()`

Instead, we use `tryLock()` with a timeout — the philosopher tries to get the chopstick for a limited time. If it fails, it gives up rather than waiting forever:

```java
public boolean pickUp(Philosopher philosopher, State state) 
        throws InterruptedException {

    if (lock.tryLock(10, TimeUnit.MILLISECONDS)) {
        System.out.println(philosopher + " picked up " + state + " " + this);
        return true;
    }

    return false;
}
```

### 💡 Why `tryLock()` Prevents Deadlock

With `tryLock()`:
- If the chopstick is available → acquire it and return `true`
- If the chopstick is **not** available within 10ms → return `false`
- The philosopher can then **release the left chopstick** it already holds and try again later

This breaks the **circular wait** condition because philosophers don't hold resources indefinitely while waiting for others.

---

## Concept 3: The `putDown()` Method

### ⚙️ Releasing the Chopstick

When a philosopher finishes eating, it releases the chopstick by unlocking:

```java
public void putDown(Philosopher philosopher, State state) {
    lock.unlock();
    System.out.println(philosopher + " put down " + state + " " + this);
}
```

Calling `unlock()` releases the `ReentrantLock`, making the chopstick available for other philosophers.

---

## Concept 4: The `toString()` Method

### ⚙️ For Readable Output

```java
@Override
public String toString() {
    return "Chopstick " + id;
}
```

This gives us clean console output like:
```
Philosopher 0 picked up LEFT Chopstick 0
Philosopher 0 picked up RIGHT Chopstick 1
Philosopher 0 put down RIGHT Chopstick 1
Philosopher 0 put down LEFT Chopstick 0
```

---

## Full Implementation

```java
public class Chopstick {

    private int id;
    private Lock lock;

    public Chopstick(int id) {
        this.id = id;
        this.lock = new ReentrantLock();
    }

    public boolean pickUp(Philosopher philosopher, State state) 
            throws InterruptedException {
        if (lock.tryLock(10, TimeUnit.MILLISECONDS)) {
            System.out.println(philosopher + " picked up " + state + " " + this);
            return true;
        }
        return false;
    }

    public void putDown(Philosopher philosopher, State state) {
        lock.unlock();
        System.out.println(philosopher + " put down " + state + " " + this);
    }

    @Override
    public String toString() {
        return "Chopstick " + id;
    }
}
```

---

## Summary

✅ Each chopstick has its own `ReentrantLock` — this ensures only one philosopher can hold it at a time

⚠️ Using `lock()` (blocking forever) leads to **deadlock** when all philosophers grab their left chopstick simultaneously

✅ Using `tryLock(timeout)` prevents deadlock — the philosopher gives up after a short wait and releases any held resources

✅ `putDown()` calls `unlock()` to make the chopstick available again

💡 The choice between `lock()` and `tryLock()` is the difference between a deadlocking system and a working one — this is a direct application of the deadlock avoidance techniques from earlier lectures
