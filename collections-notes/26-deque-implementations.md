# 📘 Deque Implementations — ArrayDeque and LinkedList

## 📌 Introduction

We've explored `List` implementations and `Queue` behavior — now it's time to look at the **Deque** (Double-Ended Queue). A `Deque` lets you add and remove elements from **both ends**, making it one of the most flexible data structures in Java. In this lesson, we'll explore the `Deque` interface and its two main implementations: **ArrayDeque** and **LinkedList**.

---

## 🧩 Concept 1: What is a Deque?

### 🧠 What is it?

`Deque` stands for **Double-Ended Queue** (pronounced "deck"). It's an interface in `java.util` that extends `Queue` and allows operations at **both the front and the rear** of the collection.

### ❓ Why do we need it?

A regular queue only lets you add at the back and remove from the front (FIFO). But what if you need to:
- Add high-priority items to the **front**?
- Remove items from **either end**?
- Use the same structure as both a **queue** and a **stack**?

That's exactly what `Deque` gives you — a structure that can behave like a queue, a stack, or both.

### ⚙️ Key methods

| Operation | Front (Head) | Rear (Tail) |
|---|---|---|
| **Add** | `addFirst(e)` / `offerFirst(e)` | `addLast(e)` / `offerLast(e)` |
| **Remove** | `removeFirst()` / `pollFirst()` | `removeLast()` / `pollLast()` |
| **Examine** | `getFirst()` / `peekFirst()` | `getLast()` / `peekLast()` |

Additionally, `Deque` inherits standard queue methods:
- `add(e)` — adds at the tail
- `remove()` — removes from the head
- `removeFirstOccurrence(e)` / `removeLastOccurrence(e)` — removes specific elements

### 💡 Insight

> Think of a `Deque` as a **two-way street** compared to a queue's one-way street. You can enter and exit from either direction.

---

## 🧩 Concept 2: ArrayDeque

### 🧠 What is it?

`ArrayDeque` is the most popular implementation of the `Deque` interface. It's backed by a **dynamically resizable array**, making it very fast for operations at both ends.

### ❓ Why do we need it?

`ArrayDeque` is the go-to choice when you need:
- **Stack behavior** (LIFO) — faster than `Stack` class
- **Queue behavior** (FIFO) — faster than `LinkedList` for this purpose
- **Deque behavior** — efficient operations at both ends

### ⚙️ How it works

Since it uses a contiguous array internally, adding/removing from both ends is very efficient — typically **O(1) amortized**. There's no overhead of maintaining node pointers like in a `LinkedList`.

### 🧪 Example

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<String> dq = new ArrayDeque<>();

// Add elements normally (at the tail)
dq.add("Apple");
dq.add("Banana");
dq.add("Cherry");
System.out.println(dq);  // [Apple, Banana, Cherry]

// Add at the front
dq.addFirst("Mango");
// Add at the rear
dq.addLast("Grapes");
System.out.println(dq);  // [Mango, Apple, Banana, Cherry, Grapes]

// Remove from both ends
dq.removeFirst();  // removes "Mango"
dq.removeLast();   // removes "Grapes"
System.out.println(dq);  // [Apple, Banana, Cherry]
```

### 🧪 Real-world scenario: Task Queue with Priority

```java
Deque<String> taskQueue = new ArrayDeque<>();

// High-priority tasks go to the front
taskQueue.addFirst("Priority Task");

// Regular tasks go to the back
taskQueue.addLast("Regular Task");

// Processing always takes from the front
String nextTask = taskQueue.removeFirst();
// "Priority Task" gets processed first!
```

This pattern ensures high-priority tasks are always handled before regular ones.

### 💡 Insight

> `ArrayDeque` has **no capacity restrictions** — it grows as needed. It's also more memory-efficient than `LinkedList` because it doesn't need to store pointers for each element.

---

## 🧩 Concept 3: LinkedList as a Deque

### 🧠 What is it?

We already know `LinkedList` implements `List` — but it also implements `Deque`. This means you can use a `LinkedList` as a double-ended queue with all the same methods.

### ⚙️ How it works

Unlike `ArrayDeque`'s contiguous array, `LinkedList` stores elements in a **doubly linked list** — each element is linked to both its previous and next neighbors.

### 🧪 Example

```java
import java.util.Deque;
import java.util.LinkedList;

Deque<String> dq = new LinkedList<>();

