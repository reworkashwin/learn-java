# Sum Problem — Sequential Approach

## Introduction

Before implementing the parallel version of the sum problem, we need a clean sequential baseline. This section implements the simplest possible sum algorithm — a linear scan that adds up every element in an array.

---

## Concept 1: The Implementation

### ⚙️ The Sequential Sum Class

```java
public class SequentialSum {
    
    public int sum(int[] nums) {
        int sum = 0;
        for (int i = 0; i < nums.length; i++) {
            sum += nums[i];
        }
        return sum;
    }
}
```

That's it. A single loop that:
1. Starts with `sum = 0`
2. Iterates through every element in the array
3. Adds each element to the running total
4. Returns the final sum

### 🧪 Testing It

```java
public static void main(String[] args) {
    int[] numbers = {1, 2, 3, 4, 5};
    SequentialSum sequential = new SequentialSum();
    System.out.println(sequential.sum(numbers));
    // Output: 15
}
```

1 + 2 + 3 + 4 + 5 = 15. Correct.

---

## Concept 2: Running Time Analysis

### ⚙️ Why is it O(N)?

The algorithm contains a single `for` loop that visits each element **exactly once**. If there are N elements, there are N iterations. No nested loops, no recursion — just a single pass.

This is a **linear-time algorithm**: double the input size, double the running time.

### 💡 Can we do better sequentially?

No. To compute the sum of N numbers, you **must** look at every number at least once. There's no shortcut — you can't skip any element and still guarantee the correct answer. O(N) is the theoretical lower bound for this problem.

---

## Concept 3: Why This Matters

### ❓ If it's so simple, why bother?

This sequential implementation serves as:

1. **The baseline** for comparing parallel performance
2. **The fallback** — when the dataset is small, sequential is actually faster than parallel (due to thread overhead)
3. **A building block** — the parallel version will use this exact logic within each thread's chunk

### 💡 Insight

The parallel sum algorithm doesn't replace sequential summation — it **uses** sequential summation internally. Each thread runs a sequential sum on its assigned chunk. The parallelism comes from running multiple sequential sums simultaneously.

---

## Summary

✅ Sequential sum iterates through the array once, adding each element — O(N) time

✅ This is the theoretical minimum — you must look at every element to compute the sum

✅ The sequential version serves as the baseline for performance comparison and as the building block inside each parallel thread

💡 For small datasets, sequential is actually faster than parallel due to thread creation and synchronization overhead
