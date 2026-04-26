# Sorting Arrays

## Introduction

Sorting is one of the most fundamental operations in programming. Java provides built-in sorting through `Arrays.sort()`, and it's important to understand what's happening under the hood — because Java actually uses **different algorithms** depending on what you're sorting.

---

## Concept 1: Two Algorithms Under the Hood

### 🧠 What does Java use?

| Data Type | Algorithm | Time Complexity |
|-----------|-----------|----------------|
| **Primitive types** (int, double, char...) | **Quicksort** (Dual-Pivot) | O(n log n) average, O(n²) worst |
| **Reference types** (Integer, String, custom objects) | **Merge Sort** (TimSort) | O(n log n) guaranteed |

### ❓ Why two different algorithms?

- **Quicksort** is the fastest sorting algorithm on average but can degrade to O(n²) in the worst case. The O(n²) worst case occurs when the pivot selection is poor — for example, if the pivot is always the smallest or largest element, each partition removes only one element instead of splitting the array roughly in half, turning the divide-and-conquer into a linear scan repeated n times. For primitives, this risk is acceptable — because (1) primitives have no identity beyond their value, so **stability doesn't matter** (two equal `int` values are indistinguishable), and (2) Java's Dual-Pivot Quicksort uses randomized pivots that make the O(n²) worst case extremely unlikely in practice.
- **Merge Sort** guarantees O(n log n) in all cases and is **stable** (preserves the original order of equal elements). Stability matters for objects, where equal elements might still differ in other fields.

---

## Concept 2: Sorting Primitive Arrays

### 🧪 Example — Ascending Order

```java
int[] nums = {1, 10, 5, 2, -5, 12, 14, 0, 1, 2};

Arrays.sort(nums);

for (int n : nums) {
    System.out.print(n + " ");
}
// Output: -5 0 1 1 2 2 5 10 12 14
```

`Arrays.sort()` sorts in **ascending order** by default.

### 🧪 Example — Descending Order (manual approach)

There's no built-in way to sort a primitive array in descending order with `Arrays.sort()`. You can't pass `Collections.reverseOrder()` — it doesn't work with primitives.

**Solution:** Sort ascending, then iterate in reverse:

```java
Arrays.sort(nums);  // ascending first

for (int i = nums.length - 1; i >= 0; i--) {
    System.out.print(nums[i] + " ");
}
// Output: 14 12 10 5 2 2 1 1 0 -5
```

---

## Concept 3: Sorting String Arrays

### 🧪 Example

```java
String[] names = {"Kevin", "Daniel", "Katie", "Anna", "Adam"};

Arrays.sort(names);

for (String name : names) {
    System.out.print(name + " ");
}
// Output: Adam Anna Daniel Katie Kevin
```

Strings are sorted in **alphabetical (lexicographic) order** — that's their natural ordering.

Since `String` is a reference type, Java uses **Merge Sort** (TimSort) here, which guarantees O(n log n) performance.

---

## ✅ Key Takeaways

- `Arrays.sort()` handles both primitive and reference types
- Primitives use **Quicksort** (fastest on average); reference types use **Merge Sort** (guaranteed O(n log n), stable)
- Default sort order is always **ascending**
- For descending order with primitives, sort ascending then iterate in reverse
- String arrays are sorted alphabetically

## ⚠️ Common Mistakes

- Trying to pass `Collections.reverseOrder()` to `Arrays.sort()` with a primitive array — this causes a compile error because the `Arrays.sort(T[], Comparator)` overload requires a generic array, and generics don't support primitive types (type erasure replaces `T` with `Object`, and `int` is not an `Object`). Use `Integer[]` instead of `int[]`.
- Forgetting that array indices start at 0 — use `nums.length - 1` as the starting index when iterating in reverse

## 💡 Pro Tips

- If you need descending order for reference types, you **can** use `Arrays.sort(names, Collections.reverseOrder())`
- `Arrays.parallelSort()` can leverage multiple CPU cores for large arrays
- Both QuickSort and MergeSort are O(n log n) — these are the best general-purpose comparison-based sorting complexities achievable
