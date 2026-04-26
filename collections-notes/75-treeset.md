# 📘 TreeSet in Java

---

## 📌 Introduction

### 🧠 What is this about?

We've already seen `HashSet` (unordered, fast) and `LinkedHashSet` (insertion-ordered). But what if you need your elements to be **automatically sorted**? That's exactly what `TreeSet` does.

`TreeSet` is a `Set` implementation that stores elements in **sorted order** — ascending by default, or in any custom order you define via a `Comparator`. Under the hood, it's powered by a `TreeMap` (a Red-Black Tree), which is why every operation has `O(log n)` performance instead of `O(1)`.

### ❓ Why does it matter?

- When you need a collection of **unique elements** that are always **sorted**, `TreeSet` is the right tool.
- It also implements `NavigableSet`, which gives you powerful **navigation methods** — like finding the nearest element less than or greater than a given value. No other `Set` gives you these capabilities.
- Understanding `TreeSet` is crucial for interview questions around sorted data structures and for real-world scenarios like leaderboard rankings, scheduling, and range queries.

---

## 🧩 Concept 1: What is TreeSet?

### 🧠 What is it?

`TreeSet` is a class that implements the `NavigableSet` interface. Let's trace its place in the hierarchy:

```
Set (interface)
 └── SortedSet (interface)
      └── NavigableSet (interface)
           └── TreeSet (class)
```

- **`Set`** — guarantees uniqueness (no duplicates).
- **`SortedSet`** — adds the guarantee that elements are stored in sorted order.
- **`NavigableSet`** — extends `SortedSet` with navigation methods (like finding the closest match to a value).
- **`TreeSet`** — the concrete class that implements all of the above.

Internally, `TreeSet` uses a **`TreeMap`** (a self-balancing Red-Black Tree). Every element you add becomes a key in this tree, and the tree keeps them in sorted order automatically.

### ❓ Why do we need it?

Imagine you have a list of scores: `{20, 10, 40, 30}`. With a `HashSet`, they might print in any order. With `TreeSet`, they'll always be `{10, 20, 30, 40}` — sorted, guaranteed. You don't need to call `Collections.sort()` or manage order yourself.

Beyond sorting, `TreeSet` gives you **navigation** — "What's the score just below 35?" or "Give me all scores between 20 and 40." These are things `HashSet` simply can't do.

### ⚙️ How it works (Step-by-Step)

1. **You create a `TreeSet`** — optionally with a `Comparator` to define custom ordering.
2. **You add elements** — each element is inserted into the internal Red-Black Tree at its correct sorted position.
3. **The tree self-balances** — ensuring that the height stays approximately `log(n)`, which guarantees `O(log n)` operations.
4. **Iteration** always yields elements in sorted order.

### 🧪 Example

#### 💻 Code Example:

```java
import java.util.TreeSet;
import java.util.Comparator;

public class TreeSetBasics {
    public static void main(String[] args) {
        // Default: natural order (ascending)
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(20);
        numbers.add(10);
        numbers.add(40);
        numbers.add(30);

        System.out.println(numbers);
        // Output: [10, 20, 30, 40]  — sorted automatically!

        // Descending order using Comparator.reverseOrder()
        TreeSet<Integer> descending = new TreeSet<>(Comparator.reverseOrder());
        descending.addAll(numbers);

        System.out.println(descending);
        // Output: [40, 30, 20, 10]

        // Explicit natural order (same as default — just for clarity)
        TreeSet<Integer> explicit = new TreeSet<>(Comparator.naturalOrder());
        explicit.addAll(numbers);

        System.out.println(explicit);
        // Output: [10, 20, 30, 40]
    }
}
```

Notice how `Comparator.reverseOrder()` and `Comparator.naturalOrder()` are **static factory methods** on the `Comparator` interface. You pass them into the `TreeSet` constructor to control the sort direction. If you don't pass anything, natural order (ascending) is used by default.

---

## 🧩 Concept 2: Key Characteristics of TreeSet

### 🧠 What is it?

