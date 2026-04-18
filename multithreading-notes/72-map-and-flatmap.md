# map() and flatMap()

## Introduction

We've already seen `map()` in action — transforming stream elements from one form to another. But what happens when each element maps to **another collection or array** instead of a single value? You end up with nested structures (a stream of arrays, or a stream of lists), and that's where `flatMap()` becomes essential.

Think of `map()` as "transform each element" and `flatMap()` as "transform each element AND flatten the results into a single stream."

---

## Concept 1: map() — Transforming Elements

### 🧠 What is it?

`map()` applies a function to every element in the stream and returns a new stream of the transformed values. It's like selecting and transforming a single column in SQL.

### ⚙️ How it works

Each element goes through the mapping function, and the output replaces the original element in the stream. The stream size stays the same.

### 🧪 Example 1: Get the length of each string

```java
List<String> words = Arrays.asList("Adam", "Ana", "Danielle");

List<Integer> lengths = words.stream()
                             .map(String::length)
                             .collect(Collectors.toList());

lengths.forEach(System.out::println);
// Output: 4, 3, 8
```

Each string is replaced by its character count: `"Adam"` → `4`, `"Ana"` → `3`, `"Danielle"` → `8`.

### 🧪 Example 2: Square every number

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4);

List<Integer> squared = nums.stream()
                            .map(n -> n * n)
                            .collect(Collectors.toList());

squared.forEach(System.out::println);
// Output: 1, 4, 9, 16
```

### 💡 Insight

`map()` is a **one-to-one transformation**. Every input element produces exactly one output element. The stream size never changes.

---

## Concept 2: The Problem that flatMap() Solves

### 🧠 What's the problem?

Suppose you have two words — `"hello"` and `"shell"` — and you want to find all **unique characters** across both words. The expected result is: `h, e, l, o, s`.

Your first instinct might be to use `map()` to split each word into characters:

```java
String[] words = {"hello", "shell"};

// Using map + split
Arrays.stream(words)
      .map(word -> word.split(""))  // Each word becomes a String[]
      .distinct()
      .collect(Collectors.toList());
```

But this **doesn't work** as expected. Why?

### ❓ Why does map() fail here?

When you call `.map(word -> word.split(""))`:

- `"hello"` → `["h", "e", "l", "l", "o"]` (a `String[]`)
- `"shell"` → `["s", "h", "e", "l", "l"]` (another `String[]`)

You now have a **`Stream<String[]>`** — a stream of arrays, not a stream of individual characters. The `distinct()` operation compares array references, not their contents. You'd get a type mismatch error if you try to collect into `List<String>`.

### 💡 Insight

The core issue: `map()` produced **nested structures** (arrays inside a stream). We need to "unwrap" or "flatten" those arrays into a single stream of strings.

---

## Concept 3: flatMap() — Flatten and Merge

### 🧠 What is it?

`flatMap()` does two things in one step:
1. **Maps** each element to a stream
2. **Flattens** all resulting streams into a single stream

Think of it visually:

```
Before flatMap:  [[1, 3, 5], [5, 13]]     ← stream of arrays
After flatMap:   [1, 3, 5, 5, 13]          ← single flat stream
```

### ⚙️ How it works

Instead of returning a value (like `map()`), the function you pass to `flatMap()` must return a **stream**. All those individual streams get merged into one.

### 🧪 Example: Get unique characters from multiple words

```java
String[] words = {"hello", "shell"};

List<String> unique = Arrays.stream(words)
    .map(word -> word.split(""))       // Stream<String[]>
    .flatMap(Arrays::stream)           // Stream<String> (flattened!)
    .distinct()                        // unique characters only
    .collect(Collectors.toList());

unique.forEach(System.out::println);
// Output: h, e, l, o, s
```

Here's what happens step by step:

| Step | Operation | Result |
|------|-----------|--------|
| 1 | Start | `Stream` of `"hello"`, `"shell"` |
| 2 | `map(split)` | `Stream<String[]>` — two arrays of characters |
| 3 | `flatMap(Arrays::stream)` | `Stream<String>` — all characters in one flat stream |
| 4 | `distinct()` | Only unique characters remain |
| 5 | `collect()` | `List<String>`: `[h, e, l, o, s]` |

### 💡 Insight

`flatMap()` is essential whenever a mapping operation produces **collections, arrays, or streams** for each element, and you want to merge everything into a single flat stream. It's the go-to tool for "unwrapping" nested data.

---

## map() vs flatMap() — Quick Comparison

| Feature | `map()` | `flatMap()` |
|---------|---------|-------------|
| Transformation | One-to-one | One-to-many (then flattened) |
| Output per element | Single value | A stream of values |
| Result structure | Same nesting level | Flattened into one stream |
| Use case | Transform values | Merge nested collections/arrays |

---

## Key Takeaways

✅ `map()` transforms each element into exactly one new element — the stream size stays the same

✅ `flatMap()` transforms each element into a stream and then merges all streams into one — it "flattens" nested structures

✅ Use `flatMap()` whenever `map()` would produce a stream of arrays/lists/streams and you want a single flat stream

⚠️ The function passed to `flatMap()` must return a `Stream`, not a raw array or list — use `Arrays::stream` or `Collection::stream` to convert

💡 A common pattern: `.map(split/transform).flatMap(Arrays::stream)` — split into arrays, then flatten
