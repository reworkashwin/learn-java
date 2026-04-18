# Blocking Queue — ArrayBlockingQueue

## Introduction

In producer-consumer problems, one thread produces data and another consumes it. The challenge: what if the producer is faster than the consumer, or the queue is full? **BlockingQueue** handles this automatically — the producer blocks when the queue is full, and the consumer blocks when it's empty. Let's start with the `ArrayBlockingQueue` implementation.

---

## Concept 1: What is a BlockingQueue?

### 🧠 The Concept

A `BlockingQueue` is a **thread-safe queue** from `java.util.concurrent` designed for producer-consumer scenarios. It has two key behaviors:

- **Blocks on `take()`** when you try to remove from an **empty** queue — the thread waits until an item appears
- **Blocks on `put()`** when you try to insert into a **full** queue — the thread waits until space is available

### 💡 Why is this powerful?

You don't need to write any synchronization code yourself — no `synchronized` blocks, no locks, no `wait()`/`notify()`. The queue handles everything.

---

## Concept 2: ArrayBlockingQueue Internals

### ⚙️ Under the Hood

`ArrayBlockingQueue` uses a **fixed-size array** as its backing data structure:

- The size is defined at creation and **cannot change** (no dynamic resizing)
- It maintains a **head index** (next item to remove) and a **tail index** (next slot to insert)
- It works like a **circular buffer** — when the tail reaches the end, it wraps around to the beginning
- No shifting of elements is needed (unlike a standard array)

### 🔒 Single Lock

`ArrayBlockingQueue` uses a **single ReentrantLock** for all operations. This means:

- If Thread A is inserting (`put`), Thread B must wait to remove (`take`)
- Even independent operations block each other
- This simplifies the implementation but can limit performance under high concurrency

### 🧪 Fairness Option

When creating an `ArrayBlockingQueue`, you can specify a fairness parameter:

```java
BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(10, true); // fair
```

| Fair (`true`) | Non-fair (`false`, default) |
|--------------|---------------------------|
| Longest-waiting thread gets the lock first | Any thread may acquire the lock |
| FIFO ordering guaranteed | Higher throughput possible |
| No thread starvation | Some threads may starve |

---

## Concept 3: Producer-Consumer Example

### ⚙️ The Producer

```java
import java.util.concurrent.BlockingQueue;

class FirstWorker implements Runnable {
    private BlockingQueue<Integer> queue;

    public FirstWorker(BlockingQueue<Integer> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        int counter = 0;
        while (true) {
            try {
                queue.put(counter);
                System.out.println("Putting item: " + counter);
                counter++;
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

### ⚙️ The Consumer

```java
class SecondWorker implements Runnable {
    private BlockingQueue<Integer> queue;

    public SecondWorker(BlockingQueue<Integer> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        while (true) {
            try {
                int value = queue.take();
                System.out.println("Taking item: " + value);
                Thread.sleep(300);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

### ⚙️ Main Method

```java
import java.util.concurrent.*;

public class App {
    public static void main(String[] args) {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(10);

        Thread t1 = new Thread(new FirstWorker(queue));
        Thread t2 = new Thread(new SecondWorker(queue));

        t1.start();
        t2.start();
    }
}
```

---

## Concept 4: What Happens When Speeds Differ?

### 🧪 Producer faster than consumer (100ms vs 300ms)

The producer fills the queue faster than the consumer empties it. Once the queue holds 10 items (the capacity), the producer **blocks** on `put()` until the consumer removes an item.

### 🧪 Consumer faster than producer (3000ms vs 100ms)

The consumer drains the queue almost instantly. Once the queue is empty, the consumer **blocks** on `take()` until the producer adds an item. The overall speed is throttled by the slower producer.

### 💡 Self-Regulating System

The blocking behavior creates a natural **backpressure** mechanism — the faster thread automatically slows down to match the slower one. No manual coordination needed.

---

## Key Takeaways

✅ `ArrayBlockingQueue` is a fixed-size, thread-safe queue backed by a circular array

✅ `put()` blocks when full, `take()` blocks when empty — no manual synchronization needed

✅ Uses a **single ReentrantLock** — simple but means all operations block each other

✅ Supports a **fairness** parameter to prevent thread starvation

⚠️ The capacity is fixed at creation — no dynamic resizing

💡 The blocking behavior creates natural backpressure between producers and consumers, making it ideal for rate-limiting and flow control
