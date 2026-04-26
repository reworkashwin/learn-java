# 📘 List Interface — Part 3

## 📌 Introduction

We've already explored the core `List` methods like `add`, `remove`, `set`, `get`, `equals`, `hashCode`, and `clear` in Parts 1 and 2. Now it's time to cover the **remaining methods** that complete the `List` interface — from searching elements by index, to bidirectional iteration, to creating **immutable lists**.

Why does this matter? These methods unlock powerful capabilities: finding where an element lives, iterating backward through a list, slicing sublists, and creating unmodifiable lists for thread-safe or constant-data scenarios. By the end of this part, you'll have the complete picture of everything the `List` interface offers.

---

## 🧩 Concept 1: `indexOf()` and `lastIndexOf()` — Finding Element Positions

### 🧠 What is it?

Imagine you have a list of numbers and some values repeat. You want to know **where** a specific element appears — either its **first** occurrence or its **last** occurrence. That's exactly what `indexOf()` and `lastIndexOf()` do.

- `indexOf(Object o)` — returns the index of the **first** occurrence of the specified element
- `lastIndexOf(Object o)` — returns the index of the **last** occurrence of the specified element

Both return `-1` if the element is not found in the list.

### ❓ Why do we need it?

Sometimes knowing *if* an element exists (`contains()`) isn't enough — you need to know *where* it sits. Think of searching for a word in a document: you might want the first match, or you might want the last match.

### ⚙️ How it works

Consider this list:

```
[1, 2, 3, 4, 5, 4, 6, 4, 7, 4]
 0  1  2  3  4  5  6  7  8  9
```

- `indexOf(4)` → returns `3` (first time `4` appears)
- `lastIndexOf(4)` → returns `9` (last time `4` appears)

### 🧪 Example

```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 4, 6, 4, 7, 4));

System.out.println("First occurrence of 4: " + list.indexOf(4));      // 3
System.out.println("Last occurrence of 4: " + list.lastIndexOf(4));    // 9
System.out.println("Index of 99: " + list.indexOf(99));                // -1 (not found)
```

### 💡 Insight

These methods use `equals()` internally to compare elements. So if you're storing custom objects, make sure your class overrides `equals()` — otherwise, you'll get unexpected `-1` results even when the object "looks" like it's in the list.

---

## 🧩 Concept 2: `ListIterator` — Bidirectional Iteration

### 🧠 What is it?

You already know about `Iterator` from the `Collection` interface — it lets you traverse elements **forward**, one by one. But what if you need to go **backward** too?

Enter `ListIterator` — a more powerful iterator **exclusive to `List`**. It extends `Iterator` and adds bidirectional traversal, index access, and the ability to modify elements during iteration.

### ❓ Why do we need it?

A regular `Iterator` is a one-way street. Once you've passed an element, there's no going back. But lists are ordered and indexed — so it makes sense to support navigation in **both directions**. `ListIterator` gives you that capability.

### ⚙️ How it works

`ListIterator` has two overloaded versions:

1. **`listIterator()`** — starts the cursor at the beginning (before the first element)
2. **`listIterator(int index)`** — starts the cursor at the specified position

Since `ListIterator` extends `Iterator`, it inherits the standard methods:

| Inherited from `Iterator` | Added by `ListIterator` |
|---|---|
| `hasNext()` | `hasPrevious()` |
| `next()` | `previous()` |
| `remove()` | `nextIndex()` |
| | `previousIndex()` |
| | `set(E e)` |
| | `add(E e)` |

Think of the cursor as sitting **between** elements:

```
Cursor positions:   ^  1  ^  2  ^  3  ^  4  ^  5  ^
                    0     1     2     3     4     5
```

- Calling `next()` moves the cursor **right** and returns the element it passed over
- Calling `previous()` moves the cursor **left** and returns the element it passed over

### 🧪 Example

**Forward iteration:**

