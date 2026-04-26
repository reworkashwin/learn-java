# TreeMap Example

## Introduction

We've learned about binary search trees and red-black trees. Now it's time to see how Java uses these concepts in practice — through the **TreeMap** data structure. Unlike `HashMap` which uses a hash function and a one-dimensional array, `TreeMap` uses a **red-black tree** under the hood. This means items are stored in a **sorted order**, and all operations are guaranteed to run in **O(log n)** time.

---

## Concept 1: What is TreeMap?

### 🧠 What is it?

`TreeMap` is a Java Collections Framework class that implements the `SortedMap` and `NavigableMap` interfaces. Since `SortedMap` extends `Map`, a `TreeMap` is also a `Map` — it stores **key-value pairs** just like `HashMap`.

The critical difference? Under the hood, there's a **balanced binary search tree** (specifically a red-black tree) — not a one-dimensional array with a hash function.

### ❓ Why use TreeMap over HashMap?

Two key reasons:

1. **Sorted order** — TreeMap keeps keys sorted automatically. Sometimes that's exactly what you need.
2. **Deterministic performance** — Every operation is guaranteed O(log n). With `HashMap`, if the hash function is poor, you could degrade to O(n). TreeMap never has that problem.

### ⚙️ How it works

```java
TreeMap<Integer, String> map = new TreeMap<>();

map.put(10, "Ten");
map.put(3, "Three");
map.put(5, "Five");
map.put(1, "One");
map.put(8, "Eight");

for (Map.Entry<Integer, String> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " " + entry.getValue());
}
```

**Output:**
```
1 One
3 Three
5 Five
8 Eight
10 Ten
```

Notice the keys come out in **ascending sorted order** — `1, 3, 5, 8, 10` — regardless of the order we inserted them. That's the red-black tree doing its job.

---

## Concept 2: Reverse (Descending) Order

### 🧠 What if you want descending order?

Pass `Collections.reverseOrder()` as a comparator when constructing the TreeMap:

```java
TreeMap<Integer, String> map = new TreeMap<>(Collections.reverseOrder());

map.put(10, "Ten");
map.put(3, "Three");
map.put(5, "Five");
map.put(1, "One");
map.put(8, "Eight");
```

**Output:**
```
10 Ten
8 Eight
5 Five
3 Three
1 One
```

Now the keys are sorted in **descending order**.

---

## Concept 3: Getting Smallest and Largest Keys

### ⚙️ How it works

`TreeMap` provides convenient methods to retrieve the first (smallest) and last (largest) keys:

```java
TreeMap<Integer, String> map = new TreeMap<>();
// ... insert items ...

System.out.println("Smallest key: " + map.firstKey());  // 1
System.out.println("Largest key: " + map.lastKey());     // 10
```

> **Note:** You must declare the variable as `TreeMap`, not just `Map`, because `firstKey()` and `lastKey()` belong to the `SortedMap` interface.

These operations also run in **O(log n)** time.

---

## Concept 4: TreeMap with String Keys

### 🧪 Example

```java
TreeMap<String, Integer> map = new TreeMap<>();

map.put("Adam", 10);
map.put("Kevin", 56);
map.put("Anna", 21);
map.put("Daniel", 10);
map.put("Katie", 45);
```

**Output (ascending):**
```
Adam Anna Daniel Katie Kevin
```

**Output (with `Collections.reverseOrder()`):**
```
Kevin Katie Daniel Anna Adam
```

String keys are sorted in **alphabetical order** — that's their natural ordering.

---

## ✅ Key Takeaways

- `TreeMap` uses a **red-black tree** under the hood — not an array with a hash function
- Keys are always stored in **sorted order** (ascending by default)
- All operations — `put()`, `get()`, `remove()`, `firstKey()`, `lastKey()` — run in **O(log n)**
- Use `Collections.reverseOrder()` as a comparator for descending order
- You must use the `TreeMap` type (not `Map`) to access `firstKey()` and `lastKey()`

## ⚠️ Common Mistakes

- Declaring the variable as `Map<K,V>` and then trying to call `firstKey()` or `lastKey()` — these are `SortedMap` methods, not available on the `Map` interface
- Assuming TreeMap is faster than HashMap — it's **not**. O(log n) is slower than O(1). TreeMap's advantage is **sorted order** and **deterministic** performance

## 💡 Pro Tips

- Use `TreeMap` when you need keys in sorted order (e.g., leaderboards, time-series data)
- Use `HashMap` when you just need fast lookups and don't care about order
- `TreeMap` does **not** allow `null` keys (unlike `HashMap` which allows one null key) — because TreeMap must call `compareTo()` (or `Comparator.compare()`) on every key to find its position in the tree. Calling `compareTo()` on `null` throws a `NullPointerException`, so null keys are structurally impossible