Before diving into the powerful navigation methods, let's nail down the four key properties that define `TreeSet`:

### ⚙️ How it works (Step-by-Step)

**1. Sorted Order**

Elements are always maintained in sorted order. By default, this is the **natural ordering** (ascending for numbers, alphabetical for strings). You can override this with a custom `Comparator`.

**2. No Duplicates**

Just like `HashSet` and `LinkedHashSet`, `TreeSet` ignores duplicate elements. If you add `30` twice, it's stored only once.

**3. NavigableSet Interface**

`TreeSet` implements `NavigableSet`, which provides rich navigation methods like `lower()`, `floor()`, `ceiling()`, `higher()`, `headSet()`, `tailSet()`, `subSet()`, and more. This is what makes `TreeSet` uniquely powerful.

**4. No Null Elements**

This is a critical difference from `HashSet`. `TreeSet` does **NOT** allow `null` values. Why? Because to place an element in the tree, `TreeSet` needs to **compare** it with existing elements. You can't compare `null` to anything — so it throws a `NullPointerException`.

### 🧪 Example

#### 💻 Code Example:

```java
import java.util.TreeSet;

public class TreeSetCharacteristics {
    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<>();
        set.add(30);
        set.add(10);
        set.add(20);
        set.add(30);  // Duplicate — ignored

        System.out.println(set);
        // Output: [10, 20, 30]  — sorted, no duplicate 30

        // Attempting to add null
        try {
            set.add(null);
        } catch (NullPointerException e) {
            System.out.println("Cannot add null to TreeSet!");
            // This WILL be thrown
        }
    }
}
```

> 💡 **Remember:** `HashSet` allows **one** `null` value. `TreeSet` allows **zero** — it throws `NullPointerException` immediately.

---

## 🧩 Concept 3: NavigableSet Methods — lower, floor, ceiling, higher

### 🧠 What is it?

These four methods let you **find the nearest element** to a given value in the set. Think of them as "search nearby" operations on a sorted collection.

Here's the precise contract for each:

| Method | Returns | Includes Equal? |
|---|---|---|
| `lower(e)` | Greatest element **strictly less** than `e` | ❌ No |
| `floor(e)` | Greatest element **less than or equal** to `e` | ✅ Yes |
| `ceiling(e)` | Smallest element **greater than or equal** to `e` | ✅ Yes |
| `higher(e)` | Smallest element **strictly greater** than `e` | ❌ No |

An easy way to remember:
- **`lower`** and **`higher`** are **strict** — they exclude the exact match.
- **`floor`** and **`ceiling`** are **inclusive** — they include the exact match if it exists.
- **`lower`** / **`floor`** look **downward** (toward smaller values).
- **`ceiling`** / **`higher`** look **upward** (toward larger values).

All four return `null` if no matching element exists.

### ❓ Why do we need it?

These methods are invaluable for scenarios like:
- "What's the highest score below the passing mark?"
- "What's the next available time slot at or after 2 PM?"
- "What's the closest price point to my budget?"

No other `Set` implementation offers this kind of querying.

### ⚙️ How it works (Step-by-Step)

Since `TreeSet` is backed by a balanced binary tree, these lookups traverse the tree — going left or right based on comparisons — and return the appropriate node. This is why they run in `O(log n)`.

### 🧪 Example

#### 💻 Code Example:

