# Stopping Executors

## Introduction

Creating an executor service and submitting tasks is straightforward — but **shutting it down properly** is just as important. If you don't shut down the executor, your application may hang indefinitely because the threads in the pool keep running. Let's explore the correct way to stop an executor service.

---

## Concept 1: The `shutdown()` Method

### 🧠 What is it?

The `shutdown()` method initiates an **orderly shutdown** of the executor service. It tells the executor:

> "Finish whatever tasks have already been submitted, but **don't accept any new ones**."

```java
ExecutorService executor = Executors.newFixedThreadPool(5);

for (int i = 0; i < 100; i++) {
    executor.execute(new Worker(i));
}

executor.shutdown(); // No new tasks accepted after this
```

### ❓ Why isn't this enough?

Calling `shutdown()` only **prevents new tasks** from being submitted. It does **not** forcefully stop tasks that are already running. If those tasks take a long time (or run forever), your application will hang.

---

## Concept 2: Waiting for Termination with `awaitTermination()`

### 🧠 What is it?

After calling `shutdown()`, you can use `awaitTermination()` to **block the current thread** until one of two things happens:

1. All submitted tasks complete
2. The timeout elapses

```java
executor.shutdown(); // Prevent new tasks

try {
    if (!executor.awaitTermination(1000, TimeUnit.MILLISECONDS)) {
        executor.shutdownNow(); // Force stop if timeout elapsed
    }
} catch (InterruptedException e) {
    executor.shutdownNow(); // Force stop on interruption
}
```

### ⚙️ How it works

1. **`shutdown()`** — Stops accepting new tasks
2. **`awaitTermination(timeout, unit)`** — Waits up to the specified time for existing tasks to finish
   - Returns `true` if all tasks completed
   - Returns `false` if the timeout elapsed before completion
3. **`shutdownNow()`** — Attempts to **stop all actively executing tasks** immediately

---

## Concept 3: The `shutdownNow()` Method

### 🧠 What is it?

`shutdownNow()` is the **forceful** version of shutdown. It:

- Attempts to stop all actively running tasks
- Returns a list of tasks that were queued but never started
- May cause `InterruptedException` in sleeping/waiting threads

```java
executor.shutdownNow();
```

### ⚠️ Important: Handle InterruptedException in Workers

When `shutdownNow()` is called, it interrupts running threads. If a worker is sleeping or waiting, it will throw an `InterruptedException`. You **must** handle this properly:

```java
class Worker implements Runnable {
    @Override
    public void run() {
        try {
            Thread.sleep((long) (Math.random() * 3000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // Re-set the interrupt flag
        }
    }
}
```

💡 Calling `Thread.currentThread().interrupt()` re-sets the interrupted flag so that the thread knows it was interrupted. This is a best practice.

---

## Concept 4: The Complete Shutdown Pattern

Here's the standard pattern for properly shutting down an executor service:

```java
ExecutorService executor = Executors.newFixedThreadPool(5);

// Submit tasks
for (int i = 0; i < 100; i++) {
    executor.execute(new Worker(i));
}

// Step 1: Prevent new tasks
executor.shutdown();

try {
    // Step 2: Wait for existing tasks to finish
    if (!executor.awaitTermination(1000, TimeUnit.MILLISECONDS)) {
        // Step 3: Force shutdown if tasks didn't finish in time
        executor.shutdownNow();
    }
} catch (InterruptedException e) {
    // Step 4: Force shutdown if we were interrupted while waiting
    executor.shutdownNow();
}
```

### 🧪 What happens in practice?

- If you **don't** call `shutdownNow()` and let tasks complete naturally, all 100 tasks will execute before the application terminates
- If you **do** call `shutdownNow()` after a short timeout, only some tasks complete (e.g., 16 out of 100) and the executor terminates early

---

## Key Takeaways

✅ Always call `shutdown()` when you're done with an executor — otherwise threads keep running

✅ Use `awaitTermination()` to give tasks time to finish gracefully

✅ Use `shutdownNow()` as a fallback when tasks don't finish in time

✅ Always handle `InterruptedException` in worker tasks — call `Thread.currentThread().interrupt()` to preserve the interrupted status

⚠️ `shutdown()` alone does NOT stop running tasks — it only prevents new ones from being submitted

💡 The pattern `shutdown() → awaitTermination() → shutdownNow()` is the standard approach for clean executor shutdown in production code
