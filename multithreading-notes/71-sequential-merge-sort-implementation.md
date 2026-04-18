# Sequential Merge Sort Implementation

## Introduction

We've already covered the theory behind merge sort — the divide and conquer paradigm, the split phase, the merge phase. Now it's time to implement the **complete sequential version** in Java. This is the foundation that we'll later parallelize. Understanding every line of this implementation is critical — the parallel version is just this code plus thread management.

---

## Concept 1: The Class Structure

### ⚙️ Setting up the MergeSort class

```java
public class MergeSort {

    private int[] nums;
    private int[] tempArray;

    public MergeSort(int[] nums) {
        this.nums = nums;
        this.tempArray = new int[nums.length];
    }

    public void sort() {
        mergeSort(0, nums.length - 1);
    }
}
```

### ❓ Why a temporary array?

Merge sort is **not in-place** — it needs extra memory to merge two sorted subarrays. Instead of creating new arrays at every merge step (which would be expensive), we allocate **one temporary array** at the beginning and reuse it throughout the entire sort.

This is an important optimization: without it, merge sort creates `O(N log N)` temporary arrays. With it, only **O(N)** extra memory is used.

---

## Concept 2: The Divide Phase — mergeSort()

### ⚙️ Implementation

```java
private void mergeSort(int low, int high) {
    // Base case: single element or empty subarray
    if (low >= high) return;

    // Find the middle index
    int middle = (low + high) / 2;

    // Recursively sort the left half
    mergeSort(low, middle);

    // Recursively sort the right half
    mergeSort(middle + 1, high);

    // Merge the two sorted halves
    merge(low, middle, high);
}
```

### 🧠 Step-by-step walkthrough

For an array `[5, 3, 8, 1]` (indices 0 to 3):

```
mergeSort(0, 3)
    middle = 1
    mergeSort(0, 1)              ← sort left half [5, 3]
        middle = 0
        mergeSort(0, 0)          ← base case (single element)
        mergeSort(1, 1)          ← base case (single element)
        merge(0, 0, 1)           ← merge [5] and [3] → [3, 5]
    mergeSort(2, 3)              ← sort right half [8, 1]
        middle = 2
        mergeSort(2, 2)          ← base case
        mergeSort(3, 3)          ← base case
        merge(2, 2, 3)           ← merge [8] and [1] → [1, 8]
    merge(0, 1, 3)               ← merge [3, 5] and [1, 8] → [1, 3, 5, 8]
```

### 💡 Insight

The `mergeSort()` method does **no actual sorting** — it just decides where to split. All the real work happens in `merge()`. This separation is what makes parallelization possible: the two recursive calls are **completely independent** and can run on different threads.

---

## Concept 3: The Conquer Phase — merge()

### ⚙️ Implementation

```java
private void merge(int low, int middle, int high) {

    // Copy the relevant portion into tempArray
    for (int i = low; i <= high; i++) {
        tempArray[i] = nums[i];
    }

    int i = low;          // pointer for left subarray
    int j = middle + 1;   // pointer for right subarray
    int k = low;          // pointer for merged result

    // Compare elements from both halves and place the smaller one
    while (i <= middle && j <= high) {
        if (tempArray[i] <= tempArray[j]) {
            nums[k] = tempArray[i];
            i++;
        } else {
            nums[k] = tempArray[j];
            j++;
        }
        k++;
    }

    // Copy remaining elements from the left subarray (if any)
    while (i <= middle) {
        nums[k] = tempArray[i];
        i++;
        k++;
    }

    // Right subarray remnants are already in place — no need to copy
}
```

### 🧠 How the merge works — visual walkthrough

Merging `[3, 5]` and `[1, 8]`:

```
tempArray: [3, 5, 1, 8]
           i        j

Step 1: tempArray[i]=3 vs tempArray[j]=1 → 1 is smaller → nums[k]=1, j++
Step 2: tempArray[i]=3 vs tempArray[j]=8 → 3 is smaller → nums[k]=3, i++
Step 3: tempArray[i]=5 vs tempArray[j]=8 → 5 is smaller → nums[k]=5, i++
Step 4: i > middle → copy remaining: nothing left from left
         j still has 8 → already in correct position in nums

Result: [1, 3, 5, 8]
```

### ⚠️ Why don't we copy the right subarray's remaining elements?

Because the right subarray elements are already at the end of `nums`. We only copied data **from** `nums` **into** `tempArray`. When the left pointer is exhausted, the right subarray elements are already where they belong.

---

## Concept 4: Running the Sort

### 🧪 Main method

```java
public class App {
    public static void main(String[] args) {
        int[] nums = {5, 3, 8, 1, 9, 2, 7, 4, 6};

        MergeSort mergeSort = new MergeSort(nums);
        mergeSort.sort();

        System.out.println(Arrays.toString(nums));
        // Output: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
}
```

---

## Concept 5: Complexity Analysis

### ⚙️ Time Complexity

- **Divide phase**: We split the array in half `log N` times
- **Merge phase**: At each level, we process all `N` elements
- **Total**: O(N log N) — guaranteed, regardless of input

### ⚙️ Space Complexity

- O(N) for the `tempArray`
- O(log N) for the recursive call stack
- **Total**: O(N)

### ⚙️ Why this matters for parallelization

The two recursive calls `mergeSort(low, middle)` and `mergeSort(middle + 1, high)` are **completely independent** — they operate on non-overlapping portions of the array. This means they can execute on different threads without any synchronization during the divide phase.

The merge step, however, is **inherently sequential** — it must wait for both halves to be sorted before combining them. This is the sequential bottleneck identified by Amdahl's Law.

---

## ✅ Key Takeaways

- The `mergeSort()` method recursively splits; the `merge()` method does the actual sorting
- A single temporary array is allocated once and reused — avoids per-merge allocations
- The merge uses a **two-pointer technique** to combine two sorted subarrays efficiently
- Right subarray remnants don't need copying — they're already in the correct position
- The two recursive calls are independent — this is why merge sort parallelizes so well
- Time complexity: O(N log N); Space complexity: O(N)
