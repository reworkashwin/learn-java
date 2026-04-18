# map() and flatMap()

## Introduction

The `map()` method is one of the most frequently used stream operations — it transforms each element in a stream into something else. But what happens when your transformation produces **nested collections**? That's where `flatMap()` comes in. Think of `map()` as a column selector in SQL, and `flatMap()` as the tool that **flattens** nested structures into a single, unified stream.

---

## Concept 1: The map() Method — Transforming Elements

### 🧠 What is it?

`map()` takes each element in a stream and applies a function to transform it into a different value. The result is a new stream containing the transformed values.

### ⚙️ How it works

The signature looks like: `Stream<R> map(Function<T, R> mapper)`

It takes a `T` and returns an `R` — meaning you can change the type entirely.

### 🧪 Example 1: Getting string lengths

```java
List<String> words = Arrays.asList("Adam", "Ana", "Danielle");

List<Integer> lengths = words.stream()
    .map(String::length)
    .collect(Collectors.toList());

// Result: [4, 3, 8]
```

Each string is replaced by its character count. The stream goes from `Stream<String>` → `Stream<Integer>`.

### 🧪 Example 2: Squaring numbers

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4);

List<Integer> squares = nums.stream()
    .map(x -> x * x)
    .collect(Collectors.toList());

// Result: [1, 4, 9, 16]
```

Each integer is replaced by its square. The type stays the same (`Integer` → `Integer`), but the values change.

### 💡 Insight

`map()` is a **one-to-one** transformation. Each input element produces exactly one output element. The stream size doesn't change — only the content does.

---

## Concept 2: The flatMap() Method — Flattening Nested Structures

### 🧠 What is it?

`flatMap()` is used when each element maps to **a collection (or stream) of values**, and you want to merge all those collections into a single flat stream. It performs a `map()` followed by a `flatten` operation.

### ❓ Why do we need it?

Consider this problem: given the words `"hello"` and `"shell"`, find all **unique characters** across both words. The expected result is: `[h, e, l, o, s]`.

### ⚙️ The problem with map()

If you try using `map()` with `split("")`:

```java
String[] words = {"hello", "shell"};

// Using map() - PROBLEM!
Arrays.stream(words)
    .map(w -> w.split(""))  // Each word → String[]
    .distinct()
    .collect(Collectors.toList());
```

This doesn't work! Why? Because `map()` transforms each word into a `String[]`. So instead of a flat stream of characters, you get a `Stream<String[]>` — a stream of **arrays**. The `distinct()` method compares arrays (by reference), not individual characters.

Visually:
```
"hello" → ["h", "e", "l", "l", "o"]  (array 1)
"shell" → ["s", "h", "e", "l", "l"]  (array 2)
Result: Stream of 2 arrays (not what we want!)
```

### ⚙️ The solution with flatMap()

```java
List<String> unique = Arrays.stream(words)
    .map(w -> w.split(""))        // Each word → String[]
    .flatMap(Arrays::stream)       // Flatten all arrays into one stream
    .distinct()                    // Keep unique characters
    .collect(Collectors.toList());

// Result: [h, e, l, o, s]
```

Here's what happens step by step:

1. `map(w -> w.split(""))` → produces `Stream<String[]>`
2. `flatMap(Arrays::stream)` → takes each `String[]` and converts it to a stream, then **merges all streams** into one `Stream<String>`
3. `distinct()` → removes duplicates
4. `collect()` → gathers into a list

Visually:
```
"hello" → ["h", "e", "l", "l", "o"]  ──┐
                                        ├──→ "h", "e", "l", "l", "o", "s", "h", "e", "l", "l"
"shell" → ["s", "h", "e", "l", "l"]  ──┘
                                        ──→ distinct → "h", "e", "l", "o", "s"
```

### 💡 Insight — The "Flattening" Analogy

Think of `flatMap()` like ironing out a wrinkled surface:

```
Before flatMap: [[1, 3, 5], [5, 13]]     → two nested arrays
After flatMap:  [1, 3, 5, 5, 13]          → one flat array
```

It takes a **stream of collections** and turns it into a **stream of elements**.

---

## map() vs flatMap() — Side by Side

| Feature | `map()` | `flatMap()` |
|---|---|---|
| Transformation | One-to-one | One-to-many |
| Output per element | Single value | A stream of values |
| Result structure | Same nesting level | Flattened |
| Use case | Transform values | Merge nested collections |

---

## ✅ Key Takeaways

- `map()` transforms each element one-to-one — same number of elements in, same number out
- `flatMap()` transforms each element into a stream and then **merges all streams** into one
- Use `map()` when each element becomes one value (e.g., `Book` → `String` title)
- Use `flatMap()` when each element becomes multiple values (e.g., word → individual characters)
- `flatMap()` = `map()` + `flatten`

## ⚠️ Common Mistakes

- Using `map()` when the transformation produces collections — you end up with nested streams
- Forgetting that `flatMap()` expects a function that returns a `Stream`, not a collection
- Confusing `flatMap()` with `map().collect()` — they serve fundamentally different purposes

## 💡 Pro Tips

- Whenever you see `Stream<Stream<T>>` or `Stream<List<T>>`, that's a sign you need `flatMap()`
- `flatMap(Collection::stream)` is a common pattern to flatten a stream of lists
- `flatMap()` is analogous to `SELECT ... JOIN` in SQL — it expands and merges related data
