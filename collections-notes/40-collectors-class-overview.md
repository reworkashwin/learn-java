# 📘 Collectors Class Overview

## 📌 Introduction

You've been using `collect(Collectors.toList())` at the end of stream pipelines — but did you know the `Collectors` class has a **treasure trove** of powerful methods beyond just `toList()`? From grouping and partitioning data to joining strings and computing sums, `Collectors` is the Swiss Army knife for transforming stream results.

The `Collectors` class lives in `java.util.stream` and provides **static factory methods** that return predefined `Collector` implementations. Let's explore the most important ones.

---

## 🧩 Concept 1: `toList()` — Collect into a List

### 🧠 What is it?

`Collectors.toList()` accumulates all stream elements into a new `List`. This is the most commonly used collector.

### 🧪 Example

```java
import java.util.*;
import java.util.stream.Collectors;

List<String> names = new HashSet<>(Arrays.asList("Bob", "Alice", "Charlie", "David"));

// Convert a Set to a List using streams
List<String> nameList = names.stream()
    .collect(Collectors.toList());

System.out.println(nameList); // [Bob, Alice, Charlie, David]
```

### 💡 Insight

This is especially useful for **converting between collection types**. Have a `Set` but need a `List`? Stream it and collect with `toList()`. All the static methods in `Collectors` can be called using the class name directly because they're `static`.

---

## 🧩 Concept 2: `toSet()` — Collect into a Set (Remove Duplicates)

### 🧠 What is it?

`Collectors.toSet()` collects elements into a `Set`, automatically removing duplicates.

### 🧪 Example

```java
List<String> names = Arrays.asList("Alice", "Bob", "Alice", "Charlie", "Charlie");

Set<String> uniqueNames = names.stream()
    .collect(Collectors.toSet());

System.out.println(uniqueNames); // [Bob, Alice, Charlie]
```

### 💡 Insight

If your source has duplicates and you want them gone, `toSet()` handles it automatically. No need for `distinct()` + `toList()` — though both approaches work.

---

## 🧩 Concept 3: `joining()` — Concatenate Strings

### 🧠 What is it?

`Collectors.joining(delimiter)` concatenates all elements of a stream into a **single string**, separated by the specified delimiter.

### 🧪 Example

```java
List<String> names = Arrays.asList("Bob", "Alice", "Charlie", "David");

String joined = names.stream()
    .collect(Collectors.joining(", "));

System.out.println(joined); // Bob, Alice, Charlie, David
```

### ⚙️ How it works

- Each element is appended to a `StringBuilder`
- The delimiter (`", "`) is inserted **between** elements (not at the start or end)
- You can use any delimiter: `" & "`, `" | "`, `" - "`, etc.

### 💡 Insight

`joining()` without arguments concatenates with no separator. There's also an overload `joining(delimiter, prefix, suffix)` for adding brackets or parentheses around the result.

---

## 🧩 Concept 4: `groupingBy()` — Group Elements by a Classifier

### 🧠 What is it?

`Collectors.groupingBy(classifier)` groups stream elements into a `Map` where:
- **Keys** are the result of the classifier function
- **Values** are lists of elements that share the same key

### ❓ Why do we need it?

Grouping is incredibly common in real-world applications — grouping orders by status, students by grade, products by category. `groupingBy()` does this in one line.

### 🧪 Example: Group Names by Length

```java
List<String> names = Arrays.asList("Adam", "Charles", "Bob", "Alice", "Charlie", "David");

Map<Integer, List<String>> groupedByLength = names.stream()
    .collect(Collectors.groupingBy(String::length));

System.out.println(groupedByLength);
// {3=[Bob], 4=[Adam], 5=[Alice, David], 7=[Charles, Charlie]}
```

### ⚙️ How it works

- `String::length` is the classifier function — it determines which group each element belongs to
- Elements with the same length are grouped into the same list
- The result is a `Map<Integer, List<String>>`

### 💡 Insight

You can group by anything — length, first letter, a computed property, an enum value. The classifier function is the key to what the groups look like.

---

## 🧩 Concept 5: `partitioningBy()` — Split into Two Groups

### 🧠 What is it?

`Collectors.partitioningBy(predicate)` splits elements into **exactly two groups** based on a boolean condition:
- `true` → elements that match the predicate
- `false` → elements that don't

### ❓ Why do we need it?

Unlike `groupingBy()` which can produce any number of groups, `partitioningBy()` always produces exactly two. It's perfect for binary classifications — pass/fail, even/odd, starts-with-A/doesn't.

### 🧪 Example: Partition by First Letter

```java
List<String> names = Arrays.asList("Adam", "Charles", "Bob", "Alice", "Charlie", "David");

Map<Boolean, List<String>> partitioned = names.stream()
    .collect(Collectors.partitioningBy(name -> name.startsWith("C")));

System.out.println(partitioned);
// {false=[Adam, Bob, Alice, David], true=[Charles, Charlie]}
```

### ⚙️ How it works

- The predicate `name -> name.startsWith("C")` returns `true` or `false` for each element
- Elements are sorted into two buckets: `true` and `false`
- The result is always a `Map<Boolean, List<T>>` with exactly two entries

### 💡 Insight

`partitioningBy()` is essentially a special case of `groupingBy()` where the classifier is a boolean predicate. The result always has both `true` and `false` keys, even if one of them has an empty list.

---

## 🧩 Concept 6: `counting()` — Count Elements

### 🧠 What is it?

`Collectors.counting()` returns the number of elements in the stream as a `long`.

### 🧪 Example

```java
List<String> names = Arrays.asList("Adam", "Charles", "Bob", "Alice", "Charlie", "David");

long count = names.stream()
    .collect(Collectors.counting());

System.out.println("Count: " + count); // Count: 6
```

