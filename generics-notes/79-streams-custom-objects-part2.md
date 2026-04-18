# Streams with Custom Objects — Part 2

## Introduction

In the previous lecture, we learned how to filter, sort, and map streams of custom objects. Now we take it further with two powerful operations: **grouping** items into a map by a property, and **combining filter, map, and limit** to answer specific questions about our data — like finding the two longest books.

---

## Concept 1: Grouping with `Collectors.groupingBy()`

### 🧠 What is grouping?

Grouping is like SQL's `GROUP BY`. You take a collection and organize it into a `Map` where:
- The **key** is some property of the objects
- The **value** is a list of objects that share that property

### 🧪 Example — Group books by type

```java
Map<Type, List<Book>> booksByType = books.stream()
    .collect(Collectors.groupingBy(Book::getType));
```

**Result:**
```
PHILOSOPHY → [Being and Time]
NOVEL      → [The Trial, Death of Virgil, The Stranger]
HISTORY    → [Ancient Greece, Ancient Rome]
THRILLER   → [Death on the Nile]
```

### ⚙️ How to print the grouped result

```java
booksByType.entrySet().stream()
    .forEach(System.out::println);
```

Each entry prints as `TYPE=[Book1, Book2, ...]`.

### 💡 Insight

`Collectors.groupingBy()` is incredibly powerful. With a single line, you create a categorized map that would take a dozen lines with traditional loops. It's the stream equivalent of SQL's `GROUP BY` clause.

---

## Concept 2: Combining Filter, Map, and Limit

### ❓ The question

*Find the titles of 2 arbitrary books with more than 500 pages.*

### ⚙️ Building the pipeline step by step

```java
List<String> longestBooks = books.stream()
    .filter(b -> b.getPages() > 500)       // Keep books with 500+ pages
    .map(Book::getTitle)                    // Extract just the titles
    .limit(2)                              // Take only the first 2
    .collect(Collectors.toList());          // Collect into a list
```

### 🧪 Tracing the data flow

| Stage | Type | Content |
|-------|------|---------|
| Source | `Stream<Book>` | All 7 books |
| After `filter` | `Stream<Book>` | Books with 500+ pages (4 books) |
| After `map` | `Stream<String>` | Just the titles of those 4 books |
| After `limit` | `Stream<String>` | First 2 titles only |
| After `collect` | `List<String>` | Final result: 2 titles |

**Result:** `[Being and Time, Ancient Rome]` (or whichever 2 come first in the original order)

---

## Concept 3: Understanding `limit()`

### 🧠 What does `limit()` do?

`limit(n)` is an intermediate operation that **truncates** the stream to at most `n` elements. It's like SQL's `LIMIT` clause.

```java
books.stream()
    .limit(3)  // Keep only the first 3 books
    .forEach(System.out::println);
```

### ❓ When is it useful?

- When you only need the "top N" results
- When working with potentially large or infinite streams
- When you want a sample or preview of the data

### 💡 Insight

`limit()` is a **short-circuiting** operation — it can stop processing the stream early once it has enough elements. This is one of the advantages of lazy evaluation: elements after the limit are never even computed.

---

## Concept 4: Printing Grouped or Listed Results

### ⚙️ Iterating and printing a Map

```java
booksByType.entrySet().stream()
    .forEach(entry -> System.out.println(entry));
```

Or with method reference:

```java
booksByType.entrySet().stream()
    .forEach(System.out::println);
```

### ⚙️ Printing a List

```java
longestBooks.stream()
    .forEach(System.out::println);
```

---

## Concept 5: Putting It All Together

### 🧪 The full picture

Streams let you express complex data queries in a few lines:

```java
// SQL equivalent: SELECT title FROM books WHERE pages > 500 LIMIT 2
List<String> result = books.stream()
    .filter(b -> b.getPages() > 500)
    .map(Book::getTitle)
    .limit(2)
    .collect(Collectors.toList());

// SQL equivalent: SELECT type, GROUP_CONCAT(title) FROM books GROUP BY type
Map<Type, List<Book>> grouped = books.stream()
    .collect(Collectors.groupingBy(Book::getType));
```

This is the declarative power of streams — you describe the result you want, not the steps to get there.

---

## ✅ Key Takeaways

- `Collectors.groupingBy()` organizes elements into a `Map<Key, List<Value>>` based on a property
- `limit(n)` truncates a stream to at most `n` elements — it's a short-circuiting operation
- You can chain `filter()`, `map()`, `limit()`, and `collect()` to build powerful data queries
- The data type changes as it flows through the pipeline: `Stream<Book>` → `Stream<String>` → `List<String>`

## ⚠️ Common Mistakes

- Forgetting that `limit()` takes from the *beginning* of the stream — it doesn't find the "best" N items unless you sort first
- Using `limit()` after `collect()` — `collect()` is terminal, so `limit()` must come before it
- Confusing `groupingBy()` result type — the value is a `List`, not a single element

## 💡 Pro Tips

- To find the *top N longest* books, sort **before** limiting: `.sorted(Comparator.comparing(Book::getPages).reversed()).limit(2)`
- `Collectors.groupingBy()` can be nested with downstream collectors: `groupingBy(Book::getType, counting())` gives you a count per type
- For more complex grouping, use `Collectors.partitioningBy()` for boolean split (true/false groups)
