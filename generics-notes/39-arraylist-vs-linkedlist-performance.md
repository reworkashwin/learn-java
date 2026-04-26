# ArrayList vs. LinkedList Performance Comparison

## Introduction

We've studied the theory behind arrays and linked lists separately. Now let's put them head-to-head with actual performance measurements. The results dramatically illustrate why choosing the right data structure matters.

---

## The Experiment

Insert **500,000 items** at the **beginning** of each data structure and measure the time taken.

```java
// ArrayList — insert at beginning
List<Integer> arrayList = new ArrayList<>();
long start = System.currentTimeMillis();

for (int i = 0; i < 500_000; i++) {
    arrayList.add(0, i);  // insert at index 0
}

long arrayTime = System.currentTimeMillis() - start;

// LinkedList — insert at beginning
LinkedList<Integer> linkedList = new LinkedList<>();
start = System.currentTimeMillis();

for (int i = 0; i < 500_000; i++) {
    linkedList.addFirst(i);  // insert at beginning
}

long linkedTime = System.currentTimeMillis() - start;
```

---

## The Results: Inserting at the Beginning

| Data Structure | Time |
|---|---|
| ArrayList | ~11,000 ms (11 seconds) |
| LinkedList | ~11 ms |

**LinkedList is approximately 1,000× faster** when inserting at the beginning.

### Why such a massive difference?

**ArrayList**: Every insertion at index 0 shifts **all existing items** one position to the right. As the list grows, each insertion becomes more expensive:
- Insert 1st item: shift 0 items
- Insert 100th item: shift 99 items
- Insert 500,000th item: shift 499,999 items

Total shifts: approximately 0 + 1 + 2 + ... + 499,999 = ~125 billion operations.

**LinkedList**: Every insertion at the beginning just updates two pointers — O(1) every single time. 500,000 pointer updates = done in milliseconds.

---

## What About Inserting at the End?

When both structures insert at the **end**:

| Data Structure | Time |
|---|---|
| ArrayList | Fast (~same as LinkedList) |
| LinkedList | Fast |

Both are approximately the same speed because:
- **ArrayList**: appending to the end is O(1) amortized — just place the item in the next slot
- **LinkedList**: `addLast()` is O(1) — the doubly linked list has a direct reference to the tail

---

## The Takeaway: It Depends on the Operation

**There is no universally "better" data structure.** It depends entirely on what operations your application performs most:

| Operation | ArrayList | LinkedList | Winner |
|---|---|---|---|
| Insert at beginning | O(n) ❌ | O(1) ✅ | LinkedList |
| Insert at end | O(1)* ✅ | O(1) ✅ | Tie |
| Remove from beginning | O(n) ❌ | O(1) ✅ | LinkedList |
| Remove from end | O(1) ✅ | O(1) ✅ | Tie |
| Access by index | O(1) ✅ | O(n) ❌ | ArrayList |
| Search by value | O(n) | O(n) | Tie |
| Memory usage | Less | More | ArrayList |

*Amortized — occasional O(n) for resizing

---

## Decision Guide

**Choose `ArrayList` when:**
- Most operations are **reads** (accessing by index)
- You mostly **append** to the end
- Memory efficiency matters
- You need fast iteration (data locality)

**Choose `LinkedList` when:**
- You frequently **insert/remove at the beginning**
- You use it as a **queue** or **deque**
- You rarely access elements by index
- The extra memory per node is acceptable

---

## ✅ Key Takeaways

- LinkedList is ~1,000× faster than ArrayList for inserting at the beginning (with 500K items)
- Both perform similarly for end operations
- ArrayList wins for index-based access; LinkedList wins for front modifications
- **Always consider your primary operations** before choosing a data structure
- The performance difference isn't theoretical — it's massive and measurable

## ⚠️ Common Mistakes

- Using `ArrayList` for queue-like behavior (frequent add/remove at the front) — this is devastatingly slow
- Using `LinkedList` when you mostly do `get(i)` lookups — each lookup traverses from the head
- Choosing a data structure based on familiarity rather than the actual operations you'll perform

## 💡 Pro Tip

In real applications, profile before optimizing. But if you know your usage pattern upfront:
- **Stack behavior** (LIFO): `ArrayDeque` is usually the best choice
- **Queue behavior** (FIFO): `ArrayDeque` or `LinkedList`
- **Random access + mostly appends**: `ArrayList`
- **Frequent front insertions**: `LinkedList`

`ArrayDeque` is often overlooked but is the most efficient choice for both stack and queue patterns — it outperforms both `ArrayList` and `LinkedList` in those use cases because it uses a circular buffer (contiguous array with head/tail pointers), which means no node-object allocation overhead like `LinkedList` and no element-shifting like `ArrayList`.
