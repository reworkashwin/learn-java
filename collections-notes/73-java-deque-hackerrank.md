# 📘 Java Deque — HackerRank Challenge (Sliding Window + Unique Elements)

---

## 📌 Introduction

### 🧠 What is this about?

This is a hands-on problem-solving lesson where we apply the **Deque** data structure to solve a classic **sliding window** problem — finding the maximum number of unique integers in any contiguous subarray of a given size.

It's a HackerRank challenge, and it beautifully demonstrates how combining **Deque** with **HashSet** from the Java Collections Framework can produce an elegant, efficient solution.

### ❓ Why does it matter?

- Sliding window is one of the **most common patterns** in coding interviews and competitive programming
- This problem forces you to think about **when to add** and **when to remove** elements — which is exactly what a Deque excels at
- You'll learn how to combine multiple collection types (Deque + Set) to solve a problem that neither can solve alone
- Understanding this pattern will help you tackle a whole family of similar problems (max/min in window, distinct count in window, etc.)

---

## 🧩 Concept 1: Understanding the Problem

### 🧠 What is it?

You're given:
- An array of **N** integers
- A window size **M**

Your task: slide a window of size M across the array, count the unique elements in each window, and return the **maximum** unique count across all windows.

### ❓ Why do we need it?

Think about it in a real-world scenario — imagine you're monitoring user sessions on a website. You want to know: *"In any 3-minute window, what's the maximum number of distinct users we've ever seen?"* That's exactly this problem.

### ⚙️ How it works (Step-by-Step)

Let's walk through the sample input:

```
N = 6, Array = [5, 3, 5, 2, 3, 2], M = 3
```

We slide a window of size 3 across the array:

```
Window 1: [5, 3, 5] → unique elements: {5, 3}     → count = 2
Window 2: [3, 5, 2] → unique elements: {3, 5, 2}   → count = 3
Window 3: [5, 2, 3] → unique elements: {5, 2, 3}   → count = 3
Window 4: [2, 3, 2] → unique elements: {2, 3}       → count = 2
```

Maximum unique count = **3**

Notice how the window "slides" — each step, we **add one element from the right** and **remove one element from the left**. This is precisely the behavior of a Deque!

### 🧪 Visualization

```
Array:  [5, 3, 5, 2, 3, 2]
         ├──────┤                 → Window 1: {5,3}   = 2 unique
            ├──────┤              → Window 2: {3,5,2}  = 3 unique ✅
               ├──────┤           → Window 3: {5,2,3}  = 3 unique ✅
                  ├──────┤        → Window 4: {2,3}    = 2 unique

Answer: 3
```

---

## 🧩 Concept 2: Why Deque is the Right Tool

### 🧠 What is it?

A **Deque** (Double-Ended Queue) allows adding and removing elements from **both the front and the back**. This maps perfectly to the sliding window:

- **Add to the back** → new element enters the window from the right
- **Remove from the front** → old element leaves the window from the left

### ❓ Why do we need it?

Why not just use an ArrayList? You *could*, but removing the first element from an ArrayList is **O(n)** — every element has to shift left. With a Deque (especially `ArrayDeque`), both `addLast()` and `removeFirst()` are **O(1)**. For large inputs, this difference matters a lot.

### ⚙️ Deque Interface Quick Recap

| Operation | Head (Front) | Tail (Back) |
|-----------|-------------|-------------|
| **Add** | `addFirst(e)` | `addLast(e)` |
| **Remove** | `removeFirst()` | `removeLast()` |
| **Examine** | `getFirst()` | `getLast()` |

When used as a **Queue (FIFO)**: `addLast()` → `removeFirst()`
When used as a **Stack (LIFO)**: `addFirst()` → `removeFirst()`

Two implementations:
- **ArrayDeque** — backed by a resizable array, more efficient for most use cases
- **LinkedList** — backed by a doubly-linked list

For this problem, we use `ArrayDeque` since it's faster and has lower memory overhead.

---

## 🧩 Concept 3: The Sliding Window Algorithm

### 🧠 What is it?

The sliding window technique is an approach where you maintain a "window" of fixed size over the data, and instead of recalculating everything from scratch for each window position, you **incrementally update** by adding the new element and removing the old one.

### ❓ Why do we need it?

The brute-force approach would be: for every possible window, count distinct elements. That's **O(N × M)** — too slow for large inputs.

With sliding window + Deque + HashSet, we can do it in approximately **O(N)** time (with a small overhead for the `contains` check on the deque).

### ⚙️ How it works (Step-by-Step)

Here's the strategy:
1. Use a **Deque** to maintain the current window of elements
2. Use a **HashSet** to track unique elements in the current window
3. For each new element:
   - **Add** it to the deque (back) and the set
   - If the deque size exceeds M, **remove** the front element from the deque
   - But only remove it from the set **if it no longer exists anywhere in the deque**
