# 📘 Comparators and Comparables

## 📌 Introduction

Sorting is one of the most common operations you'll perform on collections. Sorting numbers or strings is straightforward — Java handles it out of the box. But what about sorting a list of **custom objects**? How does Java know whether to sort students by name, age, or grade?

That's where `Comparable` and `Comparator` come in. These two interfaces give you control over **how objects are compared and sorted**. Let's understand when and why you'd use each.

---

## 🧩 Concept 1: The Comparable Interface — Natural Ordering

### 🧠 What is it?

When a class implements `Comparable`, it defines a **natural ordering** for its objects. The `Comparable` interface lives in the `java.lang` package and has a single method: `compareTo()`.

Think of `Comparable` as embedding the sorting logic **inside the class itself**. The class declares: "This is how my objects should be compared by default."

### ❓ Why do we need it?

Without `Comparable`, you can't pass custom objects to `Collections.sort()` or `Arrays.sort()`. These methods require the elements to be mutually comparable. If your class doesn't implement `Comparable`, you'll get a compile-time error.

### ⚙️ How it works

The `compareTo(T other)` method returns:
- **Negative integer** → current object is **less than** the other
- **Zero** → objects are **equal**
- **Positive integer** → current object is **greater than** the other

```java
public interface Comparable<T> {
    int compareTo(T o);
}
```

### 🧪 Example

```java
class Student implements Comparable<Student> {
    String name;
    int age;

    Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.age, other.age); // Sort by age
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

// Usage
List<Student> students = new ArrayList<>();
students.add(new Student("Alice", 23));
students.add(new Student("Bob", 21));
students.add(new Student("Charlie", 22));

Collections.sort(students); // Uses compareTo() internally

System.out.println("Sorted by age: " + students);
// Output: Sorted by age: [Bob(21), Charlie(22), Alice(23)]
```

### 💡 Insight

`Integer.compare(a, b)` is the clean way to compare integers. It handles all edge cases correctly. Avoid the temptation to write `return this.age - other.age` — that can overflow with extreme values.

---

## 🧩 Concept 2: Limitation of Comparable — Single Sorting Criteria

### 🧠 What is it?

`Comparable` defines **one and only one** natural ordering for a class. If you implement `compareTo()` to sort by age, that's the only sorting you get. Want to sort by name instead? You'd have to **change the class** itself.

### ❓ Why is this a problem?

In real-world applications, you often need to sort the same data in **multiple ways**:
- Sort employees by name, then by salary, then by department
- Sort products by price, then by rating, then by name

You can't define all these orderings with `Comparable` — it only allows one.

### 🧪 Example

```java
// If compareTo sorts by age:
@Override
public int compareTo(Student other) {
    return Integer.compare(this.age, other.age);
}

// Want to sort by name instead? You'd have to CHANGE the method:
@Override
public int compareTo(Student other) {
    return this.name.compareTo(other.name);
}

// You can't have BOTH at the same time with Comparable
```

### 💡 Insight

This limitation is exactly why `Comparator` was created — to define sorting logic **outside** the class, allowing multiple sort orders without modifying the original class.

---

## 🧩 Concept 3: The Comparator Interface — Multiple Sorting Orders

### 🧠 What is it?

`Comparator` is a separate interface (from `java.util` package) that lets you define **external sorting logic**. Unlike `Comparable`, which lives inside the class, `Comparator` is defined outside — in a separate class, anonymous class, or lambda expression.

### ❓ Why do we need it?

`Comparator` solves the one-sort-order limitation of `Comparable`. You can create as many comparators as you need — one for sorting by name, another for sorting by age, another for sorting by salary — **without touching the original class**.

### ⚙️ How it works

The `Comparator` interface has a `compare(T o1, T o2)` method that takes **two objects** and returns:
- **Negative** → `o1` comes before `o2`
- **Zero** → they're equal
- **Positive** → `o1` comes after `o2`

### 🧪 Example — Separate Comparator Classes

```java
class NameComparator implements Comparator<Student> {
    @Override
    public int compare(Student s1, Student s2) {
        return s1.name.compareTo(s2.name); // Sort by name
    }
}

class AgeComparator implements Comparator<Student> {
    @Override
    public int compare(Student s1, Student s2) {
        return Integer.compare(s1.age, s2.age); // Sort by age
    }
}
```

### 💡 Insight

Notice the difference: `Comparable.compareTo()` compares `this` with another object (one parameter). `Comparator.compare()` compares **two external objects** (two parameters). `Comparable` is "I know how to compare myself." `Comparator` is "I know how to compare any two objects."

---

## 🧩 Concept 4: Chaining Comparators — Multi-Level Sorting

### 🧠 What is it?

One of the most powerful features of `Comparator` is **chaining** — sorting by a primary criterion, then by a secondary criterion when the primary values are equal.

