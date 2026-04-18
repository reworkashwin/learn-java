# Sorting Collections

## Introduction

Collections like `ArrayList` store elements in insertion order, but what if you need them sorted — alphabetically, numerically, or by some custom rule? Java provides built-in sorting through the `Collections.sort()` method and `List.sort()`. Let's understand how sorting works, what's required from your objects, and how to control the sort order.

---

## Concept 1: Sorting with Collections.sort()

### 🧠 What is it?

`Collections.sort()` is a static utility method that sorts a `List` **in place** — it modifies the original list rather than creating a new one.

### ⚙️ How it works

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

List<Integer> numbers = new ArrayList<>(List.of(5, 2, 8, 1, 9));
Collections.sort(numbers);
System.out.println(numbers);  // [1, 2, 5, 8, 9]

List<String> names = new ArrayList<>(List.of("Charlie", "Alice", "Bob"));
Collections.sort(names);
System.out.println(names);  // [Alice, Bob, Charlie]
```

### 💡 Insight

Under the hood, Java uses **TimSort** — a hybrid sorting algorithm combining merge sort and insertion sort. It's stable (equal elements maintain their relative position) and runs in **O(n log n)** time.

---

## Concept 2: The Comparable Interface — Natural Ordering

### 🧠 What is it?

For `Collections.sort()` to work, the elements must implement `Comparable<T>`. This interface defines a **natural ordering** — the "default" way objects of that type should be sorted.

### ❓ Why do we need it?

Java needs to know: "Is element A less than, equal to, or greater than element B?" The `Comparable` interface answers this question through its single method: `compareTo()`.

### ⚙️ How it works

```java
public interface Comparable<T> {
    int compareTo(T other);
}
```

- Returns **negative** → `this` comes before `other`
- Returns **zero** → they are equal
- Returns **positive** → `this` comes after `other`

All built-in types (`String`, `Integer`, `Double`, etc.) already implement `Comparable`.

### 🧪 Example with Custom Objects

```java
public class Employee implements Comparable<Employee> {
    private String name;
    private int salary;

    public Employee(String name, int salary) {
        this.name = name;
        this.salary = salary;
    }

    @Override
    public int compareTo(Employee other) {
        return Integer.compare(this.salary, other.salary);  // sort by salary ascending
    }

    @Override
    public String toString() {
        return name + " ($" + salary + ")";
    }
}
```

```java
List<Employee> team = new ArrayList<>();
team.add(new Employee("Alice", 75000));
team.add(new Employee("Bob", 60000));
team.add(new Employee("Charlie", 90000));

Collections.sort(team);
System.out.println(team);
// [Bob ($60000), Alice ($75000), Charlie ($90000)]
```

---

## Concept 3: Sorting with a Comparator — Custom Ordering

### 🧠 What is it?

What if you want to sort by something other than the natural order? A `Comparator<T>` lets you define **any sorting logic** without modifying the class itself.

### ❓ Why do we need it?

A class can have only one `compareTo()` method (one natural order). But you might want to sort employees by name sometimes, by salary other times, by hire date on Fridays. `Comparator` gives you unlimited sorting strategies.

### ⚙️ How it works

```java
// Sort by name instead of salary
Comparator<Employee> byName = new Comparator<Employee>() {
    @Override
    public int compare(Employee e1, Employee e2) {
        return e1.getName().compareTo(e2.getName());
    }
};

Collections.sort(team, byName);
System.out.println(team);
// [Alice ($75000), Bob ($60000), Charlie ($90000)]
```

### 💡 Insight

Since Java 8, you can use `List.sort()` directly — no need for `Collections.sort()`:

```java
team.sort(byName);  // same result, cleaner syntax
```

---

## Concept 4: Reversing the Sort Order

### 🧠 What is it?

Need descending order? Java makes it easy.

### ⚙️ How it works

```java
// Reverse natural order
Collections.sort(numbers, Collections.reverseOrder());
System.out.println(numbers);  // [9, 8, 5, 2, 1]

// Reverse a custom comparator
Collections.sort(team, byName.reversed());
// [Charlie ($90000), Bob ($60000), Alice ($75000)]
```

You can also reverse `Comparable` ordering by flipping the comparison:

```java
@Override
public int compareTo(Employee other) {
    return Integer.compare(other.salary, this.salary);  // descending
}
```

But using `Comparator.reverseOrder()` or `.reversed()` is cleaner and keeps the class's natural order intact.

---

## Concept 5: Multi-Level Sorting

### 🧠 What is it?

Sometimes you need to sort by one field first, then by another when there's a tie — like sorting employees by department, then by name within each department.

### ⚙️ How it works

```java
Comparator<Employee> byDeptThenName = Comparator
    .comparing(Employee::getDepartment)
    .thenComparing(Employee::getName);

team.sort(byDeptThenName);
```

You can chain as many `.thenComparing()` calls as needed. Each one acts as a tiebreaker for the previous level.

### ⚠️ Common Mistake

Don't subtract integers to compare them (`return a.salary - b.salary`). This can cause **integer overflow** if the values are large. Always use `Integer.compare()`, `Double.compare()`, or `Comparator.comparingInt()`.

---

## ✅ Key Takeaways

- `Collections.sort()` sorts a list in place using **TimSort** (O(n log n), stable)
- Elements must implement `Comparable<T>` for natural ordering
- Use `Comparator<T>` for custom or multiple sort orders
- `Collections.reverseOrder()` and `.reversed()` flip any sort order
- Chain comparators with `.thenComparing()` for multi-level sorting
- Always use `Integer.compare()` instead of subtraction to avoid overflow
