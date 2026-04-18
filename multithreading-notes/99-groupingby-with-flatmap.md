# groupingBy() with flatMap()

## Introduction

In the previous section, each person belonged to **one** department — a simple string. But what if a person can belong to **multiple departments**? Now the department field is a `List<String>` instead of a `String`, and a naive `groupingBy()` won't work because the grouping key is a list, not a single value.

This is where combining `flatMap()` with `groupingBy()` becomes essential — and it's one of the most complex stream pipelines you'll encounter.

---

## Concept 1: The Problem — Multi-Valued Grouping Keys

### 🧠 What is it?

When a person belongs to multiple departments, the `Person` class stores departments as a `List<String>`:

```java
public class Person {
    private String name;
    private int age;
    private List<String> departments;
    // constructor, getters, setters...
}
```

Example data:

```java
List<Person> people = List.of(
    new Person("Adam", 34, List.of("Finance", "IT")),
    new Person("Kevin", 12, List.of("Finance")),
    new Person("Daniel", 77, List.of("IT")),
    new Person("Anna", 56, List.of("Packaging", "IT")),
    new Person("Joe", 31, List.of("Finance"))
);
```

### ❓ Why can't we just use groupingBy()?

If you try the naive approach:

```java
people.stream()
      .collect(Collectors.groupingBy(Person::getDepartments));
```

The **key** becomes the entire list — `["Finance", "IT"]` — not individual departments. You'd get groups like `{[Finance, IT]=[Adam], [Finance]=[Kevin, Joe]}`, which is not what we want. We want each **individual department** as a separate key.

---

## Concept 2: The Solution — Flatten, Then Group

### 🧠 The strategy

The solution follows three steps:

1. **Flatten** each person's department list into individual (department, person) pairs
2. Create a flat stream of key-value entries
3. **Group** those entries by the department key

### ⚙️ Step-by-step breakdown

**Step 1: flatMap to expand departments**

Each person may have multiple departments. We use `flatMap()` to "explode" each person into multiple entries — one per department:

```java
people.stream()
    .flatMap(person -> person.getDepartments().stream()
        .map(dept -> new AbstractMap.SimpleEntry<>(dept, person))
    )
```

For Adam (departments: Finance, IT), this produces two entries:
- `Finance → Adam`
- `IT → Adam`

For Anna (departments: Packaging, IT), this produces:
- `Packaging → Anna`
- `IT → Anna`

After flattening, the stream contains entries like:

```
Finance → Adam
IT → Adam
Finance → Kevin
IT → Daniel
Packaging → Anna
IT → Anna
Finance → Joe
```

**Step 2: Group by the department key**

Now we group these entries by their key (the department string):

```java
.collect(Collectors.groupingBy(
    Map.Entry::getKey,
    Collectors.mapping(entry -> entry.getValue().getName(), Collectors.toList())
))
```

**Step 3: Extract just the names using the downstream mapping**

We don't want the full `Map.Entry` objects — we want just the person names. The `mapping()` downstream collector transforms each entry's value (the `Person`) into just the name.

### 🧪 Complete solution

```java
Map<String, List<String>> result = people.stream()
    .flatMap(person -> person.getDepartments().stream()
        .map(dept -> new AbstractMap.SimpleEntry<>(dept, person))
    )
    .collect(Collectors.groupingBy(
        Map.Entry::getKey,
        Collectors.mapping(
            entry -> entry.getValue().getName(),
            Collectors.toList()
        )
    ));

System.out.println(result);
```

**Output:**

```
{Packaging=[Anna], IT=[Adam, Daniel, Anna], Finance=[Adam, Kevin, Joe]}
```

Adam appears in both IT and Finance. Anna appears in both Packaging and IT. This is exactly what we wanted.

---

## Concept 3: Understanding the Pipeline Visually

Let's trace the data through each stage:

```
Input:
  Adam    → [Finance, IT]
  Kevin   → [Finance]
  Daniel  → [IT]
  Anna    → [Packaging, IT]
  Joe     → [Finance]

After flatMap (expand departments into individual entries):
  Finance  → Adam
  IT       → Adam
  Finance  → Kevin
  IT       → Daniel
  Packaging → Anna
  IT       → Anna
  Finance  → Joe

After groupingBy + mapping (group by department, extract names):
  Finance   → [Adam, Kevin, Joe]
  IT        → [Adam, Daniel, Anna]
  Packaging → [Anna]
```

### 💡 Insight

The key insight is that `flatMap()` turns **one person with N departments** into **N separate entries**. This "explosion" creates the flat structure that `groupingBy()` needs to work correctly with individual department strings as keys.

---

## Key Takeaways

✅ When a grouping key is a **list** (multi-valued), you need `flatMap()` before `groupingBy()`

✅ The pattern: flatten each element into (key, value) pairs using `AbstractMap.SimpleEntry`, then group those pairs

✅ Use `Collectors.mapping()` as a downstream collector to control how grouped values are represented

⚠️ This is one of the most complex stream pipelines — if you understand this, you can handle almost any stream operation

💡 The combination of `flatMap()` + `groupingBy()` is the stream equivalent of a SQL `JOIN` followed by `GROUP BY`
