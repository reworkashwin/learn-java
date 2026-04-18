# Starting Threads — Runnable Interface

## Introduction

In the previous lecture, we saw that Java executes code sequentially — Runner 1 finishes completely before Runner 2 even starts. Now let's fix that. We'll create **actual threads** using the `Runnable` interface and see true concurrent execution with the time-slicing algorithm.

---

## Approach 1: Implementing the Runnable Interface

### 🧠 What is Runnable?

`Runnable` is a **functional interface** in `java.lang` that contains a single method: `run()`. Any class that implements `Runnable` can be executed by a thread.

### ⚙️ Step-by-step

**Step 1:** Make your classes implement `Runnable` and override the `run()` method.

```java
class Runner1 implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 10; i++) {
            System.out.println("Runner1 - " + i);
        }
    }
}

class Runner2 implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 10; i++) {
            System.out.println("Runner2 - " + i);
        }
    }
}
```

💡 **Key Point:** Everything inside the `run()` method is what the thread will execute. This is the thread's **task**.

**Step 2:** Create `Thread` objects, passing the `Runnable` to the constructor.

```java
public static void main(String[] args) {
    var t1 = new Thread(new Runner1());
    var t2 = new Thread(new Runner2());

    t1.start();
    t2.start();
}
```

### ❓ What does `start()` do?

When you call `start()`:
1. It **allocates system resources** for the new thread
2. It creates a **new call stack** for the thread
3. It calls the `run()` method in that new call stack

⚠️ **Common Mistake:** Calling `run()` directly instead of `start()`. If you call `run()`, it executes in the **current thread** — no new thread is created. Always use `start()`.

### 🧪 Output

```
Runner2 - 0
Runner1 - 0
Runner2 - 1
Runner1 - 1
Runner2 - 2
Runner1 - 2
...
```

The output is **interleaved** — both runners execute concurrently via the time-slicing algorithm. The exact order varies between runs because the OS thread scheduler decides when to switch between threads.

---

## Approach 2: Lambda Expressions

### 🧠 What's the idea?

Since `Runnable` is a **functional interface** (it has only one abstract method), we can define it using a **lambda expression** instead of creating a separate class.

### 🧪 Code

```java
public static void main(String[] args) {
    Runnable r1 = () -> {
        for (int i = 0; i < 10; i++) {
            System.out.println("Runner1 - " + i);
        }
    };

    Runnable r2 = () -> {
        for (int i = 0; i < 10; i++) {
            System.out.println("Runner2 - " + i);
        }
    };

    var t1 = new Thread(r1);
    var t2 = new Thread(r2);

    t1.start();
    t2.start();
}
```

### ⚙️ Same result, different style

This produces the **exact same concurrent behavior** as Approach 1. The difference is purely syntactical:
- **Approach 1** — separate classes implementing `Runnable` (more explicit, easier to read)
- **Approach 2** — inline lambda expressions (more concise, modern Java style)

💡 **Pro Tip:** For complex tasks, prefer separate classes. For simple one-off tasks, lambdas are cleaner.

---

## What's Actually Happening Under the Hood?

```
Main Thread:  creates t1, creates t2, calls t1.start(), calls t2.start()
                                          │                    │
                                          ▼                    ▼
Thread 1:     [Runner1 - 0] [Runner1 - 1] ... [Runner1 - 9]
Thread 2:     [Runner2 - 0] [Runner2 - 1] ... [Runner2 - 9]
```

- The **main thread** creates and starts both threads
- The CPU uses **time-slicing** to alternate between Thread 1 and Thread 2
- Both threads run concurrently — neither waits for the other

---

## ✅ Key Takeaways

- Implement `Runnable` and put your task logic inside the `run()` method
- Create a `Thread` object, passing your `Runnable` to the constructor
- Call `start()` (not `run()`) to launch the thread
- `Runnable` is a functional interface — you can use **lambda expressions** as an alternative
- The output order is **non-deterministic** — the thread scheduler decides the execution order

⚠️ **Remember:** `start()` creates a new thread. `run()` just calls the method on the current thread.

---

## What's Next?

We now have threads running concurrently — but the main thread doesn't wait for them to finish. What if we need results from a thread before continuing? That's where the **`join()` method** comes in.