```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9));
ListIterator<Integer> li = list.listIterator();

while (li.hasNext()) {
    System.out.print(li.next() + " "); // 1 2 3 4 5 6 7 8 9
}
```

**Backward iteration from the middle:**

```java
// Start cursor at the midpoint
ListIterator<Integer> li = list.listIterator(list.size() / 2);

while (li.hasPrevious()) {
    System.out.print(li.previous() + " "); // prints the first half in reverse
}
```

**Getting indexes:**

```java
ListIterator<Integer> li = list.listIterator(list.size() / 2);

while (li.hasNext()) {
    System.out.println("Index: " + li.nextIndex() + " → Value: " + li.next());
}
```

### 💡 Insight

The key difference: `Iterator` is available for **all** collections, but `ListIterator` is **exclusive to `List`**. You can't call `listIterator()` on a `Set` or a `Queue` — it simply doesn't exist there. This makes sense because only lists have the ordered, index-based structure that bidirectional traversal requires.

---

## 🧩 Concept 3: Modifying Elements via `ListIterator`

### 🧠 What is it?

Beyond just reading elements, `ListIterator` lets you **modify** the list while iterating — something a regular `Iterator` can't do (except `remove()`).

Three modification operations are available:

- **`remove()`** — removes the last element returned by `next()` or `previous()`
- **`set(E e)`** — replaces the last element returned by `next()` or `previous()`
- **`add(E e)`** — inserts an element at the current cursor position

### ❓ Why do we need it?

Imagine iterating through a list and wanting to replace a specific value, or insert a new element at a certain point. Without `ListIterator`, you'd have to track indexes manually or risk `ConcurrentModificationException` when modifying during a for-each loop.

### ⚙️ How it works

All three operations act relative to the **current cursor position**:

- `set()` replaces the element that was just returned (by `next()` or `previous()`)
- `add()` inserts at the current cursor position
- `remove()` removes the element that was just returned

### 🧪 Example

**Remove an element during iteration:**

```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
ListIterator<Integer> li = list.listIterator();

while (li.hasNext()) {
    int val = li.next();
    if (val == 3) {
        li.remove(); // removes 3 from the list
    }
}
System.out.println(list); // [1, 2, 4, 5]
```

**Replace an element:**

```java
ListIterator<Integer> li = list.listIterator();

while (li.hasNext()) {
    int val = li.next();
    if (val == 3) {
        li.set(33); // replaces 3 with 33
    }
}
System.out.println(list); // [1, 2, 33, 4, 5]
```

**Add an element at the cursor position:**

```java
ListIterator<Integer> li = list.listIterator();

while (li.hasNext()) {
    li.next(); // traverse to end
}
li.add(55); // adds 55 at the end (where cursor is now)
System.out.println(list); // [1, 2, 3, 4, 5, 55]
```

### 💡 Insight

The `add()` method inserts at **wherever the cursor currently is**, not at the end of the list by default. If you call `add()` without moving the cursor, the element goes at position 0. If you traverse halfway, it inserts in the middle. Always be aware of cursor position.

---

## 🧩 Concept 4: `subList()` — Slicing a List

### 🧠 What is it?

Think of `subList()` as taking a **slice of cake** — you get a portion of the list without destroying the original. It creates a **view** of a portion of the list between two indexes.

```java
List<E> subList(int fromIndex, int toIndex)
```

- `fromIndex` — inclusive (starting position)
- `toIndex` — exclusive (ending position, element at this index is NOT included)

### ❓ Why do we need it?

Sometimes you don't need the entire list — just a section of it. Maybe you want to display only page 2 of results, or process a specific range. `subList()` gives you a clean way to extract a range without copying elements manually.

### ⚙️ How it works

Given a list `[1, 2, 3, 4, 5, 6, 7, 8, 9]`:

