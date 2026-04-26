# Unmodifiable Collections

## Introduction

When you pass a collection to another method, that method can modify it — add items, remove items, clear it entirely. Since collections are reference types in Java, those changes affect the **original** collection. So how do you protect your data? That's where **unmodifiable collections** come in. The `Collections` class provides methods to wrap any collection in a read-only view.

---

## Concept 1: The Problem — Collections Are Mutable by Default

### 🧠 What happens when you pass a collection?

In Java, objects (including collections) are passed by value — but the **value is the reference**. This means any method that receives your list can modify it, and those changes are reflected everywhere.

### 🧪 Example

```java
List<Integer> nums = new ArrayList<>();
nums.add(10);
nums.add(20);
nums.add(30);

modify(nums);
System.out.println(nums); // [20, 30] — 10 was removed!

public static void modify(List<Integer> list) {
    list.remove(0); // removes the first element
}
```

Even though the removal happens inside `modify()`, the change is reflected in the original `nums` list. This is because both `nums` and `list` point to the **same object in memory**.

### 💡 Insight

This behavior is often surprising. You might expect that since Java is "pass by value," the original list would be safe. But the *value* being passed is the *reference* — so both variables point to the same underlying `ArrayList`.

---

## Concept 2: Making Collections Unmodifiable

### 🧠 What is an unmodifiable collection?

An unmodifiable collection is a **read-only wrapper** around an existing collection. Any attempt to modify it — `add()`, `remove()`, `set()`, `clear()` — throws an `UnsupportedOperationException` at runtime.

### ⚙️ How to create one

The `Collections` class provides static methods:

- `Collections.unmodifiableList(list)`
- `Collections.unmodifiableSet(set)`
- `Collections.unmodifiableMap(map)`
- `Collections.unmodifiableCollection(collection)`

### 🧪 Example

```java
List<Integer> nums = new ArrayList<>();
nums.add(10);
nums.add(20);
nums.add(30);

List<Integer> readOnly = Collections.unmodifiableList(nums);

modify(readOnly); // throws UnsupportedOperationException!

public static void modify(List<Integer> list) {
    list.remove(0); // BOOM — runtime exception
}
```

### ❓ When should you use this?

Whenever you want to **guarantee** that external code cannot modify your internal data. The unmodifiable wrapper acts as a protective shield.

---

## Concept 3: The Common Pattern — Protecting Internal State

### 🧠 Real-world usage in classes

The most common use case is in **getter methods**. When a class has an internal collection, you don't want external code modifying it through the getter.

### 🧪 Example

```java
public class Node {
    private List<Node> neighbors = new ArrayList<>();

    // BAD — exposes internal list for modification
    public List<Node> getNeighborsBad() {
        return neighbors;
    }

    // GOOD — returns a read-only view
    public List<Node> getNeighbors() {
        return Collections.unmodifiableList(neighbors);
    }
}
```

With the "bad" getter, anyone can call `node.getNeighbors().add(...)` and directly mutate the internal list. With the unmodifiable wrapper, any such attempt throws an exception.

### 💡 Insight

This pattern is extremely common in graph algorithms, data models, and any class that maintains internal collections. It's a form of **defensive programming** — you protect your class's invariants by never exposing mutable references.

---

## ✅ Key Takeaways

- Collections in Java are reference types — passing them to methods means the original can be modified
- `Collections.unmodifiableList()`, `.unmodifiableMap()`, `.unmodifiableSet()` create read-only wrappers
- Any modification attempt on an unmodifiable collection throws `UnsupportedOperationException` at runtime
- Always return unmodifiable views from getter methods to protect internal state

## ⚠️ Common Mistakes

- Forgetting that unmodifiable wrappers throw **runtime** exceptions, not compile-time errors — the compiler won't warn you
- Returning `neighbors` directly from a getter instead of wrapping it — this exposes your internal state
- Confusing unmodifiable with immutable — the underlying collection can still be modified through the original reference; only the wrapper is read-only. For example:

```java
List<String> original = new ArrayList<>(List.of("A", "B"));
List<String> readOnly = Collections.unmodifiableList(original);
original.add("C");  // this works!
System.out.println(readOnly); // [A, B, C] — the "read-only" view changed!
```

The unmodifiable wrapper is just a view — it delegates to the original list. For true immutability (where no reference can modify the data), use `List.of(...)` or `List.copyOf(original)` instead.

## 💡 Pro Tips

- In modern Java (9+), you can also use `List.of(...)`, `Set.of(...)`, and `Map.of(...)` to create truly immutable collections
- Pair unmodifiable collections with private setters for maximum encapsulation
- Use this pattern consistently in domain objects, DTOs, and any class exposed via an API
