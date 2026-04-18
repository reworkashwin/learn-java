# Starting Threads — Thread Class

## Introduction

We've already seen how to create threads using the `Runnable` interface — you implement `Runnable`, pass it to a `Thread` object, and call `start()`. But there's another way: **extending the `Thread` class directly**. This approach is simpler for quick tasks but comes with an important trade-off. Let's explore both how it works and when to use (or avoid) it.

---

## Concept 1: Extending the Thread Class

### 🧠 What is it?

Instead of implementing `Runnable` and wrapping it in a `Thread`, you can create a subclass of `Thread` and override its `run()` method directly.

### ⚙️ How it works

```java
class Runner1 extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 10; i++) {
            System.out.println("Runner1 - " + i);
        }
    }
}

class Runner2 extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 10; i++) {
            System.out.println("Runner2 - " + i);
        }
    }
}
```

### 🧪 Starting the threads

Since your class **is** a `Thread`, you don't need to wrap it — just create an instance and call `start()`:

```java
public static void main(String[] args) {
    Runner1 t1 = new Runner1();
    Runner2 t2 = new Runner2();

    t1.start();
    t2.start();
}
```

### 🧪 Output (varies due to time-slicing)

```
Runner1 - 0
Runner2 - 0
Runner1 - 1
Runner2 - 1
Runner1 - 2
...
```

The threads execute concurrently — the time-slicing algorithm interleaves their execution.

---

## Concept 2: Thread Class vs Runnable Interface

### ❓ Which approach should you use?

| Feature | `extends Thread` | `implements Runnable` |
|---|---|---|
| Inheritance | Uses up your only superclass | Doesn't affect inheritance |
| Flexibility | Less flexible | More flexible |
| Reusability | Same task can't be shared | Same `Runnable` can run on multiple threads |
| Simplicity | Slightly simpler syntax | Requires wrapping in `Thread` |

### 🧠 The key issue: Java doesn't support multiple inheritance

```java
// ❌ This won't compile — can't extend two classes
class MyWorker extends Thread, SomeBaseClass { }

// ✅ This works — implement as many interfaces as you want
class MyWorker extends SomeBaseClass implements Runnable { }
```

### 💡 Pro Tip

**Prefer `Runnable` (or `Callable`) over extending `Thread`** in almost all cases. The `Thread` class approach was common in early Java, but modern Java coding standards favor composition over inheritance. Using `Runnable` also works seamlessly with `ExecutorService` and thread pools.

---

## Concept 3: Setting Thread Properties

### ⚙️ Naming threads

Whether you extend `Thread` or use `Runnable`, you can name threads for easier debugging:

```java
// With Thread subclass
class MyThread extends Thread {
    public MyThread(String name) {
        super(name);  // Pass name to Thread constructor
    }

    @Override
    public void run() {
        System.out.println(getName() + " is running");
    }
}

// With Runnable
Thread t = new Thread(() -> System.out.println("Working..."), "Worker-1");
```

### ⚙️ Setting priority

```java
Thread t1 = new Runner1();
t1.setPriority(Thread.MAX_PRIORITY);  // 10
t1.start();

Thread t2 = new Runner2();
t2.setPriority(Thread.MIN_PRIORITY);  // 1
t2.start();
```

⚠️ **Common Mistake:** Thinking `setPriority()` guarantees execution order. Thread priority is just a **hint** to the scheduler — many operating systems ignore it entirely.

---

## Concept 4: Important Methods in the Thread Class

### ⚙️ Key methods

```java
Thread t = new Thread(() -> { /* task */ });

t.start();          // Start the thread (creates new OS thread)
t.join();           // Wait for this thread to finish
t.setDaemon(true);  // Mark as daemon thread (won't prevent JVM shutdown)
t.isAlive();        // Check if thread is still running
t.interrupt();      // Request the thread to stop

// Static methods (apply to current thread)
Thread.sleep(1000);           // Pause current thread for 1 second
Thread.currentThread();       // Get reference to current thread
Thread.yield();               // Hint to scheduler to let other threads run
```

⚠️ **Common Mistake:** Calling `run()` instead of `start()`. The `run()` method executes in the **calling thread** — it does NOT create a new thread:

```java
t.run();    // ❌ Runs in main thread — no concurrency
t.start();  // ✅ Creates new thread and runs concurrently
```

---

## Summary

✅ **Key Takeaways:**

- You can create threads by extending `Thread` and overriding `run()`
- Call `start()` to launch the thread — never call `run()` directly
- Extending `Thread` is simpler but uses up your one superclass
- **Prefer `Runnable` or `Callable`** for better design and flexibility
- Use `join()` to wait for threads, `setDaemon()` for background threads
- Thread names and priorities are hints for debugging and scheduling
