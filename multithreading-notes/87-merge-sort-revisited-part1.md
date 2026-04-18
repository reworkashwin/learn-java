# Merge Sort Revisited I — Fork-Join Framework

## Introduction

Earlier we implemented parallel merge sort by **manually creating threads** — managing thread counts, calling `start()` and `join()`, and falling back to sequential when threads ran out. It worked, but it was messy. Now we revisit merge sort using the **Fork-Join framework**, which handles all the thread management for us. The result is cleaner, more robust, and takes advantage of **work stealing** for better load balancing.

---

## Concept 1: Why Revisit Merge Sort?

### ❓ What was wrong with our manual implementation?

Our manual parallel merge sort had several issues:

1. **Manual thread tracking** — we passed `numThreads` through every recursive call
2. **No load balancing** — if one subtask finished early, its thread was wasted
3. **Hard-coded thread count** — based on `Runtime.getRuntime().availableProcessors()`
4. **Complex error handling** — `InterruptedException` at every `join()` call
5. **Boilerplate code** — creating `Thread` objects, calling `start()`, `join()`

The Fork-Join framework solves all of these. We just define: **when to split** and **how to merge**. The framework handles everything else.

---

## Concept 2: Merge Sort as a RecursiveAction

### 🧠 Why RecursiveAction and not RecursiveTask?

Merge sort sorts the array **in place** — it doesn't return a new sorted array. The result is stored in the original array. Since there's no return value, we use `RecursiveAction` (not `RecursiveTask<T>`).

### ⚙️ The implementation

```java
import java.util.Arrays;
import java.util.concurrent.RecursiveAction;

public class MergeSortTask extends RecursiveAction {

    private int[] nums;
    private static final int THRESHOLD = 500;

    public MergeSortTask(int[] nums) {
        this.nums = nums;
    }

    @Override
    protected void compute() {
        // Base case: small enough to sort directly
        if (nums.length <= THRESHOLD) {
            Arrays.sort(nums);  // Use built-in sort for small arrays
            return;
        }

        int middle = nums.length / 2;

        // Split the array into two halves
        int[] left = Arrays.copyOfRange(nums, 0, middle);
        int[] right = Arrays.copyOfRange(nums, middle, nums.length);

        // Create subtasks for each half
        MergeSortTask leftTask = new MergeSortTask(left);
        MergeSortTask rightTask = new MergeSortTask(right);

        // Fork both tasks (execute in parallel)
        invokeAll(leftTask, rightTask);

        // Merge the sorted halves back into the original array
        merge(left, right, nums);
    }
}
```

### 🧠 What changed from the manual version?

| Manual Version | Fork-Join Version |
|----------------|------------------|
| `new Thread(() -> mergeSort(...))` | `new MergeSortTask(subarray)` |
| `thread.start()` | `invokeAll(leftTask, rightTask)` |
| `thread.join()` | Handled by `invokeAll` |
| `if (numThreads <= 1) sequential()` | `if (nums.length <= THRESHOLD) Arrays.sort()` |
| Manual thread count management | Framework manages thread pool |

---

## Concept 3: The Merge Method

### ⚙️ Combining sorted halves

```java
private void merge(int[] left, int[] right, int[] result) {
    int i = 0, j = 0, k = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result[k++] = left[i++];
        } else {
            result[k++] = right[j++];
        }
    }

    while (i < left.length) {
        result[k++] = left[i++];
    }

    while (j < right.length) {
        result[k++] = right[j++];
    }
}
```

This is the standard merge procedure — identical to the sequential version. Two pointers walk through the sorted subarrays, always picking the smaller element.

---

## Concept 4: Running the Fork-Join Merge Sort

### 🧪 Main method

```java
import java.util.Arrays;
import java.util.Random;
import java.util.concurrent.ForkJoinPool;

public class App {
    public static void main(String[] args) {
        int[] nums = new int[10_000_000];
        Random random = new Random();
        for (int i = 0; i < nums.length; i++) {
            nums[i] = random.nextInt(1000);
        }

        ForkJoinPool pool = new ForkJoinPool(
            Runtime.getRuntime().availableProcessors()
        );

        MergeSortTask task = new MergeSortTask(nums);

        long start = System.currentTimeMillis();
        pool.invoke(task);
        long elapsed = System.currentTimeMillis() - start;

        System.out.println("Sorted in " + elapsed + "ms");
    }
}
```

---

## Concept 5: Work Stealing — Why Fork-Join Is Better

### 🧠 What is work stealing?

In a regular thread pool, each thread has its own queue. If Thread A finishes early and Thread B is overloaded, Thread A sits idle.

In the Fork-Join pool, **idle threads steal work** from busy threads' queues:

```
Thread 1: [Task A] [Task B] [Task C]     ← busy
Thread 2: [Task D]                        ← almost done
Thread 3: []                              ← idle, steals Task C from Thread 1
```

This means the workload is automatically balanced — no manual tuning needed.

### 💡 Why this matters for merge sort

If the left half of the array contains mostly sorted data (cheap to sort) and the right half is shuffled (expensive), work stealing ensures the threads that finish the easy work help with the hard work. Our manual implementation couldn't do this.

---

## Concept 6: Choosing the Right Threshold

### ⚙️ Impact of threshold value

| Threshold | Behavior |
|-----------|----------|
| Too small (e.g., 1) | Too many tasks created → overhead dominates |
| Too large (e.g., 1,000,000) | Too few tasks → not enough parallelism |
| Sweet spot (e.g., 500-5000) | Good balance of parallelism and low overhead |

### 💡 Rule of Thumb

A good starting point: set the threshold so you create roughly **4× more tasks than available processors**. This gives the work-stealing scheduler enough tasks to balance the load.

For 8 cores and 10 million elements: `10,000,000 / (8 * 4) ≈ 300,000`. But in practice, smaller thresholds (500-5000) often work better because `Arrays.sort()` is highly optimized for small arrays.

---

## ✅ Key Takeaways

- Fork-Join replaces manual thread management with a clean `compute()` method
- `invokeAll()` forks subtasks and waits for all to complete — no manual `join()`
- Work stealing automatically balances the load across threads
- Use `Arrays.sort()` for the base case — it's heavily optimized (TimSort)
- Choose a threshold that balances parallelism with task creation overhead
- Merge sort uses `RecursiveAction` because it sorts in place (no return value)
