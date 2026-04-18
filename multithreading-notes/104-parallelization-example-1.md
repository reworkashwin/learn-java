# Parallelization — Example #1

## Introduction

One of the most powerful features of the Java Stream API is how easy it makes **parallelization**. Instead of manually splitting data, creating threads, and merging results (like we did with the Fork/Join framework), you can make a stream parallel with a single method call: `.parallel()`. Under the hood, Java uses the **Fork/Join framework** we studied earlier.

But there's an important caveat: calling `.parallel()` doesn't **guarantee** parallel execution — the stream must be designed in a way that allows parallelism.

---

## Concept 1: Sequential vs Parallel Streams

### 🧠 What is it?

A **sequential stream** processes elements one by one, in order, on a single thread. A **parallel stream** splits the data across multiple threads and processes chunks simultaneously using the Fork/Join framework.

### ⚙️ How to make a stream parallel

Just call `.parallel()` before the terminal operation:

```java
// Sequential
long result = LongStream.rangeClosed(1, n).reduce(0, Long::sum);

// Parallel
long result = LongStream.rangeClosed(1, n).parallel().reduce(0, Long::sum);
```

That's it. One method call.

---

## Concept 2: Benchmarking Sequential vs Parallel

### 🧪 Example: Summing 1 billion integers

```java
private static long sum(long n) {
    return LongStream.rangeClosed(1, n)
                     .reduce(0, Long::sum);
}

private static long parallelSum(long n) {
    return LongStream.rangeClosed(1, n)
                     .parallel()
                     .reduce(0, Long::sum);
}
```

**Measuring performance:**

```java
long start = System.currentTimeMillis();
System.out.println(sum(1_000_000_000L));
System.out.println("Sequential time: " + (System.currentTimeMillis() - start) + "ms");

start = System.currentTimeMillis();
System.out.println(parallelSum(1_000_000_000L));
System.out.println("Parallel time: " + (System.currentTimeMillis() - start) + "ms");
```

### 📊 Results

| Approach | Input Size | Approximate Time |
|----------|-----------|-----------------|
| Sequential | 1 billion | ~5000ms |
| Parallel | 1 billion | ~1000ms |
| Sequential | 2 billion | ~10000ms |
| Parallel | 2 billion | ~2000ms |

The parallel approach is approximately **5× faster** — because the work is distributed across multiple CPU cores.

---

## Concept 3: What Happens Under the Hood

### 🧠 How does parallel() work?

When you call `.parallel()`:

1. Java uses the **Fork/Join framework** to split the stream data into chunks
2. Each chunk is processed by a separate thread in the common ForkJoinPool
3. Partial results are combined using the reduction function (`Long::sum` in this case)

It's essentially the same thing we implemented manually with `RecursiveTask` in the Fork/Join chapter — but the Stream API does it automatically.

---

## Concept 4: When Parallelism Doesn't Help

### ⚠️ Not all streams can be parallelized

Calling `.parallel()` is not a magic "make it faster" button. The stream operations must be **parallelizable**:

- ✅ **Stateless operations** (`map`, `filter`, `reduce`) — work well in parallel
- ❌ **Order-dependent operations** (`findFirst`, `limit`) — force sequential behavior
- ❌ **Shared mutable state** — causes race conditions

### 🧪 Example of what NOT to do

```java
// BAD: findFirst() negates parallelism
stream.parallel().filter(predicate).findFirst(); // still sequential!

// GOOD: findAny() allows true parallelism
stream.parallel().filter(predicate).findAny();   // parallel!
```

As we discussed in the previous section, `findFirst()` requires maintaining encounter order, which makes parallel execution pointless.

---

## Key Takeaways

✅ `.parallel()` enables parallel execution of stream operations using the Fork/Join framework

✅ For CPU-intensive operations on large datasets, parallel streams can be **4-5× faster**

✅ The result is identical for both sequential and parallel approaches — correctness is preserved

⚠️ Not all streams benefit from parallelism — order-dependent or stateful operations may negate the speedup

⚠️ For small datasets, the overhead of thread management may make parallel streams **slower** than sequential

💡 Parallel streams are most effective for: large datasets, CPU-bound computations, stateless operations, and scenarios where element order doesn't matter
