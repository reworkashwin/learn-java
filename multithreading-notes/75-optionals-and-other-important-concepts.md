# Optionals and Other Important Concepts

## Introduction

When working with streams, operations like finding a maximum, minimum, or reducing a collection can sometimes produce **no result** — for example, finding the max of an empty list. Instead of returning `null` (and risking `NullPointerException`), Java wraps the result in an `Optional`. This section covers `Optional`, the `reduce()` operation, `mapToInt()`, and how they all fit together.

---

## Concept 1: Counting Elements

### 🧠 What is it?

The `count()` method is a terminal operation that returns the total number of elements in a stream.

### 🧪 Example

```java
long totalBooks = books.stream().count();
System.out.println(totalBooks); // 7
```

### 💡 Insight

`count()` is actually equivalent to:
```java
books.stream().mapToLong(e -> 1L).sum();
```
Each element is mapped to `1`, and then all the `1`s are summed. That's literally how counting works under the hood.

---

## Concept 2: Finding Max and Min with reduce()

### 🧠 What is it?

`reduce()` is a terminal operation that combines all elements of a stream into a single result using an accumulator function. When finding max/min, we use `Integer::max` or `Integer::min` as the accumulator.

### ❓ Why does reduce() return an Optional?

What if the stream is empty? There's no maximum or minimum to return. Instead of returning `null` and causing a `NullPointerException` later, Java returns an `Optional` — a container that **may or may not** hold a value.

### 🧪 Example

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4);

Optional<Integer> max = nums.stream().reduce(Integer::max);
Optional<Integer> min = nums.stream().reduce(Integer::min);
```

### ⚙️ How to extract the value from an Optional

**Option 1: `get()`** — returns the value or throws `NoSuchElementException`

```java
System.out.println(max.get()); // 4
```

**Option 2: `ifPresent()`** — executes a lambda only if a value exists (preferred)

```java
min.ifPresent(System.out::println); // 1
```

**Option 3: Inline chaining**

```java
nums.stream()
    .reduce(Integer::max)
    .ifPresent(System.out::println); // 4
```

### 💡 Insight

`ifPresent()` is the safest approach. If the stream was empty, it simply does nothing — no exception, no null check needed.

---

## Concept 3: Finding the Max Value of a Field

### 🧠 What is it?

When you want the maximum value of a specific field (like the most pages among all books), you combine `map()` with `reduce()`.

### 🧪 Example

```java
books.stream()
     .map(Book::getPages)           // Stream<Integer> of page counts
     .reduce(Integer::max)          // Optional<Integer>
     .ifPresent(System.out::println); // 860
```

First, `map()` extracts the `pages` field from each book. Then `reduce()` finds the maximum among those values.

---

## Concept 4: Finding the Object with the Max Value

### 🧠 What is it?

Sometimes you don't just want the max **value** — you want the actual **object** (e.g., the book with the most pages).

### ⚙️ How it works

Use `reduce()` with a custom comparator lambda that compares two objects and returns the "winner":

```java
Optional<Book> longest = books.stream()
    .reduce((b1, b2) -> b1.getPages() > b2.getPages() ? b1 : b2);

longest.ifPresent(System.out::println);
// Output: Ancient Rome - History - 860 pages
```

The lambda compares two books at a time and keeps the one with more pages, cascading through the entire stream.

---

## Concept 5: Summing a Field with mapToInt()

### 🧠 What is it?

To sum a numeric field across all elements, you need to convert the stream to an `IntStream` (or `LongStream`, `DoubleStream`) using `mapToInt()`, and then call `sum()`.

### ❓ Why can't we just use map() and sum()?

`map()` returns a `Stream<Integer>` (boxed objects), which doesn't have a `sum()` method. `mapToInt()` returns a primitive `IntStream`, which does.

### 🧪 Example

```java
int totalPages = books.stream()
                      .mapToInt(Book::getPages)
                      .sum();

System.out.println(totalPages); // 3615
```

### 💡 Insight

There are three "map to primitive" variants:
- `mapToInt()` → returns `IntStream`
- `mapToDouble()` → returns `DoubleStream`
- `mapToLong()` → returns `LongStream`

Each has specialized methods like `sum()`, `average()`, `max()`, `min()`.

---

## Concept 6: Converting Between Stream Types

### 🧠 What is it?

You can convert between `IntStream` and `Stream<Integer>` using `boxed()`:

```java
IntStream intStream = books.stream().mapToInt(Book::getPages);
Stream<Integer> boxedStream = intStream.boxed(); // back to Stream<Integer>
```

`boxed()` wraps each primitive `int` back into an `Integer` object.

---

## Key Takeaways

✅ `reduce()` combines all stream elements into a single result — useful for max, min, sum, or custom aggregations

✅ `reduce()` returns `Optional` to safely handle empty streams

✅ Use `ifPresent()` to consume Optional values safely instead of `get()`

✅ `mapToInt()` / `mapToDouble()` / `mapToLong()` convert to primitive streams that support `sum()`, `average()`, `max()`

✅ `boxed()` converts a primitive stream back to a boxed `Stream<Integer>`

⚠️ Avoid calling `get()` on an Optional without checking — use `ifPresent()` or `orElse()` instead

💡 `count()` ≡ `mapToLong(e -> 1).sum()` — counting is just summing ones
