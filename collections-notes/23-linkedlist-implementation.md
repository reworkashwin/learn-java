# 📘 LinkedList Implementation in Java

## 📌 Introduction

We've already explored `ArrayList` — now it's time to dive into another core collection class: **LinkedList**. While `ArrayList` uses a dynamic array under the hood, `LinkedList` takes a fundamentally different approach — it uses **nodes connected via pointers**. This gives it some unique advantages, especially when it comes to insertions and deletions.

By the end of this lesson, you'll understand:
- What a LinkedList really is and how it's structured internally
- Why Java chose a **doubly linked list** instead of a singly linked list
- How LinkedList compares to ArrayList in terms of performance
- How the internal helper methods (`linkFirst`, `linkLast`, `linkBefore`, `unlink`) actually work
- How to use common LinkedList operations in practice

---

## 🧩 Concept 1: What is a LinkedList?

### 🧠 What is it?

`LinkedList` is a **doubly linked list** implementation that is part of the `java.util` package. It implements both the `List` and `Deque` interfaces, which means it functions as both a list and a double-ended queue.

### ❓ Why do we need it?

Unlike `ArrayList`, which stores elements in a contiguous block of memory, `LinkedList` stores each element in a **node**. Each node contains:

1. **A reference to the previous node**
2. **The actual data** (the value)
3. **A reference to the next node**

Because of these bidirectional links, you can navigate **both forward and backward** through the list. This makes operations like insertion and deletion much more flexible.

### ⚙️ How it works

Think of a LinkedList like a chain — each link (node) is connected to the one before it and after it. You can easily add or remove a link without disturbing the rest of the chain. Compare this to an array, where removing an item from the middle requires shifting everything after it.

### 💡 Insight

The `LinkedList` class hierarchy:
```
Iterable → Collection → List → LinkedList
                        Deque → LinkedList
```
This dual implementation gives `LinkedList` more versatility than a typical array-based structure.

---

## 🧩 Concept 2: Why a Doubly Linked List?

### 🧠 What is it?

Java's `LinkedList` is specifically a **doubly linked list** — not a singly linked list. There's no built-in singly linked list in Java's Collections Framework.

### ❓ Why do we need it?

The decision comes down to **performance**, **flexibility**, and **functionality**:

**1. Deque and Queue Operations**
Since `LinkedList` implements both `List` and `Deque`, it needs efficient bidirectional operations. Methods like `addFirst()`, `pollFirst()`, and `pollLast()` require **O(1) access to both ends**. In a singly linked list, accessing the last element costs O(n) because you'd have to traverse the entire list.

**2. Efficient Insertions and Deletions**
In a singly linked list, insertions/deletions at the head are O(1), but at the tail or middle they're O(n). A doubly linked list allows efficient insertion and deletion from **both ends and any position** because each node has references to both neighbors.

**3. Bidirectional Traversal**
Java's `ListIterator` can move both forward and backward. This is only possible because of the doubly linked structure. A singly linked list only supports forward traversal.

### 💡 Insight

> A doubly linked list can do everything a singly linked list can do, **plus more**, with relatively minimal overhead. The trade-off is storing one extra reference (previous pointer) per node — which is usually worth the increased efficiency.

If you only need simple forward traversal, you can implement your own singly linked list. But Java's standard library opts for the more versatile option.

---

## 🧩 Concept 3: LinkedList vs ArrayList

### 🧠 What is it?

These are the two most commonly used `List` implementations, but they have fundamentally different internal structures and performance characteristics.

### ⚙️ How they compare

| Feature | ArrayList | LinkedList |
|---|---|---|
| **Underlying structure** | Dynamic (resizable) array | Doubly linked nodes |
| **Memory layout** | Contiguous block | Non-contiguous (nodes scattered in memory) |
| **Random access** | **O(1)** — direct index calculation | **O(n)** — must traverse from head/tail |
| **Insertion/Deletion** | **O(n)** — elements must be shifted | **O(1)** — if node reference is known |
| **Memory overhead** | Lower per element | Higher (stores two extra pointers per node) |
| **Resizing cost** | Costly (copy entire array) | None (just add a new node) |

