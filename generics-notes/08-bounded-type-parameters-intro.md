# Bounded Type Parameters — Introduction

## Introduction

So far, our generic types have been completely open — any type can be used. But what if you're writing a math method that should only work with numbers? Or a sorting method that requires comparable objects? You need a way to **restrict** which types are allowed. That's exactly what bounded type parameters do.

---

## Concept 1: The Problem — Too Much Freedom

### 🧠 What is it?

By default, a generic type `T` can be **anything** — `String`, `Integer`, `Person`, `Car`. But sometimes that's too flexible.

### ❓ Why is this a problem?

Consider a method that performs a mathematical operation. It makes sense with `Integer`, `Float`, and `Double` — but what about `String` or a custom `Car` class? You can't do math on strings.

Without restrictions, nothing stops someone from passing a `String` to a method that expects numbers. The result? Either a confusing compile error deep in the method, or worse, a runtime failure.

---

## Concept 2: Bounded Type Parameters with `extends`

### 🧠 What is it?

A bounded type parameter puts a **constraint** on the generic type. You say: "T must be a subclass of X" or "T must implement interface Y."

### ⚙️ How it works

```java
public <T extends Comparable<T>> T findMin(T item1, T item2) {
    // T is guaranteed to have the compareTo() method
}
```

The syntax: `T extends SomeClassOrInterface`

### 💡 Important: `extends` for both classes AND interfaces

This is a common source of confusion. In regular Java:
- You **extend** a class: `class Dog extends Animal`
- You **implement** an interface: `class Dog implements Comparable`

But in bounded generics, you **always use `extends`** — even for interfaces:

```java
<T extends Comparable<T>>   // Comparable is an interface, but we use "extends"
```

> Think of `extends` in generics as meaning "is a type of" — whether it's a class or interface.

---

## Concept 3: Why Bounds Enable Method Calls

### 🧠 What is it?

Without a bound, Java only knows that `T` is some `Object`. So you can only call methods defined on `Object` (like `toString()`). But with a bound, Java knows that `T` has all the methods of the bound.

### 🧪 Example

```java
// Without bound — can't call compareTo()
public <T> T findMin(T a, T b) {
    a.compareTo(b);  // COMPILE ERROR — Object doesn't have compareTo()
}

// With bound — compareTo() is guaranteed
public <T extends Comparable<T>> T findMin(T a, T b) {
    a.compareTo(b);  // Works! T is known to implement Comparable
}
```

---

## Concept 4: Multiple Bounds

### 🧠 What is it?

You can specify **multiple constraints** on a generic type using the `&` operator:

```java
<T extends Number & Comparable<T> & Serializable>
```

This means T must:
1. Be a subclass of `Number`
2. Implement `Comparable<T>`
3. Implement `Serializable`

### ⚠️ Rule for multiple bounds

If one of the bounds is a **class** (not an interface), it must come **first**:

```java
<T extends Number & Comparable<T>>   // ✅ Class first, then interfaces
<T extends Comparable<T> & Number>   // ❌ Compile error — class must be first
```

Why must the class come first? Java allows only **single class inheritance**, so there can be at most one class bound. By requiring it first, the compiler can immediately verify there's only one class and parse the remaining bounds as interfaces — making the syntax unambiguous.

---

## ⚠️ Common Mistakes

- Using `implements` instead of `extends` for interfaces in bounds — always use `extends`
- Forgetting that `Comparable` is itself generic — use `Comparable<T>`, not just `Comparable`
- Putting the class bound after an interface bound — the class must come first in multiple bounds

## ✅ Key Takeaways

- Bounded type parameters **restrict** which types can be used as generic arguments
- Syntax: `<T extends SomeType>` — works for both classes and interfaces
- Bounds let you call methods defined in the bound type (e.g., `compareTo()` from `Comparable`)
- Multiple bounds use `&`: `<T extends Number & Comparable<T>>`
- Class bounds must come before interface bounds

## 💡 Pro Tip

When you want your generic method to **do something** with the type (compare, calculate, serialize), you need a bound. If you only need to store or pass the type around, an unbounded `<T>` is fine. The bound tells the compiler: "I promise this type can do X."
