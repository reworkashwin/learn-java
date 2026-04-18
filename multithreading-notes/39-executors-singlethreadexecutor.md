# Executors Example — SingleThreadExecutor

## Introduction

We've seen `FixedThreadPool` — a pool with a fixed number of threads. But what if you want to guarantee that tasks run **one at a time**, in the exact order they were submitted? That's where `SingleThreadExecutor` comes in. It's essentially a `FixedThreadPool` with exactly **one thread**.

---

## Concept 1: What is SingleThreadExecutor?

### 🧠 What is it?

`Executors.newSingleThreadExecutor()` creates an executor with **exactly one worker thread**. All submitted tasks are placed in an **unbounded queue** and executed sequentially by that single thread.

### ❓ Why not just create a `new Thread()` for each task?

| Feature | Raw `Thread` | `SingleThreadExecutor` |
|---|---|---|
| Thread reuse | No — new thread per task | Yes — reuses the same thread |
| Task queuing | Manual implementation | Built-in unbounded queue |
| Error recovery | You manage it | Replaces dead thread automatically |
| Ordering | No guarantee | Tasks execute in submission order |
| Lifecycle management | Manual | `shutdown()`, `awaitTermination()` |

### 💡 Insight

If the single thread dies due to an exception, the executor **automatically creates a new thread** to replace it. This self-healing behavior is something raw `Thread` doesn't provide.

---

## Concept 2: Basic Example

### ⚙️ Creating and using a SingleThreadExecutor

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class App {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        for (int i = 1; i <= 5; i++) {
            final int taskId = i;
            executor.execute(() -> {
                System.out.println("Task " + taskId + " running on " 
                    + Thread.currentThread().getName());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        executor.shutdown();
    }
}
```

### 🧪 Output

```
Task 1 running on pool-1-thread-1
Task 2 running on pool-1-thread-1
Task 3 running on pool-1-thread-1
Task 4 running on pool-1-thread-1
Task 5 running on pool-1-thread-1
```

Notice: **same thread** executes all tasks, and they execute **in order** (1, 2, 3, 4, 5). This is guaranteed.

---

## Concept 3: When to Use SingleThreadExecutor

### ⚙️ Use cases

1. **Sequential task processing** — when tasks must execute in exact submission order
2. **Event logging** — log entries should be written in order
3. **UI updates** — GUI frameworks often require updates on a single thread
4. **File I/O** — writing to a single file from multiple producers
5. **Background task runner** — offload work from the main thread without parallelism

### 🧪 Example — Sequential log writer

```java
public class LogService {
    private final ExecutorService logExecutor = Executors.newSingleThreadExecutor();

    public void log(String message) {
        logExecutor.execute(() -> {
            // All log writes happen sequentially — no file corruption
            writeToFile(message);
        });
    }

    public void shutdown() {
        logExecutor.shutdown();
    }
}
```

Multiple threads can call `log()` simultaneously, but the actual file writes happen **one at a time** on the executor's single thread. No synchronization needed for the file.

---

## Concept 4: SingleThreadExecutor vs FixedThreadPool(1)

### ❓ Are they the same?

Almost — but not quite:

```java
ExecutorService single = Executors.newSingleThreadExecutor();
ExecutorService fixed = Executors.newFixedThreadPool(1);
```

| Feature | `newSingleThreadExecutor()` | `newFixedThreadPool(1)` |
|---|---|---|
| Thread count | Always 1 — cannot be reconfigured | 1, but can be reconfigured via casting |
| Guarantee | Tasks always run sequentially | Same (with 1 thread) |
| Reconfigurable | No — wrapped to prevent reconfiguration | Yes — can cast to `ThreadPoolExecutor` |

### 💡 Pro Tip

If you need the **guarantee** that the pool will always have exactly one thread and can never be reconfigured, use `newSingleThreadExecutor()`. It returns a wrapper that prevents calling `setCorePoolSize()`.

---

## Concept 5: Proper Shutdown

### ⚙️ Graceful shutdown pattern

```java
ExecutorService executor = Executors.newSingleThreadExecutor();

// Submit tasks...

executor.shutdown();  // No new tasks accepted; existing tasks complete

try {
    if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
        executor.shutdownNow();  // Force shutdown after timeout
    }
} catch (InterruptedException e) {
    executor.shutdownNow();
    Thread.currentThread().interrupt();
}
```

⚠️ **Common Mistake:** Forgetting to call `shutdown()`. The JVM will **not exit** if there are non-daemon threads running in the executor. Your program hangs at the end.

---

## Summary

✅ **Key Takeaways:**

- `SingleThreadExecutor` uses exactly one thread to run all tasks sequentially
- Tasks are queued and processed in **submission order** (FIFO)
- The thread is **reused** across tasks — no overhead of creating new threads
- If the thread dies, a new one is automatically created
- Use for: ordered processing, logging, UI updates, single-file I/O
- Always call `shutdown()` when you're done submitting tasks
