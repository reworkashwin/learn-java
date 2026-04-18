# Bounded Type Parameters — Practical Example

## Introduction

We've learned the theory of bounded types. Now let's build something real — a `minimum()` method that finds the smaller of two values. It works with integers, doubles, strings, and even custom objects like `Person`. This example brings bounded type parameters to life.

---

## Concept 1: Building the `minimum()` Method

### ❓ Why can't we just use `<` and `>`?

Our first instinct might be:

```java
public <T> T minimum(T item1, T item2) {
    if (item1 < item2) return item1;  // COMPILE ERROR!
    return item2;
}
```

This fails because:
- `<` and `>` only work with primitive numbers
- What if `T` is a `String`? You can't use `<` on strings
- What if `T` is a `Person`? How would Java compare two people?

### ⚙️ The Solution — Bounded Types with `Comparable`

```java
public static <T extends Comparable<T>> T minimum(T item1, T item2) {
    if (item1.compareTo(item2) < 0) {
        return item1;
    }
    return item2;
}
```

Let's break this down:

| Part | Meaning |
|------|---------|
| `<T extends Comparable<T>>` | T must implement `Comparable` — so it can be compared |
| `Comparable<T>` | The `Comparable` interface is itself generic — we compare T with T |
| `item1.compareTo(item2)` | Returns: `-1` (less), `0` (equal), `+1` (greater) |

### 💡 Insight — The `compareTo()` contract

The `Comparable` interface has one method: `compareTo()`. It returns:
- **Negative** (e.g., -1) → the first object is **smaller**
- **Zero** (0) → the objects are **equal**
- **Positive** (e.g., +1) → the first object is **larger**

---

## Concept 2: Using with Built-in Types

### 🧪 Examples

**Integers:**
```java
System.out.println(NumberUtils.minimum(10, 34));  // 10
```

**Doubles:**
```java
System.out.println(NumberUtils.minimum(1.5, 10.4));  // 1.5
```

**Strings:**
```java
System.out.println(NumberUtils.minimum("Kevin", "Anna"));  // "Anna"
```

Strings are compared alphabetically — "Anna" comes before "Kevin", so Anna is the "minimum."

All three work because `Integer`, `Double`, and `String` all implement `Comparable`.

---

## Concept 3: Using with Custom Objects

### ❓ What happens with a custom class?

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

If we try:

```java
Person p1 = new Person("Kevin", 12);
Person p2 = new Person("Anna", 25);
NumberUtils.minimum(p1, p2);   // COMPILE ERROR!
```

This fails because `Person` **doesn't implement `Comparable`**. The bound requires it.

### ⚙️ Making Person Comparable

```java
public class Person implements Comparable<Person> {

    private String name;
    private int age;

    // constructor, getters...

    @Override
    public int compareTo(Person other) {
        return Integer.compare(this.age, other.getAge());
    }

    @Override
    public String toString() {
        return name + " (age: " + age + ")";
    }
}
```

Key decisions:
- We chose to compare by **age** — but we could compare by name, height, anything
- `Integer.compare(a, b)` returns -1, 0, or +1 — perfect for `compareTo()`

### 🧪 Example

```java
Person p1 = new Person("Kevin", 12);
Person p2 = new Person("Anna", 25);
System.out.println(NumberUtils.minimum(p1, p2));
// Kevin (age: 12) — Kevin is "smaller" because 12 < 25
```

Change Kevin's age to 98:

```java
Person p1 = new Person("Kevin", 98);
Person p2 = new Person("Anna", 25);
System.out.println(NumberUtils.minimum(p1, p2));
// Anna (age: 25) — Anna is now the "minimum"
```

---

## Concept 4: The Power of This Pattern

### 💡 Insight

Look at what we achieved with a **single method**:

```java
public static <T extends Comparable<T>> T minimum(T item1, T item2)
```

This one method works with:
- ✅ `Integer`
- ✅ `Double`
- ✅ `String`
- ✅ `Person` (or any custom class that implements `Comparable`)

Without generics, you'd need four separate methods. With bounded generics, you write it once.

> The bound `extends Comparable<T>` acts like a contract: "I don't care what type you give me, as long as it knows how to compare itself."

---

## ⚠️ Common Mistakes

- Forgetting that `Comparable` is generic — use `Comparable<T>`, not raw `Comparable`
- Using `<` or `>` operators with generic types — these only work with primitives
- Not implementing `Comparable` in custom classes before passing them to bounded methods
- Implementing `compareTo()` inconsistently (e.g., not following the -1/0/+1 contract)

## ✅ Key Takeaways

- You can't use `<` and `>` on generic types — use `compareTo()` through the `Comparable` bound
- `compareTo()` returns negative (smaller), zero (equal), or positive (larger)
- Built-in types like `Integer`, `Double`, `String` already implement `Comparable`
- Custom classes must explicitly `implement Comparable<T>` and define the comparison logic
- One bounded generic method replaces many type-specific methods

## 💡 Pro Tip

When implementing `Comparable` in your classes, use `Integer.compare()`, `Double.compare()`, or `String.compareTo()` instead of manual subtraction. Manual subtraction (`a - b`) can overflow with large numbers and is a common source of subtle bugs.