### 💡 Insight

You might wonder: "Why not just use `.count()` directly on the stream?" You can! But `Collectors.counting()` is useful as a **downstream collector** inside `groupingBy()` — for example, counting how many names are in each length group.

---

## 🧩 Concept 7: `mapping()` — Transform Then Collect

### 🧠 What is it?

`Collectors.mapping(function, downstream)` applies a transformation function to each element and then collects the results using another collector.

### 🧪 Example: Collect Uppercase Names

```java
List<String> names = Arrays.asList("Adam", "Charles", "Bob", "Alice", "Charlie", "David");

List<String> uppercaseNames = names.stream()
    .collect(Collectors.mapping(String::toUpperCase, Collectors.toList()));

System.out.println(uppercaseNames);
// [ADAM, CHARLES, BOB, ALICE, CHARLIE, DAVID]
```

### ⚙️ How it works

1. `String::toUpperCase` — the mapping function transforms each element
2. `Collectors.toList()` — the downstream collector gathers the transformed elements

### 💡 Insight

This is functionally equivalent to `.map(String::toUpperCase).collect(Collectors.toList())`, but `mapping()` is especially useful as a **downstream collector** inside `groupingBy()` or `partitioningBy()`.

---

## 🧩 Concept 8: `summingInt()` — Sum Integer Values

### 🧠 What is it?

`Collectors.summingInt(function)` computes the sum of an integer-valued function applied to each element.

### 🧪 Example: Sum of Name Lengths

```java
List<String> names = Arrays.asList("Adam", "Charles", "Bob", "Alice", "Charlie", "David");

int totalLength = names.stream()
    .collect(Collectors.summingInt(String::length));

System.out.println("Sum of name lengths: " + totalLength); // Sum of name lengths: 31
```

### 💡 Insight

There are also `summingLong()` and `summingDouble()` for other numeric types. These are particularly useful for aggregating numerical properties across a collection.

---

## 🧩 Concept 9: `maxBy()` — Find the Maximum Element

### 🧠 What is it?

`Collectors.maxBy(comparator)` returns the maximum element according to a given comparator, wrapped in an `Optional` (because the stream might be empty).

### 🧪 Example: Find the Longest Name

```java
List<String> names = Arrays.asList("Adam", "Charles", "Bob", "Alice", "Charlie", "David");

Optional<String> longest = names.stream()
    .collect(Collectors.maxBy(Comparator.comparingInt(String::length)));

System.out.println("Longest: " + longest); // Longest: Optional[Charles]
```

### ⚙️ How it works

- `Comparator.comparingInt(String::length)` creates a comparator based on string length
- `maxBy` finds the element with the highest value according to this comparator
- If multiple elements tie (e.g., "Charles" and "Charlie" both have length 7), the one that appears **first in the stream** is returned

### 💡 Insight

The result is `Optional` because if the stream is empty, there's no maximum. Use `longest.ifPresent(...)` or `longest.orElse(...)` to safely handle the result.

---

## 🧩 Concept 10: `toMap()` — Collect into a Map

### 🧠 What is it?

`Collectors.toMap(keyMapper, valueMapper)` collects elements into a `Map` by extracting keys and values from each element.

### 🧪 Example: Name → Length Map

```java
List<String> names = Arrays.asList("Adam", "Charles", "Bob", "Alice", "Charlie", "David");

Map<String, Integer> nameLengthMap = names.stream()
    .collect(Collectors.toMap(
        Function.identity(),              // key = the name itself
        String::length,                   // value = its length
        (oldValue, newValue) -> oldValue   // merge function for duplicate keys
    ));

System.out.println(nameLengthMap);
// {Adam=4, Charles=7, Bob=3, Alice=5, Charlie=7, David=5}
```

### ⚙️ How it works

- `Function.identity()` — uses the element itself as the key
- `String::length` — uses the string's length as the value
- The third argument (merge function) handles **duplicate keys**. Since map keys must be unique, if two elements produce the same key, the merge function decides which value to keep

### 💡 Insight

The merge function `(oldValue, newValue) -> oldValue` keeps the first value when duplicates are encountered. You could also choose the new value, throw an exception, or combine them. Without a merge function, duplicate keys cause an `IllegalStateException`.

---

## ✅ Key Takeaways

- `Collectors` is a utility class with **static methods** for transforming stream results
- `toList()` and `toSet()` are the most common — collect into lists or sets
- `joining()` concatenates elements into a single string with a delimiter
- `groupingBy()` groups elements into a `Map<K, List<V>>` by a classifier
- `partitioningBy()` splits into exactly two groups: `true` and `false`
- `counting()`, `summingInt()`, `maxBy()` perform aggregate operations
- `mapping()` transforms elements before collecting
- `toMap()` builds a `Map` with custom key/value extractors (handle duplicate keys with a merge function!)

---

## ⚠️ Common Mistakes

- **Forgetting the merge function in `toMap()`** — if your data has duplicate keys, you'll get `IllegalStateException`
- **Confusing `groupingBy` and `partitioningBy`** — `partitioningBy` always returns exactly 2 groups (true/false); `groupingBy` can return any number
- **Ignoring `Optional` from `maxBy`/`minBy`** — always handle the possibility of an empty result

---

## 💡 Pro Tips

- Use `groupingBy` with downstream collectors for advanced aggregations (e.g., `groupingBy(String::length, Collectors.counting())` counts elements per group)
- `joining(", ", "[", "]")` adds prefix/suffix to produce output like `[Alice, Bob, Charlie]`
- Explore `Collectors.toUnmodifiableList()` (Java 10+) for immutable result collections
- All these collectors can be **composed** — use one collector as a downstream argument inside another
