# ArrayDeque Example

## Introduction

We've seen `ArrayList` for lists, `PriorityQueue` for priority-based processing. Now meet `ArrayDeque` — arguably the **most versatile and efficient** general-purpose data structure in Java's Collections Framework. It can act as both a **stack** and a **queue**, and it does both faster than the alternatives. The secret? It's a **circular buffer**.

---

## Concept 1: What is ArrayDeque?

### 🧠 What is it?

`ArrayDeque` (Array Double-Ended Queue) is a resizable **circular buffer** implementation of the `Deque` interface. "Deque" stands for **Double-Ended Queue** — you can add or remove items from **both the front and the back**.

```
Deque interface  →  extends  →  Queue interface  →  extends  →  Collection  →  Iterable
```

### ❓ Why is it so powerful?

With `ArrayList`, inserting or removing at the beginning requires **shifting all elements** — an O(n) operation. `ArrayDeque` avoids this entirely by using a circular buffer with head and tail pointers. Both ends are manipulable in **O(1) constant time**.

---

## Concept 2: How the Circular Buffer Works

### ⚙️ The mechanics

Under the hood, `ArrayDeque` uses a one-dimensional array plus **two pointers**: `head` and `tail`.

**Starting state** (capacity = 4):
```
Index:  [0]  [1]  [2]  [3]
         ↑
     head/tail
```

**`addLast(A)` — insert at back:**
```
Index:  [A]  [ ]  [ ]  [ ]
         ↑    ↑
       head  tail
```

**`addLast(B)` — insert at back again:**
```
Index:  [A]  [B]  [ ]  [ ]
         ↑         ↑
       head       tail
```

**`addFirst(C)` — insert at front:**

Here's where the "circular" part shines. Head is at index 0, so going "before" index 0 wraps around to the **last** index using the modulo operator: `(-1) mod 4 = 3`.

```
Index:  [A]  [B]  [ ]  [C]
                        ↑
                      head
               tail ↑
```

No shifting! The item simply goes to the other end of the array.

**When head meets tail** → the array is full → Java **resizes** (doubles) the array, copies elements in order, and resets the pointers.

### 💡 Insight

The modulo operator is the elegant trick that makes circular buffers work. Any index that falls outside the array bounds gets wrapped back into a valid position: `index % array.length`.

---

## Concept 3: Key Methods

| Method | Behavior | Throws Exception? |
|---|---|---|
| `addFirst()` / `offerFirst()` | Insert at front | `add` throws, `offer` returns false |
| `addLast()` / `offerLast()` | Insert at back | `add` throws, `offer` returns false |
| `removeFirst()` / `pollFirst()` | Remove from front | `remove` throws, `poll` returns null |
| `removeLast()` / `pollLast()` | Remove from back | `remove` throws, `poll` returns null |
| `getFirst()` / `peekFirst()` | View front | `get` throws, `peek` returns null |
| `getLast()` / `peekLast()` | View back | `get` throws, `peek` returns null |

### ⚠️ Important limitation

You can manipulate the **front** or the **back** only. You **cannot** insert into or remove from the middle efficiently.

---

## Concept 4: Using ArrayDeque as a Queue (FIFO)

```java
Deque<Integer> queue = new ArrayDeque<>();

queue.offer(1);
queue.offer(10);
queue.offer(100);
queue.offer(1000);

while (!queue.isEmpty()) {
    System.out.println(queue.poll());
}
// Output: 1, 10, 100, 1000  (FIFO order)
```

`offer()` adds to the back, `poll()` removes from the front — classic FIFO behavior.

---

## Concept 5: Using ArrayDeque as a Stack (LIFO)

```java
Deque<Integer> stack = new ArrayDeque<>();

stack.push(1);
stack.push(10);
stack.push(100);
stack.push(1000);

while (!stack.isEmpty()) {
    System.out.println(stack.pop());
}
// Output: 1000, 100, 10, 1  (LIFO order)
```

`push()` adds to the front, `pop()` removes from the front — classic LIFO behavior.

### 💡 Insight

`push()` internally calls `addFirst()`, and `pop()` internally calls `removeFirst()`. So the stack operations work on the **head** of the deque, while queue operations work across both ends.

---

## Concept 6: Why ArrayDeque Beats the Alternatives

| Data Structure | As Stack | As Queue | Notes |
|---|---|---|---|
| `Stack` (legacy) | Slow (synchronized) | N/A | Legacy class, avoid it |
| `LinkedList` | O(1) | O(1) | Extra memory for node references |
| **`ArrayDeque`** | **O(1)** | **O(1)** | **Best performance, no extra memory** |

`ArrayDeque` is faster than `LinkedList` when used as either a stack or queue because:
- No node objects to allocate (less GC pressure)
- Better cache locality (contiguous array in memory)
- No pointer overhead

---

## ✅ Key Takeaways

- `ArrayDeque` is a **circular buffer** — one-dimensional array with head/tail pointers and modulo arithmetic
- Supports O(1) insert/remove at **both ends** — no element shifting needed
- Use it as a **queue** (FIFO) with `offer()`/`poll()`, or as a **stack** (LIFO) with `push()`/`pop()`
- **Preferred over** `Stack` (legacy, slow) and `LinkedList` (memory overhead) for both stack and queue use cases
- Cannot access or modify the middle — front and back only

## ⚠️ Common Mistakes

- Using the legacy `Stack` class instead of `ArrayDeque` for stack behavior
- Confusing `getFirst()` (throws exception) with `peekFirst()` (returns null) on an empty deque
- Trying to use `ArrayDeque` for random access in the middle — use `ArrayList` for that

## 💡 Pro Tips

- `ArrayDeque` is the **default recommendation** from Java docs for both stack and queue implementations
- Program to the `Deque` interface, not the `ArrayDeque` implementation
- It is **not** thread-safe — use `ConcurrentLinkedDeque` for concurrent scenarios. ArrayDeque's `head` and `tail` pointers and its backing circular array are unsynchronized. Concurrent `addFirst()`/`removeLast()` calls can cause two threads to read the same `head` index, overwrite each other's writes, or trigger concurrent array resizing that loses elements
