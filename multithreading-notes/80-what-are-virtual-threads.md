# What Are Virtual Threads?

## Introduction

Virtual threads are one of the most significant additions to the Java platform (introduced as a preview in Java 19 and finalized in Java 21). To understand why they matter, we need to first understand the shift from **monolithic** to **microservice** architectures, and the I/O problem that comes with it.

---

## Concept 1: Monolithic vs Microservice Architecture

### 🧠 Monolithic Architecture

In a monolith, the entire application — all features, services, database code — is built and deployed as a **single unit** (a `.jar` or `.war` file).

**Problems with monoliths:**
- A minor bug in one feature requires redeploying the **entire application**
- During deployment, the whole application is unavailable
- Scaling individual features independently is impossible

### 🧠 Microservice Architecture

The solution: split the monolith into **independent services**, each handling a specific responsibility:

```
Monolith → [Shipping Service] [Inventory Service] [Login Service] [Payment Service]
```

Each service:
- Can be deployed **independently**
- Has its own codebase and database
- Communicates with other services via **HTTP**
- Can be scaled independently based on load

If a bug is found in the Shipping Service, you fix and redeploy just that service — everything else keeps running.

### 💡 Insight

Modern applications (Facebook, Instagram, Netflix) are all microservices under the hood. This is the dominant architecture pattern today.

---

## Concept 2: The I/O Problem in Modern Applications

### 🧠 What's the problem?

In a microservice world, services constantly communicate with:
- **Other microservices** via HTTP calls
- **Databases** via SQL queries
- **External APIs**

All of these are **I/O operations** — and they're **slow**. The application spends most of its time **waiting** for responses.

### 🧪 Example: A typical endpoint

```java
@GetMapping("/vehicles")
public List<Vehicle> getVehicles() {
    User user = vehicleService.fetchUser();     // HTTP call → I/O wait
    validateUser(user);                          // Database query → I/O wait
    List<Vehicle> vehicles = getFromDB();        // Database query → I/O wait
    return vehicles;
}
```

For each request, the thread handling it spends most of its time **blocked**, waiting for I/O:

```
Thread timeline:
[work] [---waiting for HTTP---] [work] [---waiting for DB---] [work] [---waiting for DB---] [done]
        ^^^^^^^^^^^^^^^^^^^^^^^^        ^^^^^^^^^^^^^^^^^^^^^^        ^^^^^^^^^^^^^^^^^^^^^^
              mostly idle                    mostly idle                   mostly idle
```

### ❓ Why is this a problem?

Each request uses a **platform thread** (a real OS thread). Platform threads are expensive:
- Each thread consumes ~1MB of stack memory
- The OS has limits on how many threads it can manage
- An idle thread wastes resources — it can't serve other requests while waiting for I/O

If you have 200 platform threads and they're all blocked on I/O, your server can't handle a 201st request — even though the CPU is barely doing any work.

---

## Concept 3: What Are Virtual Threads?

### 🧠 What is it?

Virtual threads are **lightweight threads** managed by the **JVM** (not the operating system). They look and behave like regular threads from the developer's perspective, but they're fundamentally different under the hood.

### ❓ How are they different from platform threads?

| Feature | Platform Threads | Virtual Threads |
|---------|-----------------|-----------------|
| Managed by | Operating System | JVM |
| Memory per thread | ~1MB | ~few KB |
| Max threads | Thousands | **Millions** |
| I/O blocking behavior | Thread is blocked and idle | Thread is **unmounted** and carrier is freed |
| Cost of creation | Expensive | Very cheap |

### ⚙️ How they work — The Carrier Thread Model

Here's the key insight:

1. Virtual threads are **executed on top of** platform threads (called **carrier threads**)
2. When a virtual thread encounters a **blocking I/O operation**, the JVM **unmounts** the virtual thread from its carrier thread
3. The carrier thread is now **free** to execute other virtual threads
4. When the I/O operation completes, the JVM **mounts** the virtual thread onto an available carrier thread to resume execution

```
Virtual Thread 1:  [work] [I/O wait...............] [work]
                          ↓ unmount    ↑ mount back
Carrier Thread:    [VT1 work] [VT2 work] [VT3 work] [VT1 resume]
```

The carrier thread never sits idle — while VT1 is waiting for I/O, the carrier handles VT2 and VT3.

### 💡 Real-world analogy

Think of carrier threads as **taxi drivers** and virtual threads as **passengers**:

- **Platform threads** = Each passenger gets their own private car. The car (and driver) sit parked and waiting while the passenger is in a meeting.
- **Virtual threads** = Passengers share taxis. When a passenger goes into a meeting (I/O wait), the taxi picks up another passenger. When the first passenger's meeting ends, any available taxi picks them up.

Same number of taxis, but serving far more passengers.

---

## Concept 4: Why Virtual Threads Matter

### 🧠 The throughput revolution

With platform threads, a server handling 200 concurrent I/O-heavy requests needs ~200 threads. With virtual threads, the same server can handle **millions** of concurrent requests because:

- Virtual threads are extremely cheap to create (~few KB each)
- Blocked virtual threads don't waste carrier threads
- The JVM efficiently schedules work across a small pool of carrier threads

### ⚙️ The key behavior

```
Platform thread behavior:
  Request → OS thread → [blocked on I/O] → OS thread is wasted

Virtual thread behavior:
  Request → Virtual thread → [I/O starts] → carrier thread freed!
                                             → serves other virtual threads
                             [I/O completes] → any carrier thread resumes work
```

### 💡 Insight

Virtual threads don't make individual I/O operations faster. They make the **system** more efficient by ensuring that **no platform thread sits idle** while waiting for I/O. The benefit is **throughput** — serving more concurrent requests with the same hardware.

---

## Key Takeaways

✅ Modern microservice architectures involve heavy I/O — HTTP calls, database queries — causing threads to spend most of their time **waiting**

✅ Platform threads are expensive (OS-managed, ~1MB each) and wasteful when blocked on I/O

✅ Virtual threads are lightweight (JVM-managed, ~few KB each) — you can create millions of them

✅ When a virtual thread blocks on I/O, its carrier thread is **freed** to execute other virtual threads

✅ Virtual threads dramatically improve **throughput** for I/O-heavy applications

⚠️ Virtual threads don't help with CPU-bound tasks — they're designed for I/O-bound workloads

⚠️ Virtual threads are not faster per-operation — they're more efficient at **scale**

💡 The JVM handles all the complexity — from the developer's perspective, virtual threads are used just like regular threads
