# Atomic Variables

## Introduction

We've seen that `volatile` ensures visibility, and `synchronized` ensures atomicity. But `synchronized` blocks can be heavy — they involve locking, context switching, and potential contention. Is there a middle ground?

Yes — **atomic variables**. They live in the `java.util.concurrent.atomic` package and provide **lock-free, thread-safe** operations on single variables.

---

## Concept 1: The Problem with Simple Increment

### 🧠 Why is `counter++` not thread-safe?

```java
private int counter = 0;

public void increment() {
    counter++;  // NOT atomic!
}
```

`counter++` looks like one operation, but it's actually **three**:
1. **Read** the current value
2. **Add** 1 to it
3. **Write** the new value back

If two threads execute this simultaneously, they can both read the same value, both increment it, and both write the same result — losing one increment entirely.

### 🧪 Demonstrating the problem

```java
Thread t1 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) increment();
});
Thread t2 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) increment();
});

t1.start(); t2.start();
t1.join(); t2.join();

System.out.println(counter);  // Expected: 20000, Actual: some number < 20000
```

---

## Concept 2: The synchronized Fix

One solution is to make the method `synchronized`:

```java
public synchronized void increment() {
    counter++;
}
```

This works, but it comes with locking overhead — every thread must acquire and release the lock.

---

## Concept 3: The AtomicInteger Solution

A better solution is `AtomicInteger`:

```java
import java.util.concurrent.atomic.AtomicInteger;

private AtomicInteger counter = new AtomicInteger(0);

public void increment() {
    counter.incrementAndGet();
}
```

### ⚙️ How it works

Atomic classes use **low-level CPU instructions** (like Compare-And-Swap / CAS) to perform operations atomically **without locking**. The CPU itself guarantees that the read-modify-write happens as a single, indivisible operation.

No `synchronized` needed. No lock contention. No context switching.

### 🧪 Example

```java
AtomicInteger counter = new AtomicInteger(0);

Thread t1 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) counter.incrementAndGet();
});
Thread t2 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) counter.incrementAndGet();
});

t1.start(); t2.start();
t1.join(); t2.join();

System.out.println(counter);  // Always 20000
```

---

## Concept 4: Available Atomic Methods

`AtomicInteger` provides many useful methods:

| Method | Description |
|---|---|
| `get()` | Read the current value |
| `set(value)` | Set to a new value |
| `incrementAndGet()` | Increment by 1 and return new value |
| `getAndIncrement()` | Return current value, then increment |
| `decrementAndGet()` | Decrement by 1 and return new value |
| `addAndGet(delta)` | Add delta and return new value |
| `compareAndSet(expect, update)` | Set to update only if current value equals expect |

---

## Concept 5: Other Atomic Classes

The `java.util.concurrent.atomic` package includes:

- `AtomicInteger` — atomic int operations
- `AtomicLong` — atomic long operations
- `AtomicBoolean` — atomic boolean operations
- `AtomicIntegerArray` — atomic operations on an int array
- `AtomicReference<V>` — atomic operations on object references

💡 **Pro Tip:** Atomic variables work like reads and writes on `volatile` variables, but they also support atomic compound operations. Think of them as "`volatile` + atomicity" without the overhead of `synchronized`.

⚠️ **Common Mistake:** Using `volatile int` and thinking `counter++` is safe. `volatile` only ensures visibility — it does **not** make compound operations atomic. Use `AtomicInteger` instead.

---

## Summary

- `counter++` is **not** atomic — it's three separate operations (read, modify, write)
- `synchronized` fixes this but introduces locking overhead
- `AtomicInteger` uses **lock-free CAS operations** — no blocking, no contention
- The `java.util.concurrent.atomic` package provides atomic classes for int, long, boolean, arrays, and references
- Prefer atomic variables over `synchronized` for simple operations on single variables
