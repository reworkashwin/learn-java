# Sequential Merge Sort Introduction

## Introduction

Before we can appreciate the power of parallel algorithms, we need to understand their sequential counterparts. This section covers **merge sort** — a classic divide and conquer sorting algorithm — and sets the stage for parallelizing it later.

Why does this matter? Because merge sort is the perfect candidate for parallelization: it naturally splits work into independent subproblems that can be solved simultaneously.

---

## Concept 1: What Is Merge Sort?

### 🧠 What is it?

Merge sort is a **sorting algorithm** that arranges elements in ascending or descending order. It was invented by **John von Neumann in 1945** and is based on the **divide and conquer** paradigm.

### ❓ Why do we need it?

Sorting is one of the most fundamental operations in computer science. Merge sort gives us a **guaranteed O(N log N)** running time — no matter what the input looks like. Unlike quicksort, which can degrade to O(N²) in the worst case, merge sort is always linearithmic.

### ⚙️ Key Properties

- **Comparison-based**: relies on comparing items to determine order
- **Stable**: maintains the relative order of items with equal values
- **Not in-place**: requires **O(N) additional memory** — this is its main disadvantage
- **Running time**: O(N log N) — linearithmic

### 💡 Insight

Merge sort is often the **best choice for sorting linked lists** because, in that case, it doesn't need extra memory — you can rearrange pointers instead of copying data.

---

## Concept 2: How Merge Sort Compares to Alternatives

| Algorithm | Time Complexity | Extra Memory | Notes |
|-----------|----------------|-------------|-------|
| **Merge Sort** | O(N log N) | O(N) | Stable, great for linked lists |
| **Heap Sort** | O(N log N) | O(1) | In-place, but not stable |
| **Quick Sort** | O(N log N) avg | O(log N) | Fastest in practice, but O(N²) worst case |

✅ **Key Takeaway**: Each sorting algorithm has trade-offs. Merge sort trades memory for guaranteed performance and stability.

---

## Concept 3: The Divide Phase

### 🧠 What happens?

Merge sort works in two phases: **divide** and **conquer**. In the divide phase, we keep splitting the array into halves until every subarray contains just a **single item**.

### ⚙️ Step-by-Step

1. Find the **middle index** of the array
2. Split the array into a **left subarray** (items before middle) and a **right subarray** (items after middle)
3. **Recursively** split both subarrays
4. Stop when a subarray has only **one item** — a single item is sorted by default

Think of it like tearing a phone book in half, then tearing each half in half, and so on, until you have individual pages.

### 💡 Optimization: Insertion Sort for Small Subarrays

Instead of recursing all the way down to single items, you can switch to **insertion sort** when the subarray has fewer than 5–10 items. Why?

- Insertion sort has O(N²) in general, but **near-linear** performance on very small or nearly sorted data
- This eliminates excessive recursive function calls
- This is a common real-world optimization used in production sorting implementations

---

## Concept 4: The Conquer (Merge) Phase

### 🧠 What happens?

After dividing, we have many tiny sorted subarrays. Now we **merge** them back together, two at a time, to produce the sorted result.

### ⚙️ How Merging Works

Given two sorted subarrays, say `[3, 5, 6, 10]` and `[1, 4, 8]`:

1. Compare the first elements of both arrays: **1 < 3** → take 1
2. Compare next: **3 < 4** → take 3
3. Compare next: **4 < 5** → take 4
4. Compare next: **5 < 8** → take 5
5. Compare next: **6 < 8** → take 6
6. Compare next: **8 < 10** → take 8
7. Right subarray is exhausted → copy remaining from left: **10**

**Result**: `[1, 3, 4, 5, 6, 8, 10]`

### ⚙️ Why This Needs Extra Memory

The merge step creates a **new result array** to hold the merged items. This is why merge sort requires O(N) additional memory — you need a temporary array as large as the data you're sorting.

### 💡 Running Time of Merge

Each merge operation runs in **O(N)** time because we look at each element exactly once. Combined with the O(log N) levels of recursion, this gives the overall **O(N log N)** complexity.

---

## Concept 5: The Big Picture

```
Original:    [32, -12, 0, 3, 1, 12, 20]

DIVIDE:
             [32, -12, 0, 3]    [1, 12, 20]
           [32, -12]  [0, 3]   [1, 12]  [20]
          [32] [-12]  [0] [3]  [1] [12]  [20]

CONQUER (merge back):
          [-12, 32]  [0, 3]   [1, 12]  [20]
           [-12, 0, 3, 32]     [1, 12, 20]
             [-12, 0, 1, 3, 12, 20, 32]
```

Each level of the merge phase does O(N) work total, and there are O(log N) levels — giving us **O(N log N)** overall.

---

## Summary

✅ Merge sort is a divide and conquer algorithm with guaranteed O(N log N) performance

✅ The divide phase recursively splits the array until single items remain

✅ The conquer phase merges sorted subarrays back together

⚠️ Merge sort is **not in-place** — it requires O(N) extra memory for the merge step

💡 Switching to insertion sort for small subarrays (< 10 items) is a common optimization that reduces recursive overhead
