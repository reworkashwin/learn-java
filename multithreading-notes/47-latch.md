# CountDownLatch

## Introduction

How do you make one thread wait until several other threads have finished their work? You could use `join()`, but that requires manually tracking every thread. **CountDownLatch** provides a much cleaner solution — it's a synchronization tool where a thread waits for a counter to reach zero, and worker threads decrement that counter as they complete.

---

## Concept 1: The Problem with `join()`

### 🧠 Why not just use `join()`?

When you create threads manually, you can call `join()` on each one:

```java
Thread t1 = new Thread(task1);
Thread t2 = new Thread(task2);
t1.start();
t2.start();
t1.join(); // Wait for t1
t2.join(); // Wait for t2
```

This works, but has serious limitations:

1. **Dynamic thread creation** — In real applications, threads are created dynamically via thread pools. You don't have direct references to them
2. **Manual tracking** — You must store a reference to every thread and `join()` each one individually
3. **Doesn't work with Executor Services** — When using `ExecutorService`, you don't manage threads directly

> 💡 `join()` ties task coordination to thread tracking. `CountDownLatch` **decouples** them.

---

## Concept 2: What is CountDownLatch?

### 🧠 The Concept

A `CountDownLatch` is a synchronization aid in `java.util.concurrent` that lets one or more threads **wait** until a set of operations in other threads completes.

Think of it like a race: the referee won't start the final race until **all runners are ready** at the starting line. Each runner signals they're ready by "counting down." When all runners are ready (count = 0), the race starts.

### ⚙️ How it works

1. Create a latch with a counter: `new CountDownLatch(5)`
2. The waiting thread calls `latch.await()` — it **blocks** until the counter reaches zero
3. Each worker thread calls `latch.countDown()` when it finishes — this decrements the counter by 1
4. When the counter hits zero, the waiting thread is released

```
Main Thread:  await() ──── BLOCKED ──── counter=0 → continues
                              ↑
Worker 1:  countDown() ───────┤
Worker 2:  countDown() ───────┤
Worker 3:  countDown() ───────┤
Worker 4:  countDown() ───────┤
Worker 5:  countDown() ───────┘
```

---

## Concept 3: CountDownLatch Example

### ⚙️ The Worker Class

```java
import java.util.concurrent.CountDownLatch;

class Worker implements Runnable {
    private int id;
    private CountDownLatch latch;

    public Worker(int id, CountDownLatch latch) {
        this.id = id;
        this.latch = latch;
    }

    @Override
    public void run() {
        System.out.println("Thread with ID " + id + " starts working");
        try {
            Thread.sleep(2000); // Simulate work
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        latch.countDown(); // Signal completion
    }
}
```

### ⚙️ The Main Method

```java
import java.util.concurrent.*;

public class App {
    public static void main(String[] args) {
        CountDownLatch latch = new CountDownLatch(5);
        ExecutorService service = Executors.newSingleThreadExecutor();

        for (int i = 0; i < 5; i++) {
            service.execute(new Worker(i, latch));
        }

        try {
            latch.await(); // Block until counter reaches 0
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("All tasks have been finished!");
        service.shutdown();
    }
}
```

### 🧪 Output

```
Thread with ID 0 starts working
Thread with ID 1 starts working
Thread with ID 2 starts working
Thread with ID 3 starts working
Thread with ID 4 starts working
All tasks have been finished!
```

The main thread **waits** at `latch.await()` until all 5 workers call `countDown()`. Only then does it print the completion message.

---

## Concept 4: What If Counter > Number of Tasks?

### ⚠️ The Application Freezes

If you set the counter to a value **greater** than the number of tasks:

```java
CountDownLatch latch = new CountDownLatch(10); // Counter = 10
// But only 5 workers call countDown()
```

The counter will never reach zero. The `await()` call will **block forever**, and your application will freeze.

> ✅ **Rule:** The counter value should always be **equal to** the number of tasks that will call `countDown()`.

---

## Concept 5: CountDownLatch vs `join()`

| Feature | `Thread.join()` | `CountDownLatch` |
|---------|-----------------|------------------|
| Must track individual threads | ✅ Yes | ❌ No |
| Works with Executor Services | ❌ No | ✅ Yes |
| Reusable | N/A | ❌ One-time use |
| Decouples coordination from threads | ❌ No | ✅ Yes |
| Flexibility | Low | High |

---

## Key Takeaways

✅ `CountDownLatch` lets one thread wait for multiple other threads to finish — without knowing about those threads directly

✅ Initialize with a counter, workers call `countDown()`, the waiting thread calls `await()`

✅ Works perfectly with `ExecutorService` — the main thread doesn't need thread references

✅ The counter should match the number of tasks that will call `countDown()`

⚠️ If the counter never reaches zero, `await()` **blocks forever** — the application freezes

💡 `CountDownLatch` is a **one-shot** mechanism — once the counter reaches zero, it cannot be reset. For reusable barriers, use `CyclicBarrier`
