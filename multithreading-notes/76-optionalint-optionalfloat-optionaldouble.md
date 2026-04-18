# OptionalInt, OptionalDouble, and OptionalLong

## Introduction

In the previous section, we worked with `Optional<Integer>` — the generic Optional wrapping a boxed `Integer`. But when you use primitive streams like `IntStream`, `DoubleStream`, or `LongStream`, Java provides specialized Optional types: `OptionalInt`, `OptionalDouble`, and `OptionalLong`. These avoid the overhead of boxing primitives into objects.

---

## Concept 1: Why Specialized Optionals Exist

### 🧠 What is it?

When you call `.max()` or `.min()` on a primitive stream (e.g., `IntStream`), the return type is **not** `Optional<Integer>` — it's `OptionalInt`. This is a specialized container for primitive `int` values that avoids autoboxing.

### ❓ Why do we need them?

Autoboxing (`int` → `Integer`) has a performance cost. When you're doing numeric operations on streams, Java provides primitive-specific types to keep everything efficient:

| Primitive Stream | Optional Type |
|-----------------|---------------|
| `IntStream` | `OptionalInt` |
| `DoubleStream` | `OptionalDouble` |
| `LongStream` | `OptionalLong` |

---

## Concept 2: Using OptionalInt in Practice

### ⚙️ How it works

When you use `mapToInt()` and then call a terminal operation like `max()`, the result is an `OptionalInt`:

```java
OptionalInt maxPages = books.stream()
    .mapToInt(Book::getPages)
    .max();
```

### 🧪 Extracting the value

**Using `getAsInt()`:**

```java
int value = maxPages.getAsInt(); // 860
```

Note: it's `getAsInt()`, not `get()`. Each specialized Optional has its own getter:
- `OptionalInt` → `getAsInt()`
- `OptionalDouble` → `getAsDouble()`
- `OptionalLong` → `getAsLong()`

**Using `orElse()` (preferred):**

```java
int value = maxPages.orElse(0); // returns 860, or 0 if empty
```

`orElse()` returns the value if present, otherwise returns the default you specify. This avoids `NoSuchElementException`.

---

## Concept 3: OptionalDouble and OptionalLong

### ⚙️ How it works

If you use `mapToDouble()`, you get a `DoubleStream`, and terminal operations return `OptionalDouble`:

```java
OptionalDouble result = books.stream()
    .mapToDouble(Book::getPages)
    .max();
```

If you use `mapToLong()`, you get a `LongStream`, and terminal operations return `OptionalLong`:

```java
OptionalLong result = books.stream()
    .mapToLong(Book::getPages)
    .max();
```

### 💡 Insight

Choose the mapping method based on the data type of the field:
- Integer fields → `mapToInt()` → `OptionalInt`
- Double fields → `mapToDouble()` → `OptionalDouble`
- Long fields → `mapToLong()` → `OptionalLong`

---

## Quick Reference

| Feature | `Optional<T>` | `OptionalInt` | `OptionalDouble` | `OptionalLong` |
|---------|--------------|---------------|-------------------|----------------|
| Get value | `get()` | `getAsInt()` | `getAsDouble()` | `getAsLong()` |
| Default value | `orElse(T)` | `orElse(int)` | `orElse(double)` | `orElse(long)` |
| Check presence | `isPresent()` | `isPresent()` | `isPresent()` | `isPresent()` |
| Consume if present | `ifPresent(Consumer)` | `ifPresent(IntConsumer)` | `ifPresent(DoubleConsumer)` | `ifPresent(LongConsumer)` |

---

## Key Takeaways

✅ Primitive streams (`IntStream`, `DoubleStream`, `LongStream`) return specialized Optionals to avoid boxing overhead

✅ Use `getAsInt()`, `getAsDouble()`, `getAsLong()` instead of `get()` on specialized Optionals

✅ Prefer `orElse(defaultValue)` over `getAsInt()` to safely handle empty results

⚠️ Don't confuse `Optional<Integer>` with `OptionalInt` — they're different classes with different method names

💡 Match the stream type to your data: `int` fields → `mapToInt()` → `OptionalInt`
