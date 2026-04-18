# Running Time Comparison of Sum Operations

## Introduction

Now it's time to put sequential and parallel sum algorithms to the test with real data. The results reveal a surprising truth: parallelization **isn't always faster**. The size of your dataset determines whether the overhead of multithreading pays off.

---

## Concept 1: The Benchmark Setup

### ⚙️ Generating Test Data

```java
Random random = new Random();
int[] nums = new int[10_000_000];  // 10 million integers
for (int i = 0; i < nums.length; i++) {
    nums[i] = random.nextInt(100);  // values 0–99
}

int numThreads = Runtime.getRuntime().availableProcessors();
```

We generate random integers in the range 0–99 and use the machine's available processor count for the parallel algorithm.

### ⚙️ Timing Both Approaches

```java
// Sequential
long start = System.currentTimeMillis();
System.out.println("Sum: " + sequential.sum(nums));
System.out.println("Time: " + (System.currentTimeMillis() - start));

// Parallel
start = System.currentTimeMillis();
System.out.println("Sum: " + parallel.sum(nums));
System.out.println("Time: " + (System.currentTimeMillis() - start));
```

---

## Concept 2: The Results

### 🧪 Actual Performance Data

| Array Size | Sequential | Parallel | Winner |
|-----------|-----------|---------|--------|
| **100** | ~0 ms | ~5 ms | Sequential |
| **10 million** | ~15 ms | ~20 ms | Sequential |
| **100 million** | ~80 ms | ~75 ms | Roughly tied |
| **1 billion** | ~800 ms | ~400 ms | **Parallel (2x faster)** |

### ❓ Why is parallel slower for small inputs?

Creating threads, starting them, synchronizing with `join()`, and combining results all have **fixed overhead costs**. For small datasets, this overhead exceeds the time saved by parallelism.

### 💡 The Crossover Point

There's a threshold where parallel becomes worth it. For the sum problem, that threshold is somewhere around **100 million to 1 billion items**. Below that, sequential wins.

---

## Concept 3: Why Sum Benefits Less Than Merge Sort

### ❓ Merge sort showed 4–6x speedup. Why is sum only 2x?

The key difference is the **amount of work per element**:

- **Merge sort**: each element involves comparisons, swaps, and recursive overhead — lots of work that can be parallelized
- **Sum**: each element is just one addition — very little work per element

When the per-element work is tiny, the thread management overhead is proportionally larger. The sequential portion (combining partial sums) becomes a bigger fraction of the total time.

⚠️ **Common Mistake**: Assuming parallelization always helps. For simple operations on moderate datasets, the overhead can actually make things slower.

---

## Concept 4: Integer Overflow Warning

### ⚠️ Watch out with 1 billion items

When summing 1 billion random integers (0–99), the total can exceed `Integer.MAX_VALUE` (about 2.1 billion). The sum will **overflow** and produce incorrect results.

```java
// Average value ~50, times 1 billion ≈ 50 billion
// int max value ≈ 2.1 billion → OVERFLOW!
```

For production code, use `long` instead of `int` for the accumulator when dealing with large datasets.

---

## Concept 5: When to Use Parallelization

### 💡 General Guidelines

| Scenario | Recommendation |
|----------|---------------|
| Small data (< 1 million items) | Sequential — overhead isn't worth it |
| Medium data (1–100 million) | Depends on operation complexity |
| Large data (100M+) | Parallel — savings outweigh overhead |
| Complex per-element work | Parallel, even for smaller datasets |
| Simple per-element work (addition) | Parallel only for very large datasets |

### 💡 Real-World Context

In modern applications — social media platforms, machine learning pipelines, big data analytics — you're typically dealing with **extremely large datasets**. This is where parallelization shines. The sum benchmark at 1 billion items is closer to real-world scale than the 100-item test.

---

## Summary

✅ Parallel sum is **~2x faster** for very large datasets (1 billion+ items)

✅ For small to medium datasets, **sequential is faster** due to thread overhead

⚠️ Parallelization has a **crossover point** — below it, the overhead costs more than the speedup saves

⚠️ Watch for **integer overflow** when summing very large arrays — use `long` instead of `int`

💡 The simpler the per-element operation, the larger the dataset needs to be before parallelization pays off
