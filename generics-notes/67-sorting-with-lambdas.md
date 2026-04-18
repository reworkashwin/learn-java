# Sorting with Lambdas

## Introduction

In the previous section, we sorted collections using anonymous inner classes for `Comparator`. It worked, but writing 5+ lines of boilerplate just to compare two values feels heavy. Java 8 introduced **lambda expressions** that let you express the same sorting logic in a single, readable line. Let's see how lambdas transform sorting from verbose ceremony into elegant code.

---

## Concept 1: From Anonymous Class to Lambda

### 🧠 What is it?

A lambda expression is a concise way to represent an instance of a **functional interface** — an interface with exactly one abstract method. `Comparator<T>` is a functional interface with `compare(T o1, T o2)`, making it a perfect candidate for lambdas.

### ❓ Why do we need it?

Compare these two approaches:

**Before (Anonymous inner class):**
```java
Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});
```

**After (Lambda):**
```java
Collections.sort(names, (a, b) -> a.compareTo(b));
```

Same result. Less noise. The lambda focuses on *what* you're doing (comparing), not *how* Java's type system needs it wrapped.

### 💡 Insight

The compiler knows from context that `a` and `b` are `String` — you don't need to declare their types. This is called **type inference** from the target type.

---

## Concept 2: Lambda Syntax for Comparators

### 🧠 What is it?

The lambda `(parameters) -> expression` maps directly to the `compare()` method of `Comparator`.

### ⚙️ How it works

```java
List<String> names = new ArrayList<>(List.of("Charlie", "Alice", "Bob"));

// Sort alphabetically
names.sort((a, b) -> a.compareTo(b));
System.out.println(names);  // [Alice, Bob, Charlie]

// Sort by string length
names.sort((a, b) -> Integer.compare(a.length(), b.length()));
System.out.println(names);  // [Bob, Alice, Charlie]

// Sort in reverse alphabetical order
names.sort((a, b) -> b.compareTo(a));
System.out.println(names);  // [Charlie, Bob, Alice]
```

### ⚠️ Common Mistake

Don't forget that `sort()` modifies the list in place. If you need to keep the original order, make a copy first:

```java
List<String> sorted = new ArrayList<>(names);
sorted.sort((a, b) -> a.compareTo(b));
```

---

## Concept 3: Method References — Even Cleaner

### 🧠 What is it?

When your lambda just calls an existing method, you can replace it with a **method reference** using `::`. It's even shorter than a lambda.

### ⚙️ How it works

```java
// Lambda
names.sort((a, b) -> a.compareTo(b));

// Method reference — equivalent
names.sort(String::compareTo);
```

For static methods:

```java
List<Integer> numbers = new ArrayList<>(List.of(5, 2, 8, 1));

// Lambda
numbers.sort((a, b) -> Integer.compare(a, b));

// Method reference
numbers.sort(Integer::compare);
```

### 💡 Insight

Method references come in four flavors:
- `ClassName::staticMethod` → `Integer::compare`
- `instance::instanceMethod` → `myComparator::compare`
- `ClassName::instanceMethod` → `String::compareTo` (first param becomes the calling object)
- `ClassName::new` → constructor reference

---

## Concept 4: Comparator Factory Methods

### 🧠 What is it?

Java 8's `Comparator` interface has static and default methods that let you build comparators declaratively — often eliminating the need for lambdas entirely.

### ⚙️ How it works

```java
List<Employee> team = getEmployees();

// Sort by name
team.sort(Comparator.comparing(Employee::getName));

// Sort by salary (primitive-aware — avoids boxing)
team.sort(Comparator.comparingInt(Employee::getSalary));

// Sort by salary descending
team.sort(Comparator.comparingInt(Employee::getSalary).reversed());

// Multi-level: by department, then by name
team.sort(Comparator.comparing(Employee::getDepartment)
                     .thenComparing(Employee::getName));

// Nulls-safe sorting (nulls first or last)
team.sort(Comparator.comparing(Employee::getName, 
                     Comparator.nullsFirst(Comparator.naturalOrder())));
```

### 🧪 Example: Sorting a List of People

```java
public class Person {
    private String name;
    private int age;
    // constructor, getters...
}

List<Person> people = List.of(
    new Person("Alice", 30),
    new Person("Bob", 25),
    new Person("Charlie", 30)
);

List<Person> sorted = new ArrayList<>(people);

// Sort by age, then by name for same age
sorted.sort(Comparator.comparingInt(Person::getAge)
                       .thenComparing(Person::getName));

// Result: Bob(25), Alice(30), Charlie(30)
```

### 💡 Insight

Use `comparingInt()`, `comparingLong()`, and `comparingDouble()` instead of `comparing()` for primitive fields. They avoid autoboxing overhead and are slightly faster.

---

## Concept 5: Sorting Streams with Lambdas

### 🧠 What is it?

If you don't want to modify the original list, you can use the Stream API to create a **new sorted collection**.

### ⚙️ How it works

```java
List<String> names = List.of("Charlie", "Alice", "Bob");

// Returns a new sorted list — original unchanged
List<String> sorted = names.stream()
    .sorted()  // natural order
    .collect(Collectors.toList());

// With custom comparator
List<String> byLength = names.stream()
    .sorted(Comparator.comparingInt(String::length))
    .collect(Collectors.toList());

System.out.println(names);     // [Charlie, Alice, Bob] — unchanged
System.out.println(sorted);    // [Alice, Bob, Charlie]
System.out.println(byLength);  // [Bob, Alice, Charlie]
```

---

## ✅ Key Takeaways

- Lambdas reduce `Comparator` definitions from 5+ lines to **one line**
- `(a, b) -> a.compareTo(b)` replaces verbose anonymous inner classes
- **Method references** (`String::compareTo`) are even shorter when applicable
- `Comparator.comparing()` and `.thenComparing()` let you build comparators declaratively
- Use `comparingInt()` / `comparingDouble()` for primitives to avoid boxing
- Stream's `.sorted()` returns a new collection without modifying the original
