# 📘 NavigableMap Interface — SortedMap on Steroids

---

## 📌 Introduction

### 🧠 What is this about?

We've already explored `SortedMap` and how it keeps keys in a sorted order. But what if you need more than just sorting? What if you want to find the closest key below a certain value, or reverse the entire map, or remove entries from either end like a queue? That's where `NavigableMap` steps in.

`NavigableMap` is an interface that **extends `SortedMap`** and adds powerful navigation methods — the ability to search for closest matches, iterate in reverse, and poll entries from both ends of the map.

### ❓ Why does it matter?

Think about this: you have a product catalog sorted by price. A customer says, "I have ₹500 — what's the most expensive thing I can buy?" With a regular `SortedMap`, there's no direct way to answer that. You'd have to manually iterate and compare. With `NavigableMap`, one method call — `floorKey(500)` — gives you the answer instantly.

The moment your application needs **closest-match lookups**, **reverse traversal**, or **priority-style entry removal**, `SortedMap` falls short. `NavigableMap` fills exactly that gap.

---

## 🧩 Concept 1: Quick Recap — What SortedMap Gives Us

### 🧠 What is it?

Before we dive into `NavigableMap`, let's quickly recall what `SortedMap` already provides. `SortedMap` is an interface that extends `Map` and guarantees that keys are maintained in **sorted order** — either by their natural ordering (`Comparable`) or by a custom `Comparator` you supply.

### ⚙️ What SortedMap offers

| Method | Description |
|---|---|
| `firstKey()` | Returns the lowest (first) key |
| `lastKey()` | Returns the highest (last) key |
| `headMap(toKey)` | Returns a view of keys **strictly less than** `toKey` |
| `tailMap(fromKey)` | Returns a view of keys **greater than or equal to** `fromKey` |
| `subMap(fromKey, toKey)` | Returns a view of keys from `fromKey` (inclusive) to `toKey` (exclusive) |

### ❓ Why isn't this enough?

These methods are useful, but they're rigid. You can slice ranges, but you can't ask:

- "What's the closest key just below 50?"
- "Give me the map in reverse order"
- "Remove and return the smallest entry"

`SortedMap` gives you the sorted structure, but `NavigableMap` gives you the **tools to navigate within that structure**.

> Think of `SortedMap` as a sorted bookshelf. `NavigableMap` adds a librarian who can instantly find the closest book to what you're looking for.

---

## 🧩 Concept 2: NavigableMap — The Closest-Match Methods

### 🧠 What is it?

The headline feature of `NavigableMap` is four methods that let you find the **nearest key** relative to a given key. These are the methods that truly set it apart from `SortedMap`.

### ❓ Why do we need it?

In real-world scenarios, exact matches are not always possible. Imagine:
- A currency exchange system looking for the closest exchange rate
- A scheduling app finding the nearest available time slot
- A pricing engine finding the best price tier for a customer's budget

You need "close enough" answers — and these four methods deliver exactly that.

### ⚙️ How it works

Here's the family of four, explained with a simple mental model:

| Method | Returns | Direction |
|---|---|---|
| `lowerKey(key)` | Highest key **strictly less than** the given key | ← (just below) |
| `floorKey(key)` | Highest key **less than or equal to** the given key | ← (at or below) |
| `ceilingKey(key)` | Lowest key **greater than or equal to** the given key | → (at or above) |
| `higherKey(key)` | Lowest key **strictly greater than** the given key | → (just above) |

**How to remember:**
- **lower** and **higher** are **strict** — they never include the exact key
- **floor** and **ceiling** are **inclusive** — they CAN return the exact key if it exists
- Think of a number line: `lower ← floor ← [key] → ceiling → higher`

### 🧪 Example

#### 💻 Code Example — Product Price Lookup

```java
import java.util.NavigableMap;
import java.util.TreeMap;

public class PriceFinder {
    public static void main(String[] args) {
        // TreeMap implements NavigableMap
        NavigableMap<Integer, String> products = new TreeMap<>();
        products.put(100, "Pen");
        products.put(250, "Notebook");
        products.put(500, "Headphones");
        products.put(1000, "Keyboard");
        products.put(2500, "Monitor");

        int budget = 700;

        // What's the most expensive thing I can afford?
        System.out.println("Floor key of 700: " + products.floorKey(budget));    // 500
        System.out.println("Floor entry: " + products.floorEntry(budget));       // 500=Headphones

        // What's the cheapest thing above my budget?
        System.out.println("Ceiling key of 700: " + products.ceilingKey(budget)); // 1000
        
        // Strictly below and above
        System.out.println("Lower key of 500: " + products.lowerKey(500));   // 250
        System.out.println("Higher key of 500: " + products.higherKey(500)); // 1000

        // What if the exact key exists? floor/ceiling return it!
        System.out.println("Floor key of 500: " + products.floorKey(500));     // 500 (exact match!)
        System.out.println("Ceiling key of 500: " + products.ceilingKey(500)); // 500 (exact match!)
    }
}
```

