# Memory Management of Threads

## Introduction

To truly understand multithreading problems like race conditions and visibility issues, you need to know **how threads interact with memory**. This isn't just academic theory — it directly explains why `synchronized`, `volatile`, and atomic variables exist. Let's explore the Java memory model from a thread's perspective.

---

## Concept 1: Stack Memory vs Heap Memory

### 🧠 What are they?

Java's memory is divided into two primary regions that behave very differently in multi-threaded programs:

| Memory | Scope | Shared? | Stores |
|---|---|---|---|
| **Stack** | Per thread | ❌ Each thread has its own | Local variables, method parameters, return addresses |
| **Heap** | Global | ✅ Shared across all threads | Objects, instance variables, static variables |

### ⚙️ How it works

```java
public class Example {
    private int sharedCounter = 0;  // Heap — shared by all threads

    public void doWork() {
        int localVar = 42;           // Stack — private to this thread
        sharedCounter++;             // Accessing shared heap memory — DANGER
    }
}
```

### 💡 Insight

Every thread gets its own **call stack** when `start()` is called. Local variables live on this stack and are completely invisible to other threads. But objects and their fields live on the **heap**, which is shared — this is where all concurrency problems originate.

---

## Concept 2: Each Thread Has Its Own Stack

### 🧠 What does this mean?

When you create a thread, the JVM allocates a dedicated stack (default ~512 KB–1 MB). This stack stores:

1. **Stack frames** — one per method call, containing local variables and partial results
2. **Method parameters** — arguments passed to each method
3. **Return addresses** — where to jump back after a method completes

```
Thread 1 Stack          Thread 2 Stack
┌──────────────┐       ┌──────────────┐
│ doWork()     │       │ doWork()     │
│  localVar=42 │       │  localVar=42 │
├──────────────┤       ├──────────────┤
│ run()        │       │ run()        │
├──────────────┤       ├──────────────┤
│ start()      │       │ start()      │
└──────────────┘       └──────────────┘
```

### ❓ Why does this matter?

Each thread's `localVar` is a **separate copy**. Even though both threads execute the same `doWork()` method, their local variables are completely independent. **Local variables are thread-safe by nature.**

---

## Concept 3: Shared Heap and the Visibility Problem

### 🧠 What is the visibility problem?

When Thread A modifies a shared variable on the heap, Thread B might **not see the change** right away. Why?

Modern CPUs use **caches** (L1, L2, L3) between each core and main memory. When a thread updates a variable, the change might stay in the core's local **CPU cache** and not be written back to main memory immediately.

```
Core 1 (Thread 1)          Core 2 (Thread 2)
┌──────────┐               ┌──────────┐
│ L1 Cache │               │ L1 Cache │
│ flag=true│               │ flag=false│  ← stale!
└────┬─────┘               └────┬─────┘
     │                          │
     └──────────┬───────────────┘
           ┌────┴─────┐
           │Main Memory│
           │ flag=true │
           └───────────┘
```

### 🧪 Example — The broken flag pattern

```java
private boolean running = true;

// Thread 1 — worker
public void run() {
    while (running) {   // May NEVER see the updated value
        doWork();
    }
}

// Thread 2 — controller
public void stop() {
    running = false;    // Change may stay in Thread 2's cache
}
```

Thread 1 might loop forever because it keeps reading its **cached copy** of `running` (which is still `true`).

### ⚙️ The fix: `volatile`

```java
private volatile boolean running = true;
```

The `volatile` keyword tells the JVM:
- Every **write** goes directly to main memory
- Every **read** comes directly from main memory
- No caching of this variable in CPU caches

---

## Concept 4: The Java Memory Model (JMM)

### 🧠 What is it?

The **Java Memory Model** is a specification that defines:

1. When changes made by one thread become **visible** to other threads
2. What operations can be **reordered** by the compiler/CPU for optimization
3. The **happens-before** relationship between operations

### ⚙️ Key happens-before rules

| Action | Guarantee |
|---|---|
| `synchronized` unlock | All changes made inside the block are visible to the next thread that locks the same monitor |
| `volatile` write | All changes made before the write are visible to any thread that reads the same volatile variable |
| `Thread.start()` | All changes before `start()` are visible to the new thread's `run()` |
| `Thread.join()` | All changes made by the joined thread are visible after `join()` returns |

### 💡 Pro Tip

The JMM is the reason we need `synchronized`, `volatile`, and atomic classes. Without these mechanisms, the JVM and CPU are free to **cache**, **reorder**, and **optimize** in ways that break your multi-threaded logic.

---

## Concept 5: Putting It All Together

### 🧪 What's safe and what's not?

```java
// ✅ SAFE — local variables (stack memory)
public void process() {
    int count = 0;       // Only this thread can access it
    count++;             // No synchronization needed
}

// ❌ UNSAFE — shared instance variable (heap memory)
private int counter = 0;
public void increment() {
    counter++;           // Race condition! Needs synchronization
}

// ✅ SAFE — with synchronization
private int counter = 0;
public synchronized void increment() {
    counter++;           // Only one thread at a time
}
```

---

## Summary

✅ **Key Takeaways:**

- Each thread has its own **stack** — local variables are thread-safe by default
- All threads share the **heap** — instance variables and objects need protection
- CPU caches can cause **visibility problems** — one thread's changes may be invisible to another
- The `volatile` keyword forces reads/writes directly from/to main memory
- The **Java Memory Model** defines when changes become visible across threads
- Use `synchronized`, `volatile`, or atomic classes to ensure both **atomicity** and **visibility**

⚠️ **Common Mistake:** Assuming that because a variable is on the heap, it's automatically visible to all threads. Without proper synchronization, threads can read stale cached values indefinitely.
