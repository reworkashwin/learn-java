# LinkedList Example in Java

## Introduction

We've covered the theory of linked lists. Now let's see how Java's `LinkedList` class works in practice. The key insight: Java's implementation is a **doubly linked list**, which means it's more powerful than the singly linked list we discussed in theory.

---

## Creating a LinkedList

```java
List<Integer> list = new LinkedList<>();
```

`LinkedList` implements the `List` interface, so it can be used anywhere a `List` is expected. It also implements `Queue` and `Deque` interfaces, making it versatile.

---

## Doubly Linked List: What Makes It Special

A standard (singly) linked list only stores a reference to the **next** node. Java's `LinkedList` is **doubly linked** — each node stores references to both the **next** and the **previous** node:

```
null ← [1 | ←→ ] ↔ [10 | ←→ ] ↔ [5 | ←→ ] ↔ [3 | → null]
        ↑ head                                    ↑ tail
```

The `LinkedList` also maintains references to **both** the first (head) and last (tail) nodes.

Why does this matter? Because we can now manipulate **both ends** in O(1):

| Operation | Singly Linked | Doubly Linked (Java) |
|---|---|---|
| Insert at beginning | O(1) | O(1) |
| Insert at end | O(n) | **O(1)** ✅ |
| Remove first | O(1) | O(1) |
| Remove last | O(n) | **O(1)** ✅ |

---

## Basic Operations

### Adding items

The `add()` method appends to the **end** of the list (equivalent to `addLast()`):

```java
LinkedList<Integer> list = new LinkedList<>();
list.add(1);
list.add(10);
list.add(5);
list.add(3);

// list: [1, 10, 5, 3]
```

### Adding at the beginning

```java
list.addFirst(99);
// list: [99, 1, 10, 5, 3]
```

With `addFirst()`, the last item added becomes the first element. This is O(1).

### Adding at the end

```java
list.addLast(42);
// list: [1, 10, 5, 3, 42]
```

Also O(1) because of the doubly linked structure.

---

## Removing Items

### Remove first item

```java
list.removeFirst();  // removes and returns the first element
```

### Remove last item

```java
list.removeLast();  // removes and returns the last element
```

Both are O(1) — no traversal needed.

---

## Iterating Through the List

Because `LinkedList` implements `List`, which extends `Collection`, which extends `Iterable`, we can use the for-each loop:

```java
for (int number : list) {
    System.out.println(number);
}
```

Output: `1, 10, 5, 3`

---

## Utility Methods

### Size
```java
list.size();  // returns the number of elements
```

### isEmpty
```java
list.isEmpty();  // returns true if the list has no elements
```

---

## Interface vs. Implementation

When you declare with the `List` interface:
```java
List<Integer> list = new LinkedList<>();
```
You can only call methods defined in the `List` interface — not `addFirst()`, `addLast()`, `removeFirst()`, or `removeLast()`.

When you declare with the `LinkedList` class:
```java
LinkedList<Integer> list = new LinkedList<>();
```
You get access to all `LinkedList`-specific methods like `addFirst()`, `addLast()`, `getFirst()`, `getLast()`, `removeFirst()`, `removeLast()`.

If you need those doubly-linked-list operations, declare the variable as `LinkedList`, not `List`.

---

## When to Use LinkedList

In practice, `LinkedList` is preferred when:
- You frequently **insert/remove at the beginning or end**
- You use it as a **queue** or **deque** (double-ended queue)
- Memory overhead of storing extra pointers is acceptable

`ArrayList` is preferred when:
- You need **fast random access** by index
- Most operations are **reads** rather than insertions/removals

---

## ✅ Key Takeaways

- Java's `LinkedList` is a **doubly linked list** — it maintains pointers to both head and tail
- Both `addFirst()`/`addLast()` and `removeFirst()`/`removeLast()` are O(1)
- `add()` is equivalent to `addLast()` — it appends to the end
- To access LinkedList-specific methods, declare the variable as `LinkedList`, not `List`
- `LinkedList` implements `List`, `Queue`, and `Deque` interfaces

## ⚠️ Common Mistakes

- Declaring as `List<Integer>` and then trying to call `addFirst()` — use `LinkedList<Integer>` as the declared type if you need those methods
- Assuming Java's `LinkedList` behaves like a singly linked list — it's doubly linked, so end operations are O(1)
- Using `LinkedList` for random access by index — `get(i)` is O(n), not O(1)

## 💡 Pro Tip

In large enterprise applications, architects often favor `LinkedList` over `ArrayList` because it handles insertions and removals at **both ends** efficiently. The extra memory cost is usually negligible compared to the performance benefit of O(1) operations at both ends of the list.
