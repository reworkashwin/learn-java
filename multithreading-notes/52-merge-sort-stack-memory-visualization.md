# Merge Sort and Stack Memory Visualization

## Introduction

Understanding how merge sort interacts with the **stack memory** is essential for grasping recursive algorithms. This section walks through a complete merge sort execution step-by-step, showing exactly how recursive calls pile up on the stack and how results flow back as frames are popped.

This visualization reveals why divide and conquer algorithms rely so heavily on the stack — and why that has implications for parallel computing.

---

## Concept 1: The Setup

### 🧠 What are we working with?

We're sorting the dataset: **[3, 2, 6, 4, 1]**

The key players:
- **Stack memory**: where recursive function calls are stored
- **Merge sort source code**: the recursive function with a base case, recursive calls, and a merge step

### ⚙️ The Algorithm Structure

```java
void sort(int[] array) {
    // Base case: single item is sorted
    if (array.length <= 1) return;
    
    // Split into left and right
    int[] left = leftHalf(array);
    int[] right = rightHalf(array);
    
    // Recursive calls
    sort(left);
    sort(right);
    
    // Merge results
    merge(left, right, array);
}
```

The critical insight: `sort(left)` must **complete entirely** before `sort(right)` even begins. This is how the stack controls execution order.

---

## Concept 2: Walking Through the Execution

### Phase 1: First Split

```
sort([3, 2, 6, 4, 1])        ← pushed onto stack
  left  = [3, 2]
  right = [6, 4, 1]
  sort([3, 2])                ← pushed onto stack (left side first)
```

### Phase 2: Diving into the Left

```
sort([3, 2])                  ← on stack
  left  = [3]
  right = [2]
  sort([3])                   ← pushed onto stack
    → BASE CASE: single item, return
  sort([2])                   ← pushed onto stack  
    → BASE CASE: single item, return
  merge([3], [2]) → [2, 3]   ← merge happens here
  → return to sort([3, 2, 6, 4, 1])
```

✅ **Key Takeaway**: After both `sort([3])` and `sort([2])` return, the merge produces `[2, 3]`. This stack frame is then popped.

### Phase 3: Now the Right Side

```
sort([6, 4, 1])               ← pushed onto stack
  left  = [6]
  right = [4, 1]
  sort([6])                    ← BASE CASE, return
  sort([4, 1])                 ← pushed onto stack
    left  = [4]
    right = [1]
    sort([4])                  ← BASE CASE, return
    sort([1])                  ← BASE CASE, return
    merge([4], [1]) → [1, 4]  ← merge
    → return
  merge([6], [1, 4]) → [1, 4, 6]  ← merge
  → return to sort([3, 2, 6, 4, 1])
```

### Phase 4: Final Merge

```
Left subarray sorted:  [2, 3]
Right subarray sorted: [1, 4, 6]

merge([2, 3], [1, 4, 6]) → [1, 2, 3, 4, 6]
```

The final sorted result: **[1, 2, 3, 4, 6]**

---

## Concept 3: How the Stack Memory Behaves

### 🧠 Stack Growth and Shrinkage

Each recursive call **pushes a new stack frame** containing:
- The local variables (left array, right array, indices)
- The return address (where to continue when this call finishes)

When a function:
- Hits the **base case** → it returns, and the frame is **popped**
- Finishes all operations (including merge) → it returns, and the frame is **popped**

### 🧪 Maximum Stack Depth

For an array of N items, the maximum stack depth is **O(log N)** because we split in half each time. For 5 items:
- Level 0: `sort([3,2,6,4,1])`
- Level 1: `sort([3,2])` or `sort([6,4,1])`
- Level 2: `sort([3])` or `sort([4,1])`
- Level 3: `sort([4])` or `sort([1])`

Maximum depth ≈ 3, which is roughly log₂(5).

### 💡 Insight

The stack ensures that we always **fully process the left subtree** before touching the right subtree. This is depth-first traversal — and it's important for understanding why parallelization helps. In parallel merge sort, we can process left and right subtrees **simultaneously** on different threads, each with their own stack.

---

## Concept 4: Why This Matters for Parallelization

Recursive divide and conquer algorithms like merge sort rely heavily on the stack. In sequential execution:

- Left subtree is processed **completely** before right subtree starts
- Total time = time(left) + time(right) + time(merge)

In parallel execution:

- Left and right subtrees are processed **simultaneously** on different threads
- Total time = max(time(left), time(right)) + time(merge)

This is roughly **half the time** for the recursive part — which is exactly what parallel merge sort exploits.

⚠️ **Common Mistake**: Forgetting that the merge step is still sequential — both subarrays must be fully sorted before merging can begin. This sequential portion limits the maximum speedup (Amdahl's law).

---

## Summary

✅ Each recursive call in merge sort creates a new stack frame with its own local variables

✅ The stack grows to a maximum depth of O(log N) — one level per split

✅ Left subtrees are fully processed before right subtrees in sequential execution

✅ Merge happens only after both recursive calls return — this is the sequential bottleneck

💡 Understanding stack-based execution makes it clear why the left and right recursive calls are **independent** — and therefore perfect candidates for parallelization
