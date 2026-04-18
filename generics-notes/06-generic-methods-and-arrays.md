# Generic Methods and Generic Arrays

## Introduction

We've learned to create generic methods that accept single or multiple parameters. But what about **arrays** of generic types? This lecture explores how generics work with arrays — and reveals an important limitation that hints at a deeper concept called **type erasure**.

---

## Concept 1: Passing Generic Arrays as Parameters

### 🧠 What is it?

You can create a generic method that accepts a **one-dimensional array** of a generic type as its parameter. This lets you write methods that work with arrays of any type.

### ⚙️ How it works

```java
public <T> void print(T[] array) {
    for (T element : array) {
        System.out.println(element);
    }
}
```

The key syntax: `T[]` — an array of generic type T.

### 🧪 Example

**With strings:**

```java
String[] names = {"Anna", "Kevin", "Joe", "Daniel"};
genericClass.print(names);
// Anna
// Kevin
// Joe
// Daniel
```

**With integers:**

```java
Integer[] numbers = {1, 20, 34, 3, 0};
genericClass.print(numbers);
// 1
// 20
// 34
// 3
// 0
```

Java is smart enough to figure out the type from the array you pass — it's `String` in the first case, `Integer` in the second.

---

## Concept 2: Primitive Types Are NOT Supported

### 🧠 What is it?

This is a critical rule: **Java generics do not support primitive types**. You must use their wrapper classes instead.

### ⚙️ What this means

```java
int[] primitiveArray = {1, 2, 3};
genericClass.print(primitiveArray);    // COMPILE ERROR!

Integer[] wrapperArray = {1, 2, 3};
genericClass.print(wrapperArray);      // Works fine
```

### ❓ Why can't we use primitives?

This connects to **type erasure** — a concept we'll explore in detail later. Here's the short version:

1. At compile time, all generic types are replaced with `Object`
2. So `T[]` becomes `Object[]` at runtime
3. Primitive types like `int`, `float`, `double` are **not objects**
4. Therefore, an `int[]` cannot be stored as an `Object[]`

This is why you must use wrapper classes: `Integer`, `Float`, `Double`, `Long`, etc.

| Primitive | Wrapper Class |
|-----------|---------------|
| `int` | `Integer` |
| `float` | `Float` |
| `double` | `Double` |
| `long` | `Long` |
| `boolean` | `Boolean` |
| `char` | `Character` |

---

## Concept 3: You Cannot Create Generic Arrays

### 🧠 What is it?

Here's a surprising limitation — you **cannot instantiate** a generic array:

```java
T[] values = new T[10];   // COMPILE ERROR!
```

### ❓ Why not?

At runtime, Java doesn't know what `T` actually is (because of type erasure). So it can't safely allocate memory for an array of an unknown type.

- Passing a `T[]` as a parameter? ✅ Works — the actual type is known at the call site
- Creating a `new T[]` inside a method? ❌ Fails — Java has no type information at runtime

### 💡 Insight

This is the first hint that generics are more nuanced than they first appear:

| Operation | Allowed? |
|-----------|----------|
| Use `T` as a field variable | ✅ |
| Use `T` as a method parameter | ✅ |
| Accept `T[]` as a method parameter | ✅ |
| Create `new T[10]` | ❌ |
| Create `new T()` | ❌ |

---

## ⚠️ Common Mistakes

- Using `int[]` instead of `Integer[]` with generic methods — primitives aren't supported
- Trying to create `new T[size]` inside a generic method — this won't compile
- Assuming generics work the same at runtime as at compile time — type erasure changes everything

## ✅ Key Takeaways

- Generic methods can accept arrays: `<T> void print(T[] array)`
- Java generics **do not support primitive types** — use wrapper classes (`Integer`, `Double`, etc.)
- You **cannot create** a generic array with `new T[n]`
- These limitations exist because of **type erasure** — generic types are replaced with `Object` at compile time
- Passing a `T[]` works because the caller provides the actual typed array

## 💡 Pro Tip

When you encounter a limitation of generics (like not being able to create `new T[]`), the answer almost always traces back to type erasure. Understanding type erasure is the key to mastering generics — and it's coming up in a later lecture.
