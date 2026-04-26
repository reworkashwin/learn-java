# 📘 Searching: Linear Search vs Binary Search

## 📌 Introduction

Searching is a fundamental operation — you have data, and you need to find something in it. Whether it's looking for a specific number in a list or finding a user in a database, searching happens constantly in programming.

Java provides tools for both simple and efficient searching. In this lesson, we'll explore two approaches:
1. **Linear Search** — the straightforward, check-every-element approach
2. **Binary Search** — the divide-and-conquer approach that's dramatically faster

We'll also analyze the **efficiency** of each algorithm so you know when to use which.

---

## 🧩 Concept 1: Linear Search

### 🧠 What is it?

Linear search is the most basic form of searching. You start at the beginning of a collection and check **every element one by one** until you either find the target or reach the end.

Think of it like looking for a book on an unsorted bookshelf — you have no choice but to scan every book until you find it.

### ❓ Why do we need it?

Linear search works on **any collection** — sorted or unsorted. It's simple, intuitive, and requires no preprocessing. For small datasets, it's perfectly fine.

### ⚙️ How it works

1. Start from the first element
2. Compare it with the target
3. If it matches → found! Stop.
4. If not → move to the next element
5. Repeat until you find it or exhaust the list

### 🧪 Example

```java
List<Integer> numbers = Arrays.asList(3, 7, 1, 9, 4);
int target = 4;
boolean found = false;

for (int num : numbers) {
    if (num == target) {
        found = true;
        break;  // No need to keep searching
    }
}

System.out.println("Number found: " + found); // true
```

If the target were `44` (not in the list), `found` would remain `false`.

### 💡 Insight — Time Complexity

| Case | Complexity | When it happens |
|------|-----------|-----------------|
| **Best case** | Ω(1) | Target is the first element |
| **Worst case** | O(n) | Target is the last element or not present |

For a collection with millions of elements, if your target happens to be at the very end, you're checking every single element. That's the fundamental limitation of linear search.

---

## 🧩 Concept 2: Binary Search

### 🧠 What is it?

Binary search is a much smarter approach — but it comes with a requirement: **the collection must be sorted**.

Instead of checking every element, binary search repeatedly **divides the collection in half** and eliminates the half where the target can't possibly be. Each step cuts the search space by 50%.

### ❓ Why do we need it?

Because linear search is painfully slow for large datasets. If you have a million sorted elements, linear search might need up to 1,000,000 comparisons. Binary search? Only about **20 comparisons**. That's the power of logarithmic time.

### ⚙️ How it works

1. Find the **middle element** of the collection
2. Compare it with the target:
   - If equal → found!
   - If target < middle → search the **left half**
   - If target > middle → search the **right half**
3. Repeat on the remaining half until found or search space is empty

Let's walk through an example with `[2, 3, 4, 5, 8, 9]` searching for `4`:

```
Step 1: Collection = [2, 3, 4, 5, 8, 9]
        Mid index = 6/2 = 3 → element is 5
        4 < 5 → search LEFT half [2, 3, 4]

Step 2: Collection = [2, 3, 4]
        Mid index = 3/2 = 1 → element is 3
        4 > 3 → search RIGHT half [4]

Step 3: Collection = [4]
        4 == 4 → Found! Return index.
```

We found the element in just **3 steps** instead of scanning all 6 elements.

### 🧪 Example — Using `Collections.binarySearch()`

You don't need to implement this yourself. Java provides `Collections.binarySearch()`:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int target = 4;

int index = Collections.binarySearch(numbers, target);

if (index >= 0) {
    System.out.println("Number found at index: " + index); // Index: 3
} else {
    System.out.println("Number not found");
}
```

**Important:** If the element is **not found**, `binarySearch()` returns a **negative value** (specifically `-(insertion point) - 1`), not just `-1`.

### 💡 Insight — Time Complexity

Binary search has a time complexity of **O(log n)**.

What does that mean in practice?

| Collection Size | Linear Search (worst) | Binary Search (worst) |
|----------------|----------------------|----------------------|
| 100 | 100 comparisons | ~7 comparisons |
| 1,000 | 1,000 comparisons | ~10 comparisons |
| 1,000,000 | 1,000,000 comparisons | ~20 comparisons |

The difference is massive for large datasets.

---

## 🧩 Concept 3: Under the Hood — Java's Binary Search Implementation

### 🧠 What is it?

Let's peek at how Java actually implements `Collections.binarySearch()` to understand the algorithm at a deeper level.

### ⚙️ How it works

```java
// Simplified version of Java's implementation
int low = 0;
int high = list.size() - 1;

while (low <= high) {
    int mid = (low + high) >>> 1;  // Bitwise right shift = divide by 2
    Comparable midVal = list.get(mid);
    int cmp = midVal.compareTo(key);

    if (cmp < 0) {
        low = mid + 1;      // Key is in the upper half
    } else if (cmp > 0) {
        high = mid - 1;     // Key is in the lower half
    } else {
        return mid;          // Key found!
    }
}
return -(low + 1);  // Key not found — return negative value
```

A few things to notice:

- **`(low + high) >>> 1`** — This is a bitwise right shift, equivalent to dividing by 2 but **avoids integer overflow** that could happen with `(low + high) / 2` for very large values
- **`compareTo()`** returns negative (less than), zero (equal), or positive (greater than)
- If not found, it returns `-(low + 1)` — a negative number indicating where the element *would* be inserted

### 💡 Insight

The return value when an element is not found isn't arbitrary. If you negate it and subtract 1, you get the **insertion point** — the index where the element would go to keep the list sorted. This is useful for maintaining sorted collections.

---

## 🧩 Concept 4: Linear vs Binary Search — When to Use Which

### 🧠 Summary Comparison

| Feature | Linear Search | Binary Search |
|---------|--------------|---------------|
| **Works on** | Any collection (sorted or unsorted) | Sorted collections only |
| **Time Complexity** | O(n) | O(log n) |
| **Best for** | Small datasets, unsorted data | Large sorted datasets |
| **Preprocessing** | None required | Must sort first |
| **Implementation** | Simple loop | `Collections.binarySearch()` |

### ❓ When should you use each?

- **Linear search** → Small collections, or when you can't guarantee the data is sorted
- **Binary search** → Large collections that are already sorted (or worth sorting first)

### 💡 Insight

If you need to search a large collection multiple times, it's often worth sorting it once (O(n log n)) and then using binary search (O(log n) per search) rather than doing linear search (O(n)) each time.

---

## ✅ Key Takeaways

- **Linear search** checks every element sequentially — simple but O(n)
- **Binary search** divides the collection in half each step — fast but requires sorted data, O(log n)
- Use `Collections.binarySearch(list, key)` for built-in binary search on lists
- Binary search returns a **negative value** when the element is not found (not just -1)
- Always **sort your collection first** before performing binary search

## ⚠️ Common Mistakes

- Using binary search on an **unsorted collection** — the results will be unpredictable and incorrect
- Checking `index >= 0` instead of just `index > 0` — remember, index `0` is a valid position!
- Forgetting that `Collections.binarySearch()` requires the list to be sorted in **natural order** (or by the same comparator used for sorting)

## 💡 Pro Tips

- If you need to search the same collection multiple times, sort it once and use binary search — the upfront cost pays off quickly
- `Collections.binarySearch()` returns the insertion point (encoded as a negative number) when an element isn't found — use this for efficient sorted insertions
- For arrays, use `Arrays.binarySearch()` instead — same concept, different class
