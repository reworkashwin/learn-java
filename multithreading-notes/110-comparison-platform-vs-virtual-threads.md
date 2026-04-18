# Comparison: Platform Threads vs Virtual Threads

## Introduction

Java 21 gave us two types of threads: **platform threads** (the traditional kind) and **virtual threads** (the new lightweight kind). But when should you use which? This section provides a comprehensive side-by-side comparison — covering architecture, performance, resource consumption, and use cases. By the end, you'll know exactly when to reach for each.

---

## Concept 1: Architecture Comparison

### 🧠 Platform Threads

A platform thread is a **thin wrapper around an OS thread**. Creating a platform thread causes the JVM to ask the operating system to create a native thread. The thread lives in the OS kernel, and the OS scheduler decides when it runs.

```
Java Thread → OS Thread → CPU Core
     1    :    1    mapping
```

### 🧠 Virtual Threads

A virtual thread is a **lightweight thread managed entirely by the JVM**. It's not directly mapped to an OS thread. Instead, the JVM schedules virtual threads onto a small pool of **carrier threads** (which are platform threads).

```
Virtual Thread 1 ─┐
Virtual Thread 2 ──┤→ Carrier Thread (Platform Thread) → OS Thread → CPU Core
Virtual Thread 3 ──┤
...               ─┘
```

When a virtual thread blocks (e.g., waiting for I/O), the JVM **unmounts** it from the carrier thread and mounts another virtual thread. The carrier thread is never idle.

---

## Concept 2: Resource Consumption

### ⚙️ Side-by-side

| Resource | Platform Thread | Virtual Thread |
|----------|----------------|---------------|
| **Stack memory** | ~1 MB (fixed) | Starts at ~1 KB (grows as needed) |
| **OS thread** | 1 per thread | Shared pool (few carrier threads) |
| **Creation cost** | Expensive (OS syscall) | Cheap (JVM object allocation) |
| **Max count** | ~2,000–10,000 | **Millions** |
| **Context switch** | Expensive (OS-level) | Cheap (JVM-level) |

### 🧪 Demonstration

```java
// Platform threads — this will crash or slow to a crawl
for (int i = 0; i < 1_000_000; i++) {
    Thread.ofPlatform().start(() -> {
        Thread.sleep(Duration.ofSeconds(10));
    });
}
// OutOfMemoryError: unable to create native thread

// Virtual threads — handles millions easily
for (int i = 0; i < 1_000_000; i++) {
    Thread.ofVirtual().start(() -> {
        Thread.sleep(Duration.ofSeconds(10));
    });
}
// Works fine — millions of virtual threads sleeping
```

### 💡 Insight

A typical server might have 16 GB of RAM. With platform threads using 1 MB each, you can create ~16,000 threads. With virtual threads using 1 KB each, you can create **16 million**. That's a 1000× improvement in concurrency capacity.

---

## Concept 3: Performance Characteristics

### ⚙️ I/O-bound workloads (HTTP calls, database queries)

| Metric | Platform Threads | Virtual Threads |
|--------|-----------------|----------------|
| Throughput | Limited by thread count | Limited by I/O bandwidth |
| Concurrent requests | ~2,000 | ~1,000,000+ |
| Blocking behavior | Wastes OS thread | Unmounts, carrier is reused |

Virtual threads **dominate** in I/O-bound scenarios. When a platform thread waits for a database response, it does nothing — wasting memory and an OS thread slot. A virtual thread unmounts and lets another virtual thread use the carrier.

### ⚙️ CPU-bound workloads (computation, sorting, encryption)

| Metric | Platform Threads | Virtual Threads |
|--------|-----------------|----------------|
| Throughput | Full CPU utilization | Same (both use CPU cores) |
| Benefit | Standard | **No advantage** |

For CPU-bound work, virtual threads provide **no benefit** — and may even have slight overhead from the JVM scheduling layer. Use platform threads (or the Fork-Join framework) for computation-heavy tasks.

---

## Concept 4: Blocking Behavior — The Key Difference

### 🧠 Platform threads: blocking wastes resources

```java
// Platform thread pool with 200 threads
ExecutorService exec = Executors.newFixedThreadPool(200);

// Submit 10,000 tasks that each block for 1 second
for (int i = 0; i < 10_000; i++) {
    exec.submit(() -> {
        Thread.sleep(1000);  // Platform thread is blocked — wasted
        return result;
    });
}
// Only 200 tasks run at a time. Total time ≈ 50 seconds
```

### 🧠 Virtual threads: blocking is cheap

```java
// Virtual thread executor — unlimited virtual threads
ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor();

// Submit 10,000 tasks that each block for 1 second
for (int i = 0; i < 10_000; i++) {
    exec.submit(() -> {
        Thread.sleep(1000);  // Virtual thread unmounts — carrier is free
        return result;
    });
}
// All 10,000 tasks run nearly simultaneously. Total time ≈ 1 second
```

### 💡 Why this is revolutionary

In a microservice architecture, a typical request handler makes 3-5 blocking I/O calls. With platform threads, each request ties up a thread for the entire duration. With virtual threads, blocked threads are parked for free — the carrier thread handles other requests.

---

## Concept 5: Thread Pooling Strategy

### ⚠️ Platform threads: pooling is essential

Creating platform threads is expensive. You **must** use thread pools to reuse them:

```java
// Essential for platform threads
ExecutorService pool = Executors.newFixedThreadPool(200);
```

### ⚠️ Virtual threads: do NOT pool

Virtual threads are so cheap to create that pooling them is **wasteful and counterproductive**:

```java
// CORRECT — one virtual thread per task
ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor();

// WRONG — defeats the purpose of virtual threads
ExecutorService pool = Executors.newFixedThreadPool(200);  // with virtual threads? NO
```

Pooling limits concurrency. The entire point of virtual threads is unbounded concurrency.

---

## Concept 6: When to Use Each

### ⚙️ Decision matrix

| Workload | Best Choice | Why |
|----------|-------------|-----|
| HTTP server handling requests | Virtual threads | Requests involve I/O blocking |
| Database-heavy application | Virtual threads | DB calls are I/O-bound |
| Microservice communication | Virtual threads | HTTP calls to other services |
| CPU-intensive computation | Platform threads | Need full CPU core access |
| Parallel sorting/searching | Fork-Join / Platform threads | CPU-bound divide-and-conquer |
| Real-time low-latency | Platform threads | Predictable scheduling |
| Legacy code with `synchronized` | Platform threads | Virtual thread pinning issues |

---

## ✅ Key Takeaways

- Platform threads map 1:1 to OS threads — heavy, limited to thousands
- Virtual threads are JVM-managed — lightweight, scale to millions
- Virtual threads excel at **I/O-bound** workloads (HTTP, database, file I/O)
- Platform threads are better for **CPU-bound** computation
- **Do not pool** virtual threads — create one per task
- When a virtual thread blocks, the carrier thread is freed for other work
- Virtual threads will not make CPU-bound code faster — they're about **concurrency**, not **parallelism**
