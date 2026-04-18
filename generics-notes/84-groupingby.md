# groupingBy()

## Introduction

If you've ever used `GROUP BY` in SQL, you'll feel right at home with Java's `Collectors.groupingBy()`. It's one of the most powerful collectors available — allowing you to **categorize stream elements into groups** based on a classifier function, and then optionally apply further operations to each group. Think of it as organizing a pile of documents into labeled folders.

---

## Concept 1: Basic groupingBy()

### 🧠 What is it?

`groupingBy()` is a collector that partitions stream elements into a `Map<K, List<V>>`, where:
- **K** is the key (the grouping criterion)
- **List\<V\>** is the list of elements belonging to that group

### ⚙️ How it works

Given a `Person` class with `name`, `age`, and `department` fields:

```java
List<Person> people = List.of(
    new Person("Adam", 34, "Finance"),
    new Person("Kevin", 12, "IT"),
    new Person("Daniel", 77, "HR"),
    new Person("Anna", 56, "IT"),
    new Person("Joe", 31, "Finance")
);

Map<String, List<Person>> grouped = people.stream()
    .collect(Collectors.groupingBy(Person::getDepartment));
```

**Result:**
```
{HR=[Daniel 77], IT=[Kevin 12, Anna 56], Finance=[Adam 34, Joe 31]}
```

The classifier function `Person::getDepartment` determines the key. All persons sharing the same department are grouped together into a list.

### 💡 Insight

The return type is always a `Map`. The keys are determined by your classifier, and by default, the values are `List`s of elements in each group.

---

## Concept 2: Downstream Collectors

### 🧠 What are they?

Downstream collectors are **additional operations applied to each group after grouping**. Instead of just getting a list of elements per group, you can count them, sum a field, transform them, and more.

### ⚙️ Available downstream operations

#### Counting elements per group

```java
Map<String, Long> counts = people.stream()
    .collect(Collectors.groupingBy(Person::getDepartment, Collectors.counting()));
// {HR=1, IT=2, Finance=2}
```

#### Summing a numeric field per group

```java
Map<String, Integer> totalAges = people.stream()
    .collect(Collectors.groupingBy(
        Person::getDepartment,
        Collectors.summingInt(Person::getAge)
    ));
// {HR=77, IT=68, Finance=65}
```

HR has one person (Daniel, age 77) → sum is 77. IT has Kevin (12) + Anna (56) → sum is 68.

#### Mapping values before collecting

What if you only want names, not full `Person` objects?

```java
Map<String, List<String>> namesByDept = people.stream()
    .collect(Collectors.groupingBy(
        Person::getDepartment,
        Collectors.mapping(Person::getName, Collectors.toList())
    ));
// {HR=[Daniel], IT=[Kevin, Anna], Finance=[Adam, Joe]}
```

The `mapping()` downstream transforms each person into just their name before collecting into a list.

#### Joining strings

```java
Map<String, String> joined = people.stream()
    .collect(Collectors.groupingBy(
        Person::getDepartment,
        Collectors.mapping(Person::getName, Collectors.joining(", "))
    ));
// {HR=Daniel, IT=Kevin, Anna, Finance=Adam, Joe}
```

Instead of a list, the names are merged into a single comma-separated string.

#### Collecting into a Set instead of a List

```java
Map<String, Set<Person>> groupedSet = people.stream()
    .collect(Collectors.groupingBy(Person::getDepartment, Collectors.toSet()));
```

---

## Concept 3: Controlling the Map Type

### 🧠 What is it?

By default, `groupingBy()` produces a `HashMap`, which has **no guaranteed key order**. If you want sorted keys, you can specify a `TreeMap` as the map factory.

### ⚙️ How it works

The three-argument version of `groupingBy()`:

```java
Map<String, List<String>> sorted = people.stream()
    .collect(Collectors.groupingBy(
        Person::getDepartment,           // classifier
        TreeMap::new,                     // map factory
        Collectors.mapping(Person::getName, Collectors.toList())  // downstream
    ));
// {Finance=[Adam, Joe], HR=[Daniel], IT=[Kevin, Anna]}  ← keys sorted alphabetically
```

The `TreeMap::new` in the middle tells Java to use a `TreeMap` (backed by a red-black tree) instead of a `HashMap`, ensuring keys are sorted alphabetically.

---

## The Full groupingBy() Signature

```java
// Simple: classifier only
Collectors.groupingBy(classifier)

// With downstream collector
Collectors.groupingBy(classifier, downstream)

// With map factory and downstream
Collectors.groupingBy(classifier, mapFactory, downstream)
```

---

## ✅ Key Takeaways

- `groupingBy()` is the Java Stream equivalent of SQL's `GROUP BY`
- It returns a `Map<K, List<V>>` by default — keys are the group criteria, values are lists of elements
- **Downstream collectors** let you transform each group: count, sum, map, join, etc.
- Use `TreeMap::new` as the map factory to get sorted keys
- `Collectors.mapping()` lets you transform elements before collecting into each group
- Method references (`Person::getDepartment`) and lambdas (`p -> p.getDepartment()`) are interchangeable as classifiers

## ⚠️ Common Mistakes

- Forgetting that `groupingBy()` returns a `Map`, not a `List`
- Not using downstream collectors when you need aggregated values (counts, sums) instead of full object lists
- Assuming the keys are sorted — `HashMap` has no order; use `TreeMap::new` if you need sorting

## 💡 Pro Tips

- Chain `groupingBy()` with `Collectors.counting()` for quick frequency analysis
- Use `Collectors.mapping()` as a downstream to extract specific fields per group
- For multi-level grouping, nest `groupingBy()` calls: `groupingBy(A, groupingBy(B))`
- `Collectors.partitioningBy()` is a special case of grouping that splits into exactly two groups (true/false)
