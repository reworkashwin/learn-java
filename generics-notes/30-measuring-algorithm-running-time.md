# How to Measure the Running Time of Algorithms

## Introduction

Before we dive into different data structures and compare them, we need a way to **objectively measure** how fast or slow an operation is. This lesson introduces **Big O notation** — the standard tool for comparing algorithms regardless of hardware.

Understanding time complexity is essential for making informed decisions about which data structure to use.

---

## Why Not Just Measure Elapsed Time?

Measuring how long an algorithm takes in seconds seems intuitive, but it's deeply flawed:

- The **same algorithm** can take different amounts of time on different machines
- A **slower algorithm** might appear faster simply because it ran on a more powerful computer
- Results vary based on CPU speed, RAM, background processes, etc.

So elapsed time is unreliable. We need something hardware-independent.

---

## The Better Approach: Counting Steps

Instead of measuring time, we count the **number of basic operations** an algorithm performs as a function of the **input size** (usually called `n`).

This gives us **Big O notation** — an upper bound on the growth rate of the algorithm's running time.

The key question is: **How does the running time change as the input size grows?**

---

## O(1) — Constant Time Complexity

The running time is **independent** of the input size. No matter how large the input, the operation takes the same amount of time.

### Example: Swapping two items in an array

```java
int temp = nums[i];
nums[i] = nums[j];
nums[j] = temp;
```

Whether the array has 5 items or 5 million, swapping two elements at known indices takes the exact same number of operations.

**If you double the input size → the running time stays the same.**

---

## O(n) — Linear Time Complexity

The running time grows **proportionally** with the input size.

### Example: Doubling every value in an array

```java
for (int i = 0; i < nums.length; i++) {
    nums[i] = nums[i] * 2;
}
```

If the array has 5 items, we do 5 operations. If it has 10 items, we do 10 operations.

**If you double the input size → the running time doubles.**

---

## O(n²) — Quadratic Time Complexity

The running time grows as the **square** of the input size. This typically happens with **nested loops**.

### Example: Comparing every pair of elements

```java
for (int i = 0; i < nums.length; i++) {
    for (int j = 0; j < nums.length; j++) {
        // some operation with nums[i] and nums[j]
    }
}
```

- A single loop over `n` items → O(n)
- Two nested loops over `n` items → O(n²)
- Three nested loops → O(n³)

**If you double the input size → the running time quadruples (2² = 4).**

| Input size multiplied by | Running time multiplied by |
|---|---|
| 2× | 4× |
| 3× | 9× |
| 4× | 16× |

This gets slow very quickly, which is why naive sorting algorithms like Bubble Sort (O(n²)) struggle with large datasets.

---

## O(log n) — Logarithmic Time Complexity

The running time grows **logarithmically** — much slower than linearly. Each step cuts the problem in half.

### Example: Binary Search

Instead of checking every element, binary search eliminates half the remaining elements each step. This is why it works in O(log n) time.

```java
// Binary search — O(log n)
public static int binarySearch(int[] sorted, int target) {
    int low = 0, high = sorted.length - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (sorted[mid] == target) return mid;       // found it
        else if (sorted[mid] < target) low = mid + 1; // discard left half
        else high = mid - 1;                          // discard right half
    }
    return -1; // not found
}

// With 1,000,000 items: at most ~20 comparisons (log₂(1,000,000) ≈ 20)
// With 1,000,000,000 items: at most ~30 comparisons
```

Each iteration discards half the array. An array of 1 million elements needs at most ~20 steps, not 1 million.

---

## Comparing Growth Rates

From fastest to slowest:

| Complexity | Name | Doubles input → Running time |
|---|---|---|
| O(1) | Constant | Stays the same |
| O(log n) | Logarithmic | Increases slightly |
| O(n) | Linear | Doubles |
| O(n log n) | Linearithmic | Slightly more than doubles |
| O(n²) | Quadratic | Quadruples |
| O(2ⁿ) | Exponential | Grows astronomically |

The difference between these is massive at scale. For an input of 1 million items:
- O(1) → 1 operation
- O(log n) → ~20 operations
- O(n) → 1,000,000 operations
- O(n²) → 1,000,000,000,000 operations

---

## Why This Matters for Data Structures

In the coming lectures, we'll see that:

- **Arrays** give O(1) access by index, but O(n) for arbitrary insertions/removals
- **Linked Lists** give O(1) for inserting at the head, but O(n) for searching
- **Hash Tables** give O(1) for lookups, insertions, and deletions
- **Binary Search Trees** give O(log n) for most operations

Choosing the right data structure means choosing the right time complexity for your most frequent operations.

---

## ✅ Key Takeaways

- Don't measure algorithms by elapsed time — it depends on hardware
- Measure by **counting operations** as a function of input size
- O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) — from fastest to slowest
- Nested loops multiply complexity: one loop = O(n), two nested = O(n²), three nested = O(n³)
- The right data structure can dramatically reduce time complexity

## ⚠️ Common Mistakes

- Thinking O(n²) is "only twice as slow" as O(n) — it's not, it's exponentially worse at scale
- Ignoring time complexity when choosing data structures — this leads to performance bottlenecks
- Assuming that measuring wall-clock time is a valid way to compare algorithms

## 💡 Pro Tip

There's a fundamental **trade-off between memory and running time**. Algorithms that use more memory (like hash tables) can achieve faster running times. You can't optimize both simultaneously — faster algorithms typically require more space, and space-efficient algorithms are typically slower.