4. Track the maximum set size across all windows

### 💡 The Critical Insight

Why can't we blindly remove from the HashSet when we remove from the Deque?

Consider the window `[5, 3, 5]`. If we slide the window and remove `5` from the front, the value `5` **still exists** in the window at another position! If we removed `5` from our HashSet, we'd undercount the unique elements.

So the rule is:

> **Only remove an element from the HashSet if, after removing it from the Deque, it no longer appears anywhere in the Deque.**

We check this with `deque.contains(removed)`.

---

## 🧩 Concept 4: The Complete Solution

### 🧠 Step-by-Step Walkthrough

Let's trace through the algorithm with our sample input:

```
Array = [5, 3, 5, 2, 3, 2], M = 3
```

| Step | Action | Deque | Set | maxUnique |
|------|--------|-------|-----|-----------|
| i=0 | Add 5 | [5] | {5} | 1 |
| i=1 | Add 3 | [5, 3] | {5, 3} | 2 |
| i=2 | Add 5. Size=3 (ok) | [5, 3, 5] | {5, 3} | 2 |
| i=3 | Add 2. Size>3 → remove front (5). Deque still has 5? Yes → keep in set | [3, 5, 2] | {5, 3, 2} | 3 |
| i=4 | Add 3. Size>3 → remove front (3). Deque still has 3? No → remove from set | [5, 2, 3] | {5, 2, 3} | 3 |
| i=5 | Add 2. Size>3 → remove front (5). Deque still has 5? No → remove from set | [2, 3, 2] | {2, 3} | 3 |

**Answer: 3** ✅

### 🧪 Code Example

```java
import java.util.*;

public class JavaDequeChallenge {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        int m = in.nextInt();

        Deque<Integer> deque = new ArrayDeque<>();
        Set<Integer> set = new HashSet<>();
        int maxUnique = 0;

        // Read all elements into an array first
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = in.nextInt();
        }

        for (int i = 0; i < n; i++) {
            // Step 1: Add new element to the window
            deque.addLast(arr[i]);
            set.add(arr[i]);

            // Step 2: If window exceeds size M, shrink from the left
            if (deque.size() > m) {
                int removed = deque.removeFirst();
                // Only remove from set if element no longer exists in window
                if (!deque.contains(removed)) {
                    set.remove(removed);
                }
            }

            // Step 3: Update maximum unique count
            if (deque.size() == m) {
                maxUnique = Math.max(maxUnique, set.size());
            }
        }

        System.out.println(maxUnique);
    }
}
```

### 🔍 Code Breakdown

- **`deque.addLast(arr[i])`** — adds the new element to the right side of the window
- **`deque.removeFirst()`** — drops the leftmost (oldest) element when the window is full
- **`deque.contains(removed)`** — checks if the removed value still exists elsewhere in the window. This is the key to correctness!
- **`set.size()`** — gives us the count of unique elements in the current window at O(1)

---

## ✅ Key Takeaways

1. **Deque is perfect for sliding windows** — O(1) add/remove from both ends
2. **Combine data structures** — Deque tracks the window order, HashSet tracks uniqueness. Neither alone is sufficient.
3. **Don't blindly remove from the Set** — an element might appear multiple times in the window. Always check with `deque.contains()` before removing from the set.
4. **ArrayDeque > LinkedList** for most Deque use cases — lower memory overhead and better cache performance
5. **Sliding window avoids brute-force** — instead of recounting for each window, incrementally update by adding one element and removing one

---

## ⚠️ Common Mistakes

1. **Removing from HashSet without checking** — If you remove the front element from the deque and blindly remove it from the set, you'll undercount unique elements when duplicates exist in the window
2. **Using `deque.size() > m` without reading all elements first** — Make sure you read the full input before processing, or handle input reading inline carefully
3. **Forgetting to check `deque.size() == m`** — You should only update `maxUnique` when the window is fully formed (has exactly M elements)
4. **Using ArrayList instead of ArrayDeque** — `ArrayList.remove(0)` is O(n) and will cause TLE on large inputs

---

## 💡 Pro Tips

- **`deque.contains()` is O(n)** — For this problem it's fine because M is the window size and the contains check happens inside the deque of size M. But for very performance-critical code, you could use a **frequency map** (`HashMap<Integer, Integer>`) instead of a HashSet to track counts, eliminating the need for `contains`.
- **This pattern generalizes** — The "Deque + auxiliary data structure" pattern works for many sliding window problems: max/min in window (use Deque as monotonic queue), distinct count (Deque + Set/Map), sum in window (Deque + running sum).
- **ArrayDeque doesn't allow null elements** — If your data can have nulls, use LinkedList instead. But for integer-based problems like this, ArrayDeque is always the better choice.
- **Interview tip** — When you see "contiguous subarray of fixed size", immediately think **sliding window**. When you see "add/remove from ends", think **Deque**.
