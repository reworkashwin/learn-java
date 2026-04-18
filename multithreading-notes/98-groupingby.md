# groupingBy()

## Introduction

If you've ever used `GROUP BY` in SQL, you already understand the idea behind `Collectors.groupingBy()`. It takes a stream of objects and **groups them by a common property** — like grouping employees by department, books by genre, or people by age. The result is a `Map` where each key is a group and each value is a list of items in that group.

`groupingBy()` is one of the most powerful collectors in the Java Stream API.

---

## Concept 1: Basic groupingBy()

### 🧠 What is it?

`Collectors.groupingBy()` is a terminal operation (used inside `collect()`) that classifies stream elements into groups based on a **classifier function** — a function that extracts the grouping key from each element.

### ⚙️ How it works

1. You provide a **classifier function** — it extracts the key (e.g., department name) from each object
2. Java iterates the stream and places each element into a group based on its key
3. The result is a `Map<Key, List<Element>>`

### 🧪 Example

Given a `Person` class with `name`, `age`, and `department`:

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

System.out.println(grouped);
```

**Output:**

```
{HR=[Daniel 77], IT=[Kevin 12, Anna 56], Finance=[Adam 34, Joe 31]}
```

The keys are departments. The values are lists of people belonging to each department.

### 💡 Insight

By default, `groupingBy()` collects the grouped elements into an `ArrayList`. The classifier function can be written as a lambda `p -> p.getDepartment()` or a method reference `Person::getDepartment` — they're equivalent.

---

## Concept 2: Downstream Collectors

### 🧠 What are they?

A **downstream collector** is an operation applied to each group **after** the grouping has happened. Instead of getting a `List<Person>` for each group, you can count them, sum a field, transform them, or collect into a different data structure.

### ❓ Why do we need them?

Sometimes you don't want the raw list of objects. You might want:
- The **count** of people per department
- The **sum** of ages per department
- Just the **names** (not full objects) per department

### 🧪 Example 1: Counting items per group

```java
Map<String, Long> countByDept = people.stream()
    .collect(Collectors.groupingBy(Person::getDepartment, Collectors.counting()));

// Output: {HR=1, IT=2, Finance=2}
```

### 🧪 Example 2: Summing a field per group

```java
Map<String, Integer> ageSum = people.stream()
    .collect(Collectors.groupingBy(
        Person::getDepartment,
        Collectors.summingInt(Person::getAge)
    ));

// Output: {HR=77, IT=68, Finance=65}
```

HR has only Daniel (age 77). IT has Kevin (12) + Anna (56) = 68. Finance has Adam (34) + Joe (31) = 65.

### 🧪 Example 3: Collecting into a Set instead of a List

```java
Map<String, Set<Person>> groupedSet = people.stream()
    .collect(Collectors.groupingBy(Person::getDepartment, Collectors.toSet()));
```

Now each group is a `Set` instead of a `List`.

---

## Concept 3: Mapping Within Groups

### 🧠 What is it?

`Collectors.mapping()` lets you **transform the elements** before collecting them into the group. For example, instead of storing full `Person` objects, you can store just their names.

### ⚙️ How it works

```java
Map<String, List<String>> namesByDept = people.stream()
    .collect(Collectors.groupingBy(
        Person::getDepartment,
        Collectors.mapping(Person::getName, Collectors.toList())
    ));

// Output: {HR=[Daniel], IT=[Kevin, Anna], Finance=[Adam, Joe]}
```

The `mapping()` downstream collector takes two arguments:
1. A transformation function (`Person::getName`)
2. A downstream collector for the transformed values (`Collectors.toList()`)

### 🧪 Example: Joining names into a single string

```java
Map<String, String> joinedNames = people.stream()
    .collect(Collectors.groupingBy(
        Person::getDepartment,
        Collectors.mapping(Person::getName, Collectors.joining(", "))
    ));

// Output: {HR=Daniel, IT=Kevin, Anna, Finance=Adam, Joe}
```

Instead of a list, each group's values are joined into a comma-separated string.

---

## Concept 4: Controlling the Map Type

### 🧠 What is it?

By default, `groupingBy()` returns a `HashMap`, which has **no guaranteed key order**. If you want sorted keys, you can supply a **map factory** to use a `TreeMap` instead.

### ⚙️ How it works

The three-argument version of `groupingBy()`:

```java
groupingBy(classifier, mapFactory, downstreamCollector)
```

### 🧪 Example

```java
Map<String, List<String>> sorted = people.stream()
    .collect(Collectors.groupingBy(
        Person::getDepartment,
        TreeMap::new,                                          // map factory
        Collectors.mapping(Person::getName, Collectors.toList()) // downstream
    ));

// Output: {Finance=[Adam, Joe], HR=[Daniel], IT=[Kevin, Anna]}
```

Keys are now sorted alphabetically because `TreeMap` maintains natural ordering.

---

## Summary of groupingBy() Overloads

| Overload | Parameters | Default |
|----------|-----------|---------|
| `groupingBy(classifier)` | Classifier only | `HashMap`, values as `List` |
| `groupingBy(classifier, downstream)` | Classifier + downstream | `HashMap` |
| `groupingBy(classifier, mapFactory, downstream)` | All three | Custom map type |

---

## Key Takeaways

✅ `groupingBy()` is the stream equivalent of SQL's `GROUP BY` — it classifies elements into a `Map`

✅ The default result is `Map<Key, List<Element>>` using a `HashMap`

✅ **Downstream collectors** let you customize what happens to each group: `counting()`, `summingInt()`, `mapping()`, `toSet()`, `joining()`, etc.

✅ Use `TreeMap::new` as the map factory if you need sorted keys

⚠️ The classifier function determines the keys — make sure it returns consistent, meaningful values

💡 You can nest downstream collectors for complex transformations (e.g., `mapping()` inside `groupingBy()`)
