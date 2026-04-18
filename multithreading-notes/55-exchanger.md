# Exchanger

## Introduction

Most synchronization tools coordinate access to shared resources. The `Exchanger` is different — it's designed for two threads to **swap data** with each other at a meeting point. One thread brings data A, the other brings data B, and they trade. It's a simple but powerful concept for pair-wise coordination.

---

## Concept 1: What is an Exchanger?

### 🧠 What is it?

An `Exchanger<V>` is a synchronization point where two threads can **exchange objects**. Each thread presents some object on entry to the `exchange()` method and receives the object presented by the other thread.

```java
import java.util.concurrent.Exchanger;
```

### 🧪 Real-World Analogy

Think of a spy movie exchange: two agents meet at a bridge. Agent A carries a briefcase with documents. Agent B carries a briefcase with money. They simultaneously hand over their briefcases and walk away. Neither can leave until both arrive.

### ⚙️ How it works

```
Thread 1                           Thread 2
   │                                  │
   ├─── exchange(dataA) ──┐           │
   │                      │  ← Thread 1 blocks until Thread 2 arrives
   │                      │           │
   │                      ├── exchange(dataB) ──┐
   │                      │                     │
   │    ← receives dataB ─┤── receives dataA →  │
   │                                            │
   ▼                                            ▼
```

Both threads block at the `exchange()` call until the **other thread** also calls `exchange()`. Then they swap and both continue.

---

## Concept 2: Basic Example

### 🧪 Two threads exchanging strings

```java
import java.util.concurrent.Exchanger;

public class App {
    public static void main(String[] args) {
        Exchanger<String> exchanger = new Exchanger<>();

        // Thread 1 — sends "Hello" and receives whatever Thread 2 sends
        new Thread(() -> {
            try {
                String received = exchanger.exchange("Hello from Thread 1");
                System.out.println("Thread 1 received: " + received);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        // Thread 2 — sends "Hi" and receives whatever Thread 1 sends
        new Thread(() -> {
            try {
                String received = exchanger.exchange("Hi from Thread 2");
                System.out.println("Thread 2 received: " + received);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
}
```

### 🧪 Output

```
Thread 1 received: Hi from Thread 2
Thread 2 received: Hello from Thread 1
```

Each thread gets the other's data. The exchange is atomic — both sides happen simultaneously.

---

## Concept 3: Practical Use Case — Double Buffering

### 🧠 What is double buffering?

The most common use of `Exchanger` is the **producer-consumer with double buffering** pattern. One thread fills a buffer while the other processes a buffer, then they swap.

### 🧪 Example — Fill and process buffers

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Exchanger;

public class App {
    public static void main(String[] args) {
        Exchanger<List<Integer>> exchanger = new Exchanger<>();

        // Producer — fills a buffer and exchanges it for an empty one
        new Thread(() -> {
            List<Integer> buffer = new ArrayList<>();
            int counter = 0;
            try {
                while (true) {
                    buffer.add(counter++);
                    if (buffer.size() == 10) {
                        // Buffer full — exchange for empty buffer
                        buffer = exchanger.exchange(buffer);
                        System.out.println("Producer got empty buffer, refilling...");
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        // Consumer — processes a full buffer and exchanges it for a new one
        new Thread(() -> {
            List<Integer> buffer = new ArrayList<>();
            try {
                while (true) {
                    // Get the full buffer from producer
                    buffer = exchanger.exchange(buffer);
                    System.out.println("Consumer processing: " + buffer);
                    buffer.clear();  // Clear and return for reuse
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
}
```

### 💡 Why is this useful?

Without the exchanger, the producer would need to wait for the consumer to finish before writing new data. With double buffering:
- The producer fills buffer A while the consumer processes buffer B
- When both are done, they **swap** — no idle time for either thread

---

## Concept 4: Exchange with Timeout

### ⚙️ Don't wait forever

```java
try {
    String result = exchanger.exchange("my data", 5, TimeUnit.SECONDS);
} catch (TimeoutException e) {
    System.out.println("Partner thread didn't arrive in time");
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}
```

If the other thread doesn't call `exchange()` within 5 seconds, a `TimeoutException` is thrown. This prevents a thread from blocking indefinitely.

---

## Concept 5: Key Properties and Limitations

### ⚙️ Important characteristics

| Property | Value |
|---|---|
| Number of threads | Exactly **2** — not more, not less |
| Blocking | Yes — both threads block until the other arrives |
| Thread-safe | Yes — the exchange is atomic |
| Reusable | Yes — same `Exchanger` can be used for multiple exchanges |

⚠️ **Common Mistake:** Trying to use an `Exchanger` with more than 2 threads. With 3 threads, two will exchange while the third waits — and the pairings become unpredictable. `Exchanger` is strictly a **two-party** synchronization tool.

---

## Summary

✅ **Key Takeaways:**

- `Exchanger` lets two threads swap objects at a synchronization point
- Both threads block until the other arrives and the exchange is complete
- Primary use case: **double buffering** — one thread fills while the other processes
- Use the timeout version to avoid indefinite blocking
- Designed for exactly **two threads** — not suitable for multi-party exchanges
