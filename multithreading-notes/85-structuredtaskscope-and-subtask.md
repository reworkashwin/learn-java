# StructuredTaskScope and Subtask

## Introduction

So far we've been dealing with threads that run independently — no relationship between parent and child. If a child thread fails, the parent has no idea. If the parent dies, child threads become orphans running for no reason. This is **unstructured concurrency**, and it's messy. Java 21 introduces **Structured Concurrency** to solve exactly this problem.

---

## Concept 1: Unstructured vs Structured Concurrency

### 🧠 Unstructured Concurrency — The Problem

With unstructured concurrency (what we've been using with threads and executors):

```
Main Thread → spawns Thread A → spawns Thread B
                                     ↓
                              (who owns Thread B?)
```

Problems:
- Threads are **hard to track** — you don't know who spawned what
- **Error handling** is messy — exceptions in child threads often go unnoticed
- **Orphaned threads** can occur — if a parent thread is interrupted, child threads keep running pointlessly
- **No parent-child relationship** is defined

### 🧠 Structured Concurrency — The Solution

Structured concurrency enforces a clear lifecycle:

```
[Start Scope]
    ├── Fork: Child Thread 1
    ├── Fork: Child Thread 2
    ├── Fork: Child Thread 3
    │
    [Join Point — wait for all children]
    │
    [Combine results / handle errors]
[End Scope — shutdown]
```

Key properties:
- Parent-child relationships are **well defined**
- If a child fails, it can **notify the parent** immediately
- The parent can **cancel other children** if needed
- No orphaned threads — the scope **guarantees** all children complete before it closes

### 💡 Real-World Analogy

Think of a microservice calling two other services:

```
Digital Key Service
    ├── calls User Service → fetches user data
    └── calls Vehicle Service → fetches vehicle data
```

If the User Service is down, there's **no point** waiting for Vehicle Service — you need both results. Structured concurrency lets you cancel the remaining calls immediately.

---

## Concept 2: StructuredTaskScope — The Basics

### 🧠 What is StructuredTaskScope?

`StructuredTaskScope` is a Java 21 class that manages a group of virtual threads with a clear lifecycle. It uses `try-with-resources` to guarantee cleanup.

### ⚙️ How to use it — step by step

**Step 1: Create a Callable task**

```java
public class LongProcess implements Callable<String> {
    private int timeToSleep;
    private String result;

    public LongProcess(int timeToSleep, String result) {
        this.timeToSleep = timeToSleep;
        this.result = result;
    }

    @Override
    public String call() throws Exception {
        Thread.sleep(Duration.ofSeconds(timeToSleep));
        return result;
    }
}
```

**Step 2: Use StructuredTaskScope with try-with-resources**

```java
try (var scope = new StructuredTaskScope<String>()) {

    // Fork child tasks (each runs in its own virtual thread)
    Subtask<String> result1 = scope.fork(new LongProcess(1, "Result One"));
    Subtask<String> result2 = scope.fork(new LongProcess(3, "Result Two"));

    // Wait for ALL child threads to complete
    scope.join();

    // Combine results
    System.out.println(result1.get() + " " + result2.get());
}
```

### ⚙️ What's happening

1. `new StructuredTaskScope<>()` — creates a scope that manages child threads
2. `scope.fork(callable)` — submits a task as a virtual thread, returns a `Subtask<T>`
3. `scope.join()` — **blocks until all forked tasks complete**
4. `result.get()` — retrieves the result (safe to call after `join()` since tasks are done)
5. The `try-with-resources` closes and shuts down the scope automatically

---

## Concept 3: Subtask — Checking Results

### 🧠 What is a Subtask?

A `Subtask<T>` represents a forked task and its result. After `join()`, you can check its state:

```java
if (result1.state() == Subtask.State.SUCCESS) {
    System.out.println(result1.get());
}
```

Available states:
- `State.SUCCESS` — task completed normally
- `State.FAILED` — task threw an exception
- `State.UNAVAILABLE` — task hasn't completed yet (shouldn't happen after `join()`)

### 💡 Insight

Unlike `Future.get()`, calling `Subtask.get()` after `join()` is **non-blocking** — the task has already finished. The `join()` method has already done all the waiting.

---

## Concept 4: Why Blocking is Fine Here

### ❓ Doesn't `join()` block the thread?

Yes, `scope.join()` blocks — but remember, we're using **virtual threads** under the hood. When a virtual thread calls `join()`:

1. The JVM unmounts it from the carrier thread
2. The carrier thread executes other virtual threads
3. When all forked tasks finish, the virtual thread resumes

So **no OS thread is wasted** during the wait. This is the perfect marriage of structured concurrency and virtual threads.

---

## Concept 5: The Three Shutdown Strategies

`StructuredTaskScope` offers three approaches:

| Strategy | Behavior |
|----------|----------|
| Default (`StructuredTaskScope`) | Wait for **all** children to finish |
| `ShutdownOnFailure` | Cancel all remaining children if **any** child fails |
| `ShutdownOnSuccess` | Cancel all remaining children when the **first** child succeeds |

We'll explore `ShutdownOnFailure` and `ShutdownOnSuccess` in the next lectures.

---

## Summary

✅ **Key Takeaway:** `StructuredTaskScope` enforces parent-child relationships between threads. You fork tasks, join them, and the scope guarantees cleanup. Combined with virtual threads, blocking on `join()` is free.

⚠️ **Common Mistake:** Calling `subtask.get()` *before* `scope.join()` — the result may not be available yet.

💡 **Pro Tip:** Always use `try-with-resources` with `StructuredTaskScope`. This ensures the scope is shut down and all threads are cleaned up, even if an exception occurs.
