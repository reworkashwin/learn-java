# Deadlock — Example and Prevention

## Introduction

Deadlock is one of the most dangerous problems in concurrent programming. It happens when two or more threads are **stuck forever**, each waiting for the other to release a lock. In this section, we'll create a deadlock on purpose, understand why it happens, and then fix it.

---

## Concept 1: Creating a Deadlock

### 🧠 The setup

We need **two locks** and **two threads**, each acquiring them in the **opposite order**:

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class Deadlock {
    private Lock lock1 = new ReentrantLock(true);
    private Lock lock2 = new ReentrantLock(true);

    public void worker1() {
        lock1.lock();
        System.out.println("Worker1 acquires lock1");
        
        try { Thread.sleep(300); } catch (InterruptedException e) {}
        
        lock2.lock();
        System.out.println("Worker1 acquires lock2");
        
        lock1.unlock();
        lock2.unlock();
    }

    public void worker2() {
        lock2.lock();
        System.out.println("Worker2 acquires lock2");
        
        try { Thread.sleep(300); } catch (InterruptedException e) {}
        
        lock1.lock();
        System.out.println("Worker2 acquires lock1");
        
        lock2.unlock();
        lock1.unlock();
    }
}
```

### 🧪 Starting the threads (Java 8+ lambda style)

```java
Deadlock deadlock = new Deadlock();

new Thread(deadlock::worker1, "worker1").start();
new Thread(deadlock::worker2, "worker2").start();
```

💡 The `deadlock::worker1` syntax is a **method reference** — a concise way to pass a method as a `Runnable` without writing a full anonymous class.

### 🔥 What happens?

```
Worker1 acquires lock1
Worker2 acquires lock2
```

And then... **nothing**. The application hangs forever.

- Worker1 holds `lock1`, waiting for `lock2`
- Worker2 holds `lock2`, waiting for `lock1`
- Neither can proceed → **deadlock**

---

## Concept 2: Why Does This Happen?

### 🔄 Cyclic Dependency

The root cause is a **cyclic dependency** in lock acquisition order:

```
Worker1: lock1 → lock2
Worker2: lock2 → lock1
```

Each thread holds one lock and needs the other — forming a **cycle** where neither can make progress.

This is one of the four **necessary conditions for deadlock** (Coffman conditions):
1. **Mutual exclusion** — only one thread can hold a lock
2. **Hold and wait** — a thread holds one lock while waiting for another
3. **No preemption** — locks can't be forcibly taken away
4. **Circular wait** — threads form a cycle of dependencies

---

## Concept 3: Fixing the Deadlock

### ⚙️ The fix: Consistent lock ordering

If **both threads acquire locks in the same order**, there can be no cycle:

```java
public void worker2() {
    lock1.lock();  // same order as worker1
    System.out.println("Worker2 acquires lock1");
    
    try { Thread.sleep(300); } catch (InterruptedException e) {}
    
    lock2.lock();  // same order as worker1
    System.out.println("Worker2 acquires lock2");
    
    lock1.unlock();
    lock2.unlock();
}
```

Now both workers acquire `lock1` first, then `lock2`. The result:

```
Worker1 acquires lock1
Worker1 acquires lock2
Worker2 acquires lock1
Worker2 acquires lock2
```

No deadlock — the application completes normally.

✅ **Key Takeaway:** To prevent deadlocks, ensure every thread acquires locks in the **same global order**.

---

## Concept 4: Other Deadlock Prevention Strategies

Beyond consistent ordering, `ReentrantLock` offers additional tools:

| Strategy | How |
|---|---|
| **Consistent ordering** | All threads acquire locks in the same order |
| **tryLock() with timeout** | Back off if lock isn't available within a time limit |
| **lockInterruptibly()** | Allow the thread to be interrupted while waiting |
| **Lock-free algorithms** | Use atomic variables instead of locks |

⚠️ **Common Mistake:** Deadlocks can be subtle. In real applications, the lock ordering issue might span multiple classes and methods, making it hard to spot. Always document lock acquisition order.

---

## Summary

- Deadlock occurs when threads hold locks and wait for each other in a **circular** fashion
- The fix is simple: ensure all threads acquire locks in the **same order**
- `ReentrantLock` provides `tryLock()` and `lockInterruptibly()` as additional safety nets
- The application will **hang forever** in a deadlock — it won't crash or throw an exception
- Always think about lock ordering when designing concurrent systems
