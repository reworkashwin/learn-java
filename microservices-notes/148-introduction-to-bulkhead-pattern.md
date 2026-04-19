# Introduction to the Bulkhead Pattern

## Introduction

Remember the Titanic? When it hit the iceberg, the ship didn't sink immediately. It took hours. Why? Because the ship was divided into **compartments** (bulkheads). When one compartment flooded, the sealed walls prevented water from rushing into the others.

The **Bulkhead pattern** in microservices works on the same principle — isolating resources so that a failure in one component doesn't bring down everything else.

---

## What Is the Bulkhead Pattern?

The Bulkhead pattern improves **resilience and isolation** by partitioning resources (threads, connections, memory) between different components or APIs within a microservice.

In simple terms: give each API its own "compartment" of resources. If one API gets overwhelmed, the others keep working because they have their own reserved resources.

---

## The Problem Without Bulkhead

Imagine the Accounts microservice has two APIs:

| API | Complexity | Dependencies |
|-----|-----------|--------------|
| `myAccount` | Simple | None — just reads account data |
| `myCustomerDetails` | Complex | Calls Loans, Cards, and other services |

Without bulkhead, **all APIs share the same thread pool**. If `myCustomerDetails` gets hammered with thousands of requests, it consumes all available threads. Now `myAccount` — a fast, simple API — can't get a thread to process its requests. A slow, complex API is starving a fast, simple API.

```
[Shared Thread Pool: 200 threads]
    myCustomerDetails → uses 195 threads (complex, slow)
    myAccount → gets 5 threads (simple, fast but starved)
```

This is the **noisy neighbor problem**. One misbehaving component affects everything else.

---

## The Solution With Bulkhead

Bulkhead assigns dedicated resource boundaries to each API:

```
[myAccount Pool: 50 threads]        → Always has threads available
[myCustomerDetails Pool: 150 threads] → Limited, can't starve others
```

Now even if `myCustomerDetails` is overwhelmed, `myAccount` continues serving requests happily from its own reserved thread pool. **Failure is isolated.**

---

## How to Implement Bulkhead

### The Annotation

```java
@Bulkhead(name = "myCustomerDetails", type = Bulkhead.Type.THREADPOOL)
public CustomerDetailsDto getCustomerDetails(String mobileNumber) {
    // calls loans, cards, etc.
}
```

### Configuration Properties

There are two types of Bulkhead:

#### 1. Semaphore Bulkhead (Controls Concurrent Calls)

```yaml
resilience4j:
  bulkhead:
    instances:
      myCustomerDetails:
        maxConcurrentCalls: 25
        maxWaitDuration: 0
```

| Property | Meaning |
|----------|---------|
| `maxConcurrentCalls` | Maximum number of concurrent requests this API can handle |
| `maxWaitDuration` | How long a request waits if the limit is reached (0 = reject immediately) |

#### 2. Thread Pool Bulkhead (Controls Threads)

```yaml
resilience4j:
  thread-pool-bulkhead:
    instances:
      myCustomerDetails:
        maxThreadPoolSize: 10
        coreThreadPoolSize: 5
        queueCapacity: 20
```

| Property | Meaning |
|----------|---------|
| `maxThreadPoolSize` | Maximum threads assigned to this API |
| `coreThreadPoolSize` | Minimum threads always available |
| `queueCapacity` | Requests waiting in queue when all threads are busy |

---

## Gateway Support?

⚠️ **As of now, Spring Cloud Gateway does NOT support the Bulkhead pattern.** You can only implement it inside individual microservices using Resilience4j.

---

## When to Use Bulkhead

- You have APIs with **different complexity levels** sharing the same service
- A **slow dependency** (external API, database) could consume all threads
- You want to ensure **critical APIs** always have resources available
- You're dealing with the **noisy neighbor problem**

---

## Real-World Analogy

Think of a hospital emergency room:
- **Trauma bay** (reserved for critical patients) — always has beds
- **General area** (for non-critical patients) — shares remaining capacity

Even if the general area is overflowing, trauma patients always get treated because their resources are **isolated**.

---

## ✅ Key Takeaways

- Bulkhead pattern isolates resources between components to prevent cascading failures
- Inspired by ship compartments (bulkheads) that prevent flooding from spreading
- Two approaches: **Semaphore** (controls concurrency) and **Thread Pool** (controls threads)
- Only available via **Resilience4j** — not supported in Spring Cloud Gateway
- Use it when APIs with different complexities share the same microservice
- Requires performance testing tools (JMeter, LoadRunner) to properly validate

💡 **Pro Tip:** Don't use bulkhead everywhere — it adds complexity. Apply it to microservices where you have a clear mix of light and heavy APIs, or where a slow dependency could starve the rest of your service.
