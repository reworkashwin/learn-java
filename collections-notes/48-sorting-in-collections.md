# 📘 Sorting in Collections

## 📌 Introduction

Sorting is one of the most common operations you'll ever perform on data. Whether you're arranging numbers in ascending order, alphabetizing names, or ordering objects by a specific field — sorting is everywhere. The good news? Java makes it incredibly straightforward with its built-in utilities.

In this lesson, we'll cover two types of sorting:
1. **Natural Order Sorting** — using the default logical order
2. **Custom Sorting** — defining your own order with comparators

---

## 🧩 Concept 1: Natural Order Sorting

### 🧠 What is it?

Natural order sorting means sorting elements in their **default logical order**, based on how they implement the `Comparable` interface.

What does "natural order" look like?
- **Numbers** → ascending order (1, 2, 3, 4, 5)
- **Strings** → alphabetical order (Alice, Bob, Charlie)

This is the behavior Java gives you out of the box — no extra configuration needed.

### ❓ Why do we need it?

Because most of the time, you just want things in a sensible default order. You don't want to write a sorting algorithm from scratch every time you need to arrange a list of integers or names.

### ⚙️ How it works

Java's `Collections` class (note: it's a **class**, not the `Collection` interface) provides a static `sort()` method that accepts a `List` and sorts it in-place.

```java
Collections.sort(yourList);
```

Behind the scenes, this relies on the elements implementing the `Comparable` interface, which defines how two objects compare to each other.

### 🧪 Example — Sorting Numbers

```java
List<Integer> nums = Arrays.asList(5, 1, 4, 3, 2);
Collections.sort(nums);
System.out.println(nums); // [1, 2, 3, 4, 5]
```

The integers get sorted in ascending order — their natural order.

### 🧪 Example — Sorting Strings

```java
List<String> names = Arrays.asList("John", "Alice", "Bob");

System.out.println("Before sorting: " + names); // [John, Alice, Bob]

Collections.sort(names);

System.out.println("After sorting: " + names);  // [Alice, Bob, John]
```

Strings get sorted alphabetically — that's their natural order.

### 💡 Insight

`Collections` is a **utility class** full of static helper methods. Don't confuse it with `Collection` (the interface). Think of `Collections` as a toolbox and `Collection` as the blueprint.

---

## 🧩 Concept 2: Custom Sorting with Comparator

### 🧠 What is it?

Custom sorting lets you define **your own ordering rules** using a `Comparator`. This is essential when:
- You want to sort in a non-default order (e.g., descending instead of ascending)
- You're sorting objects by a specific field (e.g., sort `Person` objects by age)

### ❓ Why do we need it?

Imagine you have a list of `Person` objects. What's their "natural order"? By name? By age? By ID? There's no obvious default. A `Comparator` lets you explicitly say: *"Sort these people by their age."*

### ⚙️ How it works

1. Create a class with the fields you want to sort by
2. Create a `Comparator` that defines the comparison logic
3. Pass both the list and the comparator to `Collections.sort()`

### 🧪 Example — Sorting Objects by Age (Traditional Way)

First, define a `Person` class:

```java
class Person {
    String name;
    int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return name + " - " + age;
    }
}
```

Create a list and a custom comparator:

```java
List<Person> people = Arrays.asList(
    new Person("John", 25),
    new Person("Alice", 50),
    new Person("Bob", 20)
);

Comparator<Person> byAge = new Comparator<Person>() {
    @Override
    public int compare(Person p1, Person p2) {
        return Integer.compare(p1.age, p2.age);
    }
};

Collections.sort(people, byAge);
System.out.println(people); // [Bob - 20, John - 25, Alice - 50]
```

The people are now sorted by age in ascending order.

### 💡 Insight

`Integer.compare(a, b)` is preferred over `a - b` for comparisons. The subtraction approach can overflow with very large or very small integers, while `Integer.compare()` is always safe.

---

## 🧩 Concept 3: Lambda Expressions for Sorting

### 🧠 What is it?

Since `Comparator` is a **functional interface** (it has exactly one abstract method), you can replace the entire anonymous class with a clean lambda expression.

### ❓ Why do we need it?

Because writing an entire anonymous class just to compare two fields is verbose. Lambda expressions make the same logic fit in a single line.

### ⚙️ How it works

Instead of creating a full `Comparator` object, pass a lambda directly:

```java
// Traditional comparator — verbose
Comparator<Person> byAge = new Comparator<Person>() {
    @Override
    public int compare(Person p1, Person p2) {
        return Integer.compare(p1.age, p2.age);
    }
};

// Lambda expression — clean and concise
Collections.sort(people, (p1, p2) -> Integer.compare(p1.age, p2.age));
```

### 🧪 Example

```java
List<Person> people = Arrays.asList(
    new Person("John", 25),
    new Person("Alice", 50),
    new Person("Bob", 20)
);

Collections.sort(people, (p1, p2) -> Integer.compare(p1.age, p2.age));
System.out.println(people); // [Bob - 20, John - 25, Alice - 50]
```

Same result, much less code.

### 💡 Insight

You can make it even cleaner using method references with `Comparator.comparing()`:

```java
Collections.sort(people, Comparator.comparing(Person::getAge));
```

---

## 🧩 Concept 4: Reverse Order Sorting

### 🧠 What is it?

Sometimes you need elements sorted in **descending order** instead of ascending. Java provides `Collections.reverseOrder()` to flip any comparator's order.

### ⚙️ How it works

Wrap your comparator with `Collections.reverseOrder()`:

```java
Collections.sort(people, Collections.reverseOrder(
    (p1, p2) -> Integer.compare(p1.age, p2.age)
));
```

### 🧪 Example

```java
Collections.sort(people, Collections.reverseOrder(
    (p1, p2) -> Integer.compare(p1.age, p2.age)
));
System.out.println(people); // [Alice - 50, John - 25, Bob - 20]
```

Now the oldest person comes first.

### 💡 Insight

You can also use `Comparator.reversed()` for the same effect:

```java
Collections.sort(people, Comparator.comparing(Person::getAge).reversed());
```

---

## ✅ Key Takeaways

- **Natural order sorting** uses `Collections.sort(list)` and relies on `Comparable`
- **Custom sorting** uses `Collections.sort(list, comparator)` with a `Comparator`
- `Comparator` is a functional interface — use **lambda expressions** for cleaner code
- Use `Collections.reverseOrder()` or `Comparator.reversed()` for descending order
- `Collections` is a utility **class** with static methods; `Collection` is the **interface**

## ⚠️ Common Mistakes

- Confusing `Collections` (utility class) with `Collection` (interface)
- Using `a - b` instead of `Integer.compare(a, b)` for comparisons — risks integer overflow
- Forgetting that `Collections.sort()` modifies the list **in-place** — it doesn't return a new list
- Trying to sort a list of objects that don't implement `Comparable` without providing a `Comparator`

## 💡 Pro Tips

- Prefer `Comparator.comparing()` with method references for the cleanest sorting code
- Chain comparators with `.thenComparing()` for multi-field sorting (e.g., sort by age, then by name)
- If you need an unmodifiable sorted copy, sort first, then wrap with `Collections.unmodifiableList()`
