# The Volatile Keyword

## Introduction

We know that threads have their own **stack memory**, and each thread may be executed by a different CPU core. But here's the problem — CPUs have **cache memory**. If a CPU caches a variable, changes made by one thread might not be visible to another. The `volatile` keyword is Java's lightweight solution to this visibility problem.

---

## Concept 1: The Visibility Problem

### 🧠 What's happening under the hood?

Each CPU core has its own **cache**. When a thread reads a variable, the CPU may store a local copy in its cache for faster access. If another thread updates that variable in main memory, the first thread might still read the **stale cached value**.

```
Thread A (CPU 1)          Main Memory          Thread B (CPU 2)
  cache: flag = false  ←→  flag = true   ←→  cache: flag = true
  (stale!)                  (updated)
```

Thread A doesn't see Thread B's update because it's reading from its own cache.

### ❓ Why does this matter?

Imagine you have a boolean flag that controls whether a thread should stop:

```java
class Worker implements Runnable {
    private boolean terminated = false;

    public void run() {
        while (!terminated) {
            System.out.println("Working...");
            Thread.sleep(500);
        }
    }

    public void setTerminated(boolean terminated) {
        this.terminated = terminated;
    }
}
```

If the main thread calls `setTerminated(true)`, but the worker thread's CPU has cached `terminated = false`, the worker might **never stop**.

---

## Concept 2: The volatile Keyword

### ⚙️ How it works

Adding `volatile` tells the JVM: **do not cache this variable** — always read from and write to **main memory**.

```java
private volatile boolean terminated = false;
```

With `volatile`:
- Every **write** to the variable is immediately flushed to main memory
- Every **read** of the variable always comes from main memory
- No CPU caching of this variable is allowed

### 🧪 Example

```java
class Worker implements Runnable {
    private volatile boolean terminated = false;

    @Override
    public void run() {
        while (!terminated) {
            System.out.println("Working class is running...");
            try { Thread.sleep(500); } catch (InterruptedException e) {}
        }
    }

    public void setTerminated(boolean terminated) {
        this.terminated = terminated;
    }
}

public class App {
    public static void main(String[] args) throws InterruptedException {
        Worker worker = new Worker();
        Thread t1 = new Thread(worker);
        t1.start();

        Thread.sleep(3000);
        worker.setTerminated(true);
        System.out.println("Algorithm is terminated");
    }
}
```

**Output:**
```
Working class is running...
Working class is running...
Working class is running...
Working class is running...
Working class is running...
Working class is running...
Algorithm is terminated
```

---

## Concept 3: Why It Might Work Without volatile

You might notice that the program works fine even **without** `volatile`. Why?

There are several reasons:

1. **Both threads share the same CPU/core** — they read from the same cache, so the update is visible
2. **The JVM flushes the variable to main memory anyway** — this can happen, but it's not guaranteed
3. **Thread.sleep() or I/O operations** may trigger a memory barrier that forces cache synchronization

⚠️ **Common Mistake:** Just because it works without `volatile` on your machine doesn't mean it will work everywhere. The behavior is **platform-dependent** and **non-deterministic**. Always use `volatile` when sharing mutable state between threads.

---

## Concept 4: What volatile Does NOT Do

`volatile` guarantees **visibility**, but it does **not** guarantee **atomicity**.

```java
private volatile int counter = 0;

// THIS IS NOT THREAD-SAFE even with volatile!
counter++;  // read → increment → write (three operations)
```

For compound operations like `counter++`, you need either `synchronized` or `AtomicInteger`.

| Need | Solution |
|---|---|
| Visibility only (boolean flags) | `volatile` |
| Atomicity (increment, compare-and-swap) | `AtomicInteger`, `synchronized` |
| Both visibility and atomicity | `synchronized`, atomic classes |

💡 **Pro Tip:** Think of `volatile` as a "lightweight synchronization" — it solves the visibility problem without the overhead of locking. Use it for simple flags and status variables, not for counters or compound operations.

---

## Summary

- CPUs cache variables locally, which can make updates **invisible** to other threads
- `volatile` forces reads and writes to go through **main memory**, not CPU cache
- It's a lightweight synchronization mechanism — no locking overhead
- Use it for simple flags (like `terminated`, `running`, `ready`)
- It does **not** make compound operations atomic — use `synchronized` or atomic classes for that
- Always use `volatile` for shared boolean flags, even if the program seems to work without it
