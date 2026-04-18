# Streams with Strings

## Introduction

Now that we understand the theory behind streams, let's put them into practice. We'll start with one of the simplest use cases: processing a **string array** with streams. You'll see how to convert an array into a stream, sort it, filter it, and print the results — all in a clean, declarative style.

---

## Concept 1: Creating a Stream from an Array

### 🧠 How to get started

To create a stream from a regular array, use `Stream.of()`:

```java
String[] names = {"Adam", "Daniel", "Martha", "Kevin", "Ben", "Joe", "Brad", "Susan"};

Stream.of(names).forEach(System.out::println);
```

This creates a stream from the array and prints each element using **method reference** (`System.out::println`).

**Output:**
```
Adam
Daniel
Martha
Kevin
Ben
Joe
Brad
Susan
```

### 💡 Insight

`Stream.of()` works with arrays and varargs. For collections like `ArrayList`, you'd use `.stream()` instead.

---

## Concept 2: Sorting with Streams

### ⚙️ Sorting in ascending order

The `sorted()` method is an **intermediate operation** that returns a new sorted stream:

```java
Stream.of(names)
    .sorted()
    .forEach(System.out::println);
```

**Output:**
```
Adam
Ben
Brad
Daniel
Joe
Kevin
Martha
Susan
```

Strings are sorted in **alphabetical (lexicographic) order** by default.

### ⚙️ Sorting in descending order

To reverse the order, pass `Comparator.reverseOrder()`:

```java
Stream.of(names)
    .sorted(Comparator.reverseOrder())
    .forEach(System.out::println);
```

**Output:**
```
Susan
Martha
Kevin
Joe
Daniel
Brad
Ben
Adam
```

### 💡 Insight

`sorted()` is an intermediate operation — it returns a stream, so you can chain more operations after it.

---

## Concept 3: Filtering with Streams

### ⚙️ How filtering works

The `filter()` method takes a **predicate** (a condition) and keeps only the elements that match:

```java
Stream.of(names)
    .filter(name -> name.startsWith("B"))
    .forEach(System.out::println);
```

**Output:**
```
Ben
Brad
```

### 🧪 Another example

```java
Stream.of(names)
    .filter(name -> name.startsWith("A"))
    .forEach(System.out::println);
```

**Output:**
```
Adam
```

### 💡 Insight

The lambda expression `name -> name.startsWith("B")` is a **predicate** — a function that returns `true` or `false`. Only elements where the predicate returns `true` pass through the filter.

---

## Concept 4: Chaining Operations

### ⚙️ Combining filter and sort

The real power of streams is chaining multiple operations:

```java
Stream.of(names)
    .filter(name -> name.startsWith("B"))
    .sorted()
    .forEach(System.out::println);
```

**Output:**
```
Ben
Brad
```

The pipeline:
1. **Source**: array of names
2. **Filter**: keep only names starting with "B"
3. **Sort**: sort alphabetically
4. **forEach**: print each result

Each intermediate operation returns a stream, enabling this fluent, readable style.

---

## ✅ Key Takeaways

- `Stream.of(array)` creates a stream from an array
- `sorted()` sorts elements in natural order; use `Comparator.reverseOrder()` for descending
- `filter()` keeps only elements matching a predicate
- Intermediate operations (`sorted`, `filter`) return streams and can be chained
- `forEach()` is a terminal operation that processes each element

## ⚠️ Common Mistakes

- Forgetting to import `java.util.stream.Stream` and `java.util.Comparator`
- Trying to modify the original array through streams — streams don't modify the source
- Using `filter()` after `forEach()` — `forEach()` is a terminal operation; nothing can come after it

## 💡 Pro Tips

- Method references (`System.out::println`) are cleaner than lambdas (`x -> System.out.println(x)`) when the lambda just calls a single method
- You can chain as many intermediate operations as you need — each one refines the data further
- Streams are ideal for data transformation pipelines — think of them as assembly lines
