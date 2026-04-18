# Streams with Numbers

## Introduction

Let's get hands-on with the Stream API. We'll start with the simplest case — working with numbers. You'll see how streams replace traditional for-loops with clean, expressive code, and how intermediate operations like `filter()` let you build powerful data pipelines.

---

## From For-Loops to Streams

### Traditional approach

```java
int[] nums = {1, 5, 3, -1, 9, 12};

// Print all values
for (int i = 0; i < nums.length; i++) {
    System.out.println(nums[i]);
}

// Sum all values
int sum = 0;
for (int i = 0; i < nums.length; i++) {
    sum += nums[i];
}
System.out.println(sum);
```

### Stream approach

```java
int[] nums = {1, 5, 3, -1, 9, 12};

// Print all values
Arrays.stream(nums).forEach(System.out::println);

// Sum all values
int sum = Arrays.stream(nums).sum();
System.out.println(sum);
```

### 💡 Insight

No index variables, no loop conditions, no manual accumulation. The stream version says **what** you want, not **how** to do it.

---

## Converting Arrays to Streams

### ⚙️ How it works

`Arrays.stream(nums)` converts an `int[]` array into an `IntStream`. From there, you can chain operations.

```java
Arrays.stream(nums).forEach(System.out::println);
//     ^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^
//     Creates stream  Terminal operation
```

---

## Method References vs. Lambda Expressions

Two ways to pass behavior to stream operations:

### Method reference (`::`  operator)

```java
Arrays.stream(nums).forEach(System.out::println);
```

This says: "for each element, call `System.out.println` on it."

### Lambda expression

```java
Arrays.stream(nums).forEach(x -> System.out.print(x + " "));
```

This says: "for each element `x`, print it followed by a space."

Use method references when the operation matches exactly. Use lambdas when you need custom logic.

---

## Generating Streams with IntStream

You don't need an existing array. `IntStream.range()` generates numbers on the fly:

```java
// Generates: 0, 1, 2, 3, 4 (5 is exclusive)
IntStream.range(0, 5).forEach(x -> System.out.print(x + " "));

// Generates: 0, 1, 2, 3, ..., 9
IntStream.range(0, 10).forEach(System.out::println);
```

---

## Intermediate Operations: filter()

### 🧠 What is it?

`filter()` keeps only elements that match a condition (predicate). It returns a **new stream** — this is what makes it an intermediate operation.

### 🧪 Examples

```java
// Keep values greater than 4
IntStream.range(0, 10)
    .filter(x -> x > 4)
    .forEach(x -> System.out.print(x + " "));
// Output: 5 6 7 8 9

// Keep even numbers
IntStream.range(0, 10)
    .filter(x -> x % 2 == 0)
    .forEach(x -> System.out.print(x + " "));
// Output: 0 2 4 6 8

// Keep odd numbers
IntStream.range(0, 10)
    .filter(x -> x % 2 != 0)
    .forEach(x -> System.out.print(x + " "));
// Output: 1 3 5 7 9
```

### ⚙️ How it works

```
Stream: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          ↓ filter(x -> x > 4)
Stream: [5, 6, 7, 8, 9]
          ↓ forEach(print)
Output: 5 6 7 8 9
```

The `filter()` returns a **stream** (intermediate), and `forEach()` returns **void** (terminal).

---

## Chaining Operations

The real power of streams is **pipelining** — chaining multiple operations:

```java
IntStream.range(0, 10)
    .filter(x -> x % 2 != 0)  // keep odd numbers
    .forEach(System.out::println);  // print them
```

Each intermediate operation transforms the stream and passes it to the next step. The terminal operation triggers execution of the entire pipeline.

---

## ✅ Key Takeaways

- `Arrays.stream(array)` converts an array into a stream
- `IntStream.range(start, end)` generates a stream of integers (end is exclusive)
- `filter()` is an intermediate operation — it returns a stream
- `forEach()` is a terminal operation — it returns void
- Method references (`::`) are shorthand for simple lambda expressions
- Stream operations can be **chained** into pipelines

## ⚠️ Common Mistake

- Forgetting that `IntStream.range(0, 5)` excludes the upper bound — it produces 0, 1, 2, 3, 4 (not 5)
- Trying to reuse a stream after a terminal operation — streams are single-use

## 💡 Pro Tip

Use `sum()`, `min()`, `max()`, and `average()` directly on `IntStream` for quick numeric computations without writing loops.
