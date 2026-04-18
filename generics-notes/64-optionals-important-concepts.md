# Optionals and Other Important Stream Concepts

## Introduction

When working with streams, you'll often need to find maximum/minimum values, calculate sums, or count elements. But what if the stream is empty? You'd get a `NullPointerException`. This is where **Optional** comes in — a container that may or may not hold a value. In this note, we'll explore `count()`, `reduce()`, `Optional`, and how to convert between stream types using `mapToInt()`, `mapToDouble()`, and `mapToLong()`.

---

## Concept 1: Counting Elements

### 🧠 What is it?

The `count()` terminal operation returns the total number of elements in a stream.

### 🧪 Example

```java
long totalBooks = books.stream().count();
// Result: 7
```

### 💡 Insight

Under the hood, `count()` is equivalent to:
```java
books.stream().mapToLong(e -> 1L).sum();
```
It maps every element to `1` and sums them up. That's all counting is!

---

## Concept 2: Finding Max and Min with reduce()

### 🧠 What is it?

The `reduce()` terminal operation combines all elements in a stream into a single result using a binary operator. It's incredibly versatile — you can use it for max, min, sum, or any custom aggregation.

### ⚙️ How it works

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4);

Optional<Integer> max = nums.stream().reduce(Integer::max);
Optional<Integer> min = nums.stream().reduce(Integer::min);
```

Notice the return type is `Optional<Integer>`, not `Integer`. Why? Because the stream might be empty — and if it is, there's no max or min to return.

### ❓ What is Optional?

`Optional` is a **container object that may or may not contain a non-null value**:
- `isPresent()` → returns `true` if a value exists
- `get()` → returns the value (throws exception if empty)
- `ifPresent(Consumer)` → executes the consumer only if a value exists
- `orElse(defaultValue)` → returns the value if present, otherwise returns the default

### 🧪 Safe ways to use Optional

```java
// ❌ Risky — throws NoSuchElementException if empty
int value = max.get();

// ✅ Safe — only executes if value exists
max.ifPresent(System.out::println);

// ✅ Safe — provides a default value
int value = max.orElse(0);
```

The `ifPresent()` pattern is the most idiomatic way to use Optional with streams:

```java
nums.stream()
    .reduce(Integer::min)
    .ifPresent(System.out::println);
```

---

## Concept 3: Finding the Book with the Most Pages

### ⚙️ Getting just the max page count

```java
books.stream()
    .map(Book::getPages)
    .reduce(Integer::max)
    .ifPresent(System.out::println);  // 860
```

### ⚙️ Getting the actual Book object

```java
Optional<Book> longest = books.stream()
    .reduce((b1, b2) -> b1.getPages() > b2.getPages() ? b1 : b2);

longest.ifPresent(System.out::println);
// Ancient Rome, History, 860 pages
```

Here, `reduce()` compares two books at a time, keeping the one with more pages.

---

## Concept 4: mapToInt(), mapToDouble(), mapToLong()

### 🧠 What are they?

These are specialized `map()` variants that convert a `Stream<T>` into primitive streams: `IntStream`, `DoubleStream`, or `LongStream`. Primitive streams offer additional numeric operations like `sum()`, `average()`, `max()`, and `min()`.

### ❓ Why do we need them?

A regular `Stream<Integer>` doesn't have a `sum()` method. You need an `IntStream` for that.

### 🧪 Summing all pages

```java
int totalPages = books.stream()
    .mapToInt(Book::getPages)  // Stream<Book> → IntStream
    .sum();
// Result: 3615
```

`mapToInt()` converts `Stream<Book>` into an `IntStream`, which provides `sum()`, `average()`, `max()`, and `min()` directly.

### ⚙️ Converting back: boxed()

If you need to convert an `IntStream` back to a `Stream<Integer>`:

```java
IntStream intStream = books.stream().mapToInt(Book::getPages);
Stream<Integer> boxed = intStream.boxed();  // IntStream → Stream<Integer>
```

The `boxed()` method wraps each primitive `int` back into an `Integer` object.

---

## Summary of Primitive Stream Conversions

| Method | Input | Output |
|---|---|---|
| `mapToInt()` | `Stream<T>` | `IntStream` |
| `mapToDouble()` | `Stream<T>` | `DoubleStream` |
| `mapToLong()` | `Stream<T>` | `LongStream` |
| `boxed()` | `IntStream` / etc. | `Stream<Integer>` / etc. |

---

## ✅ Key Takeaways

- `count()` returns the number of elements — equivalent to `mapToLong(e -> 1).sum()`
- `reduce()` combines all elements into one result — useful for max, min, sum, and custom aggregations
- `reduce()` returns `Optional` because the stream might be empty
- Use `ifPresent()` or `orElse()` to safely handle Optional values — never call `get()` blindly
- `mapToInt()`, `mapToDouble()`, `mapToLong()` convert to primitive streams with `sum()`, `average()`, `max()`, `min()`
- `boxed()` converts a primitive stream back to an object stream

## ⚠️ Common Mistakes

- Calling `Optional.get()` without checking if the value is present — use `ifPresent()` or `orElse()` instead
- Trying to call `sum()` on a `Stream<Integer>` — you need `mapToInt()` first to get an `IntStream`
- Confusing `map()` with `mapToInt()` — `map()` returns `Stream<Integer>` (boxed), `mapToInt()` returns `IntStream` (primitive)

## 💡 Pro Tips

- Prefer `ifPresent()` over `get()` to avoid `NoSuchElementException`
- Chain `mapToInt()` directly with `sum()` / `max()` / `min()` for concise numeric operations
- Use `orElse(defaultValue)` when you need a fallback value for empty streams
