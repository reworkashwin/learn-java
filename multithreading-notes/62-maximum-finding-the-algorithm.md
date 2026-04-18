# Maximum Finding — The Algorithm

## Introduction

Now that we understand the Fork-Join framework and thread optimization, let's apply it to a practical problem: **finding the maximum element in a large array**. We'll build both a sequential solution (linear search) and a parallel solution using `RecursiveTask`, then see how the Fork-Join framework splits the problem into sub-problems.

---

## Sequential Maximum Finding

### 🧠 What is it?

A classic linear search — iterate through every element, track the largest value seen so far, and return it at the end.

### ⚙️ How it works

```java
public class SequentialMaxFinding {

    public long max(long[] nums) {
        long max = nums[0];

        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > max) {
                max = nums[i];
            }
        }

        return max;
    }
}
```

**Step-by-step:**
1. Assume the first element is the maximum
2. Compare every remaining element against the current maximum
3. If an element is larger, it becomes the new maximum
4. Return the final maximum

### 💡 Insight

This runs in **O(N)** time — you must look at every element at least once when the array is unsorted. If the array were sorted, you could use binary search for **O(log N)**, but we're dealing with unsorted data here.

---

## Parallel Maximum Finding

### 🧠 What is it?

A divide-and-conquer approach using the Fork-Join framework. We recursively split the array into halves until each sub-array is small enough to solve sequentially, then merge results by taking the maximum of the two halves.

### ❓ Why do we need it?

For extremely large arrays (hundreds of millions of elements), splitting the work across multiple CPU cores can significantly reduce the time.

### ⚙️ How it works

```java
public class ParallelMaxTask extends RecursiveTask<Long> {

    private long[] nums;
    private int lowIndex;
    private int highIndex;

    public ParallelMaxTask(long[] nums, int lowIndex, int highIndex) {
        this.nums = nums;
        this.lowIndex = lowIndex;
        this.highIndex = highIndex;
    }

    @Override
    protected Long compute() {
        // Base case: sub-array is small enough for sequential approach
        if (highIndex - lowIndex < 1000) {
            return sequentialMaxFinding();
        }

        // Split the array in half
        int middleIndex = (highIndex + lowIndex) / 2;

        ParallelMaxTask task1 = new ParallelMaxTask(nums, lowIndex, middleIndex);
        ParallelMaxTask task2 = new ParallelMaxTask(nums, middleIndex + 1, highIndex);

        // Execute both tasks in parallel
        invokeAll(task1, task2);

        // Merge results — return the larger maximum
        return Math.max(task1.join(), task2.join());
    }

    private long sequentialMaxFinding() {
        long max = nums[lowIndex];

        for (int i = lowIndex + 1; i < highIndex; i++) {
            if (nums[i] > max) {
                max = nums[i];
            }
        }

        return max;
    }
}
```

### Step-by-step breakdown

1. **Check if sub-array is small enough** — if fewer than 1000 elements, solve sequentially
2. **Calculate middle index** — split the array into two halves
3. **Create two sub-tasks** — one for the left half (`lowIndex` to `middleIndex`), one for the right half (`middleIndex + 1` to `highIndex`)
4. **Execute in parallel** — `invokeAll(task1, task2)` forks both and waits for completion
5. **Merge** — return `Math.max()` of both sub-results

---

## Understanding `lowIndex` and `highIndex`

These are **index pointers** that define which portion of the array a task operates on.

```
Array: [4, 7, 2, 9, 1, 6]
Index:  0  1  2  3  4  5

Full array:    lowIndex = 0, highIndex = 5
Left half:     lowIndex = 0, highIndex = 2
Right half:    lowIndex = 3, highIndex = 5
```

Each sub-task works on its assigned range without copying the array — they all share the same underlying array but operate on different index ranges.

---

## The Threshold: When to Stop Splitting

### 🧠 What is it?

The threshold (in our case, 1000) determines when to stop dividing and switch to the sequential algorithm. This is a crucial tuning parameter.

### ❓ Why does it matter?

- **Too small** → too many tiny tasks, thread overhead dominates
- **Too large** → not enough parallelism, underutilizes CPU cores
- **Just right** → maximum speedup

### 💡 Pro Tip

There's no universal optimal threshold. It depends on:
- The number of CPU cores
- The cost of each operation
- Array size

Experiment with values like 1000, 3000, or 5000 to find what works best for your hardware.

---

## ✅ Key Takeaways

- Sequential max finding uses **linear search** with O(N) time
- Parallel max finding uses **divide-and-conquer** with the Fork-Join framework
- The array is recursively split until sub-arrays are small enough for sequential processing
- `invokeAll()` executes multiple tasks in parallel and waits for all to complete
- `Math.max()` merges the sub-results
- The **threshold** is a tunable parameter that controls when to switch from parallel to sequential

## ⚠️ Common Mistake

- Setting the threshold too low creates excessive sub-tasks, leading to more overhead than benefit
- Always test with different threshold values to find the sweet spot

## 💡 Pro Tip

The `lowIndex` / `highIndex` approach avoids copying array segments — all tasks share the same array and just track their boundaries. This is memory-efficient and fast.
