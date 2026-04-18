# Daemon Threads and User Threads

## Introduction

Not all threads are created equal. Java distinguishes between two categories of threads: **user threads** (foreground) and **daemon threads** (background). Understanding this distinction is critical because it directly affects when the JVM shuts down. Let's explore the three types of threads and see exactly how daemon threads behave differently.

---

## Concept 1: User Threads

### 🧠 What is it?

A user thread is a standard thread that performs the main work of your application. It's what we've been creating in all previous lectures — the "regular" threads.

### ⚙️ How to create them

**Option 1 — Implement `Runnable`:**
```java
class Worker implements Runnable {
    @Override
    public void run() {
        // task logic
    }
}
```

**Option 2 — Extend `Thread`:**
```java
class Worker extends Thread {
    @Override
    public void run() {
        // task logic
    }
}
```

### 💡 Key characteristic

User threads are **foreground threads with high priority**. The JVM will **not** terminate while any user thread is still running. It waits for every user thread to complete before shutting down.

---

## Concept 2: Worker Threads

### 🧠 What is it?

Worker threads are a specialized form of user threads that perform specific tasks, often managed within a **thread pool**. They're commonly created via `ExecutorService` — a framework we'll explore in later lectures.

### ❓ Why do they exist?

In real-world applications like web servers, you don't create a new thread for every request. Instead, you create a fixed pool of worker threads and distribute tasks among them. This is far more efficient.

### 💡 Insight

Worker threads and user threads are conceptually very similar — many resources treat them as the same thing. The key difference is that worker threads are typically **pool-managed** rather than individually created.

---

## Concept 3: Daemon Threads

### 🧠 What is it?

A daemon thread is a **background support thread**. It provides services to user threads — things like garbage collection, memory monitoring, or background cleanup. The critical difference: **the JVM does not wait for daemon threads to finish before shutting down**.

### ⚙️ How to create a daemon thread

```java
Thread t = new Thread(new MyWorker());
t.setDaemon(true);  // must be called BEFORE start()
t.start();
```

You can check whether a thread is a daemon:
```java
System.out.println(t.isDaemon());  // true or false
```

### 🧪 Example — Seeing the difference in action

**Normal (user) thread with infinite loop:**
```java
class NormalWorker implements Runnable {
    @Override
    public void run() {
        while (true) {
            Thread.sleep(1000);
            System.out.println("Executing the normal thread...");
        }
    }
}
```
If you start this thread, the application **never terminates** — because the JVM waits for user threads.

**Daemon thread with infinite loop:**
```java
class DaemonWorker implements Runnable {
    @Override
    public void run() {
        while (true) {
            Thread.sleep(100);
            System.out.println("Executing the daemon thread...");
        }
    }
}
```

Now combine them:
```java
Thread t1 = new Thread(new NormalWorker());  // user thread
Thread t2 = new Thread(new DaemonWorker());
t2.setDaemon(true);                          // daemon thread

t1.start();
t2.start();
```

### ⚙️ What happens?

1. Both threads start executing
2. The normal worker prints once, then finishes (no infinite loop in this version — just a single print + sleep)
3. Once the normal worker completes, the only remaining thread is the daemon
4. **The JVM immediately terminates the daemon thread and exits**

The daemon thread's infinite loop doesn't matter — it gets killed the moment no user threads remain.

---

## Concept 4: Side-by-Side Comparison

| Property | User / Worker Thread | Daemon Thread |
|---|---|---|
| **Purpose** | Core application tasks | Background support tasks |
| **JVM behavior** | Waits for completion | Terminates when no user threads remain |
| **Default** | All threads are user threads by default | Must explicitly call `setDaemon(true)` |
| **Priority** | Higher (foreground) | Lower (background) |
| **Examples** | Main thread, request handlers | GC threads, timer threads, monitors |

---

## Key Takeaways

- ✅ **User threads** perform core work — the JVM waits for them to finish
- ✅ **Daemon threads** are background helpers — the JVM kills them when no user threads remain
- ✅ All threads are user threads **by default** — you must explicitly set daemon with `setDaemon(true)`
- ⚠️ Call `setDaemon(true)` **before** `start()` — setting it after the thread has started throws an `IllegalThreadStateException`
- ⚠️ Never perform critical operations (like writing to a file) in daemon threads — they can be terminated abruptly without cleanup
- 💡 The GC-related threads you saw when listing JVM threads? Those are all daemon threads
