# What Are Linked Lists?

## Introduction

We've seen that arrays struggle with insertions and removals at arbitrary positions because items must be shifted. **Linked lists** solve this problem entirely by using a fundamentally different approach to storing data.

---

## The Problem with Arrays (Revisited)

With arrays, inserting at position 1 when there's already an item there means **shifting every subsequent item** one position to the right:

```
Before: [12, 5, -7, 25]
Insert 20 at index 1: shift 5, -7, 25 → [12, 20, 5, -7, 25]
```

In the worst case, we shift **all** items — O(n). Linked lists eliminate this shifting entirely.

---

## How Linked Lists Work

Instead of storing items contiguously in memory, a linked list stores each item in a **node**, and each node contains:

1. **Data** — the actual value (integer, string, object, etc.)
2. **Pointer** — a reference to the next node in the list

```
[5 | →] → [20 | →] → [3 | →] → [10 | null]
```

The nodes are connected by **pointers** (references), not by physical position in memory. This means:
- Items are **not** stored next to each other in memory
- Removing a node just means **updating pointers** — no shifting
- There are **never gaps** in the structure

---

## Anatomy of a Linked List

### The Head Node
We only have direct access to the **first node** — called the **head**. To reach any other node, we must start at the head and follow the chain of pointers.

### The Last Node
The last node's pointer points to `null`. This is how we know we've reached the end of the list.

### A Single Node
```
┌───────────┬───────────┐
│   Data    │  Next →   │
│   (42)    │  (0xA4)   │
└───────────┴───────────┘
```

Each node stores the data and a reference to the next node's memory address.
```java
// A simple linked list node in Java:
class Node<T> {
    T data;
    Node<T> next;

    Node(T data) {
        this.data = data;
        this.next = null;
    }
}

// Building a chain manually:
Node<Integer> head = new Node<>(5);
head.next = new Node<>(20);
head.next.next = new Node<>(3);
// Result: 5 → 20 → 3 → null
```
---

## The No-Shifting Advantage

Why can't there be "holes" in a linked list? Because items aren't positioned by index — they're connected by pointers.

To remove a node, we simply update the previous node's pointer to skip over it:

```
Before: [5 | →] → [20 | →] → [3 | →] → [10 | null]

Remove 20: update 5's pointer to point to 3

After:  [5 | →] → [3 | →] → [10 | null]
```

No shifting. Just pointer updates. This is O(1) once we have a reference to the node.

---

## The Trade-offs

### No Random Access
Because items aren't contiguous in memory, there's **no index-based access**. You can't jump to the 5th element — you have to traverse from the head.

With arrays: `array[4]` → O(1)
With linked lists: traverse 4 nodes → O(n)

### More Memory
Each node stores the data **plus** a pointer. Arrays store only the data. For a list of integers, a linked list uses roughly **twice the memory** of an array.

### No Shifting Needed
Insertions and removals never require shifting other elements. Just update pointers.

---

## Linked Lists vs. Arrays at a Glance

| Feature | Array | Linked List |
|---|---|---|
| Memory layout | Contiguous | Scattered |
| Random access | ✅ O(1) | ❌ O(n) |
| Insert at beginning | ❌ O(n) | ✅ O(1) |
| Remove from beginning | ❌ O(n) | ✅ O(1) |
| Memory per item | Data only | Data + pointer |
| Shifting required | Yes | Never |

---

## Applications

Linked lists are used to implement more complex data structures:
- **Stacks** — push/pop from one end
- **Queues** — add at one end, remove from the other
- **Graph adjacency lists** — storing neighbors of each vertex

---

## ✅ Key Takeaways

- Linked list nodes store **data + a pointer** to the next node
- We only have direct access to the **head** (first node); everything else requires traversal
- The last node points to `null` — that's how we detect the end
- Insertions/removals at the head are O(1) — no shifting needed
- The trade-off: no random access (O(n) to find an arbitrary item) and more memory usage

## ⚠️ Common Mistakes

- Trying to access a linked list item by index like an array — linked lists don't support O(1) random access
- Forgetting that finding an arbitrary item in a linked list is O(n), the same as arrays
- Assuming linked lists are always better than arrays — they're only better for specific operations (front insertions/removals)

## 💡 Pro Tip

Linked lists shine when you **frequently insert or remove at the beginning** of the data structure. If your primary operations are index-based lookups, stick with arrays. The right choice depends entirely on your usage pattern.
