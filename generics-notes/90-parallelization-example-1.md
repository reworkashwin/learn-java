# Parallelization — Example #1

## Introduction

So far, all our stream operations have been **sequential** — processing one element at a time on a single thread. But modern computers have multiple CPU cores sitting idle. **Parallel streams** let you split the work across all available cores with almost zero code changes. Let's explore when and how to use them.

---

## Concept 1: What Are Parallel Streams?

### 🧠 What is it?

A parallel stream divides the source data into multiple chunks and processes each chunk on a separate thread using the **ForkJoinPool**. The results are then combined back together.

### ❓ Why do we need it?

If you're processing millions of elements and the operation is CPU-intensive (not I/O-bound), parallelism can dramatically reduce execution time — potentially by a factor equal to the number of CPU cores.

### ⚙️ How it works

```java
// Sequential stream
long count = numbers.stream()
    .filter(n -> isPrime(n))
    .count();

// Parallel stream — one word change
long count = numbers.parallelStream()
    .filter(n -> isPrime(n))
    .count();

// Or convert an existing stream to parallel
long count = numbers.stream()
    .parallel()
    .filter(n -> isPrime(n))
    .count();
```

### 💡 Insight

Think of it as assembling furniture alone (sequential) vs. with friends (parallel). If the instructions have independent steps, friends help. If every step depends on the previous one, extra people just watch.

---

## Concept 2: Measuring the Performance Difference

### 🧠 What is it?

Let's see a concrete example where parallelism provides a real speedup.

### ⚙️ How it works

```java
public static boolean isPrime(long n) {
    if (n <= 1) return false;
    for (long i = 2; i <= Math.sqrt(n); i++) {
        if (n % i == 0) return false;
    }
    return true;
}

public static void main(String[] args) {
    List<Long> numbers = LongStream.rangeClosed(1, 1_000_000)
        .boxed()
        .collect(Collectors.toList());

    // Sequential
    long start = System.currentTimeMillis();
    long seqCount = numbers.stream()
        .filter(n -> isPrime(n))
        .count();
    long seqTime = System.currentTimeMillis() - start;

    // Parallel
    start = System.currentTimeMillis();
    long parCount = numbers.parallelStream()
        .filter(n -> isPrime(n))
        .count();
    long parTime = System.currentTimeMillis() - start;

    System.out.println("Sequential: " + seqTime + "ms, count: " + seqCount);
    System.out.println("Parallel:   " + parTime + "ms, count: " + parCount);
}
```

On a 4-core machine, you might see:
```
Sequential: 3200ms, count: 78498
Parallel:   900ms, count: 78498
```

The parallel version is roughly **3-4x faster** — almost linear speedup because `isPrime()` is a CPU-intensive operation with no shared state.

---

## Concept 3: How the ForkJoinPool Works

### 🧠 What is it?

Parallel streams use the **common ForkJoinPool** — a thread pool shared across your application. By default, it uses `Runtime.getRuntime().availableProcessors() - 1` threads (plus the calling thread).

### ⚙️ How it works

The framework:
1. **Splits** the data source into chunks (fork)
2. **Processes** each chunk on a separate thread
3. **Combines** the partial results back together (join)

```
[1, 2, 3, 4, 5, 6, 7, 8]
         ↙         ↘
   [1, 2, 3, 4]    [5, 6, 7, 8]
     ↙     ↘         ↙      ↘
 [1,2]   [3,4]    [5,6]    [7,8]
   ↓       ↓        ↓        ↓
 process  process  process  process
   ↓       ↓        ↓        ↓
   ↘     ↙         ↘      ↙
   combine          combine
         ↘         ↙
        final result
```

### 💡 Insight

You can check how many threads are available:

```java
System.out.println(ForkJoinPool.commonPool().getParallelism());
// Usually: number of CPU cores - 1
```

---

## Concept 4: When NOT to Use Parallel Streams

### 🧠 What is it?

Parallelism isn't free. There's overhead for splitting, thread management, and combining results. Sometimes parallel is **slower** than sequential.

### ⚠️ Common Mistakes

**1. Small data sets:**
```java
// Don't parallelize 100 elements — overhead > benefit
List<Integer> small = List.of(1, 2, 3, 4, 5);
small.parallelStream().forEach(System.out::println);  // slower!
```

**2. I/O-bound operations:**
```java
// Network calls won't benefit — threads just wait
urls.parallelStream()
    .map(url -> fetchFromNetwork(url))  // threads block on I/O
    .collect(Collectors.toList());
```

**3. Order-dependent operations:**
```java
// forEach doesn't guarantee order in parallel
numbers.parallelStream()
    .forEach(System.out::println);  // out of order!

// Use forEachOrdered if order matters (but it's slower)
numbers.parallelStream()
    .forEachOrdered(System.out::println);  // ordered, but reduced parallelism
```

**4. Shared mutable state:**
```java
// DANGEROUS — race condition!
List<Integer> results = new ArrayList<>();
numbers.parallelStream()
    .filter(n -> n > 5)
    .forEach(results::add);  // ArrayList is NOT thread-safe
```

---

## Concept 5: Rules of Thumb for Parallel Streams

### 🧠 What is it?

Quick guidelines to decide whether parallelism will help.

### ✅ Parallel streams work well when:

1. **Large data set** — thousands or millions of elements
2. **CPU-intensive operations** — heavy computation per element (like `isPrime()`)
3. **Stateless operations** — no shared mutable state
4. **Easily splittable source** — `ArrayList`, arrays, `IntStream.range()` split well; `LinkedList` and `Stream.iterate()` do not
5. **Associative, stateless reduction** — `sum()`, `count()`, `collect(Collectors.toList())`

### ⚠️ Avoid parallel streams when:

1. Small data sets (< 10,000 elements for simple operations)
2. I/O-bound work (database, network, file reads)
3. Order matters and can't be sacrificed
4. Using non-thread-safe accumulation targets
5. Source is hard to split (`LinkedList`, `Stream.iterate()`)

---

## ✅ Key Takeaways

- Parallel streams split work across multiple CPU cores using the **ForkJoinPool**
- Switch with `.parallelStream()` or `.parallel()` — minimal code change
- Best for **large datasets** with **CPU-intensive, stateless** operations
- The ForkJoinPool uses a fork/join (divide-and-conquer) strategy
- **Never mutate shared state** from parallel streams — use thread-safe collectors
- Always **measure** before assuming parallel is faster — overhead can negate benefits
