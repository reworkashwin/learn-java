# Parallel Merge Sort Implementation

## Introduction

Now that we understand sequential merge sort, it's time to **parallelize** it. The idea is simple: since the left and right subarrays are sorted independently, we can sort them on **different threads simultaneously**. This section walks through the actual Java implementation of parallel merge sort.

---

## Concept 1: The Parallel Strategy

### 🧠 What's the approach?

Instead of sorting left and right subarrays one after the other (sequentially), we assign each subarray to a **separate thread** and sort them **at the same time**.

### ❓ How many threads should we create?

This is crucial: we do **NOT** create a thread for every subarray. That would be extremely expensive because:
- Context switching between threads is costly
- The OS has to save/load thread state on every switch
- Too many threads actually slows things down

Instead, we create **as many threads as the number of processor cores**. On a machine with 8 cores, we use 8 threads. Once we run out of threads, we fall back to sequential merge sort.

### 💡 Analogy

Think of it like delegating work to employees. If you have 8 employees, you split a big job into chunks and assign one to each person. If you have more chunks than employees, some employees handle multiple chunks sequentially — you don't hire temporary workers for every tiny task.

---

## Concept 2: The Implementation

### ⚙️ Step 1: The Thread Creation Method

```java
private Thread createThread(int low, int high, int numThreads) {
    return new Thread(() -> {
        parallelMergeSort(low, high, numThreads / 2);
    });
}
```

This method creates a new thread that will sort a subarray from index `low` to index `high`. Notice `numThreads / 2` — each time we split, we divide the available threads between left and right.

### ⚙️ Step 2: The Parallel Merge Sort Method

```java
public void parallelMergeSort(int low, int high, int numThreads) {
    // No more threads available — fall back to sequential
    if (numThreads <= 1) {
        mergeSort(low, high);  // standard sequential merge sort
        return;
    }
    
    int middle = (low + high) / 2;
    
    // Create threads for left and right halves
    Thread leftSorter = createThread(low, middle, numThreads);
    Thread rightSorter = createThread(middle + 1, high, numThreads);
    
    // Start both threads — they run in parallel
    leftSorter.start();
    rightSorter.start();
    
    // Wait for both threads to finish
    try {
        leftSorter.join();
        rightSorter.join();
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    
    // Merge the sorted halves — this is sequential!
    merge(low, middle, high);
}
```

### ⚙️ Step 3: How Thread Count Decreases

If you start with 8 threads on an 8-core machine:

```
Level 0: parallelMergeSort(..., 8)
 ├── Level 1 Left:  parallelMergeSort(..., 4)
 │    ├── Level 2: parallelMergeSort(..., 2)
 │    │    ├── Level 3: parallelMergeSort(..., 1) → sequential!
 │    │    └── Level 3: parallelMergeSort(..., 1) → sequential!
 │    └── Level 2: parallelMergeSort(..., 2)
 │         ├── ...
 │         └── ...
 └── Level 1 Right: parallelMergeSort(..., 4)
      └── (mirrors left side)
```

At each level, `numThreads` is halved. Once it reaches 1, the algorithm switches to sequential merge sort.

---

## Concept 3: Why the Merge Must Be Sequential

### ❓ Why can't we parallelize the merge too?

The merge operation compares elements from **two sorted subarrays** and combines them. It's inherently **order-dependent** — you must look at the current smallest elements from both arrays to decide which goes next.

More critically: **both subarrays must be fully sorted before merging can begin**. This means threads **must wait for each other** before the merge step.

```java
// Both must finish before we can merge
leftSorter.join();   // wait for left thread
rightSorter.join();  // wait for right thread

merge(low, middle, high);  // sequential merge
```

### 💡 Insight

This sequential merge is the bottleneck that limits how much speedup we can achieve. This is directly related to **Amdahl's law** — the sequential portion of an algorithm limits the maximum possible speedup, regardless of how many processors you have.

---

## Concept 4: The Complete Picture

```
Original Array:  [32, -12, 0, 3, 1, 12, 20]
Threads Available: 8

Thread 1: sort [32, -12, 0, 3]     Thread 2: sort [1, 12, 20]
    ↓ (parallel)                        ↓ (parallel)
Thread 3: [32, -12]  Thread 4: [0, 3]  Thread 5: [1, 12]  Thread 6: [20]
    ↓ sequential       ↓ sequential       ↓ sequential       ↓ done
[-12, 32]             [0, 3]             [1, 12]            [20]
    ↓ merge              ↓ merge            ↓ merge
[-12, 0, 3, 32]                       [1, 12, 20]
              ↓ final merge (sequential)
         [-12, 0, 1, 3, 12, 20, 32]
```

---

## Summary

✅ Parallel merge sort assigns left and right subarrays to separate threads for simultaneous sorting

✅ The number of threads starts equal to the number of processor cores and halves at each split level

✅ When threads run out (`numThreads <= 1`), the algorithm falls back to sequential merge sort

✅ `Thread.start()` launches parallel execution; `Thread.join()` waits for completion

⚠️ The merge step is always **sequential** — both subarrays must be sorted before merging can begin

⚠️ Creating too many threads hurts performance — always limit threads to available processor cores

💡 The `join()` calls act as synchronization barriers, ensuring correctness before merging
