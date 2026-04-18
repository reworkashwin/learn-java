# Synchronized Blocks and Custom Lock Objects

## Introduction

In the previous section, we learned that the `synchronized` keyword on a method acquires the object's intrinsic lock. But what if only a tiny portion of your method needs protection? Locking the entire method forces all threads to wait — even for code that doesn't need synchronization. **Synchronized blocks** give you fine-grained control over exactly what gets locked and which lock is used.

---

## Concept 1: The Problem with Synchronizing Entire Methods

### 🧠 What is it?

When you synchronize a method, the lock is held for the **entire duration** of that method. If the method has 50 lines but only 1 line needs protection, the other 49 lines still block other threads unnecessarily.

### ❓ Why is this bad?

- **Reduced throughput** — threads queue up waiting for a lock they don't actually need
- **Only one lock** — every synchronized method on the same object shares the same intrinsic lock, so unrelated methods block each other too

---

## Concept 2: Synchronized Blocks

### 🧠 What is it?

A synchronized block lets you lock only the specific lines of code that need protection, leaving the rest of the method freely accessible to multiple threads.

### ⚙️ Syntax

```java
public void increment() {
    // Any thread can run this part concurrently
    doSomethingElse();
    
    synchronized (this) {
        // Only one thread at a time here
        counter++;
    }
    
    // Any thread can run this part concurrently too
    doAnotherThing();
}
```

When you write `synchronized (this)`, you're locking on the **same intrinsic lock** as a synchronized method would — so the behavior is identical for the protected section. The difference is that the code **outside** the block remains concurrent.

### 💡 Insight

Think of it like a toll booth on a highway. You don't need to block the entire highway — just the toll booth. Cars flow freely before and after; they only queue up at the narrow point that requires it.

---

## Concept 3: Custom Lock Objects

### 🧠 What is it?

Instead of locking on `this` (which gives you a single lock for the entire object), you can create **separate lock objects** for different critical sections. This allows **independent synchronization** — threads working on unrelated data don't block each other.

### ⚙️ How it works

```java
private int counter1 = 0;
private int counter2 = 0;

private final Object lock1 = new Object();
private final Object lock2 = new Object();

public void incrementOne() {
    synchronized (lock1) {
        counter1++;
    }
}

public void incrementTwo() {
    synchronized (lock2) {
        counter2++;
    }
}
```

### ❓ Why is this powerful?

- Thread A can execute `incrementOne()` (locking on `lock1`)
- Thread B can execute `incrementTwo()` (locking on `lock2`) **at the same time**
- They don't block each other because they use **different locks**

If both methods used `synchronized (this)`, Thread B would have to wait for Thread A to finish — even though they're working on completely unrelated data.

---

## Concept 4: Comparison — Method vs. Block vs. Custom Lock

| Approach | Scope | Lock | Concurrency |
|---|---|---|---|
| `synchronized` method | Entire method | Object's intrinsic lock | Low — one lock for everything |
| `synchronized (this)` block | Specific lines | Object's intrinsic lock | Medium — only blocks critical section |
| `synchronized (lockObj)` block | Specific lines | Custom lock object | High — independent locks for independent data |

### 🧪 Example in practice

```java
public void execute() {
    Thread t1 = new Thread(() -> {
        for (int i = 0; i < 1000; i++) incrementOne();
    });
    
    Thread t2 = new Thread(() -> {
        for (int i = 0; i < 1000; i++) incrementTwo();
    });
    
    t1.start();
    t2.start();
    t1.join();
    t2.join();
    
    System.out.println("Counter 1: " + counter1);  // 1000
    System.out.println("Counter 2: " + counter2);  // 1000
}
```

Both counters reach exactly 1000, and the threads ran concurrently because they locked on different objects.

---

## Key Takeaways

- ✅ Use **synchronized blocks** instead of synchronized methods — lock only what needs protection
- ✅ Create **custom lock objects** (`new Object()`) to enable independent synchronization of unrelated data
- ✅ Multiple synchronized blocks with different locks can execute **concurrently**
- ⚠️ `synchronized (this)` gives you the same single intrinsic lock as a synchronized method — it doesn't improve concurrency between methods
- 💡 The less code you lock, the more throughput your application gets — fine-grained locking is almost always better
