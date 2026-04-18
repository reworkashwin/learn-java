# Maximum Finding — Running the Application

## Introduction

We've built both the sequential and parallel maximum finding algorithms. Now it's time to **benchmark** them — run both on the same dataset and compare their execution times. This reveals when parallelism pays off and how to tune it.

---

## Setting Up the Benchmark

### ⚙️ Generating Test Data

We need a large array of random numbers to test with:

```java
private static long[] createNumbers() {
    Random random = new Random();
    int n = 300_000_000; // 300 million items
    long[] nums = new long[n];

    for (int i = 0; i < nums.length; i++) {
        nums[i] = random.nextInt(1000);
    }

    return nums;
}
```

### ⚙️ Running Sequential vs. Parallel

```java
public static void main(String[] args) {
    long[] nums = createNumbers();

    // Sequential approach
    SequentialMaxFinding sequential = new SequentialMaxFinding();
    long start = System.currentTimeMillis();
    System.out.println("Max: " + sequential.max(nums));
    System.out.println("Sequential time: " + (System.currentTimeMillis() - start) + " ms");

    // Parallel approach
    ForkJoinPool pool = new ForkJoinPool(Runtime.getRuntime().availableProcessors());
    ParallelMaxTask task = new ParallelMaxTask(nums, 0, nums.length - 1);
    start = System.currentTimeMillis();
    long max = pool.invoke(task);
    System.out.println("Max: " + max);
    System.out.println("Parallel time: " + (System.currentTimeMillis() - start) + " ms");
}
```

---

## Benchmark Results

### With 300 million items

| Approach | Time |
|---|---|
| Sequential | Faster ✅ |
| Parallel | Slower |

Wait — the sequential approach is faster? Yes! With "only" 300 million items and a simple comparison operation, the overhead of thread management outweighs the parallelism benefit.

### With 500 million items

| Approach | Time |
|---|---|
| Sequential | Slower |
| Parallel | Faster ✅ |

With a larger dataset, the parallel approach begins to win because there's enough work to distribute across cores.

---

## Tuning the Threshold

### 🧠 What is it?

The threshold controls when the algorithm switches from parallel splitting to sequential computation. Tuning it can dramatically affect performance.

### 🧪 Experimenting with thresholds

| Threshold | Effect |
|---|---|
| 1000 | Many small tasks — more thread overhead |
| 3000 | Fewer tasks — better balance |
| 5000 | Even fewer tasks — potentially faster |

Each threshold value changes how many sub-tasks are created and how much work each thread performs. The optimal value depends on your hardware and dataset.

### 💡 Insight

There's no magic number. You need to **profile on your target machine** with realistic data sizes. What works on a 4-core laptop may not be optimal on a 16-core server.

---

## When Is Parallel Faster?

### ❓ The key question

Parallelism adds overhead: thread creation, synchronization, task management. It only pays off when:

1. **Dataset is large enough** — the work per thread must justify the overhead
2. **Threshold is tuned** — sub-tasks should be neither too small nor too large
3. **Multiple cores are available** — on a single-core machine, parallel is always slower

### 💡 Real-world analogy

Imagine sorting a pile of papers. If you have 10 papers, it's faster to sort them yourself than to divide them among 4 people, explain the rules, collect results, and merge. But if you have 10,000 papers, distributing the work is clearly faster.

---

## ✅ Key Takeaways

- Sequential max finding can be **faster** than parallel for smaller datasets (e.g., 300 million items)
- Parallel max finding wins on **very large datasets** (e.g., 500 million+ items)
- The **threshold** is a critical tuning parameter — experiment with different values
- Use `Runtime.getRuntime().availableProcessors()` to match the Fork-Join pool size to your CPU
- Always **benchmark** before assuming parallel is faster

## ⚠️ Common Mistake

- Assuming parallel is always faster — it's not. Thread management has real overhead
- Using a fixed threshold without testing — always profile with your actual data

## 💡 Pro Tip

When benchmarking, always use the same dataset for both approaches. Generate the data once, then run sequential and parallel on the same array to get a fair comparison.