**Output:**
```
Floor key of 700: 500
Floor entry: 500=Headphones
Ceiling key of 700: 1000
Lower key of 500: 250
Higher key of 500: 1000
Floor key of 500: 500
Ceiling key of 500: 500
```

> 💡 Notice the difference: `lowerKey(500)` returns `250` (strictly less), but `floorKey(500)` returns `500` itself (because "less than or equal" includes the exact match).

### 💡 Entry Variants

Each of these four methods also has an `Entry` version that returns the full key-value pair instead of just the key:

| Key-only | Entry version |
|---|---|
| `lowerKey(key)` | `lowerEntry(key)` |
| `floorKey(key)` | `floorEntry(key)` |
| `ceilingKey(key)` | `ceilingEntry(key)` |
| `higherKey(key)` | `higherEntry(key)` |

Use the `Entry` variants when you need both the key and the value in one call.

---

## 🧩 Concept 3: descendingMap() — Reverse the Entire Map

### 🧠 What is it?

`descendingMap()` returns a **reverse-order view** of the map. If your map goes from lowest to highest, the descending view goes from highest to lowest.

### ❓ Why do we need it?

Sometimes you need the data in the opposite order:
- Display products from most expensive to cheapest
- Show leaderboard scores from highest to lowest
- Process events from most recent to oldest

Without `descendingMap()`, you'd have to create a new `TreeMap` with a reversed comparator or manually iterate backwards. This method gives you a live, reversed view with zero extra memory.

### ⚙️ How it works

- It does NOT create a new map. It returns a **view** — meaning changes to the original map are reflected in the descending view and vice versa.
- The view itself is also a `NavigableMap`, so you can chain all the same methods on it.

### 🧪 Example

```java
NavigableMap<Integer, String> products = new TreeMap<>();
products.put(100, "Pen");
products.put(250, "Notebook");
products.put(500, "Headphones");
products.put(1000, "Keyboard");

// Normal order: 100, 250, 500, 1000
System.out.println("Ascending: " + products);

// Reversed view: 1000, 500, 250, 100
NavigableMap<Integer, String> reversed = products.descendingMap();
System.out.println("Descending: " + reversed);

// It's a LIVE view — changes reflect both ways
products.put(750, "Mouse");
System.out.println("Descending after adding 750: " + reversed);
// Output: {1000=Keyboard, 750=Mouse, 500=Headphones, 250=Notebook, 100=Pen}
```

> You also get `descendingKeySet()` if you only need the keys in reverse order.

---

## 🧩 Concept 4: pollFirstEntry() and pollLastEntry() — Queue-Like Behavior

### 🧠 What is it?

These two methods **remove AND return** the first (lowest) or last (highest) entry from the map. Think of it as popping from either end of a sorted structure.

### ❓ Why do we need it?

This turns your sorted map into something that behaves like a **priority queue for key-value pairs**:
- Process the cheapest order first → `pollFirstEntry()`
- Handle the highest-priority task first → `pollLastEntry()`
- Drain entries one by one in sorted order

Unlike `firstKey()` / `lastKey()` from `SortedMap` (which only peek), these methods **remove** the entry — you're consuming it.

### ⚙️ How it works

| Method | Returns | Side Effect |
|---|---|---|
| `pollFirstEntry()` | The entry with the **lowest** key | **Removes** it from the map |
| `pollLastEntry()` | The entry with the **highest** key | **Removes** it from the map |

Both return `null` if the map is empty.

### 🧪 Example

```java
NavigableMap<Integer, String> taskQueue = new TreeMap<>();
taskQueue.put(1, "Fix critical bug");
taskQueue.put(3, "Write unit tests");
taskQueue.put(2, "Code review");
taskQueue.put(5, "Update docs");

System.out.println("Processing tasks by priority...");

// Process from lowest (highest priority) to highest
while (!taskQueue.isEmpty()) {
    Map.Entry<Integer, String> task = taskQueue.pollFirstEntry();
    System.out.println("Processing: Priority " + task.getKey() + " → " + task.getValue());
}

System.out.println("All tasks processed. Map size: " + taskQueue.size());
```

