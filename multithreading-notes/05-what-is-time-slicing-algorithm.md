# What is the Time-Slicing Algorithm?

## Introduction

We know that applications can have multiple threads. But here's the fundamental question: if a computer has only **one processor**, how does it handle multiple threads at the same time?

The answer is the **time-slicing algorithm** — a clever technique that creates the *illusion* of simultaneous execution.

---

## The Problem: One CPU, Many Threads

Suppose your application has `k` threads that all need to run. But there's only **one** CPU. How does the CPU handle all of them?

It can't truly run them all at once — it only has one processing core. So it uses a scheduling strategy.

---

## Concept 1: Time-Slicing Algorithm

### 🧠 What is it?

The time-slicing algorithm **shares the processing time** of a single CPU among multiple threads by rapidly switching between them.

### ⚙️ How it works

With two threads and one CPU:

```
Time →
CPU:  [Thread 1] [Thread 2] [Thread 1] [Thread 2] [Thread 1] ...
```

1. The CPU executes **Thread 1** for a short time period
2. It **pauses** Thread 1 and switches to **Thread 2**
3. It executes Thread 2 for a short time period
4. It **pauses** Thread 2 and switches back to **Thread 1**
5. This cycle continues until both threads complete

### 💡 Key Insight

While one thread is being executed, the other thread **must wait**. The CPU switches so fast that it *appears* as if both threads are running simultaneously — but they're actually taking turns.

💡 **Real-world analogy:** Imagine a chef who is cooking two dishes. They stir dish A for a minute, then switch to dish B, then back to A. The chef is only working on one dish at a time, but both dishes are progressing.

---

## Concept 2: True Parallelism with Multiple Processors

### 🧠 What happens with multiple CPUs?

Modern computers have **multiple processor cores** (e.g., 4, 8, or even 18 cores). When multiple cores are available:

```
CPU 1:  [Thread 1] ──────────────────────→
CPU 2:  [Thread 2] ──────────────────────→
```

- The OS assigns each thread to a **different CPU core**
- Both threads execute **truly simultaneously** — this is called **parallelism**
- No time-slicing is needed

### ❓ When is time-slicing still used?

If the number of threads **exceeds** the number of available processors, then the OS falls back to time-slicing for the extra threads.

For example, with 2 CPUs and 5 threads:
- CPU 1 handles Threads 1, 3, 5 (using time-slicing)
- CPU 2 handles Threads 2, 4 (using time-slicing)

---

## A Common Student Question

> "I'm using multithreading, but my threads seem to run in parallel — not interleaved. Why?"

**Answer:** Your computer has multiple CPU cores. The OS assigns each thread to a separate core, so they truly run in parallel. The time-slicing algorithm is only needed when threads outnumber available processors.

---

## ✅ Key Takeaways

- **Time-slicing** allows a single CPU to handle multiple threads by rapidly switching between them
- While one thread runs, others **wait** — the switching is so fast it looks simultaneous
- **Multiple CPUs** enable true **parallelism** — threads run at the exact same time on different cores
- If threads outnumber CPUs, the OS uses time-slicing to share CPU time
- Understanding this distinction between **concurrency** (time-slicing) and **parallelism** (multiple CPUs) is fundamental

---

## What's Next?

Now that we understand *how* threads are executed, let's explore the **benefits of multithreading** — why it's worth the added complexity.
