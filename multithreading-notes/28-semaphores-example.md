# Semaphores — Practical Example

## Introduction

Now let's see semaphores in action. We'll build a realistic scenario: a **download manager** that limits how many threads can download data from the web simultaneously.

---

## Concept 1: Setting Up the Semaphore

### ⚙️ Singleton Downloader with Semaphore

We use an `enum` to implement the singleton pattern — a single shared downloader that controls concurrency:

```java
import java.util.concurrent.Semaphore;

enum Downloader {
    INSTANCE;

    private Semaphore semaphore = new Semaphore(3, true);

    public void download() {
        try {
            semaphore.acquire();
            downloadData();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            semaphore.release();
        }
    }

    private void downloadData() {
        try {
            System.out.println(Thread.currentThread().getName() + " - Downloading data...");
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### Key elements

- `new Semaphore(3, true)` — **3 permits**, with **fairness** enabled
- The `true` fairness parameter means the **longest-waiting thread** gets the next available permit (FIFO order), preventing thread starvation
- `acquire()` — takes a permit (blocks if none available)
- `release()` — returns the permit to the semaphore

---

## Concept 2: Creating Multiple Threads with ExecutorService

Instead of creating threads manually, we use `ExecutorService` (which we'll cover in detail in the next sections):

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class App {
    public static void main(String[] args) {
        ExecutorService service = Executors.newCachedThreadPool();

        for (int i = 0; i < 12; i++) {
            service.execute(new Runnable() {
                @Override
                public void run() {
                    Downloader.INSTANCE.download();
                }
            });
        }
        
        service.shutdown();
    }
}
```

We submit **12 tasks**, but the semaphore only allows **3 at a time**.

---

## Concept 3: What Happens at Runtime?

### With 3 permits

```
Thread-1 - Downloading data...
Thread-2 - Downloading data...
Thread-3 - Downloading data...
// (2-second pause — only 3 at a time)
Thread-4 - Downloading data...
Thread-5 - Downloading data...
Thread-6 - Downloading data...
// (continues in batches of 3)
```

Only 3 threads execute simultaneously. The remaining 9 threads **wait** until a permit becomes available.

### With 5 permits

Change to `new Semaphore(5, true)`, and 5 threads download concurrently:

```
Thread-1 - Downloading data...
Thread-2 - Downloading data...
Thread-3 - Downloading data...
Thread-4 - Downloading data...
Thread-5 - Downloading data...
// (then the next batch of 5)
```

---

## Concept 4: Real-World Use Cases

| Scenario | Permit Count |
|---|---|
| Database connection pool | Number of available connections (e.g., 10) |
| Web server request handler | Max concurrent requests |
| File download manager | Max simultaneous downloads |
| API rate limiter | Max requests per time window |
| Printer queue | Number of printers |

💡 **Pro Tip:** Semaphores are especially powerful for web servers. You can define a semaphore that limits how many clients access your server simultaneously — protecting it from being overwhelmed.

⚠️ **Common Mistake:** Forgetting to call `release()` in case of an exception. Always put `release()` in a `finally` block to ensure the permit is returned no matter what.

✅ **Key Takeaway:** The `acquire()` + `release()` pattern is similar to `lock()` + `unlock()`, but a semaphore can allow **multiple threads through** at the same time, while a lock only allows one.

---

## Summary

- Create a `Semaphore` with a permit count and optional fairness flag
- `acquire()` blocks if no permits are available
- `release()` returns a permit, unblocking a waiting thread
- Use `finally` to ensure `release()` is always called
- Fairness (`true`) ensures threads are served in FIFO order — prevents starvation
- Semaphores are ideal for limiting concurrent access to pools of resources