### 🧪 How access works

**ArrayList** computes memory address directly:
```
address = startingAddress + (index × sizeOfElement)
```
This gives instant O(1) access.

**LinkedList** must traverse nodes one by one from the head or tail until it reaches the desired index — O(n) in the worst case.

### 🧪 How insertion/deletion works

**ArrayList**: Inserting at index 3 means all elements from index 3 onward shift right by one position.

**LinkedList**: Simply adjust the `next` and `previous` pointers of the surrounding nodes. No shifting required.

### ❓ When to use which?

Use **LinkedList** when:
- You need **frequent insertions and deletions**, especially from the middle or start
- You **don't need random access** by index
- You want **queue/deque behavior** (`addFirst`, `addLast`, `removeFirst`, `removeLast`)

Use **ArrayList** when:
- You need **fast random access** by index
- Your operations are mostly **reads**, not writes
- Memory efficiency matters

---

## 🧩 Concept 4: Internal Helper Methods

### 🧠 What are they?

Inside the `LinkedList` class, there are several **private helper methods** that do the actual work of adding and removing nodes. You never call these directly — they're invoked by the public methods like `add()`, `addFirst()`, `remove()`, etc.

The key internal fields:
```java
int size;       // number of elements
Node<E> first;  // pointer to the first node
Node<E> last;   // pointer to the last node
```

### ⚙️ `linkFirst(E e)` — Insert at the beginning

This method inserts a new element at the **head** of the list. Called internally by `addFirst()`.

**Steps:**
1. Save the current first node
2. Create a new node with `prev = null`, `next = oldFirst`
3. Set `first` to the new node
4. If the list was empty, set `last` to the new node too
5. Otherwise, update old first's `prev` to point to the new node
6. Increment `size` and `modCount`

### ⚙️ `linkLast(E e)` — Insert at the end

This method inserts a new element at the **tail** of the list. Called internally by `addLast()` and `add()`.

Works just like `linkFirst`, but in the opposite direction.

### ⚙️ `linkBefore(E e, Node<E> successor)` — Insert before a node

This is the workhorse method for inserting at any arbitrary position. Called by `add(int index, E element)`.

**Steps:**
1. Get the predecessor: `predecessor = successor.prev`
2. Create a new node: `newNode = new Node(predecessor, e, successor)`
3. Update `successor.prev = newNode`
4. If `predecessor == null` (successor was the first node), set `first = newNode`
5. Otherwise, set `predecessor.next = newNode`
6. Increment `size` and `modCount`

### 🧪 Example: linkBefore in action

**Starting list:** `A ↔ B ↔ C`

Call `linkBefore(X, B)` — insert X before B:

1. `predecessor = B.prev = A`
2. Create node X with `prev = A`, `next = B`
3. `B.prev = X`
4. `A.next = X`

**Result:** `A ↔ X ↔ B ↔ C`

**What if B is the first node?** (List: `B ↔ C`)
1. `predecessor = B.prev = null`
2. Create node X with `prev = null`, `next = B`
3. `B.prev = X`
4. Since `predecessor == null`, set `first = X`

**Result:** `X ↔ B ↔ C`

---

## 🧩 Concept 5: Unlinking (Removal) Methods

### 🧠 What are they?

Three private methods handle node removal:

### ⚙️ `unlinkFirst(Node<E> f)` — Remove the first node

Called by `removeFirst()`, `poll()`, and `pollFirst()`.

**Steps:**
1. Store the value of the first node (to return later)
2. Get the next node
3. Set `first` to the next node
4. If the list had only one node, set `last = null` (list is now empty)
5. Otherwise, set new first's `prev = null`
6. Decrement `size`, increment `modCount`
7. Return the stored value

### ⚙️ `unlinkLast(Node<E> l)` — Remove the last node

Mirror of `unlinkFirst` — removes the tail node.

### ⚙️ `unlink(Node<E> x)` — Remove any node

This handles removing a node from **any position** in the list.

