# Bounded Type Parameters — Solution

## Introduction

We've learned what bounded type parameters are and why they exist. Now let's put them into practice by solving a concrete problem: writing a generic method that only works with types that are **comparable** — so we can find minimums, maximums, and sort data safely.

---

## Concept 1: The Problem Recap

### 🧠 What is it?

Suppose you want to write a generic method that finds the **maximum** of three values. Without bounds, the compiler has no idea whether `T` supports comparison.

```java
// This does NOT compile
public static <T> T findMax(T a, T b, T c) {
    T max = a;
    if (b.compareTo(max) > 0) max = b;  // ERROR: compareTo undefined for T
    if (c.compareTo(max) > 0) max = c;
    return max;
}
```

### ❓ Why does it fail?

The type parameter `T` could be *anything* — a `String`, a `Thread`, a `FileInputStream`. The compiler can't guarantee that `T` has a `compareTo()` method, so it refuses to compile.

---

## Concept 2: The Solution — Upper Bound with `Comparable`

### 🧠 What is it?

By adding `extends Comparable<T>`, you tell the compiler: "T must implement the `Comparable` interface." Now the compiler knows that `compareTo()` is available.

### ⚙️ How it works

```java
public static <T extends Comparable<T>> T findMax(T a, T b, T c) {
    T max = a;
    if (b.compareTo(max) > 0) max = b;
    if (c.compareTo(max) > 0) max = c;
    return max;
}
```

### 🧪 Example

```java
System.out.println(findMax(3, 7, 5));           // 7
System.out.println(findMax("apple", "banana", "cherry"));  // cherry
System.out.println(findMax(1.1, 2.2, 0.5));     // 2.2
```

All of `Integer`, `String`, and `Double` implement `Comparable`, so they work. But if you try:

```java
findMax(new Thread(), new Thread(), new Thread());  // COMPILE-TIME ERROR
```

`Thread` doesn't implement `Comparable`, so the compiler rejects it immediately.

### 💡 Insight

`<T extends Comparable<T>>` is one of the most common bounds you'll see in Java. It means: "T is a type that can compare itself to other instances of the same type."

---

## Concept 3: Building a Generic Sorting Method

### 🧠 What is it?

With bounded types, we can write generic algorithms that work on any comparable type — like a simple bubble sort.

### ⚙️ How it works

```java
public static <T extends Comparable<T>> void sort(T[] array) {
    for (int i = 0; i < array.length - 1; i++) {
        for (int j = 0; j < array.length - 1 - i; j++) {
            if (array[j].compareTo(array[j + 1]) > 0) {
                T temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
    }
}
```

```java
Integer[] nums = {5, 2, 8, 1};
sort(nums);
System.out.println(Arrays.toString(nums));  // [1, 2, 5, 8]

String[] words = {"banana", "apple", "cherry"};
sort(words);
System.out.println(Arrays.toString(words));  // [apple, banana, cherry]
```

One method, multiple types, full type safety.

---

## Concept 4: Multiple Bounds

### 🧠 What is it?

Sometimes you need a type to satisfy **more than one constraint**. Java lets you specify multiple bounds using `&`.

### ⚙️ How it works

```java
public static <T extends Number & Comparable<T>> T findMin(T a, T b) {
    return a.compareTo(b) <= 0 ? a : b;
}
```

Here, `T` must:
1. Extend `Number` (so you can call `doubleValue()`, `intValue()`, etc.)
2. Implement `Comparable<T>` (so you can compare values)

### 🧪 Example

```java
System.out.println(findMin(10, 20));     // 10 — Integer extends Number & implements Comparable
System.out.println(findMin(3.14, 2.71)); // 2.71 — Double also satisfies both bounds
```

```java
findMin("hello", "world");  // COMPILE-TIME ERROR — String is not a Number
```

### ⚠️ Rules for multiple bounds

- A **class** bound must come first: `<T extends SomeClass & Interface1 & Interface2>`
- You can have **at most one class** but **multiple interfaces**
- The `&` symbol is used (not commas — commas separate type parameters)

---

## Concept 5: Real-World Analogy

Think of a job posting that says: "Must have a degree in Computer Science **and** 3 years of experience." The bounded type parameter is the same idea — your type must meet **all** the listed requirements to qualify.

---

## ✅ Key Takeaways

- `<T extends Comparable<T>>` constrains T to types that can compare themselves
- This enables writing generic sorting, searching, and min/max algorithms
- Multiple bounds use `&`: `<T extends Number & Comparable<T>>`
- Class bounds must come before interface bounds
- Bounds are checked at compile time — wrong types are rejected immediately

## ⚠️ Common Mistakes

- Forgetting the bound and trying to call `compareTo()` on an unbounded `T`
- Using commas instead of `&` for multiple bounds — commas separate type parameters, `&` separates bounds
- Placing an interface bound before a class bound — the class must come first

## 💡 Pro Tip

If you look at the signature of `Collections.sort()`, you'll see: `<T extends Comparable<? super T>>`. The `? super T` part allows sorting a list of `T` even if the `compareTo()` method is defined in a superclass of `T`. This is a more flexible version of the pattern we've learned here.