**Output:**
```
Processing tasks by priority...
Processing: Priority 1 → Fix critical bug
Processing: Priority 2 → Code review
Processing: Priority 3 → Write unit tests
Processing: Priority 5 → Update docs
All tasks processed. Map size: 0
```

> ⚠️ Remember: `pollFirstEntry()` **removes** the entry. If you just want to look without removing, use `firstEntry()` instead.

---

## 🧩 Concept 5: When to Use SortedMap vs NavigableMap

### 🧠 The Decision Formula

Here's the simple rule of thumb:

```
NavigableMap = SortedMap + closest-match navigation + reverse views + poll operations
```

| Need | Use |
|---|---|
| Keys in sorted order, basic range views | `SortedMap` is fine |
| Find the closest key below/above a value | `NavigableMap` |
| Reverse iteration without a new comparator | `NavigableMap` |
| Remove and return entries from ends (queue-like) | `NavigableMap` |
| Inclusive/exclusive control on `headMap`, `tailMap`, `subMap` | `NavigableMap` |

### 💡 Bonus: Inclusive Range Methods

`SortedMap`'s `headMap(toKey)` is always **exclusive** of `toKey`. `NavigableMap` adds overloaded versions with a boolean flag:

```java
NavigableMap<Integer, String> map = new TreeMap<>();
map.put(10, "A");
map.put(20, "B");
map.put(30, "C");
map.put(40, "D");

// SortedMap style — exclusive (does NOT include 30)
System.out.println(map.headMap(30));          // {10=A, 20=B}

// NavigableMap style — inclusive (INCLUDES 30)
System.out.println(map.headMap(30, true));    // {10=A, 20=B, 30=C}

// Same for tailMap and subMap
System.out.println(map.tailMap(20, false));   // {30=C, 40=D}  — excludes 20
System.out.println(map.subMap(10, true, 30, true)); // {10=A, 20=B, 30=C}
```

This inclusive/exclusive control is something `SortedMap` simply doesn't offer.

---

## ✅ Key Takeaways

1. **`NavigableMap` extends `SortedMap`** — it has everything `SortedMap` has, plus navigation superpowers.
2. **Four closest-match methods**: `lowerKey`, `floorKey`, `ceilingKey`, `higherKey` — remember that `floor`/`ceiling` are inclusive, `lower`/`higher` are strict.
3. **`descendingMap()`** gives a live reversed view — no need to create a new map with a reversed comparator.
4. **`pollFirstEntry()` / `pollLastEntry()`** enable queue-like consumption of sorted entries.
5. **`TreeMap`** is the standard implementation of `NavigableMap` — whenever you need a `NavigableMap`, reach for `TreeMap`.
6. **Inclusive range methods** (`headMap(key, boolean)`, etc.) give you fine-grained control that `SortedMap` lacks.

---

## ⚠️ Common Mistakes

1. **Confusing `lowerKey` with `floorKey`**: `lowerKey(500)` skips 500 even if it exists. `floorKey(500)` returns 500 itself. This subtle difference causes bugs in boundary conditions.
2. **Forgetting that `pollFirstEntry()` removes the entry**: If you just want to peek, use `firstEntry()`. Using `poll` when you meant to peek silently deletes data.
3. **Assuming `descendingMap()` creates a copy**: It's a view. Modifying the original map changes the descending view too (and vice versa). This can cause `ConcurrentModificationException` if you iterate one while modifying the other.
4. **Using `SortedMap` as the variable type when you need navigation**: If you declare `SortedMap<K,V> map = new TreeMap<>()`, you lose access to all `NavigableMap` methods. Use the right type for what you need.

---

## 💡 Pro Tips

1. **Interview formula**: "NavigableMap = SortedMap + more navigation." If asked the difference, list the four closest-match methods, `descendingMap()`, and `pollFirstEntry/LastEntry` — that covers it.
2. **`TreeMap` is always the answer**: In practice, whenever you need `NavigableMap`, you'll use `TreeMap`. There's no other standard implementation in `java.util`.
3. **Combine `descendingMap()` with `pollFirstEntry()`** to process entries from highest to lowest — essentially a max-priority queue for key-value pairs.
4. **All `NavigableMap` methods return `null` for no-match**: `floorKey()`, `ceilingKey()`, `pollFirstEntry()`, etc. all return `null` when there's no matching entry. Always null-check in production code.
5. **`ConcurrentSkipListMap`** is the thread-safe `NavigableMap` implementation — use it in concurrent scenarios instead of synchronizing a `TreeMap`.
