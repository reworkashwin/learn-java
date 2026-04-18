# Cyclic Barrier

## Introduction

In the previous note, we learned about `CountDownLatch` — where **one thread waits** for others. But what if you need **all threads to wait for each other**? Imagine downloading 5 datasets in parallel and wanting all downloads to complete before any thread starts processing. This is where `CyclicBarrier` shines.

---

## Concept 1: CountDownLatch vs CyclicBarrier

### 🧠 The Key Difference

- **CountDownLatch**: One thread (usually `main`) waits for worker threads to finish
- **CyclicBarrier**: Multiple threads **wait for each other** at a common barrier point

Think of a `CyclicBarrier` like a group of friends agreeing to meet at a restaurant. Nobody starts eating until **everyone** has arrived.

### 💡 Two More Differences

1. **Reusability**: `CyclicBarrier` can be reused over and over. `CountDownLatch` is one-time only
2. **Barrier action**: `CyclicBarrier` supports a `Runnable` callback that runs automatically when all threads arrive at the barrier

---

## Concept 2: How CyclicBarrier Works

### ⚙️ The Mechanics

1. Create a barrier with a party count: `new CyclicBarrier(5, barrierAction)`
2. Each thread does its work, then calls `barrier.await()`
3. The thread **blocks** at `await()` until all parties have called it
4. When all parties arrive, the barrier action runs and all threads are released

```
Thread 1:  work → await() ──── BLOCKED ────┐
Thread 2:  work → await() ──── BLOCKED ────┤  All arrived!
Thread 3:  work → await() ──── BLOCKED ────┤  → Run barrier action
Thread 4:  work → await() ──── BLOCKED ────┤  → All threads released
Thread 5:  work → await() ──── BLOCKED ────┘
```

---

## Concept 3: Practical Example

### ⚙️ The Worker Class

```java
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.BrokenBarrierException;
import java.util.Random;

class BarrierWorker implements Runnable {
    private int id;
    private Random random;
    private CyclicBarrier barrier;

    public BarrierWorker(int id, CyclicBarrier barrier) {
        this.id = id;
        this.random = new Random();
        this.barrier = barrier;
    }

    @Override
    public void run() {
        doWork();
        try {
            barrier.await(); // Wait for all other threads
        } catch (InterruptedException | BrokenBarrierException e) {
            e.printStackTrace();
        }
        System.out.println("After the await - Thread " + id);
    }

    private void doWork() {
        System.out.println("Thread with ID " + id + " starts working");
        try {
            Thread.sleep(random.nextInt(3000));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### ⚙️ The Main Method

```java
import java.util.concurrent.*;

public class App {
    public static void main(String[] args) {
        ExecutorService service = Executors.newFixedThreadPool(5);

        CyclicBarrier barrier = new CyclicBarrier(5, () -> {
            System.out.println("All tasks have been finished!");
        });

        for (int i = 0; i < 5; i++) {
            service.execute(new BarrierWorker(i + 1, barrier));
        }

        service.shutdown();
    }
}
```

### 🧪 Output

```
Thread with ID 1 starts working
Thread with ID 4 starts working
Thread with ID 5 starts working
Thread with ID 3 starts working
Thread with ID 2 starts working
All tasks have been finished!        ← Barrier action runs
After the await - Thread 1           ← All threads continue
After the await - Thread 4
After the await - Thread 3
After the await - Thread 2
After the await - Thread 5
```

All threads do their work, wait at the barrier, and once all 5 have arrived:
1. The barrier action prints "All tasks have been finished!"
2. All threads proceed past `await()` and print "After the await"

---

## Concept 4: Reusability — The "Cyclic" Part

### 🧠 What makes it cyclic?

Unlike `CountDownLatch`, a `CyclicBarrier` can be **reused** after all parties have passed the barrier. You can submit a new batch of tasks using the same barrier without creating a new one.

### ⚠️ Don't Call `reset()` While Threads Are Waiting

If you call `barrier.reset()` while threads are blocked at `await()`, those threads will get a `BrokenBarrierException`. In practice, you rarely need to call `reset()` explicitly — just let the barrier complete naturally and reuse it.

---

## Concept 5: CyclicBarrier vs CountDownLatch — Summary

| Feature | CountDownLatch | CyclicBarrier |
|---------|---------------|---------------|
| Who waits? | One thread waits for others | All threads wait for each other |
| Reusable? | ❌ One-time use | ✅ Can be reused |
| Callback action | ❌ No | ✅ Runnable runs when barrier breaks |
| Typical use | Main waits for workers | Workers synchronize with each other |
| Method | `await()` + `countDown()` | `await()` only |

---

## Key Takeaways

✅ `CyclicBarrier` makes **all threads wait for each other** at a synchronization point

✅ Pass a `Runnable` callback as the second constructor argument — it runs automatically when all threads arrive

✅ Unlike `CountDownLatch`, `CyclicBarrier` is **reusable** — this is the "cyclic" part

✅ Each thread calls `barrier.await()` — no separate `countDown()` needed

⚠️ If fewer threads call `await()` than the number of parties, the waiting threads will **block forever**

💡 Use `CyclicBarrier` when threads need to coordinate at a common point (e.g., all downloads must complete before processing begins). Use `CountDownLatch` when one thread just needs to wait for others to finish
