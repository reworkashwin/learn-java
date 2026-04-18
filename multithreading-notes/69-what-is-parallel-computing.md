# What Is Parallel Computing?

## Introduction

We've been working with multithreading — running multiple threads within a single process. Now we step back and look at the **bigger picture**: parallel computing. What exactly does it mean to do things "in parallel"? How does it relate to concurrency? And why does it matter for real-world applications? Understanding these foundations will make everything else — parallel merge sort, the Fork-Join framework, parallel streams — click into place.

---

## Concept 1: Concurrency vs Parallelism

### 🧠 What's the difference?

These two terms are often used interchangeably, but they mean different things:

**Concurrency** = Multiple tasks making progress over the same time period. They may or may not execute simultaneously.

**Parallelism** = Multiple tasks executing **at the exact same time** on different processors.

### 💡 Real-World Analogy

- **Concurrency**: A single chef preparing two dishes by switching between them — chopping vegetables for dish A, then stirring sauce for dish B, then back to dish A. Both dishes make progress, but only one is being worked on at any instant.
- **Parallelism**: Two chefs, each preparing a different dish simultaneously. Both dishes are being actively worked on at the same time.

### ⚙️ On a single-core CPU

Concurrency is **possible** — the OS time-slices between threads, creating the **illusion** of simultaneous execution.

Parallelism is **impossible** — with one core, only one instruction executes at a time.

### ⚙️ On a multi-core CPU

Both concurrency and parallelism are possible. Multiple cores can execute different threads truly simultaneously.

```
Single-core (concurrency):
|--Thread A--|--Thread B--|--Thread A--|--Thread B--|
             ↑ time-slicing

Multi-core (parallelism):
Core 1: |---Thread A---|---Thread A---|
Core 2: |---Thread B---|---Thread B---|
         ↑ truly simultaneous
```

---

## Concept 2: Types of Parallelism

### 🧠 Data Parallelism

The **same operation** is applied to **different chunks of data** simultaneously.

Example: Summing a billion numbers by splitting the array across 8 cores, each core summing its portion.

```
Array: [1, 2, 3, 4, 5, 6, 7, 8]

Core 1: sum(1, 2) = 3
Core 2: sum(3, 4) = 7
Core 3: sum(5, 6) = 11
Core 4: sum(7, 8) = 15

Final: 3 + 7 + 11 + 15 = 36
```

This is the most common type in scientific computing, image processing, and machine learning.

### 🧠 Task Parallelism

**Different operations** are performed simultaneously on the same or different data.

Example: In a web server, one thread handles a login request while another serves a product page — completely different tasks running in parallel.

```
Core 1: [Sorting algorithm]
Core 2: [Database query]
Core 3: [Image rendering]
Core 4: [Network I/O]
```

---

## Concept 3: Why Parallel Computing Matters

### ❓ Can't we just make CPUs faster?

For decades, processor clock speeds doubled roughly every 18 months (Moore's Law). But around 2005, this hit a wall — **thermal limits**. Faster clocks generate more heat, and we can't cool them efficiently enough.

The industry's solution: instead of one faster core, put **multiple cores** on a single chip. To exploit this, software must be written to run tasks in parallel.

### ⚙️ The modern reality

| Year | Typical Desktop | Cores |
|------|----------------|-------|
| 2000 | Single-core | 1 |
| 2005 | Dual-core | 2 |
| 2010 | Quad-core | 4 |
| 2015 | 4-8 cores | 4-8 |
| 2020 | 8-16 cores | 8-16 |
| 2024 | 8-24 cores | 8-24 |

A program running on a single thread uses **one core out of 16**. That's wasting 93.75% of the available computing power.

### 💡 Insight

Sequential programs don't get faster with more cores. **Only parallel programs benefit from multi-core hardware.** This is why parallel computing is no longer optional — it's essential.

---

## Concept 4: Challenges of Parallel Computing

### ⚠️ Not everything can be parallelized

Some tasks are **inherently sequential**. You can't read chapter 2 of a book before chapter 1 if chapter 2 depends on information from chapter 1.

**Amdahl's Law** quantifies this: if a fraction `f` of a program is sequential, the maximum speedup with `N` processors is:

$$S = \frac{1}{f + \frac{1-f}{N}}$$

Even with infinite processors, if 10% of the program is sequential, the maximum speedup is **10×**.

### ⚠️ Coordination overhead

Parallel threads need to communicate:
- **Splitting work** takes time
- **Merging results** takes time
- **Synchronization** (locks, barriers) introduces waiting

If the overhead exceeds the benefit, parallel execution is **slower** than sequential.

### ⚠️ Race conditions and correctness

When multiple threads access shared data, **race conditions** can produce incorrect results. Preventing them requires synchronization, which adds complexity and can reduce parallelism.

---

## Concept 5: Parallelism in Java

### ⚙️ Java's parallel computing tools

Java provides multiple levels of abstraction for parallel computing:

| Tool | Level | Use Case |
|------|-------|----------|
| `Thread` class | Low-level | Full control, maximum complexity |
| `ExecutorService` | Mid-level | Thread pool management |
| **Fork-Join framework** | Mid-level | Divide and conquer problems |
| **Parallel Streams** | High-level | Data-parallel operations on collections |
| **Virtual Threads** (Java 21) | High-level | Massive I/O-bound concurrency |

As we progress through the course, we'll use increasingly higher-level abstractions — letting the framework handle thread management while we focus on the algorithm.

---

## ✅ Key Takeaways

- **Concurrency** = tasks making progress over the same period; **Parallelism** = tasks executing simultaneously
- True parallelism requires **multiple cores** — single-core CPUs can only simulate concurrency via time-slicing
- **Data parallelism** splits data across cores; **Task parallelism** runs different functions on different cores
- Sequential programs waste multi-core hardware — parallel computing is essential for performance
- Not everything can be parallelized — **Amdahl's Law** sets a theoretical upper limit on speedup
- Coordination overhead can make parallel programs slower if the problem is too small
