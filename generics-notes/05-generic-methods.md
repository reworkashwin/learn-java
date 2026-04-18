# Generic Methods

## Introduction

So far, we've made entire **classes** generic. But what if you only need a single method to be generic — without making the whole class generic? That's where **generic methods** come in. This lecture covers how to declare them, use multiple type parameters, and return generic types.

---

## Concept 1: Declaring a Generic Method

### 🧠 What is it?

A generic method is a method that introduces its **own type parameter**, independent of the class. The type parameter is declared in a diamond operator **before the return type**.

### ⚙️ How it works

```java
public class GenericClass {
    public <T> void show(T item) {
        System.out.println("Item: " + item.toString());
    }
}
```

Let's break down the syntax piece by piece:

| Part | Meaning |
|------|---------|
| `public` | access modifier |
| `<T>` | declares the generic type — **this is NOT the return type** |
| `void` | return type (no return value) |
| `show` | method name |
| `T item` | parameter of generic type T |

### ❓ Why the `<T>` before the return type?

This is how you **notify Java** that this method uses a generic type. Without it, Java doesn't know what `T` is and you'll get a compile-time error.

> A common beginner confusion: `<T>` looks like it might be the return type. It's not. The return type comes **after** it (in this case, `void`).

### 🧪 Example

```java
GenericClass gc = new GenericClass();
gc.show(42);          // T is Integer → prints "Item: 42"
gc.show(3.14f);       // T is Float  → prints "Item: 3.14"
gc.show("Hello");     // T is String → prints "Item: Hello"
```

One method handles integers, floats, and strings — no overloading needed.

---

## Concept 2: Multiple Generic Type Parameters

### 🧠 What is it?

A method can accept **multiple generic types** by declaring them all in the diamond operator.

### ⚙️ How it works

```java
public <T, V> void show(T item1, V item2) {
    System.out.println("Item 1: " + item1.toString());
    System.out.println("Item 2: " + item2.toString());
}
```

- `T` and `V` are two independent type parameters
- `item1` can be any type, `item2` can be a completely different type
- Both must be declared in `<T, V>`

### 🧪 Example

```java
gc.show("Adam", 32);
// Item 1: Adam    (String)
// Item 2: 32      (Integer)
```

---

## Concept 3: Returning a Generic Type

### 🧠 What is it?

A generic method can also **return** a value of the generic type. The return type in the method signature is the generic type itself.

### ⚙️ How it works

```java
public <T> T show(T item) {
    System.out.println("Item: " + item.toString());
    return item;
}
```

Reading this signature left to right:
1. `<T>` — "this method uses a generic type T"
2. `T` — "the return type is T"
3. `show(T item)` — "it accepts a parameter of type T"

### 🧪 Example

```java
String result = gc.show("Apple");
System.out.println(result);  // "Apple"
```

The method prints "Item: Apple" internally, then returns the same item. The return type is automatically inferred as `String` because we passed a `String`.

---

## Concept 4: Generic Methods vs. Generic Classes

### 💡 Insight

| Feature | Generic Class | Generic Method |
|---------|--------------|----------------|
| Type declared on | Class definition: `class Store<T>` | Method definition: `<T> void show(T item)` |
| Scope | Type applies to the **entire class** | Type applies to **that method only** |
| When to use | When the type is used across multiple fields/methods | When only one method needs to be generic |

You can even have generic methods inside a non-generic class — the method's type parameter is completely independent.

---

## ⚠️ Common Mistakes

- Forgetting the `<T>` declaration before the return type — this causes a "cannot find symbol" error
- Confusing `<T>` (type declaration) with the return type — they're separate
- Using `T` in the method body without declaring it in `<T>` — the type must be "registered" first
- Not calling `toString()` when printing generic objects — always use `.toString()` for safe string conversion

## ✅ Key Takeaways

- Generic methods declare their own type parameter with `<T>` **before** the return type
- This `<T>` is **not** the return type — it's the type declaration
- Methods can have multiple generic types: `<T, V>`
- Generic methods can return the generic type: `<T> T methodName(T param)`
- Generic methods and generic classes are independent — you can use either or both

## 💡 Pro Tip

Use generic methods when you want a **single method** to be flexible without committing the entire class to being generic. This is especially common for utility methods like comparisons, sorting, and data transformations.
