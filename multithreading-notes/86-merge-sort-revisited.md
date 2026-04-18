# Merge Sort Revisited — Parallel vs. Sequential

## Introduction

We've implemented both sequential and parallel merge sort. Now let's put them head-to-head with a proper benchmark using the same dataset. This gives us a clear picture of how much speedup parallelism provides for sorting — and when it doesn't help.

---

## Setting Up the Comparison

### ⚙️ Generating Random Data

```java
private static int[] createNumbers(int n) {
    Random random = new Random();
    int[] nums = new int[n];

    for (int i = 0; i < nums.length; i++) {
        nums[i] = random.nextInt(10000);
    }

    return nums;
}
```

### ⚙️ Fair Comparison — Same Input Data

To compare fairly, **both algorithms must sort the exact same data**. We create two copies of the array:

```java
int[] nums1 = createNumbers(100_000_000); // 100 million items
int[] nums2 = new int[nums1.length];

for (int i = 0; i < nums1.length; i++) {
    nums2[i] = nums1[i]; // copy values
}
```

- `nums1` → used for sequential sort
- `nums2` → used for parallel sort

### 💡 Insight

If you sort `nums1` first (sequential), the array is now sorted. Passing a sorted array to the parallel sort would give misleading results. Always use separate copies.

---

## Running the Benchmark

```java
// Sequential merge sort
SequentialMergeSort sequential = new SequentialMergeSort(nums1);
long start = System.currentTimeMillis();
sequential.mergeSort(nums1);
System.out.println("Sequential sort: " + (System.currentTimeMillis() - start) + " ms");

// Parallel merge sort
ForkJoinPool pool = new ForkJoinPool(Runtime.getRuntime().availableProcessors());
MergeSortTask parallel = new MergeSortTask(nums2);
start = System.currentTimeMillis();
pool.invoke(parallel);
System.out.println("Parallel sort: " + (System.currentTimeMillis() - start) + " ms");
```

---

## Results

### With 100 million items

| Approach | Time (approx.) |
|---|---|
| Sequential | ~12–13 seconds |
| Parallel | ~4 seconds |

The parallel merge sort is approximately **3x faster** than sequential on a multi-core machine.

### With 100 items

| Approach | Time |
|---|---|
| Sequential | Faster ✅ |
| Parallel | Slower (thread overhead) |

For small arrays, the cost of creating threads far exceeds any benefit from parallelism.

---

## The Base Case Threshold

Recall that the parallel merge sort has a base case:

```java
if (nums.length <= 10) {
    // Use sequential merge sort
}
```

When the sub-array has 10 or fewer elements, we switch to sequential sorting. This prevents creating an excessive number of tiny tasks.

---

## Why Parallel Merge Sort Wins on Large Data

### ⚙️ How the speedup works

1. The array is recursively split into halves
2. Each half is assigned to a separate thread
3. Multiple CPU cores work on different halves simultaneously
4. The merge step combines sorted halves

With 100 million items and (say) 4 cores, each core handles roughly 25 million items — nearly a 4x theoretical speedup (in practice, ~3x due to merge overhead and synchronization).

---

## When to Use Which

| Scenario | Best Approach |
|---|---|
| Small arrays (< thousands) | Sequential |
| Large arrays (millions+) | Parallel |
| Single-core machine | Sequential |
| Multi-core machine | Parallel (for large data) |

---

## ✅ Key Takeaways

- Parallel merge sort is ~3x faster than sequential for 100 million items
- For small arrays, sequential is faster due to thread overhead
- Always use **separate copies** of data when benchmarking to ensure fairness
- The base case threshold (e.g., 10 elements) prevents excessive task creation
- Speedup scales with the number of available CPU cores

## ⚠️ Common Mistake

- Benchmarking with a sorted array after the first sort — this gives wrong results for the second algorithm
- Assuming parallel is always better — test with your actual data sizes

## 💡 Pro Tip

The Fork-Join pool size should match `Runtime.getRuntime().availableProcessors()`. More threads than cores leads to context switching overhead, not speedup.
