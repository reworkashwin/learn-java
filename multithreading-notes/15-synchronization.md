# Synchronization

## Introduction

When multiple threads access shared data, things can go horribly wrong. Imagine two people editing the same document at the exact same time — they'd overwrite each other's changes. This is precisely what happens in multithreaded Java when threads modify shared variables without coordination. **Synchronization** is the mechanism that prevents this chaos.

---

## Concept 1: The Problem — Data Inconsistency

### 🧠 What is it?

When two or more threads read and write a shared variable simultaneously, the final result becomes unpredictable. This is called a **race condition**.

### 🧪 Example — The broken counter

```java
private static int counter = 0;

public static void increment() {
    counter++;
}

Thread t1 = new Thread(() -> {
    for (int i = 0; i < 1000; i++) increment();
});

Thread t2 = new Thread(() -> {
    for (int i = 0; i < 1000; i++) increment();
});

t1.start();
t2.start();
t1.join();
t2.join();

System.out.println("Counter: " + counter);  // Expected: 2000, Actual: ???
```

Run this several times and you'll get different values — 1987, 1952, 1999 — but rarely 2000. Why?

---

## Concept 2: Why `counter++` Is Not Atomic

### 🧠 What is it?

The expression `counter++` looks like a single operation, but it's actually **three separate steps**:

1. **Read** the current value of `counter`
2. **Increment** the value by 1
3. **Write** the new value back to `counter`

### ⚙️ How the race condition occurs

| Step | Thread 1 | Thread 2 | counter |
|---|---|---|---|
| 1 | Reads counter = 0 | — | 0 |
| 2 | — | Reads counter = 0 | 0 |
| 3 | Increments to 1 | — | 0 |
| 4 | — | Increments to 1 | 0 |
| 5 | Writes counter = 1 | — | 1 |
| 6 | — | Writes counter = 1 | **1** |

Both threads incremented, but the counter only went from 0 to 1 instead of 0 to 2. One increment was **lost**.

### 💡 Insight

This happens because the counter variable lives in **heap memory**, and both threads access the same memory location. Without coordination, they step on each other's toes.

---

## Concept 3: The `synchronized` Keyword

### 🧠 What is it?

The `synchronized` keyword ensures that only **one thread at a time** can execute a particular method or block of code. All other threads must wait until the current thread finishes.

### ⚙️ How to use it

Simply add `synchronized` to the method:

```java
public static synchronized void increment() {
    counter++;
}
```

Now when Thread 1 enters `increment()`, it acquires the **intrinsic lock** (also called the monitor lock). Thread 2 tries to enter the same method, but the lock is taken — so it waits. Only when Thread 1 exits the method and releases the lock can Thread 2 proceed.

### 🧪 Result

```java
System.out.println("Counter: " + counter);  // Always 2000 ✓
```

---

## Concept 4: How Synchronization Works Under the Hood

### 🧠 The Intrinsic Lock

Every Java object has exactly one **intrinsic lock** (monitor). When a thread enters a `synchronized` method:

1. It **acquires** the object's intrinsic lock
2. It **executes** the method body
3. It **releases** the lock upon exiting (even if an exception is thrown)

While the lock is held, no other thread can enter any `synchronized` method on the same object.

### 💡 Real-world analogy

Think of a bathroom with a single lock. When someone enters and locks the door, everyone else has to wait in line. It doesn't matter if they need the bathroom for a different reason — there's only one lock, so only one person at a time.

---

## Key Takeaways

- ✅ **Race conditions** occur when multiple threads read/write shared data without coordination
- ✅ `counter++` is **not atomic** — it involves read, increment, and write as separate steps
- ✅ The `synchronized` keyword ensures **mutual exclusion** — only one thread accesses the critical section at a time
- ✅ Every object has a single **intrinsic lock** that synchronized methods acquire
- ⚠️ Shared variables in heap memory are vulnerable — always protect them with synchronization
- 💡 Thread safety is the process of making programs safe for multithreaded use, and synchronization is the most fundamental tool for achieving it
