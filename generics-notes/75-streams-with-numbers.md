# Streams with Numbers

## Introduction

The Stream API is incredibly powerful for processing collections. But when you work with numeric data — sums, averages, ranges — the generic `Stream<Integer>` has a hidden cost: **autoboxing**. Every `int` gets wrapped into an `Integer` object, and every operation unwraps it. Java provides **primitive stream specializations** — `IntStream`, `LongStream`, and `DoubleStream` — that eliminate this overhead and offer numeric-specific operations.

---

## Concept 1: The Problem with Boxed Streams

### 🧠 What is it?

When you use `Stream<Integer>`, every number is an `Integer` object. Summing a million integers means a million boxing/unboxing operations — wasted memory and CPU.

### ❓ Why do we need primitive streams?

```java
// This works but is inefficient
List<Integer> numbers = List.of(1, 2, 3, 4, 5);
int sum = numbers.stream()
    .reduce(0, Integer::sum);  // lots of boxing/unboxing
```

Primitive streams avoid this entirely by working directly with `int`, `long`, and `double` values.

---

## Concept 2: Creating IntStream, LongStream, DoubleStream

### 🧠 What is it?

Java provides three primitive stream types, each with convenient factory methods.

### ⚙️ How it works

```java
import java.util.stream.IntStream;
import java.util.stream.LongStream;
import java.util.stream.DoubleStream;

// IntStream from values
IntStream ints = IntStream.of(1, 2, 3, 4, 5);

// IntStream from a range
IntStream range = IntStream.range(1, 6);        // 1, 2, 3, 4, 5 (exclusive end)
IntStream rangeClosed = IntStream.rangeClosed(1, 5); // 1, 2, 3, 4, 5 (inclusive end)

// From an array
int[] arr = {10, 20, 30};
IntStream fromArray = Arrays.stream(arr);

// Converting from Stream<Integer> to IntStream
List<Integer> list = List.of(1, 2, 3);
IntStream fromList = list.stream().mapToInt(Integer::intValue);

// LongStream and DoubleStream work the same way
LongStream longs = LongStream.rangeClosed(1, 1_000_000);
DoubleStream doubles = DoubleStream.of(1.5, 2.5, 3.5);
```

### 💡 Insight

`IntStream.range(1, 6)` is Java's answer to Python's `range(1, 6)` or a classic for-loop. It's a clean, functional replacement for `for (int i = 1; i < 6; i++)`.

---

## Concept 3: Numeric Operations — Sum, Average, Min, Max

### 🧠 What is it?

Primitive streams provide built-in terminal operations that generic streams don't have directly.

### ⚙️ How it works

```java
IntStream numbers = IntStream.of(10, 20, 30, 40, 50);

// Sum
int sum = IntStream.of(10, 20, 30, 40, 50).sum();
System.out.println("Sum: " + sum);  // 150

// Average (returns OptionalDouble)
OptionalDouble avg = IntStream.of(10, 20, 30, 40, 50).average();
avg.ifPresent(a -> System.out.println("Average: " + a));  // 30.0

// Min and Max
OptionalInt min = IntStream.of(10, 20, 30, 40, 50).min();
OptionalInt max = IntStream.of(10, 20, 30, 40, 50).max();

// Count
long count = IntStream.of(10, 20, 30, 40, 50).count();

// Summary statistics — all at once!
IntSummaryStatistics stats = IntStream.of(10, 20, 30, 40, 50).summaryStatistics();
System.out.println("Count: " + stats.getCount());     // 5
System.out.println("Sum: " + stats.getSum());          // 150
System.out.println("Min: " + stats.getMin());          // 10
System.out.println("Max: " + stats.getMax());          // 50
System.out.println("Average: " + stats.getAverage());  // 30.0
```

### 💡 Insight

`summaryStatistics()` is a lifesaver when you need multiple aggregate values. Without it, you'd need to create separate streams for sum, min, max, and average — because **streams can only be consumed once**.

---

## Concept 4: Mapping Between Stream Types

### 🧠 What is it?

You often need to convert between object streams and primitive streams, or between different primitive stream types.

### ⚙️ How it works

```java
// Stream<String> → IntStream (get lengths)
List<String> words = List.of("hello", "world", "java");
IntStream lengths = words.stream().mapToInt(String::length);
System.out.println(lengths.sum());  // 14

// IntStream → Stream<Integer> (boxing)
Stream<Integer> boxed = IntStream.of(1, 2, 3).boxed();

// IntStream → DoubleStream
DoubleStream doubles = IntStream.of(1, 2, 3).asDoubleStream();

// IntStream → LongStream
LongStream longs = IntStream.of(1, 2, 3).asLongStream();

// Stream<T> → mapToInt / mapToLong / mapToDouble
List<Employee> employees = getEmployees();
double avgSalary = employees.stream()
    .mapToInt(Employee::getSalary)
    .average()
    .orElse(0.0);
```

---

## Concept 5: Generating Number Sequences

### 🧠 What is it?

Primitive streams have powerful generation methods for creating sequences without explicit collections.

### ⚙️ How it works

```java
// Generate a sequence: 0, 2, 4, 6, 8
IntStream.iterate(0, n -> n + 2)
    .limit(5)
    .forEach(System.out::println);

// Java 9+: iterate with a predicate (like a for-loop)
IntStream.iterate(0, n -> n < 10, n -> n + 2)
    .forEach(System.out::println);  // 0, 2, 4, 6, 8

// Generate random numbers
IntStream.generate(() -> (int)(Math.random() * 100))
    .limit(5)
    .forEach(System.out::println);

// Sum of first 100 natural numbers
int total = IntStream.rangeClosed(1, 100).sum();
System.out.println(total);  // 5050
```

### 🧪 Real-World Example

Need to calculate the sum of all order amounts?

```java
List<Order> orders = getOrders();
double totalRevenue = orders.stream()
    .mapToDouble(Order::getAmount)
    .sum();
```

No loops, no accumulators, no boxing overhead.

---

## ✅ Key Takeaways

- `IntStream`, `LongStream`, `DoubleStream` avoid autoboxing overhead
- Built-in methods: `sum()`, `average()`, `min()`, `max()`, `summaryStatistics()`
- `IntStream.range()` and `rangeClosed()` replace traditional for-loops
- Use `mapToInt()` / `mapToDouble()` to convert object streams to primitive streams
- Use `.boxed()` to go back from primitive stream to object stream
- `summaryStatistics()` gives you count, sum, min, max, and average in one pass
