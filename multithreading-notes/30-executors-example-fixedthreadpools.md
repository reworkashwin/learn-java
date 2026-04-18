# Executors Example — FixedThreadPool

## Introduction

Now let's see how a **fixed thread pool** works in practice. We'll create a pool with a set number of threads and submit multiple tasks to it. The key observation: the pool **reuses** threads — you can see the same thread IDs executing different tasks.

---

## Concept 1: Setting Up Tasks

We define a simple `Work` class that simulates doing some work:

```java
class Work implements Runnable {
    private int id;

    public Work(int id) {
        this.id = id;
    }

    @Override
    public void run() {
        System.out.println("Task " + id + " running on thread " + Thread.currentThread().getId());
        try {
            int duration = (int) (Math.random() * 3000);
            Thread.sleep(duration);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

Each task has an ID, prints which thread is running it, and sleeps for a random duration to simulate work.

---

## Concept 2: Fixed Thread Pool with 2 Threads

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class App {
    public static void main(String[] args) {
        ExecutorService service = Executors.newFixedThreadPool(2);

        for (int i = 0; i < 10; i++) {
            service.execute(new Work(i + 1));
        }
    }
}
```

### 🧪 What happens?

With **2 threads** and **10 tasks**:

```
Task 1 running on thread 18
Task 2 running on thread 19
Task 3 running on thread 18    ← thread 18 reused!
Task 4 running on thread 19    ← thread 19 reused!
...
```

Only thread IDs 18 and 19 appear. The pool creates exactly **2 threads**, and they take turns executing all 10 tasks.

### ⚙️ How the pool assigns work

1. Task 1 → Thread 18 picks it up
2. Task 2 → Thread 19 picks it up
3. Tasks 3–10 wait in the **blocking queue**
4. When Thread 18 finishes Task 1, it picks up Task 3 from the queue
5. When Thread 19 finishes Task 2, it picks up Task 4
6. This continues until all tasks are done

---

## Concept 3: Fixed Thread Pool with 5 Threads

```java
ExecutorService service = Executors.newFixedThreadPool(5);
```

With **5 threads** and **10 tasks**:

```
Task 1 running on thread 18
Task 2 running on thread 19
Task 3 running on thread 20
Task 4 running on thread 21
Task 5 running on thread 22
Task 6 running on thread 18    ← reuse starts after first 5
Task 7 running on thread 19
...
```

The first 5 tasks get their own thread immediately. Tasks 6–10 are picked up as threads become free.

---

## Concept 4: Fixed Thread Pool with 10 Threads, 100 Tasks

```java
ExecutorService service = Executors.newFixedThreadPool(10);

for (int i = 0; i < 100; i++) {
    service.execute(new Work(i + 1));
}
```

- 10 threads are created with 10 unique IDs
- These 10 threads execute all 100 tasks
- Each thread finishes one task, then immediately picks up the next from the queue
- The queue handles the ordering

---

## Concept 5: The Shutdown Problem

⚠️ **Important:** If you run this code, the application **won't terminate** even after all tasks are done. Why?

The thread pool keeps its threads alive, waiting for more work. You must explicitly shut it down:

```java
service.shutdown();  // no new tasks accepted, existing tasks complete
```

For immediate termination:
```java
service.shutdownNow();  // attempts to stop all running tasks
```

Without calling `shutdown()`, the JVM won't exit because the pool threads are non-daemon threads.

---

## Concept 6: Why This Matters

The beauty of `ExecutorService`:

✅ You don't create threads manually

✅ You don't call `start()` or `join()`

✅ You don't handle `wait()` or `notify()`

✅ You don't assign tasks to threads — the pool does it automatically

✅ Threads are reused — no creation/destruction overhead

💡 **Pro Tip:** Choose the pool size based on your workload:
- **CPU-bound tasks** → pool size ≈ number of CPU cores
- **I/O-bound tasks** → pool size can be larger (threads spend time waiting for I/O)
- A common formula: `pool size = number of cores × (1 + wait time / compute time)`

---

## Summary

- `Executors.newFixedThreadPool(n)` creates a pool with exactly n reusable threads
- Tasks are submitted via `service.execute(runnable)`
- If all threads are busy, tasks wait in a blocking queue
- Threads are reused — same thread IDs appear for multiple tasks
- Always call `service.shutdown()` to terminate the pool when done
- The pool handles all thread creation, assignment, and lifecycle management for you
