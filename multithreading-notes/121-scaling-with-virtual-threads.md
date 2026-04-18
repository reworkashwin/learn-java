# Scaling with Virtual Threads

## Introduction

We've learned how virtual threads work, how to create them, and how structured concurrency manages them. Now let's step back and understand the **big picture**: how do virtual threads help us **scale** applications in production, and how do they compare to traditional scaling approaches?

---

## Concept 1: Vertical Scaling

### 🧠 What is vertical scaling?

Vertical scaling means adding **more resources** to a single machine — more CPU cores, more RAM, faster disks.

```
Before:  [Service] → 2 CPU, 4GB RAM → handles 200 req/s
After:   [Service] → 8 CPU, 32GB RAM → handles 800 req/s
```

### ✅ Pros
- Simple — no architectural changes needed
- No data synchronization issues

### ⚠️ Cons
- There's a physical ceiling — you can't add infinite resources to one machine
- Expensive — high-end hardware costs disproportionately more
- Single point of failure

---

## Concept 2: Horizontal Scaling

### 🧠 What is horizontal scaling?

Horizontal scaling means adding **more instances** of the same service, distributing the load across them.

```
Before:  [Service Instance 1] → handles 200 req/s

After:   [Service Instance 1] ─┐
         [Service Instance 2] ─┤→ Load Balancer → handles 800 req/s
         [Service Instance 3] ─┤
         [Service Instance 4] ─┘
```

### ✅ Pros
- Theoretically unlimited scaling
- Redundancy — if one instance dies, others handle the load

### ⚠️ Cons
- More complex architecture
- Data consistency challenges — multiple instances may share databases
- More expensive with cloud providers — each instance costs money

---

## Concept 3: The Hidden Scaling Problem — Thread Efficiency

### ❓ Before scaling out, are you using your threads efficiently?

Here's a fact that most developers overlook: the typical Java web server (like Tomcat) handles about **200 threads** at a time. Each HTTP request gets its own thread.

With **platform threads**, most of these threads spend their time **blocked on I/O**:

```
Thread 1: [handle request] [wait for DB......] [process] [wait for API......] [respond]
Thread 2: [handle request] [wait for DB......] [process] [respond]
                            ^^^^^^^^^^^^^^^^            ^^^^^^^^^^^^^^^^
                            Wasted time — thread is idle, OS thread blocked
```

Out of 200 threads, maybe only 20 are doing actual CPU work at any moment. The other 180 are **waiting**. And you can't create more platform threads because each one consumes ~1MB of stack + an OS thread.

### 💡 The insight

Before spending money on more servers or bigger machines, **use your existing resources better**. Virtual threads let you do exactly that.

---

## Concept 4: Virtual Threads as a Scaling Strategy

### 🧠 How virtual threads change the equation

With **virtual threads**, blocking is no longer a problem:

```
Virtual Thread 1: [handle] [I/O block → JVM unmounts, carrier freed] [resume] [respond]
Virtual Thread 2: [handle] [I/O block → JVM unmounts, carrier freed] [resume] [respond]
...
Virtual Thread 10000: [handle] [I/O] [resume] [respond]
```

While Virtual Thread 1 waits for a database response, its carrier thread is executing other virtual threads. The same 8 carrier threads (one per CPU core) can serve **thousands** of concurrent requests.

### 🧪 The numbers

| Metric | Platform Threads | Virtual Threads |
|--------|-----------------|-----------------|
| Concurrent requests | ~200 | **10,000 – 100,000+** |
| Memory per thread | ~1MB | ~few hundred bytes |
| Blocked thread cost | Wastes OS thread | Free (carrier reused) |
| Thread creation cost | Expensive | Nearly free |

With virtual threads, a single server can handle **10x to 100x** more concurrent requests for I/O-bound workloads — without adding hardware.

---

## Concept 5: The Complete Scaling Toolkit

### 🧠 Putting it all together

You don't have to choose — these strategies complement each other:

```
Level 1: Virtual Threads + Structured Concurrency
         → Maximize throughput on existing hardware
         → "Free" scaling — just change your thread model

Level 2: Vertical Scaling
         → Add more resources when Level 1 isn't enough
         → Simple but has limits

Level 3: Horizontal Scaling
         → Multiple instances with load balancing
         → For massive scale (cloud-native)
```

### 💡 The smart order

1. **First**, switch from platform threads to virtual threads — this is essentially free and can multiply your throughput by 10-100x
2. **Then**, if needed, vertically scale your hardware
3. **Finally**, horizontally scale with multiple instances

Many teams jump straight to horizontal scaling (spinning up more cloud instances, paying more money) when simply adopting virtual threads on their existing infrastructure could handle the load.

---

## Summary

✅ **Key Takeaway:** Virtual threads are a **scaling multiplier**. Before paying for more servers or bigger machines, adopt virtual threads and structured concurrency to handle 10-100x more concurrent I/O-bound requests on existing hardware.

⚠️ **Common Mistake:** Treating virtual threads as a silver bullet for CPU-bound tasks. Virtual threads help with **I/O-bound** workloads (HTTP calls, database queries, file I/O). For CPU-bound tasks, you still need more cores or parallel algorithms.

💡 **Pro Tip:** In Spring Boot 3.2+, you can enable virtual threads with a single config property: `spring.threads.virtual.enabled=true`. Tomcat will then use virtual threads for request handling, potentially multiplying your server's throughput with zero code changes.
