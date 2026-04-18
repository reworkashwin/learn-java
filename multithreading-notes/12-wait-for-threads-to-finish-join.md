# Wait for Threads to Finish — join()

## Introduction

We've learned how to create and start threads. But there's a problem we haven't addressed yet: the **main thread doesn't wait** for other threads to finish. It just keeps going. This can cause serious issues when one operation depends on the result of another.

The solution? The `join()` method.

---

## The Problem: Main Thread Doesn't Wait

### 🧠 Understanding the default behavior

When the main thread starts other threads, it **continues executing immediately** — it does not pause or wait for those threads to complete.

```java
public static void main(String[] args) {
    var t1 = new Thread(new Runner1());
    var t2 = new Thread(new Runner2());

    t1.start();
    t2.start();

    System.out.println("Finished with all runners!");
}
```

### 🧪 Expected vs. Actual Output

**You might expect:**
```
Runner1 - 0, 1, 2, ... 9
Runner2 - 0, 1, 2, ... 9
Finished with all runners!
```

**What actually happens:**
```
Finished with all runners!    ← This prints FIRST!
Runner1 - 0
Runner2 - 0
Runner1 - 1
...
```

### ❓ Why?

The main thread calls `t1.start()` and `t2.start()` — which **launch** the threads but don't wait for them. The main thread immediately moves to the next line and prints "Finished with all runners!" while the other threads are still running in the background.

### 🧪 Real-World Danger

Imagine this scenario:

```java
// Thread 1: downloads images
// Thread 2: processes downloaded images (depends on Thread 1!)

var t1 = new Thread(() -> downloadImages());
var t2 = new Thread(() -> processImages());  // Needs downloaded images!

t1.start();
t2.start();  // Starts immediately — images aren't downloaded yet!
```

Thread 2 tries to process images that haven't been downloaded yet. This will fail or produce incorrect results.

---

## The Solution: join()

### 🧠 What is join()?

The `join()` method makes the **calling thread wait** until the target thread finishes execution.

```java
t1.join();  // The current thread (main) waits until t1 finishes
```

### ⚙️ How to use it

```java
public static void main(String[] args) {
    var t1 = new Thread(new Runner1());
    var t2 = new Thread(new Runner2());

    t1.start();
    t2.start();

    try {
        t1.join();  // Main thread waits for t1 to finish
        t2.join();  // Main thread waits for t2 to finish
    } catch (InterruptedException e) {
        e.printStackTrace();
    }

    System.out.println("Finished with all runners!");
}
```

### 🧪 Output

```
Runner1 - 0
Runner2 - 0
Runner1 - 1
Runner2 - 1
...
Runner1 - 9
Runner2 - 9
Finished with all runners!    ← Now prints LAST, as expected
```

The main thread starts both threads, then **waits at the join point** until both threads complete before continuing.

⚠️ **Important:** `join()` throws `InterruptedException`, so you must handle it with a `try-catch` block or declare `throws InterruptedException` on the method.

---

## Joining a Single Thread

What if you only join on `t1` but not `t2`?

```java
t1.start();
t2.start();

try {
    t1.join();  // Wait only for t1
} catch (InterruptedException e) {
    e.printStackTrace();
}

System.out.println("Finished with all runners!");
```

Now suppose `t1` finishes quickly (100ms sleep per iteration) but `t2` is slow (1000ms sleep per iteration):

```
Runner1 - 0, 1, 2, ... 9      ← t1 finishes fast
Runner2 - 0, 1, 2              ← t2 still running
Finished with all runners!     ← Main thread continues after t1 finishes
Runner2 - 3, 4, 5, ... 9      ← t2 keeps running in background
```

The main thread only waits for `t1`. Once `t1` is done, it prints the message — even though `t2` is still running.

---

## Visualizing join()

### Without join:
```
Main:   [start t1] [start t2] [print "Finished"] 
t1:                [....running.......]
t2:                [........running..........]
```

### With join on both:
```
Main:   [start t1] [start t2] [---waiting---] [print "Finished"]
t1:                [....running.......]        ↑ join point
t2:                [........running..........]  ↑ join point
```

---

## The join() Method in Detail

### 🧠 Key facts about join():

| Aspect | Detail |
|--------|--------|
| **Purpose** | Makes calling thread wait until target thread terminates |
| **Exception** | Throws `InterruptedException` — must be handled |
| **Who waits?** | The thread that *calls* `join()` waits |
| **Who is waited for?** | The thread that `join()` is *called on* |
| **Can join from any thread?** | Yes — any thread can call `join()` on any other thread |
| **CPU usage while waiting** | None — the waiting thread is in the BLOCKED/WAITING state |

---

## ✅ Key Takeaways

- The main thread **does not wait** for started threads by default — it continues immediately
- `join()` forces the calling thread to **wait** until the target thread finishes
- Always handle `InterruptedException` when using `join()`
- You can call `join()` on multiple threads to wait for all of them
- `join()` can be called from **any thread**, not just the main thread
- Without `join()`, operations that depend on thread results will fail or produce incorrect results

⚠️ **Common Mistake:** Forgetting to `join()` threads that produce results needed later in the program. This leads to race conditions and unpredictable behavior.

---

## What's Next?

We now have the basics of thread creation, execution, and synchronization with `join()`. In the coming lectures, we'll explore more advanced thread management techniques and dive into **thread synchronization** — handling shared resources safely.
