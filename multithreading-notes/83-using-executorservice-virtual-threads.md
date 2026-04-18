# Using ExecutorService to Create Virtual Threads

## Introduction

In the previous lecture, we created virtual threads manually and had to call `join()` on each one to prevent the JVM from exiting. That works, but it's tedious — especially when you have many threads. There's a much more elegant solution: using `ExecutorService` with `try-with-resources`.

---

## Concept 1: The Problem with Manual `join()`

### ❓ Why do we need a better approach?

With the builder/factory approach:

```java
Thread t1 = builder.start(task1);
Thread t2 = builder.start(task2);
Thread t3 = builder.start(task3);

t1.join();
t2.join();
t3.join();
```

You have to manually track every thread and join them all. With 100 tasks, this becomes unmanageable.

---

## Concept 2: `newVirtualThreadPerTaskExecutor()`

### 🧠 What is it?

Java 21 introduces a new executor specifically for virtual threads:

```java
Executors.newVirtualThreadPerTaskExecutor()
```

This creates an `ExecutorService` that:
- Creates a **new virtual thread for every submitted task**
- Does **not** pool threads (unlike `newFixedThreadPool`)
- Does **not** reuse threads — each task gets a fresh virtual thread

### ⚠️ Key Distinction

With platform thread executors (`newFixedThreadPool`, `newCachedThreadPool`), the whole point was to **reuse** threads because creating platform threads is expensive. With virtual threads, there's **no pooling** — threads are so cheap that creating and disposing them is faster than managing a pool.

---

## Concept 3: The Try-With-Resources Pattern

### ⚙️ How it works

The magic happens when you combine the virtual thread executor with `try-with-resources`:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(VirtualTask::run);
    executor.submit(VirtualTask::run);
    executor.submit(VirtualTask::run);
}
// JVM waits here until ALL submitted threads finish
```

### ❓ Why is this so powerful?

The `try-with-resources` block does two things:

1. **Auto-joins** — When the `try` block ends, it automatically waits for **all** submitted virtual threads to finish execution
2. **Auto-shuts down** — After all threads complete, the executor service shuts itself down

You **don't need to call `join()`** on any thread. You **don't need to call `shutdown()`** on the executor. The `try-with-resources` handles everything.

### 🧪 Example

```java
public class App {
    public static void main(String[] args) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            executor.submit(VirtualTask::run);
            executor.submit(VirtualTask::run);
            executor.submit(VirtualTask::run);
        }
        System.out.println("All tasks completed!");
    }
}
```

Output:
```
Started: virtual-0
Started: virtual-1
Started: virtual-2
Finished: virtual-0
Finished: virtual-1
Finished: virtual-2
All tasks completed!
```

### 💡 Insight

Under the hood, when the `try` block exits:
1. The executor stops accepting new tasks
2. It waits for all running virtual threads to complete
3. Then it shuts down

This is exactly the pattern we want — submit tasks, wait for all of them, then move on.

---

## Concept 4: No Pooling, No Work Stealing

### ❓ Why no thread pool?

With the `newFixedThreadPool(n)` for platform threads:
- A fixed pool of `n` threads is maintained
- Tasks wait in a queue if all threads are busy
- The **work stealing** algorithm redistributes work among idle threads

With `newVirtualThreadPerTaskExecutor()`:
- **Every** `submit()` call creates a **brand new virtual thread**
- The thread runs its task and is then **disposed**
- No queue, no pool management, no work stealing

This works because virtual threads cost almost nothing to create. The overhead of managing a pool would actually be **slower** than just creating fresh threads.

---

## Summary

```
// ❌ Manual approach — tedious
Thread t1 = builder.start(task);
Thread t2 = builder.start(task);
t1.join();
t2.join();

// ✅ ExecutorService with try-with-resources — elegant
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(task1);
    executor.submit(task2);
}
```

✅ **Key Takeaway:** `Executors.newVirtualThreadPerTaskExecutor()` combined with `try-with-resources` is the most elegant way to work with virtual threads. It creates a fresh virtual thread per task, automatically waits for completion, and shuts down the executor — all without manual `join()` calls.

⚠️ **Common Mistake:** Using `newFixedThreadPool()` or `newCachedThreadPool()` with virtual threads defeats the purpose. Virtual threads should not be pooled.

💡 **Pro Tip:** This is the recommended pattern for most virtual thread use cases. If you need to combine results from multiple virtual threads, look into `CompletableFuture` and `StructuredTaskScope` — which we'll cover next.
