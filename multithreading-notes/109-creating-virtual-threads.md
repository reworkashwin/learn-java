# Creating Virtual Threads

## Introduction

Now that we understand how virtual threads work conceptually, let's get our hands dirty and actually **create** them in Java 21. There are two main approaches: using a **builder** and using a **thread factory**. Both are straightforward, but there's an important gotcha — all virtual threads are **daemon threads**.

---

## Concept 1: The Daemon Thread Gotcha

### ⚠️ Why does my program finish instantly?

Before we look at how to create virtual threads, you need to understand this: **every virtual thread is a daemon thread**.

Remember from earlier chapters — if the main thread finishes and only daemon threads are left running, the JVM **terminates immediately**. It doesn't wait for daemon threads to complete.

So if you create virtual threads and don't explicitly wait for them, your program will exit before they do any work. This is the most common mistake when starting with virtual threads.

---

## Concept 2: Approach 1 — Using the Builder Pattern

### ⚙️ How it works

Java 21 adds two factory methods to the `Thread` class:
- `Thread.ofPlatform()` — builder for platform threads
- `Thread.ofVirtual()` — builder for virtual threads

```java
public class VirtualTask implements Runnable {
    @Override
    public void run() {
        System.out.println("Started: " + Thread.currentThread().getName());
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("Finished: " + Thread.currentThread().getName());
    }
}
```

Now we create and start virtual threads using the builder:

```java
var builder = Thread.ofVirtual().name("virtual-", 0);

Thread t1 = builder.start(new VirtualTask());
Thread t2 = builder.start(new VirtualTask());

t1.join();
t2.join();
```

### ❓ What's happening here?

- `Thread.ofVirtual()` returns a virtual thread builder
- `.name("virtual-", 0)` sets a naming pattern — threads will be named `virtual-0`, `virtual-1`, `virtual-2`, etc.
- `.start(runnable)` creates the thread and **immediately starts** it
- **We must call `join()`** to wait for the threads to finish (because they're daemon threads)

### 🧪 Output

```
Started: virtual-0
Started: virtual-1
Finished: virtual-0
Finished: virtual-1
```

---

## Concept 3: Approach 2 — Using the Thread Factory

### ⚙️ How it works

Instead of `start()`, you can use `factory()` to get a `ThreadFactory`, then call `newThread()`:

```java
var factory = Thread.ofVirtual().name("virtual-", 0).factory();

Thread t1 = factory.newThread(new VirtualTask());
Thread t2 = factory.newThread(new VirtualTask());

t1.start();
t2.start();

t1.join();
t2.join();
```

### ❓ What's the difference?

With the builder's `start()` method, the thread is created **and** started immediately. With the factory's `newThread()` method, the thread is **only created** — you have to call `start()` yourself.

Use the factory approach when you need to:
- Configure the thread before starting it
- Control the exact timing of when threads begin executing

---

## Concept 4: Using Method References

### 💡 Cleaner syntax with `::`

If your task is a `void` method, you can use method references instead of explicitly creating a `Runnable`:

```java
public class App {
    public static void run() {
        System.out.println("Started: " + Thread.currentThread().getName());
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("Finished: " + Thread.currentThread().getName());
    }

    public static void main(String[] args) throws InterruptedException {
        var builder = Thread.ofVirtual().name("virtual-", 0);

        Thread t1 = builder.start(App::run);
        Thread t2 = builder.start(App::run);

        t1.join();
        t2.join();
    }
}
```

The `App::run` method reference is automatically treated as a `Runnable` because `run()` is a void method with no parameters — matching the `Runnable` functional interface.

---

## Summary

| Approach | Creates Thread | Starts Thread | Needs `join()` |
|----------|---------------|---------------|----------------|
| `builder.start(task)` | ✅ | ✅ (immediate) | ✅ |
| `factory.newThread(task)` | ✅ | ❌ (manual `start()`) | ✅ |

✅ **Key Takeaway:** Virtual threads are created using `Thread.ofVirtual()`. They are always daemon threads, so you **must** call `join()` or use another mechanism to wait for them — otherwise the JVM will exit before they complete.

⚠️ **Common Mistake:** Forgetting to `join()` virtual threads. If your program exits instantly with no output, this is almost certainly the reason.

💡 **Pro Tip:** Don't pool virtual threads. They're so lightweight that you should create a new one for every task and let it be garbage collected when done. In the next lecture, we'll see an even more elegant approach using `ExecutorService`.
