# The List Interface

## Introduction

Now that we understand the Collections Framework hierarchy and time complexity, let's focus on the **`List` interface** — one of the most frequently used interfaces in Java. This is where `ArrayList` and `LinkedList` live, and understanding the `List` interface is key to using them effectively.

---

## What is the List Interface?

The `List` interface is an **ordered collection** that allows us to store and access items in a **sequential manner**.

Here's where it sits in the hierarchy:

```
Iterable → Collection → List
```

Because `List` extends `Collection`, and `Collection` extends `Iterable`:
- Every `List` is a `Collection`
- Every `List` is `Iterable` (supports for-each loops and iterators)

---

## Key Characteristics of Lists

### 1. Ordered
Items maintain the order in which they were inserted. You have full visibility and control over positioning.

### 2. Allows Duplicates
Unlike `Set`, you can store the same value multiple times:

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(5);
numbers.add(5);  // This is perfectly fine
```

### 3. Index-Based Access
Items can be accessed by their position (index), starting from 0.

---

## Concrete Implementations

The `List` interface has several implementations. The two most important are:

| Implementation | Under the Hood | Best For |
|---|---|---|
| `ArrayList` | Dynamic array | Random access by index, appending items |
| `LinkedList` | Doubly linked list | Frequent insertions/removals at beginning or end |

Other implementations include `Stack` and `Vector`, but `ArrayList` and `LinkedList` are by far the most commonly used.

---

## Methods from the Hierarchy

Because `List` extends `Collection` and `Iterable`, it inherits a rich set of methods:

### From `Iterable`
- `iterator()` — returns an iterator to traverse elements

### From `Collection`
- `add(E e)` — adds an element
- `addAll(Collection c)` — adds multiple elements
- `clear()` — removes all elements
- `isEmpty()` — returns `true` if the collection has no elements
- `remove(Object o)` — removes a specific element
- `size()` — returns the number of elements

### From `List` (specific to lists)
- `get(int index)` — retrieve element at a given index
- `set(int index, E element)` — replace element at a given index
- `indexOf(Object o)` — find the first occurrence of an element
- `lastIndexOf(Object o)` — find the last occurrence of an element
- `remove(int index)` — remove element at a given index
- `subList(int from, int to)` — get a view of a portion of the list

---

## Iteration: Two Approaches

Because `List` extends `Iterable`, we can iterate in two ways:

### Using a for-each loop
```java
List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");

for (String name : names) {
    System.out.println(name);
}
```

### Using an Iterator explicitly
```java
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    System.out.println(it.next());
}
```

Both achieve the same result. The for-each loop is cleaner, but the `Iterator` gives you the ability to call `remove()` during iteration.

---

## ✅ Key Takeaways

- `List` is an ordered collection that allows duplicates and supports index-based access
- It extends `Collection` → `Iterable`, giving it iteration support and a rich set of methods
- `ArrayList` and `LinkedList` are the two primary implementations — choosing between them depends on your use case
- All `List` methods from the documentation are available at [Oracle's Java Docs](https://docs.oracle.com/javase/8/docs/api/java/util/List.html)

## ⚠️ Common Mistakes

- Using `List` and `Collection` interchangeably — `List` is more specific (ordered, indexed)
- Forgetting that `List` allows duplicates while `Set` does not
- Not considering **which implementation** to use — `ArrayList` and `LinkedList` have very different performance characteristics

## 💡 Pro Tip

Always **program to the interface**, not the implementation:

```java
// Good — flexible, can swap implementations easily
List<String> names = new ArrayList<>();

// Less flexible — tied to ArrayList
ArrayList<String> names = new ArrayList<>();
```

Using `List` as the declared type means you can switch from `ArrayList` to `LinkedList` later without changing any other code.
