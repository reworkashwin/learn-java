# 📘 Parallel Streams

## 📌 Introduction

What if you could make your stream processing **twice as fast** — or more — just by calling a single method? That's the promise of **parallel streams** in Java 8. By splitting data across multiple threads, parallel streams leverage multi-core processors to process large datasets significantly faster.

But with great power comes great responsibility. Parallel streams aren't always the right choice, and using them incorrectly can actually make things **slower**. Let's explore when and how to use them.

---

## 🧩 Concept 1: What is a Parallel Stream?

### 🧠 What is it?

A parallel stream is a stream that divides its data into multiple parts and processes them **simultaneously across multiple threads**. Under the hood, it uses Java's **Fork/Join framework** to split work into tasks and distribute them across available CPU cores.

### ❓ Why do we need it?

Sequential streams process elements one at a time in a single thread. For large datasets with CPU-intensive operations, this can be slow. Parallel streams break the work into chunks and process them concurrently, significantly reducing execution time on multi-core machines.

### ⚙️ How to create one

Two ways to create a parallel stream:

```java
// Method 1: Convert an existing stream
list.stream().parallel()

// Method 2: Create directly from a collection
list.parallelStream()
```

Both are equivalent — use whichever reads better in your context.

---

## 🧩 Concept 2: Parallel Stream in Action — Basic Example

### 🧪 Example: Order is NOT Guaranteed

```java
import java.util.Arrays;
import java.util.List;

public class ParallelStreamDemo {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        numbers.stream()
            .parallel()
            .forEach(System.out::println);
    }
}
```

**Possible output:**
```
7
8
3
10
1
5
6
4
9
2
```

### ⚙️ How it works

- The `.parallel()` method converts the stream into a parallel stream
- `forEach` processes elements across multiple threads
- **The order is unpredictable** — whichever thread finishes first prints first
- Running the same program again will likely produce a **different order**

### 💡 Insight

This unpredictable ordering is the key thing to understand about parallel streams. Different threads race to process different chunks of data, and the output order depends on which thread finishes first. If you need ordered output, parallel streams may not be appropriate — or you'd need `forEachOrdered()` instead.

---

## 🧩 Concept 3: How Parallel Streams Work — The Fork/Join Framework

### 🧠 What is it?

Parallel streams use the **Fork/Join framework** under the hood. Here's how it works:

1. **Fork** — The data is split into smaller chunks (tasks)
2. **Process** — Each chunk is assigned to a separate thread
3. **Join** — Results from all threads are combined into the final result

```
         [Original Data]
        /    |     |    \
     [T1]  [T2]  [T3]  [T4]   ← Each processed by a different thread
        \    |     |    /
         [Combined Result]
```

### 💡 Insight

The number of threads used typically matches the number of available CPU cores. On a 4-core machine, the data might be split into 4 chunks. This is why parallel streams shine on **multi-core systems** but offer no benefit on single-core machines.

---

## 🧩 Concept 4: Performance Comparison — Sequential vs. Parallel

### 🧠 What is it?

Let's put numbers behind the claim. We'll compare the time taken by sequential and parallel streams to compute the sum of squares for **100 million numbers**.

### 🧪 Example

```java
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class PerformanceComparison {
    public static void main(String[] args) {
        // Create a list of 100 million integers
        List<Integer> numbers = IntStream.rangeClosed(1, 100_000_000)
            .boxed()
            .collect(Collectors.toList());

        // Sequential stream
        Instant startSeq = Instant.now();
        long sumSequential = numbers.stream()
            .mapToLong(num -> (long) num * num)
            .sum();
        Instant endSeq = Instant.now();
        long seqTime = Duration.between(startSeq, endSeq).toMillis();

        // Parallel stream
        Instant startPar = Instant.now();
        long sumParallel = numbers.parallelStream()
            .mapToLong(num -> (long) num * num)
            .sum();
        Instant endPar = Instant.now();
        long parTime = Duration.between(startPar, endPar).toMillis();

        System.out.println("Sequential sum: " + sumSequential + " | Time: " + seqTime + "ms");
        System.out.println("Parallel sum:   " + sumParallel + "   | Time: " + parTime + "ms");
    }
}
```

**Typical output:**
```
Sequential sum: 333333338333333350 | Time: 293ms
Parallel sum:   333333338333333350 | Time: 115ms
```

### 💡 Insight

On a multi-core machine, the parallel stream finishes in roughly **half the time** (or better) compared to the sequential stream. Both produce the **exact same result** — parallel streams don't sacrifice correctness, just process faster by dividing the work.

The performance gain scales with dataset size. For 100 million elements, the difference is dramatic. For 10 elements, parallel would actually be slower.

---

## 🧩 Concept 5: When to Avoid Parallel Streams

### 🧠 What is it?

Parallel streams are powerful, but they're not a universal solution. Using them in the wrong context can actually **hurt performance** or cause bugs.

### ⚠️ Avoid parallel streams when:

| Scenario | Why |
|----------|-----|
| **Small datasets** | Thread management overhead exceeds the speedup. A sequential stream will be faster. |
| **I/O-bound operations** | Network calls, disk reads, or database queries don't benefit from CPU parallelism. Threads end up waiting, not computing. |
| **Order matters** | Parallel streams don't guarantee element ordering. If you need elements processed in sequence, stick with sequential. |
| **Stateful operations** | Operations that modify shared data (like a shared counter) can cause **race conditions** in parallel streams. |
| **Single-core machines** | No multiple cores = no parallelism benefit. |

### 🧪 Example: Order Not Maintained

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// Sequential — always prints 1, 2, 3, 4, 5
numbers.stream().forEach(System.out::println);

// Parallel — might print 3, 1, 5, 2, 4
numbers.parallelStream().forEach(System.out::println);
```

### 💡 Insight

A good rule of thumb: **use parallel streams only when all three conditions are met:**
1. The dataset is large (thousands or millions of elements)
2. The operation is CPU-intensive (not I/O)
3. Element order doesn't matter

---

## ✅ Key Takeaways

- Parallel streams split data across multiple threads for concurrent processing
- Use `.parallel()` on an existing stream or `.parallelStream()` directly on a collection
- Under the hood, parallel streams use the **Fork/Join framework**
- They can provide **significant performance boosts** for large, CPU-intensive operations
- The output order is **not guaranteed** in parallel streams
- Both sequential and parallel streams produce the **same result** — only speed differs
- Avoid parallel streams for small data, I/O operations, ordered processing, or stateful operations

---

## ⚠️ Common Mistakes

- **Using parallel streams on small datasets** — the thread overhead makes it slower, not faster
- **Assuming order is preserved** — `forEach` on a parallel stream prints in arbitrary order
- **Modifying shared state** — leads to race conditions and unpredictable bugs
- **Not measuring performance** — always benchmark before assuming parallel is faster

---

## 💡 Pro Tips

- Use `forEachOrdered()` instead of `forEach()` if you need ordered output with parallel streams (though it reduces parallelism benefits)
- Benchmark with `Instant.now()` and `Duration.between()` to compare sequential vs. parallel performance
- For purely computational tasks on large collections, parallel streams can nearly halve execution time
- The common ForkJoinPool used by parallel streams has a default parallelism level equal to `Runtime.getRuntime().availableProcessors() - 1`
