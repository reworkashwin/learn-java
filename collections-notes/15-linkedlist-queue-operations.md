# 📘 LinkedList — Queue & Deque Operations

## 📌 Introduction

We've already explored `LinkedList` as a `List` implementation. But here's what makes `LinkedList` truly versatile — it also implements the **`Queue`** and **`Deque`** interfaces. This means a single `LinkedList` can behave as a list, a queue, a double-ended queue, and even a stack. In this section, we focus on the **queue and deque operations** available on `LinkedList`.

---

## 🧩 Concept 1: Retrieving Without Removing — `peek()` vs `element()`

### 🧠 What is it?

Both methods retrieve the **first element** (head) of the linked list without removing it. The difference? How they handle an empty list.

| Method | Returns | On Empty List |
|--------|---------|---------------|
| `peek()` | First element | Returns `null` |
| `element()` | First element | Throws `NoSuchElementException` |

### 🧪 Example

```java
LinkedList<String> fruits = new LinkedList<>(List.of("Apple", "Banana", "Cherry"));

fruits.peek();    // "Apple" — list unchanged
fruits.element(); // "Apple" — list unchanged

// On an empty list:
LinkedList<String> empty = new LinkedList<>();
empty.peek();    // null
empty.element(); // throws NoSuchElementException
```

### ❓ When to use which?

- Use **`peek()`** when an empty list is a normal, expected condition — you can check for `null`
- Use **`element()`** when an empty list indicates a bug — let the exception surface the problem

### 💡 Insight

> This null-vs-exception pattern is consistent across the entire `Queue` API. Methods come in pairs: one returns `null` on failure, the other throws an exception. This is by design.

---

## 🧩 Concept 2: Retrieving AND Removing — `poll()` vs `remove()`

### 🧠 What is it?

Both methods retrieve **and remove** the first element (head) of the list. Again, the difference is how they handle an empty list.

| Method | Returns | On Empty List |
|--------|---------|---------------|
| `poll()` | First element (and removes it) | Returns `null` |
| `remove()` | First element (and removes it) | Throws `NoSuchElementException` |

### 🧪 Example

```java
LinkedList<String> fruits = new LinkedList<>(List.of("Apple", "Banana", "Cherry"));

String head = fruits.poll();
System.out.println(head);   // "Apple"
System.out.println(fruits); // [Banana, Cherry] — Apple removed

// On an empty list:
LinkedList<String> empty = new LinkedList<>();
empty.poll();   // null
empty.remove(); // throws NoSuchElementException
```

### 💡 Insight

> Notice the pattern: `peek()`/`element()` for read-only access, `poll()`/`remove()` for destructive access. Each pair has a safe version (returns `null`) and a strict version (throws exception).

---

## 🧩 Concept 3: Adding Elements — `offer()`, `offerFirst()`, `offerLast()`

### 🧠 What is it?

The `offer` family of methods adds elements to the linked list, and which method you use depends on whether you're treating the list as a **Queue** or a **Deque**:

| Method | Adds To | Context |
|--------|---------|---------|
| `offer(E e)` | End (tail) | Queue operations |
| `offerFirst(E e)` | Front (head) | Deque operations |
| `offerLast(E e)` | End (tail) | Deque operations |

### ❓ Wait — `offer()` and `offerLast()` do the same thing?

Yes! Both add to the tail. The difference is **semantic intent**:

- **`offer()`** — used when you're treating the `LinkedList` as a **Queue** (FIFO behavior)
- **`offerLast()`** — used when you're treating it as a **Deque** (double-ended queue)

Functionally identical, but using the right method communicates your intent to other developers.

### 🧪 Example

```java
LinkedList<String> fruits = new LinkedList<>(List.of("Apple", "Banana"));

fruits.offer("Cherry");       // [Apple, Banana, Cherry] — added to tail
fruits.offerFirst("Avocado"); // [Avocado, Apple, Banana, Cherry] — added to head
fruits.offerLast("Dates");    // [Avocado, Apple, Banana, Cherry, Dates] — added to tail
```