**Steps:**
1. Store the value, get `prev` and `next` of node X
2. If `prev != null`, set `prev.next = next` (skip over X)
3. If `prev == null`, set `first = next` (X was the first node)
4. If `next != null`, set `next.prev = prev` (skip over X)
5. If `next == null`, set `last = prev` (X was the last node)
6. Clear X's references and value
7. Decrement `size`, increment `modCount`
8. Return the stored value

### 💡 Insight

> **Unlinking** = breaking the references (pointers) between nodes so the target node is no longer part of the list. The surrounding nodes get connected directly to each other, bypassing the removed node.

---

## 🧩 Concept 6: Common LinkedList Operations

### 🧪 Creating and populating a LinkedList

```java
import java.util.LinkedList;

LinkedList<String> fruits = new LinkedList<>();
fruits.add("Apple");    // adds at the end (tail)
fruits.add("Banana");
fruits.add("Cherry");
// Result: [Apple, Banana, Cherry]
```

### 🧪 Accessing elements

```java
fruits.getFirst();  // "Apple" — throws NoSuchElementException if empty
fruits.getLast();   // "Cherry"
fruits.get(1);      // "Banana" — access by index
```

### 🧪 Adding elements at specific positions

```java
fruits.addFirst("Grapes");  // [Grapes, Apple, Banana, Cherry]
fruits.addLast("Mango");    // [Grapes, Apple, Banana, Cherry, Mango]
fruits.add(2, "Kiwi");      // insert at index 2
```

### 🧪 Removing elements

```java
fruits.removeFirst();       // removes head, returns removed element
fruits.removeLast();        // removes tail, returns removed element
fruits.remove("Apple");     // removes first occurrence, returns true/false
fruits.remove(1);           // removes element at index 1
```

### 🧪 Utility methods

```java
fruits.contains("Banana");  // true/false
fruits.size();               // number of elements
fruits.indexOf("Apple");     // first occurrence index
fruits.lastIndexOf("Apple"); // last occurrence index
fruits.set(1, "NewFruit");   // replace element at index 1
fruits.clear();              // remove all elements
```

### 🧪 Adding another collection

```java
LinkedList<String> moreFruits = new LinkedList<>();
moreFruits.add("Peach");
moreFruits.add("Plum");

fruits.addAll(moreFruits);          // append at end
fruits.addAll(2, moreFruits);       // insert at index 2
```

### 💡 Insight

The `add()` method (without index) uses `linkLast` internally — it always appends to the **end** of the list. The `set()` method replaces an element at a given index, while `add(index, element)` inserts without replacing.

---

## ✅ Key Takeaways

1. **LinkedList is a doubly linked list** — each node holds references to both its previous and next neighbors
2. **O(1) insertion/deletion** when the node reference is known; O(n) if traversal is needed
3. **O(n) random access** — unlike ArrayList's O(1), you must traverse to reach an element
4. **Implements both List and Deque** — making it usable as a list, queue, or double-ended queue
5. **No built-in singly linked list** in Java — the doubly linked design covers all use cases with minimal overhead
6. **Internal methods** (`linkFirst`, `linkLast`, `linkBefore`, `unlink`) handle the pointer manipulation; public methods delegate to them

## ⚠️ Common Mistakes

- **Using LinkedList for random access** — If you frequently call `get(index)`, you'll face O(n) traversal. Use `ArrayList` instead.
- **Assuming O(1) for all insertions** — Insertion is O(1) only if you already have a reference to the node. Finding the node first costs O(n).
- **Forgetting that `getFirst()`/`getLast()` throw exceptions** — On an empty list, these throw `NoSuchElementException`. Use `peekFirst()`/`peekLast()` for null-safe alternatives.
- **Ignoring memory overhead** — Each node stores two extra references (prev + next), making LinkedList less memory-efficient per element than ArrayList.

## 💡 Pro Tips

- Use `LinkedList` when your workload is **insertion/deletion heavy** and you rarely access by index
- For **queue behavior**, prefer `LinkedList` since it implements `Deque` — use `addFirst()`, `addLast()`, `removeFirst()`, `removeLast()`
- The `modCount` field tracks structural modifications — this is how `ConcurrentModificationException` gets detected when you modify a list during iteration
- If you need both fast random access AND fast insertions, consider a different data structure altogether — no single Java collection excels at both
