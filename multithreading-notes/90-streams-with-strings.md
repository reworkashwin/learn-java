# Streams with Strings

## Introduction

We've seen streams with numbers. Now let's work with **strings** — sorting names, filtering by patterns, and building more expressive pipelines. The same stream concepts apply, but with string-specific operations.

---

## Creating a Stream from a String Array

```java
String[] names = {"Adam", "Daniel", "Martha", "Kevin", "Ben", "Joe", "Brad", "Susan"};

// Print all names
Stream.of(names).forEach(System.out::print);
// Output: AdamDanielMarthaKevinBenJoeBradSusan
```

`Stream.of(names)` creates a `Stream<String>` from the array. Then `forEach` iterates through each name.

---

## Sorting Strings

### Alphabetical order (ascending)

```java
Stream.of(names)
    .sorted()
    .forEach(System.out::print);
// Output: AdamBenBradDanielJoeKevinMarthaSusan
```

The `sorted()` intermediate operation sorts strings in **natural (alphabetical) order** by default.

### Reverse alphabetical order (descending)

```java
Stream.of(names)
    .sorted(Comparator.reverseOrder())
    .forEach(System.out::print);
// Output: SusanMarthaKevinJoeDanielBradBenAdam
```

Pass `Comparator.reverseOrder()` to sort in descending order.

### 💡 Insight

`sorted()` is an intermediate operation — it returns a new sorted stream without modifying the original array.

---

## Filtering Strings

### Filter by starting character

```java
// Names starting with "B"
Stream.of(names)
    .filter(x -> x.startsWith("B"))
    .forEach(System.out::println);
// Output: Ben, Brad

// Names starting with "A"
Stream.of(names)
    .filter(x -> x.startsWith("A"))
    .forEach(System.out::println);
// Output: Adam
```

### ⚙️ How it works

The lambda `x -> x.startsWith("B")` is a **predicate** — a function that returns `true` or `false`. The filter keeps only elements where the predicate returns `true`.

---

## Combining Operations

You can chain filter and sort together:

```java
Stream.of(names)
    .filter(x -> x.startsWith("B"))  // keep names starting with B
    .sorted()                         // sort alphabetically
    .forEach(System.out::println);    // print each
// Output: Ben, Brad
```

Each step transforms the stream:
1. **Source**: all 8 names
2. **filter**: keeps "Ben" and "Brad"
3. **sorted**: sorts them alphabetically
4. **forEach**: prints each name

---

## Intermediate vs. Terminal — Quick Recap

| Operation | Type | Returns |
|---|---|---|
| `sorted()` | Intermediate | Stream |
| `filter()` | Intermediate | Stream |
| `forEach()` | Terminal | void |

Intermediate operations can be chained. Terminal operations trigger execution.

---

## ✅ Key Takeaways

- `Stream.of(array)` creates a stream from a string array
- `sorted()` sorts strings in natural (alphabetical) order
- `sorted(Comparator.reverseOrder())` sorts in descending order
- `filter()` with string methods like `startsWith()` enables powerful text filtering
- Multiple intermediate operations can be chained before a terminal operation

## ⚠️ Common Mistake

- Forgetting that `sorted()` doesn't modify the original array — it returns a new sorted stream
- Using `==` instead of `.equals()` or `.startsWith()` for string comparison in predicates

## 💡 Pro Tip

You can combine `filter()` calls for complex conditions, or use `&&` / `||` within a single filter lambda: `filter(x -> x.startsWith("B") && x.length() > 3)`.
