# Running Time Comparison of Merge Sort Implementations

## Introduction

Theory is great, but numbers don't lie. This section puts sequential and parallel merge sort head-to-head, measuring actual running times on real data. The results demonstrate exactly how much parallelization can speed up a divide and conquer algorithm.

---

## Concept 1: Setting Up the Benchmark

### ⚙️ Generating Test Data

To fairly compare both approaches, we need the **exact same data** for both algorithms:

```java
private static int[] createArray(int n) {
    int[] a = new int[n];
    Random random = new Random();
    for (int i = 0; i < n; i++) {
        a[i] = random.nextInt(n);
    }
    return a;
}
```

Then we copy the array so both sorts work on identical data:

```java
int[] numbers1 = createArray(10_000_000);  // 10 million items
int[] numbers2 = new int[numbers1.length];
for (int i = 0; i < numbers1.length; i++) {
    numbers2[i] = numbers1[i];  // exact copy
}
```

✅ **Key Takeaway**: Always compare algorithms on **identical inputs**. Using different random arrays would invalidate the comparison.

### ⚙️ Getting Available Processors

```java
int numThreads = Runtime.getRuntime().availableProcessors();
// Returns 16 on this machine
```

This tells us how many threads can actually run simultaneously.

---

## Concept 2: Measuring the Results

### ⚙️ Benchmarking Code Pattern

```java
// Parallel merge sort
long start = System.currentTimeMillis();
parallelSorter.parallelMergeSort(0, numbers1.length - 1, numThreads);
long end = System.currentTimeMillis();
System.out.println("Parallel: " + (end - start) + " ms");

// Sequential merge sort
start = System.currentTimeMillis();
sequentialSorter.mergeSort(0, numbers2.length - 1);
end = System.currentTimeMillis();
System.out.println("Sequential: " + (end - start) + " ms");
```

### 🧪 Actual Results

| Array Size | Parallel | Sequential | Speedup |
|-----------|---------|-----------|---------|
| **10 million** | ~270 ms | ~1,080 ms | **~4x faster** |
| **100 million** | ~2,000 ms | ~13,000 ms | **~6x faster** |

### 💡 Key Observations

1. **Parallel is consistently faster** for large datasets
2. **The speedup increases** with larger datasets — 4x for 10M items, 6x for 100M items
3. The more items you sort, the more the parallel approach shines

---

## Concept 3: Why the Speedup Isn't Linear

### ❓ With 16 cores, why isn't it 16x faster?

Two reasons:

1. **The merge step is sequential** — threads must wait for each other before merging. This is the bottleneck.
2. **Thread management overhead** — creating threads, context switching, and synchronization all take time.

This is a direct consequence of **Amdahl's law**: the sequential portion of the algorithm limits the maximum speedup, regardless of how many processors you use.

### 💡 Insight

As the dataset grows, the sorting work (parallelizable) dominates over the merge work (sequential) and thread overhead. This is why 100M items shows 6x speedup while 10M shows only 4x.

---

## Concept 4: Correctness Verification

Before trusting performance results, always verify correctness:

```java
// Use a small array to visually verify
int[] small = createArray(10);
parallelSorter.parallelMergeSort(0, small.length - 1, numThreads);
parallelSorter.showResults();
// Output: 0 1 3 3 3 4 5 6 8 8  ✓ Sorted correctly
```

⚠️ **Common Mistake**: Only testing performance without verifying that the parallel algorithm produces correct results. Always check small cases first.

---

## Summary

✅ Parallel merge sort is **4–6x faster** than sequential merge sort for large datasets

✅ The speedup **increases** with larger datasets because sorting work dominates thread overhead

✅ On a 16-core machine, you won't get 16x speedup due to the sequential merge bottleneck

✅ Always benchmark with **identical data** and **verify correctness** on small inputs first

💡 The more processor cores available, the larger the performance gap between parallel and sequential approaches
