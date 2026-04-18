# Array Operations

## Introduction

Now that we understand what arrays are and how they work in memory, let's look at the **operations** we can perform — and crucially, how fast each one is. This will help us understand when arrays are the right choice and when they're not.

---

## Adding Items to the End — O(1)

If there's space available, appending an item to the end is **constant time**. We simply place the item in the next available slot.

```
Before: [12, 5, -7, _, _, _, _, _]
Add 25: [12, 5, -7, 25, _, _, _, _]
```

No other items need to move. This is the fastest way to add to an array.

### What happens when the array is full?

If the array runs out of space, we need to **resize**: allocate a larger array and copy all existing items. This copying is **O(n)** — but it happens rarely, so the amortized cost remains O(1).

---

## The Memory vs. Speed Trade-off

Starting with a **small array**:
- ✅ Less memory wasted
- ❌ Must resize frequently (O(n) each time)

Starting with a **large array**:
- ❌ More memory wasted on empty slots
- ✅ Rarely need to resize

This is a fundamental principle: **you cannot optimize both memory and speed simultaneously**. Faster algorithms generally require more memory, and memory-efficient approaches are generally slower.

---

## Adding Items at Arbitrary Positions — O(n)

Inserting at a specific index requires **shifting** all subsequent items to make room.

### Example: Insert 20 at index 1

```
Before: [12, 5, -7, 25, _, _, _, _]

Step 1: Shift items right
        [12, _, 5, -7, 25, _, _, _]

Step 2: Insert
        [12, 20, 5, -7, 25, _, _, _]
```

In the worst case (inserting at index 0), **every item** must shift. This is O(n).

---

## Removing the Last Item — O(1)

Removing the last element is simple and fast — just "forget" it:

```
Before: [12, 5, -7, 25]
After:  [12, 5, -7]
```

No shifting needed. Constant time.

---

## Removing an Arbitrary Item — O(n)

Removing an item from the middle requires:

1. **Find** the item — O(n) in the worst case
2. **Remove** it — O(1)
3. **Shift** remaining items to fill the gap — O(n) in the worst case

### Example: Remove the value 5

```
Before: [12, 5, -7, 25]

Step 1: Find 5 at index 1
Step 2: Remove it → [12, _, -7, 25]
Step 3: Shift left → [12, -7, 25]
```

Items must remain contiguous — no gaps allowed. This is what makes arbitrary removal expensive.

---

## Searching for an Item by Index — O(1)

If you know the index, access is instant:

```java
int value = array[3];  // O(1) — direct memory calculation
```

This is the superpower of arrays.

---

## Searching for an Item by Value — O(n)

If you don't know the index, you must scan through the array:

```java
for (int i = 0; i < array.length; i++) {
    if (array[i] == target) {
        return i;
    }
}
```

In the worst case, you check every element. This is O(n).

---

## Summary: Array Operation Complexities

| Operation | Time Complexity | Fast? |
|---|---|---|
| Access by index | O(1) | ✅ Very fast |
| Insert at end | O(1) amortized | ✅ Fast |
| Remove last item | O(1) | ✅ Fast |
| Search by value | O(n) | ❌ Slow |
| Insert at arbitrary position | O(n) | ❌ Slow |
| Remove arbitrary item | O(n) | ❌ Slow |

---

## When to Use Arrays (and When Not To)

**Use arrays when:**
- You need fast access by index
- You mostly add/remove from the end
- You know the size upfront (or it doesn't change often)

**Avoid arrays when:**
- You frequently insert/remove at arbitrary positions
- You need to frequently search by value
- The data size is highly unpredictable

For the slow operations, more advanced data structures can help:
- **Binary search trees** → reduce O(n) to O(log n)
- **Hash tables** → reduce O(n) to O(1)

---

## ✅ Key Takeaways

- Arrays excel at **index-based access** and **end operations** — all O(1)
- Inserting or removing at arbitrary positions requires shifting items — O(n)
- There's a fundamental **trade-off between memory usage and running time**
- Arrays are not ideal when you need frequent insertions/removals at random positions

## ⚠️ Common Mistakes

- Assuming all array operations are O(1) — only index-based access and end operations are
- Ignoring the cost of resizing when the array is full
- Not considering that removing from the middle leaves a gap that must be filled by shifting

## 💡 Pro Tip

If you find yourself frequently inserting at the beginning of an `ArrayList`, that's a code smell. Each insertion shifts all elements — O(n) per insertion. Consider using a `LinkedList` or `ArrayDeque` instead, which handle front insertions in O(1).
