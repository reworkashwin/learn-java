# Streams with Custom Objects — Part 2

## Introduction

In Part 1, we learned `filter()`, `sorted()`, and `map()`. Now let's explore more powerful operations: **grouping** data like a SQL `GROUP BY`, and using `limit()` to restrict results. These operations show why streams feel like database queries for Java collections.

---

## Grouping with Collectors.groupingBy()

### 🧠 What is it?

`groupingBy()` partitions stream elements into a `Map` based on a classification function — just like SQL's `GROUP BY`.

### ❓ Why do we need it?

Imagine you want to categorize all books by their type. Without streams, you'd manually iterate, check each type, and add to separate lists. With streams, it's a single line.

### 🧪 Group books by type

```java
Map<Type, List<Book>> booksByType = books.stream()
    .collect(Collectors.groupingBy(Book::getType));
```

**Result:**

| Key (Type) | Value (List of Books) |
|---|---|
| PHILOSOPHY | [Being and Time] |
| NOVEL | [The Trial, Death of Virgil, The Stranger] |
| HISTORY | [Ancient Greece, Ancient Rome] |
| THRILLER | [Death on the Nile] |

### ⚙️ How it works

1. Each book flows through the stream
2. `Book::getType` extracts the type (the grouping key)
3. Books with the same type are collected into the same list
4. The result is a `Map<Type, List<Book>>`

### 🧪 Printing the grouped result

```java
booksByType.entrySet().stream()
    .forEach(System.out::println);
```

Each entry prints as: `NOVEL=[The Trial, Death of Virgil, The Stranger]`

---

## Limiting Results with limit()

### 🧠 What is it?

`limit(n)` truncates the stream to at most `n` elements. Think of it as SQL's `LIMIT` clause.

### 🧪 Find two books with more than 500 pages

```java
List<String> longestBooks = books.stream()
    .filter(b -> b.getPages() > 500)     // keep books with 500+ pages
    .map(Book::getTitle)                  // extract titles
    .limit(2)                             // take first 2
    .collect(Collectors.toList());        // collect into list
```

**Step-by-step pipeline:**

```
Stream<Book>:    [Heidegger(560), Kafka(240), Christie(320), Greece(670), Rome(860), Broch(590), Camus(520)]
    ↓ filter(pages > 500)
Stream<Book>:    [Heidegger(560), Greece(670), Rome(860), Broch(590), Camus(520)]
    ↓ map(getTitle)
Stream<String>:  ["Being and Time", "Ancient Greece", "Ancient Rome", "Death of Virgil", "The Stranger"]
    ↓ limit(2)
Stream<String>:  ["Being and Time", "Ancient Greece"]
    ↓ collect(toList)
List<String>:    ["Being and Time", "Ancient Greece"]
```

### 💡 Insight

`limit()` takes the **first N elements** it encounters — not the "top N" by any ranking. If you want the top N by some criteria, `sorted()` first, then `limit()`.

---

## Combining Multiple Operations

The beauty of streams is how naturally operations compose:

```java
books.stream()
    .filter(b -> b.getPages() > 500)                    // condition
    .sorted(Comparator.comparing(Book::getPages))        // order
    .map(Book::getTitle)                                 // transform
    .limit(2)                                            // restrict
    .collect(Collectors.toList());                       // materialize
```

This reads almost like English: "From all books, keep those with more than 500 pages, sort by page count, get the titles, take the first 2, and put them in a list."

---

## Stream Pipeline Visualization

Here's a complete picture of how types flow through a pipeline:

```
books.stream()           → Stream<Book>
  .filter(...)           → Stream<Book>      (same type, fewer elements)
  .sorted(...)           → Stream<Book>      (same type, reordered)
  .map(Book::getTitle)   → Stream<String>    (type changes!)
  .limit(2)              → Stream<String>    (same type, at most 2)
  .collect(toList())     → List<String>      (terminal — produces result)
```

---

## ✅ Key Takeaways

- `Collectors.groupingBy()` partitions elements into a `Map` — similar to SQL `GROUP BY`
- The grouping key is extracted via a method reference (e.g., `Book::getType`)
- `limit(n)` restricts the stream to the first `n` elements
- `limit()` takes the first N elements encountered — sort first if you want top-N
- Stream pipelines can combine filter → sort → map → limit → collect in a single expression

## ⚠️ Common Mistake

- Using `limit()` without `sorted()` and expecting "top N" results — `limit()` just takes the first N from whatever order the stream has
- Forgetting that `groupingBy()` produces a `Map`, not a `List` — the result type changes

## 💡 Pro Tip

For more advanced grouping, you can pass a second argument to `groupingBy()`:
```java
// Group by type, but only keep the count
Collectors.groupingBy(Book::getType, Collectors.counting())
// Result: Map<Type, Long>  →  {NOVEL=3, HISTORY=2, ...}
```
