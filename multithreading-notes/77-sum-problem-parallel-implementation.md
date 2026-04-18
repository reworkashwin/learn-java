# Sum Problem — Parallel Implementation

## Introduction

We've seen the sequential approach to summing an array of numbers — iterate through every element and add them up. Now we implement the **parallel version**: split the array into chunks, assign each chunk to a separate thread, compute partial sums simultaneously, and combine the results. This is a classic example of **data parallelism** and one of the most important patterns in parallel computing.

---

## Concept 1: The Strategy

### 🧠 How do we parallelize summation?

1. **Divide** the array into `N` chunks (where `N` = number of available processors)
2. **Assign** each chunk to a separate thread
3. Each thread computes a **partial sum** of its chunk
4. **Combine** all partial sums into the final result

```
Array: [10, 20, 30, 40, 50, 60, 70, 80]

Thread 1: sum(10, 20, 30, 40) = 100
Thread 2: sum(50, 60, 70, 80) = 260
                                  ↓
Main:     100 + 260 = 360
```

### 💡 Key Insight

Each thread works on a **non-overlapping portion** of the array. There's no shared mutable state, so **no synchronization is needed** during the computation phase. The only sequential step is combining the partial sums at the end.

---

## Concept 2: The ParallelWorker Class

### ⚙️ Each thread runs a worker

```java
public class ParallelWorker extends Thread {

    private int[] nums;
    private int low;
    private int high;
    private long partialSum;

    public ParallelWorker(int[] nums, int low, int high) {
        this.nums = nums;
        this.low = low;
        this.high = Math.min(high, nums.length);
    }

    public long getPartialSum() {
        return partialSum;
    }

    @Override
    public void run() {
        partialSum = 0;
        for (int i = low; i < high; i++) {
            partialSum += nums[i];
        }
    }
}
```

### 🧠 What's happening

- Each worker operates on a **slice** of the array from `low` to `high`
- The `partialSum` stores the result — no shared state, no locking needed
- `Math.min(high, nums.length)` prevents `ArrayIndexOutOfBoundsException` when the array doesn't divide evenly

---

## Concept 3: The ParallelSum Class

### ⚙️ Orchestrating the threads

```java
public class ParallelSum {

    private int[] nums;
    private int numThreads;

    public ParallelSum(int numThreads) {
        this.numThreads = numThreads;
    }

    public long sum(int[] nums) throws InterruptedException {
        this.nums = nums;

        int chunkSize = (int) Math.ceil(nums.length / (double) numThreads);
        ParallelWorker[] workers = new ParallelWorker[numThreads];

        // Create and start worker threads
        for (int i = 0; i < numThreads; i++) {
            int low = i * chunkSize;
            int high = low + chunkSize;
            workers[i] = new ParallelWorker(nums, low, high);
            workers[i].start();
        }

        // Wait for all threads to finish
        long totalSum = 0;
        for (ParallelWorker worker : workers) {
            worker.join();
            totalSum += worker.getPartialSum();
        }

        return totalSum;
    }
}
```

### ⚙️ Step-by-step breakdown

**Step 1: Calculate chunk size**
```java
int chunkSize = (int) Math.ceil(nums.length / (double) numThreads);
```
If array has 1000 elements and we have 4 threads: `chunkSize = 250`. Each thread sums 250 elements.

**Step 2: Create and start workers**
Each worker gets its chunk boundaries (`low` to `high`). All workers start simultaneously.

**Step 3: Wait and collect results**
`join()` blocks until the worker finishes. Then we add its partial sum to the total.

### ⚠️ Common Mistake: Integer division

```java
// WRONG — integer division truncates
int chunkSize = nums.length / numThreads;  // 1000 / 3 = 333 (misses last element)

// CORRECT — ceiling division
int chunkSize = (int) Math.ceil(nums.length / (double) numThreads);  // 1000 / 3 = 334
```

Without ceiling division, the last few elements might not be processed.

---

## Concept 4: Running the Comparison

### 🧪 Benchmarking sequential vs parallel

```java
public class App {
    public static void main(String[] args) throws InterruptedException {
        int[] nums = new int[1_000_000_000];
        Random random = new Random();
        for (int i = 0; i < nums.length; i++) {
            nums[i] = random.nextInt(100);
        }

        int numProcessors = Runtime.getRuntime().availableProcessors();

        // Sequential
        long start = System.currentTimeMillis();
        long seqSum = 0;
        for (int num : nums) seqSum += num;
        long seqTime = System.currentTimeMillis() - start;

        // Parallel
        start = System.currentTimeMillis();
        ParallelSum parallelSum = new ParallelSum(numProcessors);
        long parSum = parallelSum.sum(nums);
        long parTime = System.currentTimeMillis() - start;

        System.out.println("Sequential: " + seqSum + " in " + seqTime + "ms");
        System.out.println("Parallel:   " + parSum + " in " + parTime + "ms");
    }
}
```

### 📊 Typical results (8-core machine)

| Approach | Time (1 billion elements) |
|----------|--------------------------|
| Sequential | ~4000ms |
| Parallel (8 threads) | ~800ms |
| Speedup | ~5× |

### ❓ Why not exactly 8× faster?

Several reasons:
1. **Thread creation overhead** — starting 8 threads takes time
2. **The sequential combining step** — adding 8 partial sums is sequential
3. **Memory bandwidth** — all cores share the same RAM bus
4. **Cache effects** — different cores compete for cache lines

---

## Concept 5: When NOT to Parallelize

### ⚠️ Small arrays

For small arrays (e.g., 1000 elements), the overhead of creating threads **exceeds** the computation time. Sequential is faster.

### ⚙️ Rule of thumb

- **N < 10,000**: Use sequential
- **N > 100,000**: Parallel usually helps
- **N > 1,000,000**: Parallel is almost always faster

### 💡 Pro Tip

Always **benchmark** before parallelizing. Don't assume parallel = faster. The crossover point depends on the operation complexity and hardware.

---

## ✅ Key Takeaways

- Split the array into chunks, assign one chunk per thread, combine partial results
- No synchronization needed during computation — each thread works on its own slice
- Use `Math.ceil()` to handle arrays that don't divide evenly
- Thread creation overhead means parallelization only helps for **large** datasets
- Speedup is less than the number of cores due to overhead, memory bandwidth, and the sequential combining step
- Always benchmark: parallel isn't always faster