dq.add("Apple");
dq.add("Banana");
dq.add("Cherry");

dq.addFirst("Mango");
dq.addLast("Grapes");
System.out.println(dq);  // [Mango, Apple, Banana, Cherry, Grapes]

dq.removeFirst();  // removes "Mango"
dq.removeLast();   // removes "Grapes"
System.out.println(dq);  // [Apple, Banana, Cherry]
```

The output is **identical** to `ArrayDeque`. The difference is purely in the internal implementation.

### 💡 Insight

> When you declare the variable as `Deque<String>`, you can swap between `ArrayDeque` and `LinkedList` without changing any other code. This is the power of **programming to the interface**.

---

## 🧩 Concept 4: ArrayDeque vs LinkedList — Which One to Choose?

### 🧠 What is it?

Both implement `Deque`, but they have different performance characteristics that make each better suited for different use cases.

### ⚙️ Comparison

| Feature | ArrayDeque | LinkedList |
|---|---|---|
| **Backing structure** | Resizable array | Doubly linked nodes |
| **Add/Remove at ends** | ✅ Faster (array-based) | ❌ Slightly slower (node overhead) |
| **Add/Remove in middle** | ❌ Costly (shifting) | ✅ Efficient (pointer adjustment) |
| **Memory efficiency** | ✅ Better (no pointers) | ❌ Higher overhead (prev/next per node) |
| **Random access** | ❌ Not supported via Deque | ✅ Available (via List interface) |
| **Null elements** | ❌ Not allowed | ✅ Allowed |
| **Use as Stack** | ✅ Preferred | ⚙️ Works but slower |
| **Use as Queue** | ✅ Preferred | ⚙️ Works but slower |

### ❓ When to use which?

**Choose ArrayDeque when:**
- Your primary operations are at the **ends** (front/rear)
- You need **stack or queue behavior**
- You want **better performance** and **lower memory usage**
- You don't need null elements

**Choose LinkedList when:**
- You need to frequently insert or remove elements in the **middle**
- You're working with **larger data sets** where random access isn't needed
- You need `List` interface methods alongside `Deque` operations
- You need to store **null** values

### 🧪 Quick decision guide

```
Need stack/queue only?          → ArrayDeque
Need operations at both ends?   → ArrayDeque
Need middle insertions?         → LinkedList
Need List + Deque together?     → LinkedList
```

### 💡 Insight

> For pure stack and queue use cases, **`ArrayDeque` is almost always the better choice**. It's faster, uses less memory, and is the recommended replacement for both the legacy `Stack` class and `LinkedList`-based queues. Reserve `LinkedList` for when you genuinely need its middle-insertion flexibility or `List` interface compatibility.

---

## ✅ Key Takeaways

1. **Deque** = Double-Ended Queue — supports add/remove from both front and rear
2. **ArrayDeque** is backed by a resizable array — fast, memory-efficient, ideal for stack/queue behavior
3. **LinkedList** also implements `Deque` — offers flexibility for middle insertions but has higher memory overhead
4. **ArrayDeque is generally faster** than LinkedList for deque operations
5. `Deque` can function as a **queue (FIFO)**, a **stack (LIFO)**, or both simultaneously
6. Use **`addFirst()`** for high-priority insertions and **`addLast()`** for regular appends

## ⚠️ Common Mistakes

- **Using `Stack` class instead of `ArrayDeque`** — `Stack` is a legacy class; `ArrayDeque` is the modern, faster replacement
- **Storing null values in ArrayDeque** — `ArrayDeque` does not allow nulls; use `LinkedList` if you need null elements
- **Using LinkedList as a Deque when you only need end operations** — You're paying for pointer overhead you don't need. Use `ArrayDeque` instead.
- **Confusing `remove()` and `poll()`** — `remove()` throws an exception on empty deque; `poll()` returns null

## 💡 Pro Tips

- **Program to the interface**: Declare your variable as `Deque<E>` — this lets you swap implementations without changing client code
- `ArrayDeque` is the **officially recommended** replacement for `Stack` (per Java documentation)
- For a **priority-based task queue**, use `addFirst()` for high-priority and `addLast()` for regular tasks
- When in doubt between `ArrayDeque` and `LinkedList` for deque usage, **default to `ArrayDeque`** — it wins in most benchmarks
- The `offer`/`poll`/`peek` family of methods return special values (null/false) instead of throwing exceptions — prefer them when empty deques are expected
