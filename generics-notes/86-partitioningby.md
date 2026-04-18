# partitioningBy()

## Introduction

We've used `groupingBy()` to split elements into multiple groups based on a classifier. But sometimes you don't need multiple groups — you just need **two**: elements that match a condition and elements that don't. Think pass/fail, above/below threshold, valid/invalid. This is exactly what `Collectors.partitioningBy()` does — it's a specialized form of grouping that produces a `Map<Boolean, List<T>>`.

---

## Concept 1: What is partitioningBy()?

### 🧠 What is it?

`Collectors.partitioningBy()` splits a stream into exactly **two groups** based on a `Predicate<T>`. The result is always a `Map<Boolean, List<T>>` where:
- `true` → elements that matched the predicate
- `false` → elements that didn't

### ❓ Why not just use groupingBy()?

You could use `groupingBy()` with a boolean-returning function, but `partitioningBy()` is cleaner and **guarantees both keys exist** — even if one group is empty. With `groupingBy`, if no element maps to `false`, that key won't be in the map.

### ⚙️ How it works

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

Map<Boolean, List<Integer>> evenOdd = numbers.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));

System.out.println("Even: " + evenOdd.get(true));   // [2, 4, 6, 8, 10]
System.out.println("Odd: " + evenOdd.get(false));    // [1, 3, 5, 7, 9]
```

### 💡 Insight

Even if no elements match the predicate, both `true` and `false` keys are present in the map with empty lists. This makes `partitioningBy()` null-safe — you never get a `NullPointerException` from `.get(true)` or `.get(false)`.

---

## Concept 2: Practical Examples

### 🧠 What is it?

Let's see `partitioningBy()` in action with real-world scenarios.

### ⚙️ Pass/Fail Students

```java
public class Student {
    private String name;
    private int score;
    // constructor, getters...
}

List<Student> students = List.of(
    new Student("Alice", 85),
    new Student("Bob", 42),
    new Student("Charlie", 91),
    new Student("David", 38),
    new Student("Eve", 76)
);

Map<Boolean, List<Student>> passedFailed = students.stream()
    .collect(Collectors.partitioningBy(s -> s.getScore() >= 50));

System.out.println("Passed: " + passedFailed.get(true));   // Alice, Charlie, Eve
System.out.println("Failed: " + passedFailed.get(false));   // Bob, David
```

### ⚙️ Adults vs. Minors

```java
List<Person> people = getPeople();

Map<Boolean, List<Person>> adultMinor = people.stream()
    .collect(Collectors.partitioningBy(p -> p.getAge() >= 18));

List<Person> adults = adultMinor.get(true);
List<Person> minors = adultMinor.get(false);
```

---

## Concept 3: partitioningBy() with a Downstream Collector

### 🧠 What is it?

Just like `groupingBy()`, you can pass a **downstream collector** to `partitioningBy()` to control what goes into each partition — count them, sum them, join them, etc.

### ⚙️ How it works

```java
// Count elements in each partition
Map<Boolean, Long> counts = students.stream()
    .collect(Collectors.partitioningBy(
        s -> s.getScore() >= 50,
        Collectors.counting()
    ));
System.out.println("Passed count: " + counts.get(true));   // 3
System.out.println("Failed count: " + counts.get(false));   // 2

// Average score in each partition
Map<Boolean, Double> avgScores = students.stream()
    .collect(Collectors.partitioningBy(
        s -> s.getScore() >= 50,
        Collectors.averagingInt(Student::getScore)
    ));
System.out.println("Pass avg: " + avgScores.get(true));    // 84.0
System.out.println("Fail avg: " + avgScores.get(false));    // 40.0

// Collect names instead of objects
Map<Boolean, List<String>> namesByStatus = students.stream()
    .collect(Collectors.partitioningBy(
        s -> s.getScore() >= 50,
        Collectors.mapping(Student::getName, Collectors.toList())
    ));
System.out.println(namesByStatus.get(true));  // [Alice, Charlie, Eve]
```

---

## Concept 4: partitioningBy() vs groupingBy()

### 🧠 What is it?

These two collectors look similar but serve different purposes.

### ⚙️ Comparison

```java
// partitioningBy — always 2 groups (true/false)
Map<Boolean, List<Integer>> partitioned = numbers.stream()
    .collect(Collectors.partitioningBy(n -> n > 5));

// groupingBy — any number of groups
Map<String, List<Integer>> grouped = numbers.stream()
    .collect(Collectors.groupingBy(n -> {
        if (n <= 3) return "low";
        if (n <= 7) return "medium";
        return "high";
    }));
```

| Feature | partitioningBy | groupingBy |
|---------|---------------|------------|
| Number of groups | Always 2 | Any number |
| Key type | `Boolean` | Any type |
| Empty groups | Always present | Only if elements exist |
| Input | `Predicate<T>` | `Function<T, K>` |

### 💡 Insight

Use `partitioningBy()` when you have a **binary condition** (yes/no, pass/fail, above/below). Use `groupingBy()` when you have **multiple categories**.

---

## Concept 5: Nested partitioningBy()

### 🧠 What is it?

You can nest `partitioningBy()` inside another to create multi-level binary partitions.

### ⚙️ How it works

```java
// Partition by pass/fail, then within each group partition by honors (>= 90)
Map<Boolean, Map<Boolean, List<Student>>> nested = students.stream()
    .collect(Collectors.partitioningBy(
        s -> s.getScore() >= 50,
        Collectors.partitioningBy(s -> s.getScore() >= 90)
    ));

List<Student> passedWithHonors = nested.get(true).get(true);   // Charlie (91)
List<Student> passedNormal = nested.get(true).get(false);       // Alice (85), Eve (76)
```

### ⚠️ Common Mistake

Deeply nested partitions become hard to read. If you need more than two levels of splitting, consider using `groupingBy()` with a meaningful enum or string key instead.

---

## ✅ Key Takeaways

- `partitioningBy()` splits a stream into exactly **two groups**: `true` and `false`
- Both groups are **always present** in the result map — even if empty
- Takes a `Predicate<T>` — not a `Function<T, K>` like `groupingBy()`
- Supports **downstream collectors** for counting, averaging, mapping, etc.
- Perfect for binary conditions: pass/fail, above/below, valid/invalid
- For more than two categories, use `groupingBy()` instead