```java
import java.util.TreeSet;

public class NavigableSetMethods {
    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<>();
        set.add(10);
        set.add(20);
        set.add(30);
        set.add(40);

        System.out.println("Set: " + set);  // [10, 20, 30, 40]

        // lower(e) — greatest element STRICTLY LESS than e
        System.out.println("lower(40) = " + set.lower(40));   // 30
        System.out.println("lower(10) = " + set.lower(10));   // null (nothing less than 10)
        System.out.println("lower(25) = " + set.lower(25));   // 20

        // floor(e) — greatest element LESS THAN OR EQUAL to e
        System.out.println("floor(20) = " + set.floor(20));   // 20 (exact match)
        System.out.println("floor(19) = " + set.floor(19));   // 10 (greatest ≤ 19)
        System.out.println("floor(35) = " + set.floor(35));   // 30 (greatest ≤ 35)

        // ceiling(e) — smallest element GREATER THAN OR EQUAL to e
        System.out.println("ceiling(11) = " + set.ceiling(11)); // 20 (smallest ≥ 11)
        System.out.println("ceiling(20) = " + set.ceiling(20)); // 20 (exact match)
        System.out.println("ceiling(25) = " + set.ceiling(25)); // 30 (smallest ≥ 25)

        // higher(e) — smallest element STRICTLY GREATER than e
        System.out.println("higher(30) = " + set.higher(30));   // 40
        System.out.println("higher(40) = " + set.higher(40));   // null (nothing greater than 40)
        System.out.println("higher(25) = " + set.higher(25));   // 30
    }
}
```

Walk through a few of these to make them stick:
- `lower(40)` → We want the greatest element **strictly less** than 40. That's `30`. ✅
- `floor(19)` → We want the greatest element **≤ 19**. 19 isn't in the set, so the next greatest is `10`. ✅
- `ceiling(11)` → We want the smallest element **≥ 11**. 11 isn't in the set, so the next smallest is `20`. ✅
- `higher(40)` → We want the smallest element **strictly greater** than 40. Nothing exists → `null`. ✅

---

## 🧩 Concept 4: NavigableSet Methods — headSet, tailSet, subSet

### 🧠 What is it?

These methods return **views** (subsets) of the `TreeSet` based on ranges. They're incredibly useful for range queries — "Give me all elements in this range."

| Method | Returns | Boundary Behavior |
|---|---|---|
| `headSet(toElement)` | Elements **strictly less** than `toElement` | Exclusive upper bound |
| `tailSet(fromElement)` | Elements **greater than or equal** to `fromElement` | Inclusive lower bound |
| `subSet(from, to)` | Elements from `from` (inclusive) to `to` (exclusive) | `[from, to)` |

> 🧠 **Key insight:** The default behavior is that the **lower bound is inclusive** and the **upper bound is exclusive**. This is the same convention used by `String.substring()`, `List.subList()`, and most range operations in Java.

### ❓ Why do we need it?

Think of scenarios like:
- "Show me all products priced below $50" → `headSet(50)`
- "Show me all appointments from Monday onward" → `tailSet("Monday")`
- "Show me all scores between 60 and 90" → `subSet(60, 90)`

### ⚙️ How it works (Step-by-Step)

1. These methods return a **view** of the original set, not a copy. Changes to the view reflect in the original set and vice versa.
2. The view is backed by the same tree — it just restricts what's visible based on the range boundaries.
3. Since `TreeSet` elements are sorted, extracting a range is efficient — `O(log n)` to find the boundaries, then linear to iterate the range.

### 🧪 Example

#### 💻 Code Example:

```java
import java.util.TreeSet;

public class RangeQueries {
    public static void main(String[] args) {
        TreeSet<String> fruits = new TreeSet<>();
        fruits.add("apple");
        fruits.add("banana");
        fruits.add("mango");
        fruits.add("orange");

        System.out.println("Full set: " + fruits);
        // Output: [apple, banana, mango, orange]  — alphabetically sorted

        // headSet(toElement) — elements STRICTLY LESS than toElement
        System.out.println("headSet(\"mango\") = " + fruits.headSet("mango"));
        // Output: [apple, banana]
        // "mango" itself is EXCLUDED

        // tailSet(fromElement) — elements GREATER THAN OR EQUAL to fromElement
        System.out.println("tailSet(\"mango\") = " + fruits.tailSet("mango"));
        // Output: [mango, orange]
        // "mango" itself is INCLUDED

        // subSet(from, to) — from (INCLUSIVE) to to (EXCLUSIVE)
        System.out.println("subSet(\"banana\", \"orange\") = " + fruits.subSet("banana", "orange"));
        // Output: [banana, mango]
        // "banana" is INCLUDED, "orange" is EXCLUDED

        System.out.println("subSet(\"apple\", \"orange\") = " + fruits.subSet("apple", "orange"));
        // Output: [apple, banana, mango]

        System.out.println("subSet(\"apple\", \"mango\") = " + fruits.subSet("apple", "mango"));
        // Output: [apple, banana]
        // "mango" is EXCLUDED (upper bound is always exclusive)
    }
}
```