### 💡 Insight

> The naming convention tells you the context: methods from the `Queue` interface (`offer`, `poll`, `peek`) deal with single-ended operations. Methods with `First`/`Last` suffixes come from the `Deque` interface and explicitly state which end they operate on.

---

## 🧩 Concept 4: Deque Peek & Poll — `peekFirst()`, `peekLast()`, `pollFirst()`, `pollLast()`

### 🧠 What is it?

These methods extend peek/poll to work on **both ends** of the linked list — the Deque advantage.

| Method | Operation | End | On Empty |
|--------|-----------|-----|----------|
| `peekFirst()` | Retrieve only | Head | `null` |
| `peekLast()` | Retrieve only | Tail | `null` |
| `pollFirst()` | Retrieve + Remove | Head | `null` |
| `pollLast()` | Retrieve + Remove | Tail | `null` |

### 🧪 Example

```java
LinkedList<String> fruits = new LinkedList<>(List.of("Apple", "Banana", "Cherry"));

fruits.peekFirst(); // "Apple" — no removal
fruits.peekLast();  // "Cherry" — no removal

fruits.pollFirst(); // "Apple" — removed from head
// fruits = [Banana, Cherry]

fruits.pollLast();  // "Cherry" — removed from tail
// fruits = [Banana]
```

### 💡 Insight

> With `peekFirst()`/`peekLast()` and `pollFirst()`/`pollLast()`, you have full control over both ends of the list. This is what makes `LinkedList` a true **double-ended queue**.

---

## 🧩 Concept 5: Stack Operations — `push()` and `pop()`

### 🧠 What is it?

`LinkedList` can also act as a **stack** (LIFO — Last In, First Out) using `push()` and `pop()`:

| Method | Operation | End |
|--------|-----------|-----|
| `push(E e)` | Adds element to the **front** (head) | Top of stack |
| `pop()` | Removes and returns element from the **front** (head) | Top of stack |

### ❓ Why use LinkedList as a stack?

Java has a legacy `Stack` class, but it extends `Vector` (which is synchronized and slower). Using `LinkedList` as a stack via `push()`/`pop()` is the **modern, preferred approach**.

### 🧪 Example

```java
LinkedList<String> stack = new LinkedList<>();
stack.push("First");   // [First]
stack.push("Second");  // [Second, First]
stack.push("Third");   // [Third, Second, First]

stack.pop(); // "Third" — removed from front
// stack = [Second, First]

stack.peek(); // "Second" — just looks, no removal
```

### 💡 Insight

> `push()` adds to the front (head), and `pop()` removes from the front. This gives you LIFO behavior. Internally, `pop()` simply calls `removeFirst()`.

---

## 🧩 Concept 6: Removing by Occurrence — `removeFirstOccurrence()` and `removeLastOccurrence()`

### 🧠 What is it?

When you have duplicate elements, these methods let you target **which occurrence** to remove:

| Method | Removes |
|--------|---------|
| `removeFirstOccurrence(Object o)` | The **first** match found (from head) |
| `removeLastOccurrence(Object o)` | The **last** match found (from tail) |

Both return `boolean` — `true` if an element was removed, `false` if not found.

### 🧪 Example

```java
LinkedList<String> fruits = new LinkedList<>(
    List.of("Apple", "Banana", "Apple", "Cherry", "Apple")
);

fruits.removeFirstOccurrence("Apple");
// [Banana, Apple, Cherry, Apple] — first "Apple" removed

fruits.removeLastOccurrence("Apple");
// [Banana, Apple, Cherry] — last "Apple" removed
```

### 💡 Insight

> These are precision tools for duplicate management. The plain `remove(Object o)` method is equivalent to `removeFirstOccurrence()` — it always removes the first match.

---

## 🧩 Concept 7: ListIterator and Descending Iterator

### 🧠 What is it?

`LinkedList` provides two specialized iterators for **bidirectional traversal**:

### `listIterator(int index)`

