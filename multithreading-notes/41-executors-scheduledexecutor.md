# Executors Example — ScheduledExecutor

## Introduction

So far, our executors run tasks **immediately** when submitted. But what if you need to delay a task or run it repeatedly at fixed intervals — like a heartbeat check, a scheduled cleanup, or polling a service? That's what `ScheduledExecutorService` is for. It's the modern replacement for `java.util.Timer`.

---

## Concept 1: What is ScheduledExecutorService?

### 🧠 What is it?

`ScheduledExecutorService` is an extension of `ExecutorService` that can **schedule tasks** to run after a delay or periodically. You create one using:

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
```

The parameter is the **core pool size** — the number of threads available for scheduling.

### ❓ Why not use `Timer` and `TimerTask`?

| Feature | `Timer` | `ScheduledExecutorService` |
|---|---|---|
| Thread pool | Single thread | Configurable pool size |
| Exception handling | One exception kills the timer | Other tasks continue normally |
| Flexibility | Only `TimerTask` | Any `Runnable` or `Callable` |
| API | Old (Java 1.3) | Modern (Java 5+) |

⚠️ **Common Mistake:** Using `Timer` in production. If a `TimerTask` throws an unchecked exception, the entire `Timer` thread dies and **all scheduled tasks stop running silently**. `ScheduledExecutorService` handles exceptions per task without affecting others.

---

## Concept 2: schedule() — Run Once After a Delay

### ⚙️ Schedule a single task

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

scheduler.schedule(() -> {
    System.out.println("This runs after 3 seconds");
}, 3, TimeUnit.SECONDS);
```

### 🧪 Output

```
(waits 3 seconds)
This runs after 3 seconds
```

### ⚙️ Schedule with a return value (Callable)

```java
ScheduledFuture<String> future = scheduler.schedule(() -> {
    return "Computation complete";
}, 5, TimeUnit.SECONDS);

String result = future.get();  // Blocks until the task completes
System.out.println(result);
```

---

## Concept 3: scheduleAtFixedRate() — Repeated Execution

### 🧠 What is it?

Runs a task repeatedly at a **fixed interval**, regardless of how long each execution takes:

```java
scheduler.scheduleAtFixedRate(() -> {
    System.out.println("Heartbeat: " + LocalTime.now());
}, 0, 2, TimeUnit.SECONDS);
```

### Parameters

| Parameter | Meaning |
|---|---|
| Task | The `Runnable` to execute |
| Initial delay | Wait before first execution (0 = start immediately) |
| Period | Time between **start** of one execution and **start** of the next |
| Time unit | `SECONDS`, `MILLISECONDS`, etc. |

### 🧪 Output

```
Heartbeat: 10:00:00
Heartbeat: 10:00:02
Heartbeat: 10:00:04
Heartbeat: 10:00:06
...
```

### ⚠️ Important behavior

If a task takes **longer** than the period (e.g., task takes 3 seconds but period is 2 seconds), the next execution starts **immediately** after the previous one finishes. Executions never overlap.

```
Period = 2s, Task duration = 3s

|---task 1 (3s)---|---task 2 (3s)---|---task 3 (3s)---|
                  ↑ starts immediately (no 2s gap)
```

---

## Concept 4: scheduleWithFixedDelay() — Fixed Delay Between Executions

### 🧠 What is it?

Runs a task repeatedly with a **fixed delay** between the **end** of one execution and the **start** of the next:

```java
scheduler.scheduleWithFixedDelay(() -> {
    System.out.println("Cleanup: " + LocalTime.now());
    try { Thread.sleep(1000); } catch (InterruptedException e) {}
}, 0, 2, TimeUnit.SECONDS);
```

### ❓ How is it different from scheduleAtFixedRate()?

| Feature | `scheduleAtFixedRate` | `scheduleWithFixedDelay` |
|---|---|---|
| Timing measured from | **Start** of previous execution | **End** of previous execution |
| Task takes 1s, period/delay = 2s | Next starts at t=2s | Next starts at t=3s (1s task + 2s delay) |
| Use case | Regular heartbeats | Tasks with variable duration |

### 🧪 Visual comparison (task takes 1 second)

```
scheduleAtFixedRate(period=2s):
|--task(1s)--|       |--task(1s)--|       |--task(1s)--|
t=0          t=1     t=2          t=3     t=4

scheduleWithFixedDelay(delay=2s):
|--task(1s)--|           |--task(1s)--|           |--task(1s)--|
t=0          t=1         t=3          t=4         t=6
             |--2s gap-->|            |--2s gap-->|
```

---

## Concept 5: Practical Example — Periodic Status Check

### 🧪 Complete working example

```java
import java.util.concurrent.*;
import java.time.LocalTime;

public class App {
    public static void main(String[] args) throws InterruptedException {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

        // Task 1: Heartbeat every 1 second
        ScheduledFuture<?> heartbeat = scheduler.scheduleAtFixedRate(() -> {
            System.out.println("[Heartbeat] " + LocalTime.now());
        }, 0, 1, TimeUnit.SECONDS);

        // Task 2: Cleanup every 5 seconds (with 3s initial delay)
        scheduler.scheduleWithFixedDelay(() -> {
            System.out.println("[Cleanup] Running cleanup...");
        }, 3, 5, TimeUnit.SECONDS);

        // Let it run for 15 seconds, then shut down
        Thread.sleep(15_000);

        heartbeat.cancel(false);   // Stop the heartbeat
        scheduler.shutdown();
    }
}
```

### 💡 Pro Tip

Use `cancel()` on the returned `ScheduledFuture` to stop individual tasks. The `false` parameter means "don't interrupt if currently running."

---

## Summary

✅ **Key Takeaways:**

- `ScheduledExecutorService` schedules tasks with delays or at fixed intervals
- `schedule()` — run once after a delay
- `scheduleAtFixedRate()` — repeat at fixed intervals (measured from start to start)
- `scheduleWithFixedDelay()` — repeat with fixed gaps (measured from end to start)
- Always prefer `ScheduledExecutorService` over `Timer` — it's more robust and handles exceptions better
- Use `cancel()` on `ScheduledFuture` to stop individual recurring tasks
- Call `shutdown()` on the scheduler when your application is done