Notice the pattern: `headSet` and `subSet`'s upper bound are **exclusive**, while `tailSet` and `subSet`'s lower bound are **inclusive**. This is the `[from, to)` convention — inclusive start, exclusive end.

> 💡 **Tip:** There are overloaded versions that let you control inclusivity: `headSet(e, inclusive)`, `tailSet(e, inclusive)`, and `subSet(from, fromInclusive, to, toInclusive)`. These give you full control when the defaults don't fit.

---

## 🧩 Concept 5: Other NavigableSet Methods — pollFirst, pollLast, descendingSet

### 🧠 What is it?

Beyond the search and range methods, `NavigableSet` provides a few more utilities:

- **`pollFirst()`** — Retrieves **and removes** the **first** (lowest) element. Returns `null` if the set is empty.
- **`pollLast()`** — Retrieves **and removes** the **last** (highest) element. Returns `null` if the set is empty.
- **`descendingSet()`** — Returns a **reverse-order view** of the set.
- **`descendingIterator()`** — Returns an iterator that traverses the set in **descending order**.

### ❓ Why do we need it?

- `pollFirst()` / `pollLast()` are useful for **priority-based processing** — grab and remove the smallest or largest item.
- `descendingSet()` gives you a reversed view without creating a new collection — efficient and memory-friendly.

### 🧪 Example

#### 💻 Code Example:

```java
import java.util.TreeSet;
import java.util.Iterator;

public class PollAndDescending {
    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<>();
        set.add(10);
        set.add(20);
        set.add(30);
        set.add(40);

        // pollFirst — removes and returns the smallest
        System.out.println("pollFirst: " + set.pollFirst());  // 10
        System.out.println("After pollFirst: " + set);         // [20, 30, 40]

        // pollLast — removes and returns the largest
        System.out.println("pollLast: " + set.pollLast());     // 40
        System.out.println("After pollLast: " + set);           // [20, 30]

        // Reset for descending demo
        set.add(10);
        set.add(40);

        // descendingSet — reverse view
        System.out.println("Descending: " + set.descendingSet());
        // Output: [40, 30, 20, 10]

        // descendingIterator
        Iterator<Integer> it = set.descendingIterator();
        System.out.print("Descending iteration: ");
        while (it.hasNext()) {
            System.out.print(it.next() + " ");
        }
        // Output: 40 30 20 10
    }
}
```

---

## 🧩 Concept 6: TreeSet Performance — TreeSet vs HashSet

### 🧠 What is it?

Let's put the performance question to rest. `TreeSet` and `HashSet` serve different purposes, and their performance profiles reflect that.

| Feature | HashSet | TreeSet |
|---|---|---|
| **Ordering** | No order guaranteed | Sorted (natural or custom) |
| **Null values** | Allows one `null` | ❌ Not allowed (throws NPE) |
| **Performance (add/remove/contains)** | **O(1)** average | **O(log n)** |
| **Underlying structure** | Hash table (`HashMap`) | Red-Black Tree (`TreeMap`) |
| **Navigation methods** | ❌ Not available | ✅ lower, floor, ceiling, higher, etc. |
| **Use case** | Fast lookups, uniqueness | Sorted data, range queries |

### ❓ Why do we need it?

The decision is straightforward:
- **Need speed and don't care about order?** → Use `HashSet`.
- **Need sorted elements or navigation methods?** → Use `TreeSet`.
- **Need insertion order?** → Use `LinkedHashSet`.

### ⚙️ How it works (Step-by-Step)

