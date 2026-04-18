# HashSet Example

## Introduction

We've talked about the `Set` interface and what makes it special — no duplicate elements and no guaranteed order. Now let's get our hands dirty with the most commonly used implementation: **`HashSet`**. This is the go-to `Set` when you need fast lookups, insertions, and deletions — and you don't care about the order of elements.

---

## Concept 1: What is a HashSet?

### 🧠 What is it?

A `HashSet<E>` is an implementation of the `Set` interface backed by a **hash table** (actually a `HashMap` under the hood). It stores unique elements with no guaranteed iteration order.

### ❓ Why do we need it?

Imagine you're collecting email addresses for a newsletter. You don't want duplicates — if someone signs up twice, you still store them once. You also don't care about the order they signed up. `HashSet` is perfect for this.

### ⚙️ How it works

- When you add an element, Java computes its **hash code** to decide which "bucket" it goes into
- If two elements have the same hash code, it uses `equals()` to check for true duplicates
- This gives **O(1) average time** for `add()`, `remove()`, and `contains()`

```java
import java.util.HashSet;
import java.util.Set;

Set<String> emails = new HashSet<>();
emails.add("alice@example.com");
emails.add("bob@example.com");
emails.add("alice@example.com");  // duplicate — ignored

System.out.println(emails.size());  // 2
System.out.println(emails);         // [bob@example.com, alice@example.com] (order not guaranteed)
```

### 💡 Insight

The "Hash" in `HashSet` refers to **hashing** — a technique that converts an object into a numeric code (`hashCode()`) for fast bucket-based lookup. This is why `HashSet` is blazing fast but doesn't maintain order.

---

## Concept 2: Creating and Populating a HashSet

### 🧠 What is it?

There are several ways to create and fill a `HashSet`.

### ⚙️ How it works

```java
// 1. Create empty and add elements
Set<Integer> numbers = new HashSet<>();
numbers.add(10);
numbers.add(20);
numbers.add(30);

// 2. Create from another collection
List<Integer> list = Arrays.asList(1, 2, 3, 2, 1);
Set<Integer> unique = new HashSet<>(list);
System.out.println(unique);  // [1, 2, 3] — duplicates removed

// 3. Using Set.of() (immutable — Java 9+)
Set<String> immutable = Set.of("A", "B", "C");
// immutable.add("D");  // throws UnsupportedOperationException
```

### ⚠️ Common Mistake

`Set.of()` creates an **immutable** set. If you try to add or remove elements, you'll get an `UnsupportedOperationException`. If you need a mutable set from factory values, wrap it: `new HashSet<>(Set.of("A", "B", "C"))`.

---

## Concept 3: Core Operations

### 🧠 What is it?

The fundamental operations you'll use every day with `HashSet`: adding, removing, checking membership, and iterating.

### ⚙️ How it works

```java
Set<String> fruits = new HashSet<>();

// Adding
fruits.add("Apple");
fruits.add("Banana");
fruits.add("Cherry");

// Checking membership — O(1) average
boolean hasApple = fruits.contains("Apple");    // true
boolean hasMango = fruits.contains("Mango");    // false

// Removing
fruits.remove("Banana");

// Size and empty check
System.out.println(fruits.size());     // 2
System.out.println(fruits.isEmpty());  // false

// Iterating
for (String fruit : fruits) {
    System.out.println(fruit);
}

// Clearing all elements
fruits.clear();
```

### 💡 Insight

The `add()` method returns a `boolean` — `true` if the element was actually added, `false` if it was already present. This is a handy way to check for duplicates:

```java
if (!emails.add("alice@example.com")) {
    System.out.println("Duplicate email detected!");
}
```

---

## Concept 4: Set Operations (Union, Intersection, Difference)

### 🧠 What is it?

Sets support mathematical operations that are incredibly useful for comparing and combining datasets.

### ⚙️ How it works

```java
Set<Integer> setA = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5));
Set<Integer> setB = new HashSet<>(Arrays.asList(4, 5, 6, 7, 8));

// Union (all elements from both sets)
Set<Integer> union = new HashSet<>(setA);
union.addAll(setB);
System.out.println(union);  // [1, 2, 3, 4, 5, 6, 7, 8]

// Intersection (elements common to both)
Set<Integer> intersection = new HashSet<>(setA);
intersection.retainAll(setB);
System.out.println(intersection);  // [4, 5]

// Difference (elements in A but not in B)
Set<Integer> difference = new HashSet<>(setA);
difference.removeAll(setB);
System.out.println(difference);  // [1, 2, 3]
```

### 🧪 Real-World Example

You have two lists of student IDs — one for the math class and one for the science class. Want to find students taking both? **Intersection**. Students in math but not science? **Difference**. All students across both? **Union**.

---

## Concept 5: HashSet with Custom Objects

### 🧠 What is it?

When you put your own objects into a `HashSet`, you **must** override both `hashCode()` and `equals()`. Otherwise, the set can't properly detect duplicates.

### ❓ Why do we need it?

By default, Java uses the memory address for `hashCode()` and `equals()`. Two `Person` objects with the same name and age would be considered different — even though logically they represent the same person.

### ⚙️ How it works

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

```java
Set<Person> people = new HashSet<>();
people.add(new Person("Alice", 30));
people.add(new Person("Alice", 30));  // duplicate — ignored because equals/hashCode match

System.out.println(people.size());  // 1
```

### ⚠️ Common Mistake

Overriding `equals()` without overriding `hashCode()` (or vice versa) breaks the contract. Two objects that are `equal` **must** have the same `hashCode()`. Violating this means a `HashSet` might store "duplicates" because it uses `hashCode()` first to find the right bucket.

---

## ✅ Key Takeaways

- `HashSet` provides **O(1) average** performance for add, remove, and contains
- **No duplicates** — determined by `hashCode()` + `equals()`
- **No guaranteed order** of iteration
- Supports set math: `addAll()` (union), `retainAll()` (intersection), `removeAll()` (difference)
- Always override both `hashCode()` and `equals()` for custom objects
- `add()` returns `false` if the element already exists — useful for duplicate detection
