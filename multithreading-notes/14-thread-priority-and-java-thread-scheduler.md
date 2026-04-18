# Thread Priority and Java Thread Scheduler

## Introduction

When you have multiple threads in an application, who decides which one runs first? That's the job of the **thread scheduler** — a component within the JVM that determines execution order. Java lets you influence this ordering through **thread priorities**, but as we'll discover, these priorities are more of a *suggestion* than a *guarantee*.

---

## Concept 1: The Thread Scheduler

### 🧠 What is it?

The thread scheduler is a part of the JVM that decides which thread gets CPU time and in what order. Since a single CPU core can only execute one thread at a time, the scheduler uses a **queue** and the **time-slicing algorithm** to rotate through threads.

### ⚙️ How it works

- If all threads have equal priority, they execute in **first-in, first-served (FIFO)** order
- The time-slicing algorithm gives each thread a small slice of CPU time (~10 ms), then switches to the next
- Threads with higher priority **should** get more CPU time — but this depends on the OS

---

## Concept 2: Thread Priority Values

### 🧠 What is it?

Every Java thread has an integer priority value between **1 and 10**:

| Constant | Value | Meaning |
|---|---|---|
| `Thread.MIN_PRIORITY` | 1 | Lowest priority |
| `Thread.NORM_PRIORITY` | 5 | Default priority |
| `Thread.MAX_PRIORITY` | 10 | Highest priority |

If you don't set a priority, your thread gets the default value of **5**.

### ⚙️ How to use it

```java
// Check main thread's priority
System.out.println(Thread.currentThread().getName());     // "main"
System.out.println(Thread.currentThread().getPriority());  // 5

// Set custom priorities
Thread t1 = new Thread(task, "Low-Priority");
t1.setPriority(Thread.MIN_PRIORITY);   // 1

Thread t2 = new Thread(task, "Normal-Priority");
t2.setPriority(Thread.NORM_PRIORITY);  // 5

Thread t3 = new Thread(task, "High-Priority");
t3.setPriority(Thread.MAX_PRIORITY);   // 10
```

### ⚠️ Important

Setting a priority **outside** the range 1–10 throws an `IllegalArgumentException`.

---

## Concept 3: Priority in Practice — The Surprise

### 🧪 Example

```java
class Task implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + " count: " + i);
            Thread.sleep(100);
        }
    }
}

// Create threads with different priorities
Thread low = new Thread(new Task(), "Low-Priority");
Thread normal = new Thread(new Task(), "Normal-Priority");
Thread high = new Thread(new Task(), "High-Priority");

low.setPriority(Thread.MIN_PRIORITY);
normal.setPriority(Thread.NORM_PRIORITY);
high.setPriority(Thread.MAX_PRIORITY);

low.start();
normal.start();
high.start();
```

### ❓ What do you expect?

You'd expect the high-priority thread to execute first, then normal, then low. But if you run this multiple times, you'll see **non-deterministic** behavior — sometimes the low-priority thread runs first!

---

## Concept 4: Why Priorities Don't Work as Expected

### 🧠 The OS controls scheduling

Thread priorities in Java are just **hints** to the operating system. The JVM passes the priority to the OS, but the OS is free to ignore or reinterpret it.

### ⚙️ Why this happens

1. **OS-dependent behavior** — Different operating systems handle priorities differently:
   - **Windows**: Priorities may have slightly more effect
   - **Linux/macOS**: Priorities are often **ignored** or mapped differently

2. **Modern scheduling algorithms** — Most OSes use preemptive multilevel queue schedulers that don't strictly respect Java-level priorities

3. **Thread starvation prevention** — Even low-priority threads get some CPU time to prevent starvation. The OS won't let a thread wait forever.

### 💡 Insight

Think of thread priorities like a "preferred boarding" pass at an airport. It gives you higher *probability* of boarding early, but the airline (OS) ultimately decides the order, and they won't leave a passenger stranded on the tarmac forever.

---

## Key Takeaways

- ✅ Thread priorities range from **1** (MIN) to **10** (MAX), with **5** as the default
- ✅ The thread scheduler uses a queue and time-slicing to manage multiple threads
- ✅ Higher-priority threads have a *higher probability* of being scheduled — not a guarantee
- ⚠️ Thread priority behavior is **OS-dependent** and largely non-deterministic
- ⚠️ Never rely on thread priorities for correctness — use them only as optimization hints
- 💡 On Linux and macOS, priorities are often ignored entirely — don't build application logic around them