Returns a `ListIterator` starting at the specified position. You can move **forward** (`hasNext()`, `next()`) and **backward** (`hasPrevious()`, `previous()`), plus add/remove/replace elements during iteration.

```java
LinkedList<String> fruits = new LinkedList<>(
    List.of("Apple", "Banana", "Cherry", "Dates")
);

// Start iterating from index 1 (Banana)
ListIterator<String> it = fruits.listIterator(1);
while (it.hasNext()) {
    System.out.println(it.next());
}
// Output: Banana, Cherry, Dates

// Iterate backward from the end
ListIterator<String> backIt = fruits.listIterator(fruits.size());
while (backIt.hasPrevious()) {
    System.out.println(backIt.previous());
}
// Output: Dates, Cherry, Banana, Apple
```

### `descendingIterator()`

Returns an iterator that traverses the list in **reverse order** (from tail to head). Available since Java 1.6.

```java
Iterator<String> descIt = fruits.descendingIterator();
while (descIt.hasNext()) {
    System.out.println(descIt.next());
}
// Output: Dates, Cherry, Banana, Apple
```

### 💡 Insight

> `ListIterator` is more powerful than `descendingIterator` — it supports bidirectional movement, add/remove during iteration, and position tracking. But `descendingIterator` is simpler when you just need reverse-order traversal.

---

## 🧩 Concept 8: The Node Class — How LinkedList Works Internally

### 🧠 What is it?

Internally, `LinkedList` is implemented as a **doubly linked list**. Each element is wrapped in a `Node` object that holds:

```java
private static class Node<E> {
    E item;        // the actual element
    Node<E> next;  // reference to the next node
    Node<E> prev;  // reference to the previous node
}
```

### ⚙️ How it works

- Every node knows its **predecessor** and **successor**
- The list maintains references to both the **first** (head) and **last** (tail) nodes
- This is what enables O(1) operations at both ends — which is why `LinkedList` excels as a Queue/Deque

### 💡 Insight

> Every method in `LinkedList` — whether it's `push()`, `pollLast()`, or `removeFirstOccurrence()` — ultimately manipulates these `Node` objects by updating `next` and `prev` references. Understanding this makes the entire API intuitive.

---

## ✅ Key Takeaways

- `LinkedList` implements **`List`**, **`Queue`**, and **`Deque`** — making it the most versatile collection class
- Queue methods come in **pairs**: safe (`peek`/`poll` → return `null`) and strict (`element`/`remove` → throw exception)
- `offer()` is for Queue context; `offerFirst()`/`offerLast()` is for Deque context — functionally, `offer()` = `offerLast()`
- `push()`/`pop()` turn `LinkedList` into a **stack** (LIFO) — preferred over the legacy `Stack` class
- `removeFirstOccurrence()` and `removeLastOccurrence()` let you target specific duplicates
- Internally, `LinkedList` is a **doubly linked list** — each node has `item`, `next`, and `prev`

## ⚠️ Common Mistakes

- **Confusing `peek()` with `poll()`** — `peek()` only looks, `poll()` removes. Accidentally using `poll()` when you just want to check the head is a common bug
- **Using `element()`/`remove()` without checking for empty list** — these throw exceptions, unlike their safe counterparts
- **Forgetting that `offer()` and `offerLast()` are the same** — don't overthink the choice; pick the one that matches your intent (Queue vs Deque)
- **Using `LinkedList` when `ArrayDeque` would be faster** — for pure Queue/Deque operations without List functionality, `ArrayDeque` is typically faster

## 💡 Pro Tips

- The **null-vs-exception pattern** in Queue API is an interview favorite — know which methods return `null` and which throw exceptions
- For **stack behavior**, prefer `LinkedList` (or `ArrayDeque`) over `java.util.Stack` — `Stack` extends `Vector` which adds unnecessary synchronization overhead
- Use `descendingIterator()` for clean reverse traversal instead of manually managing indices
- `Spliterator` (returned by `spliterator()`) is designed for **parallel processing** — it becomes important when you learn about the Stream API and multithreading
