# OptionalInt, OptionalDouble, and OptionalLong

## Introduction

In the previous note, we learned about `Optional<T>` — a container for values that might be absent. But when working with **primitive streams** (`IntStream`, `DoubleStream`, `LongStream`), Java provides specialized optional types: `OptionalInt`, `OptionalDouble`, and `OptionalLong`. These avoid the overhead of boxing primitives into wrapper objects.

---

## Concept 1: Why Specialized Optionals?

### 🧠 What are they?

When you call `max()`, `min()`, or `average()` on a primitive stream, the return type is a **primitive-specific Optional** rather than `Optional<Integer>`:

| Stream Type | Optional Type |
|---|---|
| `IntStream` | `OptionalInt` |
| `DoubleStream` | `OptionalDouble` |
| `LongStream` | `OptionalLong` |

### ❓ Why not just use Optional\<Integer\>?

Performance. `OptionalInt` stores a raw `int` — no boxing needed. `Optional<Integer>` would require wrapping the `int` in an `Integer` object, which adds overhead.

---

## Concept 2: Using OptionalInt in Practice

### 🧪 Example: Finding the maximum number of pages

```java
OptionalInt maxPages = books.stream()
    .mapToInt(Book::getPages)   // Stream<Book> → IntStream
    .max();                      // Returns OptionalInt
```

Since we used `mapToInt()`, Java knows we're dealing with integers. The `max()` method returns `OptionalInt` — not `Optional<Integer>`.

### ⚙️ Getting the value

```java
// Using getAsInt() — specific to OptionalInt
int value = maxPages.getAsInt();  // throws NoSuchElementException if empty

// Using orElse() — safe default
int value = maxPages.orElse(0);   // returns 0 if no value present
```

Note the method is `getAsInt()`, not `get()`. Each primitive Optional has its own getter:

| Optional Type | Getter Method |
|---|---|
| `OptionalInt` | `getAsInt()` |
| `OptionalDouble` | `getAsDouble()` |
| `OptionalLong` | `getAsLong()` |

### 💡 Insight

The `orElse()` method is the preferred approach. If a value is present, it returns that value. If not, it returns the default you specified. No exceptions, no null checks — clean and safe.

---

## Concept 3: Choosing the Right mapTo Method

The primitive Optional you get depends on which `mapTo` method you use:

```java
// mapToInt → IntStream → OptionalInt
OptionalInt result = books.stream()
    .mapToInt(Book::getPages)
    .max();

// mapToDouble → DoubleStream → OptionalDouble
OptionalDouble result = books.stream()
    .mapToDouble(Book::getRating)
    .max();

// mapToLong → LongStream → OptionalLong
OptionalLong result = books.stream()
    .mapToLong(Book::getWordCount)
    .max();
```

Choose the `mapTo` method that matches your data type. Pages are integers → use `mapToInt()`. If your values are floating-point → use `mapToDouble()`.

---

## ✅ Key Takeaways

- Primitive streams return **specialized Optional types**: `OptionalInt`, `OptionalDouble`, `OptionalLong`
- Use `getAsInt()`, `getAsDouble()`, `getAsLong()` instead of `get()`
- Prefer `orElse(defaultValue)` over `getAs*()` for safe value retrieval
- The Optional type is determined by the stream type: `mapToInt()` → `OptionalInt`, etc.
- Specialized Optionals avoid boxing overhead compared to `Optional<Integer>`

## ⚠️ Common Mistakes

- Calling `get()` on an `OptionalInt` — the method is `getAsInt()`, not `get()`
- Using `mapToDouble()` for integer data — match the `mapTo` method to your data type
- Ignoring the Optional and calling `getAsInt()` directly — always handle the empty case with `orElse()` or `ifPresent()`

## 💡 Pro Tips

- When in doubt, use `orElse()` — it handles both present and absent cases in one call
- Chain operations fluently: `stream().mapToInt(...).max().orElse(0)`
- `OptionalInt` also supports `ifPresent()`: `maxPages.ifPresent(System.out::println)`
