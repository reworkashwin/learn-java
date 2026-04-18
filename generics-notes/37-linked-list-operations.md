# Linked List Operations

## Introduction

Now that we understand the structure of linked lists, let's examine each operation in detail — how they work, why they have the complexity they do, and how they compare to arrays.

---

## Insert at the Beginning — O(1)

This is where linked lists truly shine. Inserting at the head only requires **updating two references**:

### How it works:

1. Create a new node
2. Point the new node's `next` to the current head
3. Update the head to point to the new node

```
Before: head → [5 | →] → [20 | →] → [3 | null]

Insert 10:
  new node [10 | →] points to [5]
  head → [10 | →] → [5 | →] → [20 | →] → [3 | null]
```

### Implementation:

```java
public void insertAtBeginning(T data) {
    Node<T> newNode = new Node<>(data);
    newNode.next = head;
    head = newNode;
}
```

Just two pointer updates — done. **O(1) constant time**, regardless of how many items are in the list.

---

## Insert at the End — O(n)

Because we only have access to the head, inserting at the end requires **traversing the entire list** to find the last node.

### How it works:

1. Start at the head
2. Follow pointers until we find the node whose `next` is `null`
3. Update that node's `next` to point to the new node

```
head → [10 | →] → [5 | →] → [20 | →] → [3 | null]

Insert 7 at end:
  Traverse: 10 → 5 → 20 → 3 (found last node)
  Update: [3 | →] now points to [7 | null]
```

### Implementation:

```java
public void insertAtEnd(T data) {
    Node<T> newNode = new Node<>(data);
    Node<T> current = head;
    while (current.next != null) {
        current = current.next;
    }
    current.next = newNode;
}
```

The `while` loop must traverse all `n` items → **O(n) linear time**.

---

## Remove from the Beginning — O(1)

Just like inserting at the head, removing is a simple pointer update:

1. Set the head to the second node (`head.next`)
2. The old head becomes unreferenced and is garbage collected

```
Before: head → [10 | →] → [5 | →] → [20 | null]
After:  head → [5 | →] → [20 | null]
```

**O(1) — instant.**

---

## Remove from the End (or Arbitrary Position) — O(n)

To remove the last item or any arbitrary item, we must **traverse the list** to find it first.

### Removing the last item:

1. Traverse to the second-to-last node
2. Set its `next` to `null`

```
Before: head → [10 | →] → [5 | →] → [20 | →] → [3 | null]

Remove last:
  Traverse to [20] (second-to-last)
  Set [20 | null]
  
After: head → [10 | →] → [5 | →] → [20 | null]
```

### Removing an arbitrary item:

1. Traverse to find the item
2. Update the previous node's `next` to skip the removed node

Both require traversal → **O(n) linear time**.

---

## Summary: Linked List Operation Complexities

| Operation | Time Complexity | Why? |
|---|---|---|
| Find first item | O(1) | Direct access to head |
| Insert at beginning | O(1) | Just update head pointer |
| Remove first item | O(1) | Just update head pointer |
| Find arbitrary item | O(n) | Must traverse from head |
| Insert at end | O(n) | Must traverse to find last node |
| Insert at arbitrary position | O(n) | Must traverse to find position |
| Remove last item | O(n) | Must traverse to second-to-last |
| Remove arbitrary item | O(n) | Must traverse to find it |

---

## The Pattern

Notice the clear pattern:

- **First item operations** → O(1) ✅ (we have direct access to the head)
- **Everything else** → O(n) ❌ (requires traversal)

This is the fundamental limitation of singly linked lists. More advanced data structures address this:
- **Doubly linked lists** → O(1) for last item operations too (Java's `LinkedList` is doubly linked)
- **Binary search trees** → O(log n) for search, insert, and delete
- **Hash tables** → O(1) for search, insert, and delete

---

## Linked Lists vs. Arrays: Operation Comparison

| Operation | Array | Linked List |
|---|---|---|
| Access by index | O(1) ✅ | O(n) ❌ |
| Insert at beginning | O(n) ❌ | O(1) ✅ |
| Insert at end | O(1)* | O(n) ❌ |
| Remove first | O(n) ❌ | O(1) ✅ |
| Remove last | O(1) ✅ | O(n) ❌ |
| Search by value | O(n) | O(n) |

*Amortized, excluding resize

Each data structure has its strengths. The choice depends on which operations your application performs most.

---

## ✅ Key Takeaways

- Linked lists are **O(1) for head operations** (insert/remove first item)
- Everything that requires traversal is **O(n)** — finding, inserting at end, removing arbitrary items
- The key insight: linked lists and arrays are **complementary** — each is fast where the other is slow
- More advanced structures (BSTs, hash tables) can achieve better than O(n) for the slow operations

## ⚠️ Common Mistakes

- Assuming inserting at the end of a linked list is O(1) — it's O(n) for singly linked lists (must traverse)
- Forgetting that even though removal doesn't require shifting, **finding** the node to remove still takes O(n)
- Comparing linked lists to arrays without considering which operations your code actually uses

## 💡 Pro Tip

Java's `LinkedList` is a **doubly linked list** — it maintains references to both the first and last node. This means both `addFirst()` and `addLast()` are O(1). The O(n) limitation for end operations only applies to **singly** linked lists.
