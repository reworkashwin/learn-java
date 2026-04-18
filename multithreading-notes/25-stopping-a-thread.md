# Stopping a Thread

## Introduction

How do you stop a thread in Java? You might think there's a `stop()` method — and there is — but it's **deprecated** because it's inherently unsafe. So what's the correct way?

---

## Concept 1: Why Not Thread.stop()?

The `Thread.stop()` method is deprecated in the Java documentation (oracle.com). It was dangerous because:

- It could **abruptly** terminate a thread in the middle of a critical operation
- It could leave shared data in an **inconsistent state**
- It could release locks unexpectedly, causing other threads to see corrupted data

❌ **Never use `Thread.stop()`.**

---

## Concept 2: The Correct Approach — Boolean Flag

The proper way to stop a thread is to use a **volatile boolean flag** that the thread checks periodically:

```java
class Worker implements Runnable {
    private volatile boolean terminated = false;

    @Override
    public void run() {
        while (!terminated) {
            // do work
            System.out.println("Working...");
            try { Thread.sleep(500); } catch (InterruptedException e) {}
        }
    }

    public void setTerminated(boolean terminated) {
        this.terminated = terminated;
    }
}
```

### ⚙️ How it works

1. The thread's `run()` method checks the `terminated` flag in every loop iteration
2. When another thread sets `terminated = true`, the worker thread sees the change and **exits gracefully**
3. The `volatile` keyword ensures the flag is **not cached** by any CPU — changes are immediately visible

### 🧪 Usage

```java
Worker worker = new Worker();
Thread t1 = new Thread(worker);
t1.start();

Thread.sleep(3000);  // let it run for 3 seconds
worker.setTerminated(true);  // signal the thread to stop
```

✅ **Key Takeaway:** The thread decides **when** and **how** to stop — it's a cooperative mechanism, not a forced kill.

⚠️ **Common Mistake:** Forgetting the `volatile` keyword on the flag. Without it, the worker thread's CPU may cache the variable and never see the update.

💡 **Pro Tip:** This is the standard pattern for graceful thread termination in Java. You'll see it everywhere — from simple worker threads to complex server applications.

---

## Summary

- `Thread.stop()` is deprecated — never use it
- Use a **volatile boolean flag** that the thread checks periodically
- The `volatile` keyword is **absolutely crucial** — it prevents CPU caching
- The thread stops **cooperatively** by exiting its `run()` method naturally
- This is the standard, safe way to stop a thread in Java
