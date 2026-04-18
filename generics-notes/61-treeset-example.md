# TreeSet Example

## Introduction

We just explored `HashSet` — fast but unordered. But what if you need your elements **sorted automatically**? Enter `TreeSet`, a `Set` implementation that keeps elements in **natural sorted order** (or a custom order you define). Every time you add an element, it's placed in the right position — like a self-organizing bookshelf.

---

## Concept 1: What is a TreeSet?

### 🧠 What is it?

A `TreeSet<E>` is an implementation of the `SortedSet` (and `NavigableSet`) interface backed by a **Red-Black tree** — a self-balancing binary search tree.

### ❓ Why do we need it?

Sometimes order matters. If you want to maintain a leaderboard of scores, display names alphabetically, or quickly find the minimum/maximum element, `TreeSet` handles all of this automatically.

### ⚙️ How it works

```java
import java.util.TreeSet;
import java.util.Set;

Set<Integer> scores = new TreeSet<>();
scores.add(85);
scores.add(92);
scores.add(78);
scores.add(92);  // duplicate — ignored

System.out.println(scores);  // [78, 85, 92] — always sorted!
```

### 💡 Insight

Unlike `HashSet` (O(1) average), `TreeSet` operations are **O(log n)** because it maintains a balanced tree structure. You trade speed for order.

| Feature | HashSet | TreeSet |
|---------|---------|---------|
| Order | No guarantee | Sorted |
| Performance | O(1) average | O(log n) |
| Null elements | Allows one null | No nulls (throws NPE) |
| Underlying structure | Hash table | Red-Black tree |

---

## Concept 2: Natural Ordering

### 🧠 What is it?

By default, a `TreeSet` sorts elements using their **natural ordering** — defined by the `Comparable` interface.

### ⚙️ How it works

```java
// Strings — alphabetical order
TreeSet<String> names = new TreeSet<>();
names.add("Charlie");
names.add("Alice");
names.add("Bob");
System.out.println(names);  // [Alice, Bob, Charlie]

// Integers — ascending numeric order
TreeSet<Integer> numbers = new TreeSet<>();
numbers.add(30);
numbers.add(10);
numbers.add(20);
System.out.println(numbers);  // [10, 20, 30]
```

For this to work, the element type must implement `Comparable<T>`. All Java wrapper types (`String`, `Integer`, `Double`, etc.) already do.

### ⚠️ Common Mistake

If you try to add objects that don't implement `Comparable` to a `TreeSet` without providing a `Comparator`, you'll get a `ClassCastException` at runtime — not at compile time.

---

## Concept 3: Custom Ordering with Comparator

### 🧠 What is it?

You can override the natural ordering by passing a `Comparator` to the `TreeSet` constructor.

### ⚙️ How it works

```java
// Reverse order
TreeSet<Integer> descending = new TreeSet<>(Comparator.reverseOrder());
descending.add(10);
descending.add(30);
descending.add(20);
System.out.println(descending);  // [30, 20, 10]

// Custom objects — sort by age
TreeSet<Person> byAge = new TreeSet<>(Comparator.comparingInt(Person::getAge));
byAge.add(new Person("Alice", 30));
byAge.add(new Person("Bob", 25));
byAge.add(new Person("Charlie", 35));

byAge.forEach(p -> System.out.println(p.getName() + " - " + p.getAge()));
// Bob - 25
// Alice - 30
// Charlie - 35
```

### 💡 Insight

When using a `Comparator`, the `TreeSet` uses the comparator — not `equals()` — to determine duplicates. If your comparator says two elements are "equal" (returns 0), the second one won't be added, even if `equals()` says they're different.

---

## Concept 4: Navigation Methods

### 🧠 What is it?

`TreeSet` implements `NavigableSet`, giving you powerful methods to navigate through the sorted elements — finding closest matches, subsets, and boundaries.

### ⚙️ How it works

```java
TreeSet<Integer> nums = new TreeSet<>(Arrays.asList(10, 20, 30, 40, 50));

// First and last
System.out.println(nums.first());   // 10
System.out.println(nums.last());    // 50

// Floor and ceiling (closest match)
System.out.println(nums.floor(25));    // 20 — greatest element ≤ 25
System.out.println(nums.ceiling(25));  // 30 — smallest element ≥ 25

// Lower and higher (strictly less/greater)
System.out.println(nums.lower(30));    // 20 — greatest element < 30
System.out.println(nums.higher(30));   // 40 — smallest element > 30

// Subset views
System.out.println(nums.headSet(30));         // [10, 20] — elements < 30
System.out.println(nums.tailSet(30));         // [30, 40, 50] — elements ≥ 30
System.out.println(nums.subSet(20, 40));      // [20, 30] — elements ≥ 20 and < 40

// Descending view
System.out.println(nums.descendingSet());     // [50, 40, 30, 20, 10]

// Poll (remove and return)
System.out.println(nums.pollFirst());  // 10 — removes and returns smallest
System.out.println(nums.pollLast());   // 50 — removes and returns largest
```

### 🧪 Real-World Example

Think of a hospital triage system. Patients arrive with severity scores. A `TreeSet` keeps them sorted. `first()` gives you the most critical patient. `ceiling(5)` finds the nearest patient with severity at least 5. `headSet(3)` returns all low-severity patients.

---

## Concept 5: TreeSet with Custom Objects

### 🧠 What is it?

To store custom objects in a `TreeSet`, the objects must be **comparable** — either via `Comparable` or a `Comparator`.

### ⚙️ How it works

**Option 1: Implement Comparable**

```java
public class Student implements Comparable<Student> {
    private String name;
    private double gpa;

    public Student(String name, double gpa) {
        this.name = name;
        this.gpa = gpa;
    }

    @Override
    public int compareTo(Student other) {
        return Double.compare(this.gpa, other.gpa);
    }

    @Override
    public String toString() {
        return name + " (" + gpa + ")";
    }
}
```

```java
TreeSet<Student> students = new TreeSet<>();
students.add(new Student("Alice", 3.8));
students.add(new Student("Bob", 3.5));
students.add(new Student("Charlie", 3.9));

System.out.println(students);
// [Bob (3.5), Alice (3.8), Charlie (3.9)]
```

**Option 2: Provide a Comparator**

```java
TreeSet<Student> byName = new TreeSet<>(Comparator.comparing(Student::getName));
```

### ⚠️ Common Mistake

If two students have the same GPA, `compareTo` returns 0, and `TreeSet` treats them as **duplicates** — the second student won't be added. To avoid losing elements, make the comparison more specific:

```java
@Override
public int compareTo(Student other) {
    int cmp = Double.compare(this.gpa, other.gpa);
    return cmp != 0 ? cmp : this.name.compareTo(other.name);
}
```

---

## ✅ Key Takeaways

- `TreeSet` keeps elements **automatically sorted** — either by natural order or a custom `Comparator`
- Backed by a **Red-Black tree** — all operations are **O(log n)**
- Does **not allow null** elements (would break comparison)
- Navigation methods (`floor`, `ceiling`, `headSet`, `tailSet`) are incredibly powerful
- For custom objects: implement `Comparable` or provide a `Comparator`
- Be careful: the comparator determines equality in a `TreeSet`, not `equals()`