### ❓ Why do we need it?

Imagine you have multiple students named "Alice" with different ages. If you sort by name only, their relative order is undefined. Chaining lets you say: "Sort by name first. If names are equal, then sort by age."

### ⚙️ How it works

Use the `thenComparing()` method to chain comparators:

```java
Comparator<Student> nameComparator = new NameComparator();
Comparator<Student> nameThenAge = nameComparator.thenComparing(new AgeComparator());

Collections.sort(students, nameThenAge);
```

### 🧪 Example

```java
List<Student> students = new ArrayList<>();
students.add(new Student("Alice", 23));
students.add(new Student("Alice", 21));
students.add(new Student("Bob", 24));
students.add(new Student("Charlie", 22));
students.add(new Student("Bob", 20));
students.add(new Student("Alice", 50));

Comparator<Student> nameThenAge = new NameComparator()
    .thenComparing(new AgeComparator());

Collections.sort(students, nameThenAge);

for (Student s : students) {
    System.out.println(s);
}
```

**Output:**
```
Alice(21)
Alice(23)
Alice(50)
Bob(20)
Bob(24)
Charlie(22)
```

### 💡 Insight

All three Alices are grouped together and sorted by age within the group. Same for the two Bobs. This kind of **multi-level sorting** is not possible with `Comparable` alone — it's a killer feature of `Comparator`.

---

## 🧩 Concept 5: Lambda Expressions with Comparator

### 🧠 What is it?

Instead of creating separate comparator classes, you can use **lambda expressions** to define sorting logic inline. This dramatically reduces boilerplate code.

### ❓ Why do we need it?

Creating a full class just to sort by one field feels like overkill. Lambda expressions let you define the comparator right where you use it — concise and readable.

### ⚙️ How it works

`Comparator.comparing()` is a static factory method that creates a comparator from a key extractor function. You pass a lambda that extracts the field to sort by.

### 🧪 Example

```java
// Without lambda (verbose)
class NameComparator implements Comparator<Student> {
    @Override
    public int compare(Student s1, Student s2) {
        return s1.name.compareTo(s2.name);
    }
}

// With lambda (concise) — equivalent!
Comparator<Student> nameThenAge = Comparator
    .comparing((Student s) -> s.name)
    .thenComparing((Student s) -> s.age);

Collections.sort(students, nameThenAge);
```

Both produce the exact same result, but the lambda version eliminates the need for separate `NameComparator` and `AgeComparator` classes entirely.

### 💡 Insight

`Comparator.comparing()` defines the **primary** sort. Each `thenComparing()` adds a **secondary** (or tertiary, etc.) sort. You can chain as many as you need. This is arguably the most elegant sorting API in Java.

---

## 🧩 Concept 6: When to Use Comparable vs Comparator

### 🧠 Decision Guide

| Scenario | Use |
|----------|-----|
| One obvious, default sort order (e.g., age for students) | `Comparable` |
| Multiple sort orders needed (by name, age, salary) | `Comparator` |
| Can't modify the class (third-party library) | `Comparator` |
| Sorting logic should live inside the class | `Comparable` |
| Sorting logic should be external/reusable | `Comparator` |
| Need multi-level sorting (sort by X, then Y) | `Comparator` with `thenComparing()` |

### 💡 Insight

In practice, many developers implement `Comparable` for the most natural default ordering (like alphabetical for strings) and use `Comparator` for any alternative orderings. They're not mutually exclusive — you can use both in the same class.

---

## ✅ Key Takeaways

- **`Comparable`** defines a **single natural ordering** inside the class via `compareTo()` — one sort order per class
- **`Comparator`** defines **external sorting logic** via `compare()` — unlimited sort orders without modifying the class
- `Comparator.comparing()` + `thenComparing()` enables elegant **multi-level sorting**
- **Lambda expressions** eliminate the need for separate comparator classes
- `Collections.sort(list)` requires `Comparable`; `Collections.sort(list, comparator)` uses `Comparator`

## ⚠️ Common Mistakes

- Forgetting to implement `Comparable` and then wondering why `Collections.sort()` throws an error
- Using `this.age - other.age` in `compareTo()` instead of `Integer.compare()` — the subtraction approach can overflow
- Creating full classes for simple comparators when a lambda would suffice
- Confusing `compareTo()` (one parameter, inside the class) with `compare()` (two parameters, outside the class)

## 💡 Pro Tips

- Use `Comparator.comparing()` with method references for maximum readability: `Comparator.comparing(Student::getName)`
- For reverse sorting, chain `.reversed()`: `Comparator.comparing(Student::getAge).reversed()`
- `Comparable` is used by `TreeSet` and `TreeMap` for element ordering — if your objects go into these collections, implement `Comparable`
- In interviews, always mention: `Comparable` = natural ordering inside class; `Comparator` = custom ordering outside class