```java
list.subList(2, 5) → [3, 4, 5]
//           ^   ^
//      fromIndex toIndex (exclusive)
// Indexes:  0  1  [2  3  4]  5  6  7  8
```

The original list remains **unchanged** — `subList()` copies the specified range into a new list.

### 🧪 Example

```java
List<Integer> numbers = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9));

List<Integer> subList = numbers.subList(2, 5);

System.out.println(subList);  // [3, 4, 5]
System.out.println(numbers);  // [1, 2, 3, 4, 5, 6, 7, 8, 9] — unchanged
```

### 💡 Insight

The `toIndex` is **exclusive** — this follows the same convention as `String.substring()`, `Arrays.copyOfRange()`, and many other Java APIs. The pattern is always: **from (inclusive) to (exclusive)**.

---

## 🧩 Concept 5: `Spliterator` in Lists vs Collections

### 🧠 What is it?

We explored `Spliterator` earlier when studying the `Collection` interface. The `List` interface also provides a `spliterator()` method, but with some key differences due to the ordered nature of lists.

### ❓ Why do we need it?

Lists are **ordered** and support **indexed access** — these properties allow the list's `Spliterator` to be more efficient at splitting for parallel processing compared to a generic collection `Spliterator`.

### ⚙️ How it works

| Feature | Collection Spliterator | List Spliterator |
|---|---|---|
| **Ordering** | Not guaranteed (depends on the collection) | **Maintains element order** |
| **Splitting** | General-purpose splitting | Can efficiently split into sublists using indexes |
| **Applicability** | Works on any collection (List, Set, Queue, etc.) | Only works on List collections |
| **Methods** | Same core methods: `tryAdvance()`, `forEachRemaining()`, `trySplit()`, `estimateSize()` | Same methods — inherits from the same `Spliterator` interface |

### 💡 Insight

If you've already understood `Spliterator` from the Collection interface, the list version works the same way — it just has the added guarantee of maintaining element order, which matters when the sequence of processing is important.

---

## 🧩 Concept 6: `List.of()` — Creating Immutable Lists (Java 9+)

### 🧠 What is it?

`List.of()` is a **static factory method** introduced in **Java 9** that creates an **immutable (unmodifiable) list**. Once created, you cannot add, remove, or change any elements — similar to how arrays have a fixed size.

### ❓ Why do we need it?

Before Java 9, creating an unmodifiable list required multiple steps:

```java
List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c"));
list = Collections.unmodifiableList(list); // verbose!
```

`List.of()` makes this a **one-liner**. It's perfect for creating constant lists, configuration values, or any list that should never change.

### ⚙️ How it works

There are **multiple overloaded versions** of `of()`:

- `List.of()` — empty immutable list
- `List.of(e1)` — one element
- `List.of(e1, e2)` — two elements
- ... up to `List.of(e1, e2, ..., e10)` — ten elements
- `List.of(E... elements)` — varargs for more than 10 elements

**Restrictions:**

1. **No modifications** — calling `add()`, `remove()`, or `set()` throws `UnsupportedOperationException`
2. **No null values** — passing `null` throws `NullPointerException`

### 🧪 Example

```java
// Empty immutable list
List<String> empty = List.of();
System.out.println(empty); // []

// Immutable list with elements
List<String> fruits = List.of("Apple", "Banana", "Cherry");
System.out.println(fruits); // [Apple, Banana, Cherry]

// Trying to modify throws exception
fruits.add("Date");    // ❌ UnsupportedOperationException
fruits.remove("Apple"); // ❌ UnsupportedOperationException

// Null values are not allowed
List<String> bad = List.of("A", null, "C"); // ❌ NullPointerException
```

### 💡 Insight

When you pass 3 elements, Java uses the `of(E e1, E e2, E e3)` overload. When you pass more than 10, it falls back to the varargs version `of(E... elements)`. This design avoids the overhead of varargs (array creation) for the most common cases.

---

## 🧩 Concept 7: `List.copyOf()` — Making an Existing List Immutable (Java 10+)