Why is `HashSet` faster? Because hashing gives direct access to the bucket — `O(1)`. In a `TreeSet`, every operation involves **tree traversal** — walking down from the root, comparing at each node — which takes `O(log n)` steps. For a set of 1 million elements, that's roughly 20 comparisons per operation.

Is `O(log n)` slow? Not at all — it's very efficient. But when you don't need sorting, `HashSet`'s `O(1)` is hard to beat.

### 🧪 Example

#### 💻 Code Example:

```java
import java.util.*;

public class SetComparison {
    public static void main(String[] args) {
        // HashSet — unordered, allows null
        Set<Integer> hashSet = new HashSet<>(Arrays.asList(40, 10, 30, 20));
        System.out.println("HashSet: " + hashSet);
        // Output: [20, 40, 10, 30]  — unpredictable order

        // TreeSet — sorted, no null
        Set<Integer> treeSet = new TreeSet<>(Arrays.asList(40, 10, 30, 20));
        System.out.println("TreeSet: " + treeSet);
        // Output: [10, 20, 30, 40]  — always sorted

        // LinkedHashSet — insertion order
        Set<Integer> linkedHashSet = new LinkedHashSet<>(Arrays.asList(40, 10, 30, 20));
        System.out.println("LinkedHashSet: " + linkedHashSet);
        // Output: [40, 10, 30, 20]  — insertion order preserved
    }
}
```

---

## ✅ Key Takeaways

1. **`TreeSet` stores elements in sorted order** — natural ordering (ascending) by default, or custom order via `Comparator`.
2. **No duplicates, no nulls** — duplicates are silently ignored; `null` throws `NullPointerException`.
3. **Implements `NavigableSet`** — which provides `lower()`, `floor()`, `ceiling()`, `higher()`, `headSet()`, `tailSet()`, `subSet()`, and more.
4. **`floor` and `ceiling` are inclusive**; `lower` and `higher` are strict (exclusive of the exact match).
5. **`subSet(from, to)` is `[from, to)`** — inclusive start, exclusive end (Java's standard range convention).
6. **Performance is `O(log n)`** for add, remove, and search — slower than `HashSet`'s `O(1)`, but you get sorting and navigation in return.
7. **Backed by a `TreeMap`** internally (a Red-Black Tree).

---

## ⚠️ Common Mistakes

1. **Adding `null` to a `TreeSet`** — Unlike `HashSet`, this throws `NullPointerException`. Always check for null before inserting.
2. **Confusing `lower` with `floor`** — `lower(20)` on `{10, 20, 30}` returns `10` (strictly less), while `floor(20)` returns `20` (less than or equal). The "equal" part matters!
3. **Assuming `subSet` upper bound is inclusive** — It's **exclusive** by default. `subSet("apple", "mango")` does NOT include "mango".
4. **Using `TreeSet` with objects that don't implement `Comparable`** — If your elements don't have a natural ordering and you don't provide a `Comparator`, you'll get a `ClassCastException` at runtime.
5. **Expecting `O(1)` performance** — `TreeSet` is `O(log n)`, not `O(1)`. If you don't need sorting, use `HashSet` for better performance.

---

## 💡 Pro Tips

1. **Use `TreeSet` for range-based queries** — If you frequently need "all elements between X and Y", `TreeSet` with `subSet()` is far more efficient than filtering a `HashSet`.
2. **`headSet`/`tailSet`/`subSet` return views, not copies** — Modifications to the view affect the original set. If you need an independent copy, wrap it: `new TreeSet<>(set.subSet(...))`.
3. **Custom objects need `Comparable` or a `Comparator`** — When storing custom objects, either implement `Comparable<T>` on your class or pass a `Comparator<T>` to the `TreeSet` constructor.
4. **`descendingSet()` is O(1)** — It doesn't create a new sorted set; it returns a reverse view of the existing tree. Very efficient.
5. **Overloaded range methods exist** — Use `subSet(from, fromInclusive, to, toInclusive)` when you need full control over boundary inclusion.
