# PriorityQueue Example

## Introduction

A regular queue follows strict FIFO — first in, first out. But what if some items are more **urgent** than others? What if a hospital emergency room needs to treat critical patients before someone with a paper cut, regardless of arrival order? This is exactly what a **PriorityQueue** solves — items are served based on **priority**, not insertion order.

---

## Concept 1: What is a PriorityQueue?

### 🧠 What is it?

A `PriorityQueue` is an implementation of the `Queue` interface where each item has a **priority value**. Items with higher priority are served **before** those with lower priority, regardless of when they were added.

### ⚙️ How it works under the hood

Under the hood, Java's `PriorityQueue` uses a **heap data structure** — specifically a **min-heap** — which is represented as a one-dimensional array.

- The item with the **lowest value** (highest priority in a min-heap) sits at the **root**
- Accessing the root is O(1) — that's why `peek()` is instant

### 🧪 Running Time Complexities

| Operation | Time Complexity |
|---|---|
| `offer()` / `add()` — insert | O(log n) |
| `poll()` / `remove()` — remove head | O(log n) |
| `remove(Object)` — remove arbitrary item | O(n) |
| `contains()` — check if present | O(n) |
| `peek()` — view head without removing | O(1) |
| `size()` | O(1) |

💡 `peek()` is O(1) because the highest-priority item is always at the root of the heap.

---

## Concept 2: Basic Usage with Integers

### 🧪 Example

```java
Queue<Integer> queue = new PriorityQueue<>();

queue.offer(5);
queue.offer(12);
queue.offer(10);
queue.offer(1);

while (!queue.isEmpty()) {
    System.out.println(queue.poll());
}
// Output: 1, 5, 10, 12
```

### 💡 Insight

Notice the output is in **ascending order**. That's because Java's `PriorityQueue` is a **min-heap** by default — the smallest value has the highest priority.

By repeatedly polling from the PriorityQueue, you effectively get a **sorting algorithm** — this is called **HeapSort**, and it runs in O(n log n).

### ❓ Want descending order?

Use a custom `Comparator`:

```java
Queue<Integer> queue = new PriorityQueue<>(
    (a, b) -> -Integer.compare(a, b)  // reverse the natural order
);
```

Now polling gives you `12, 10, 5, 1`.

---

## Concept 3: Storing Custom Objects

### ❓ The problem

When you store custom objects like `Person`, Java doesn't know how to compare them. Is `Person("Adam", 12)` higher priority than `Person("Kevin", 67)`? By name? By age?

You **must** tell Java how to determine priority.

### ⚙️ Solution: Implement `Comparable`

```java
class Person implements Comparable<Person> {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public int compareTo(Person other) {
        return Integer.compare(this.age, other.getAge());
    }

    // getters and toString()...
}
```

### 🧪 Example in action

```java
Queue<Person> queue = new PriorityQueue<>();

queue.offer(new Person("Anna", 32));
queue.offer(new Person("Adam", 12));
queue.offer(new Person("Catherine", 67));
queue.offer(new Person("Joe", 43));

while (!queue.isEmpty()) {
    System.out.println(queue.poll());
}
// Output sorted by age: 12, 32, 43, 67
```

### 🔄 Changing the priority criteria

**Sort by age descending:**
```java
return -Integer.compare(this.age, other.getAge());
```

**Sort alphabetically by name:**
```java
return this.name.compareTo(other.getName());
```

**Sort by name in reverse:**
```java
return -this.name.compareTo(other.getName());
```

The `compareTo()` method is the **single method** of the `Comparable` interface, and it's the hook that lets you define your own priority logic.

---

## Concept 4: `poll()` vs `remove()` and `offer()` vs `add()`

| Method | On empty/full queue |
|---|---|
| `remove()` | Throws exception if queue is empty |
| `poll()` | Returns `null` if queue is empty |
| `add()` | Throws exception if capacity is limited and full |
| `offer()` | Returns `false` if element can't be added |

💡 **Prefer `poll()` over `remove()`** and **`offer()` over `add()`** — they fail gracefully instead of throwing exceptions.

---

## ✅ Key Takeaways

- `PriorityQueue` serves items by **priority**, not insertion order
- Java uses a **min-heap** by default — smallest value = highest priority
- For primitive types, the value itself acts as the priority
- For custom objects, implement `Comparable` and define `compareTo()` to set the priority logic
- Repeatedly polling from a PriorityQueue yields a sorted sequence — this is HeapSort (O(n log n))

## ⚠️ Common Mistakes

- Forgetting to implement `Comparable` for custom objects — causes `ClassCastException` at runtime
- Assuming PriorityQueue maintains insertion order — it doesn't
- Using `remove(Object)` or `contains()` heavily — both are O(n), making PriorityQueue a poor choice for frequent lookups

## 💡 Pro Tips

- Use a `Comparator` in the constructor to define priority without modifying the class itself
- If you need frequent `contains()` or arbitrary `remove()`, consider a `TreeMap` or `HashMap` instead
- PriorityQueue is **not** thread-safe — use `PriorityBlockingQueue` for concurrent access. PriorityQueue's internal heap array and `size` field have no synchronization, so concurrent `offer()`/`poll()` can corrupt the heap structure — two threads may sift elements simultaneously, violating the heap invariant and causing `poll()` to return elements out of priority order or throw `ArrayIndexOutOfBoundsException` during resize