### 🧠 What is it?

`List.copyOf()` is a **static method** introduced in **Java 10** that creates an **unmodifiable copy** of an existing collection. It takes a mutable collection and returns a frozen, immutable version of it.

### ❓ Why do we need it?

What if you start with a mutable list — adding and removing elements — and then at some point you want to "freeze" it? `List.of()` requires you to know all elements upfront. `List.copyOf()` lets you **build first, freeze later**.

| Method | Use Case |
|---|---|
| `List.of(...)` | You know all elements at creation time |
| `List.copyOf(collection)` | You have an existing mutable collection and want an immutable snapshot |

### ⚙️ How it works

```java
List<E> immutableList = List.copyOf(existingCollection);
```

- Creates a **new** list containing the same elements
- The new list is **unmodifiable** — `add()`, `remove()`, `set()` all throw `UnsupportedOperationException`
- The **original list remains mutable** — changes to it do NOT affect the copy
- **Null values are not allowed** — if the source collection contains `null`, a `NullPointerException` is thrown

### 🧪 Example

```java
List<Integer> mutableList = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 6));

// Create an immutable copy
List<Integer> copiedList = List.copyOf(mutableList);

// Original list is still mutable
mutableList.add(10); // ✅ Works fine
System.out.println(mutableList); // [1, 2, 3, 4, 5, 6, 10]

// Copied list is immutable
copiedList.add(10); // ❌ UnsupportedOperationException

// Null values cause problems
mutableList.add(null); // ✅ Fine for ArrayList
List<Integer> bad = List.copyOf(mutableList); // ❌ NullPointerException
```

### 💡 Insight

Think of `List.copyOf()` as taking a **photograph** of your list. The photo captures the list at that moment in time and can never be changed — but the original list can keep evolving. This is useful for passing data to other parts of your program while guaranteeing it won't be tampered with.

---

## ✅ Key Takeaways

1. **`indexOf()` / `lastIndexOf()`** find the first and last position of an element — return `-1` if not found
2. **`ListIterator`** is a bidirectional iterator exclusive to lists — supports `next()`, `previous()`, `set()`, `add()`, and `remove()`
3. **`listIterator(index)`** lets you start iteration from any position in the list
4. **`subList(from, to)`** creates a slice of the list without modifying the original — `toIndex` is exclusive
5. **`List.of()`** (Java 9) creates immutable lists — no adds, removes, or nulls allowed
6. **`List.copyOf()`** (Java 10) creates an immutable snapshot of an existing mutable collection
7. With this part, we've covered **every method** in the `List` interface

## ⚠️ Common Mistakes

- **Forgetting `toIndex` is exclusive** in `subList()` — `subList(2, 5)` includes indexes 2, 3, 4 but NOT 5
- **Trying to modify an immutable list** created by `List.of()` or `List.copyOf()` — always throws `UnsupportedOperationException`
- **Passing `null` to `List.of()` or `List.copyOf()`** — both throw `NullPointerException`; they don't silently accept nulls
- **Using `ListIterator` on non-List collections** — `listIterator()` doesn't exist on `Set` or `Queue`
- **Confusing `Iterator` cursor behavior** — `remove()`, `set()`, and `add()` all operate relative to the last element returned by `next()` or `previous()`

## 💡 Pro Tips

- Use `List.of()` for **constant/configuration data** that should never change — it clearly communicates immutability intent
- Use `List.copyOf()` as a **defensive copy** when returning a list from a method — prevents callers from modifying your internal state
- `ListIterator` is great for algorithms that need to traverse a list in **both directions**, like implementing undo/redo or reversing elements in-place
- When searching for elements, prefer `indexOf()` over manual loops — it's cleaner and leverages `equals()` properly
- Remember the Java version requirements: `List.of()` needs **Java 9+**, `List.copyOf()` needs **Java 10+**
