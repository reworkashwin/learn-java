# partitioningBy()

## Introduction

We've seen `groupingBy()` — which splits a stream into groups based on any classifier function. Now meet its simpler cousin: `partitioningBy()`. Instead of grouping by any property, it divides elements into exactly **two groups**: those that match a predicate and those that don't. Think of it as a binary split — true or false, yes or no, pass or fail.

---

## Concept 1: What Is partitioningBy()?

### 🧠 The idea

`Collectors.partitioningBy()` takes a **predicate** (a function that returns `true` or `false`) and splits the stream into a `Map<Boolean, List<T>>`:

- Key `true` → all elements matching the predicate
- Key `false` → all elements not matching

### 💡 Real-World Analogy

A bouncer at a club checking IDs: everyone is split into two lines — those **over 18** (allowed in) and those **under 18** (not allowed). Two groups, one rule.

### ⚙️ Syntax

```java
Map<Boolean, List<T>> result = stream
    .collect(Collectors.partitioningBy(predicate));
```

---

## Concept 2: Basic Example

### 🧪 Partitioning numbers into even and odd

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

Map<Boolean, List<Integer>> partitioned = numbers.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));

System.out.println("Even: " + partitioned.get(true));
System.out.println("Odd:  " + partitioned.get(false));
```

**Output:**
```
Even: [2, 4, 6, 8, 10]
Odd:  [1, 3, 5, 7, 9]
```

### 🧪 Partitioning people by age

```java
List<Person> people = List.of(
    new Person("Alice", 25),
    new Person("Bob", 17),
    new Person("Charlie", 30),
    new Person("Diana", 15)
);

Map<Boolean, List<Person>> adults = people.stream()
    .collect(Collectors.partitioningBy(p -> p.getAge() >= 18));

System.out.println("Adults: " + adults.get(true));   // [Alice, Charlie]
System.out.println("Minors: " + adults.get(false));   // [Bob, Diana]
```

---

## Concept 3: partitioningBy() vs groupingBy()

### 🧠 When to use which?

| Feature | `partitioningBy()` | `groupingBy()` |
|---------|-------------------|----------------|
| Number of groups | Always **2** (true/false) | Any number |
| Key type | `Boolean` | Any type |
| Input | Predicate (`T → boolean`) | Classifier function (`T → K`) |
| Use case | Binary yes/no split | Multi-category classification |

### 🧪 Same problem, two approaches

```java
// partitioningBy — is the person an adult?
Map<Boolean, List<Person>> partition = people.stream()
    .collect(Collectors.partitioningBy(p -> p.getAge() >= 18));

// groupingBy — group by age bracket (more flexible)
Map<String, List<Person>> groups = people.stream()
    .collect(Collectors.groupingBy(p -> {
        if (p.getAge() < 18) return "Minor";
        if (p.getAge() < 65) return "Adult";
        return "Senior";
    }));
```

Use `partitioningBy()` when you only need a **binary split**. Use `groupingBy()` when you need **multiple categories**.

### 💡 Key Advantage of partitioningBy()

`partitioningBy()` **always returns both keys** — even if one group is empty:

```java
List<Integer> allPositive = List.of(1, 2, 3);

Map<Boolean, List<Integer>> result = allPositive.stream()
    .collect(Collectors.partitioningBy(n -> n > 0));

System.out.println(result.get(true));   // [1, 2, 3]
System.out.println(result.get(false));  // []  ← empty list, NOT null
```

With `groupingBy()`, a missing key wouldn't appear in the map at all. This makes `partitioningBy()` safer when you always need both groups.

---

## Concept 4: Using Downstream Collectors

### 🧠 Collecting more than just lists

Just like `groupingBy()`, you can pass a **downstream collector** to transform what goes into each partition:

### 🧪 Counting elements in each partition

```java
Map<Boolean, Long> counted = numbers.stream()
    .collect(Collectors.partitioningBy(
        n -> n % 2 == 0,
        Collectors.counting()
    ));

System.out.println("Even count: " + counted.get(true));   // 5
System.out.println("Odd count: " + counted.get(false));    // 5
```

### 🧪 Joining strings in each partition

```java
Map<Boolean, String> joined = people.stream()
    .collect(Collectors.partitioningBy(
        p -> p.getAge() >= 18,
        Collectors.mapping(
            Person::getName,
            Collectors.joining(", ")
        )
    ));

System.out.println("Adults: " + joined.get(true));   // "Alice, Charlie"
System.out.println("Minors: " + joined.get(false));   // "Bob, Diana"
```

### 🧪 Finding the max in each partition

```java
Map<Boolean, Optional<Person>> oldest = people.stream()
    .collect(Collectors.partitioningBy(
        p -> p.getAge() >= 18,
        Collectors.maxBy(Comparator.comparingInt(Person::getAge))
    ));
```

---

## Concept 5: Practical Use Cases

### ⚙️ When is partitioningBy() especially useful?

| Scenario | Predicate |
|----------|-----------|
| Pass/fail a test | `score >= 60` |
| Positive/negative numbers | `n > 0` |
| Available/unavailable items | `item.inStock()` |
| Valid/invalid data | `data.isValid()` |
| Premium/free users | `user.isPremium()` |

### 💡 Pro Tip: Use partitioning for validation

```java
Map<Boolean, List<Order>> validated = orders.stream()
    .collect(Collectors.partitioningBy(Order::isValid));

List<Order> validOrders = validated.get(true);     // Process these
List<Order> invalidOrders = validated.get(false);   // Log/report these
```

This is cleaner than filtering twice (once for valid, once for invalid) — it processes the stream only **once**.

---

## ✅ Key Takeaways

- `partitioningBy()` splits a stream into exactly **two groups** based on a predicate
- Returns `Map<Boolean, List<T>>` — key `true` for matching, `false` for non-matching
- Both keys are **always present** — even if a group is empty (no null risk)
- Use downstream collectors for counting, joining, or transforming partitions
- Use `partitioningBy()` for binary splits; use `groupingBy()` for multi-category grouping
- Partitioning processes the stream once — more efficient than two separate `filter()` calls
