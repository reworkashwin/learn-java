# Generic Types — The Diamond Operator and Type Safety

## Introduction

We've seen why method overloading isn't enough. Now it's time to build our first generic class. This lecture covers the **diamond operator**, the difference between raw types and generic types, and — most importantly — how generics enforce **type safety** by turning runtime exceptions into compile-time errors.

---

## Concept 1: The Naive Approach — Using `Object`

### 🧠 What is it?

Since `Object` is the parent class of every class in Java, you might think: "Why not just use `Object` as the type and store anything?"

```java
public class Store {
    private Object item;

    public void setItem(Object item) {
        this.item = item;
    }

    public Object getItem() {
        return this.item;
    }
}
```

### ⚙️ How it works

```java
Store store = new Store();
store.setItem(42);                           // stores an Integer (autoboxed)
int item = (int) store.getItem();            // works — but requires casting
System.out.println("Item: " + item);         // prints 42
```

You can also store a `double`:

```java
store.setItem(3.14);
double value = (double) store.getItem();     // works fine
```

### ❓ What's the problem?

Watch what happens when types don't match:

```java
store.setItem(3.14f);                        // stores a Float
double value = (double) store.getItem();     // RUNTIME EXCEPTION!
// ClassCastException: Float cannot be cast to Double
```

There's **no compile-time error** — the code looks perfectly fine. But at runtime, it explodes with a `ClassCastException`.

This is exactly the kind of bug generics are designed to prevent.

---

## Concept 2: The Diamond Operator

### 🧠 What is it?

The diamond operator `<>` is how you declare a generic type parameter on a class. It tells Java: "This class works with a type that will be specified later."

### ⚙️ How it works

```java
public class Store<T> {
    private T item;

    public void setItem(T item) {
        this.item = item;
    }

    public T getItem() {
        return this.item;
    }
}
```

Key points about the syntax:
- **`<T>`** after the class name declares the type parameter
- **`T`** is a placeholder — it gets replaced with a real type when you create an instance
- By convention, single uppercase letters are used: `T`, `U`, `V`, `E`, `K`

### 💡 Insight

Without the diamond operator in the class declaration, using `T` as a type anywhere in the class will cause a compile-time error. The `<T>` on the class is what "registers" the generic type.

---

## Concept 3: Using the Generic Class

### ⚙️ How it works

```java
// Specify the type when creating the instance
Store<String> store = new Store<>();
store.setItem("Hello");
String value = store.getItem();   // no casting needed!
```

Notice:
- The left side declares `Store<String>` — "this store holds strings"
- The right side uses the empty diamond `<>` — Java infers the type (type inference)
- `getItem()` returns `String` directly — no casting required

### 🧪 Example — Type Safety in Action

```java
Store<String> store = new Store<>();
store.setItem("Hello");
int value = (int) store.getItem();  // COMPILE-TIME ERROR!
```

With generics, the compiler **immediately** catches the mistake. Compare this to the `Object` approach where the same mistake would only crash at runtime.

```java
Store<Double> store = new Store<>();
store.setItem("oops");              // COMPILE-TIME ERROR!
// Cannot insert a String into a Store<Double>
```

---

## Concept 4: Raw Types vs. Generic Types

### 🧠 What is a raw type?

A raw type is when you use a generic class **without specifying the type parameter**:

```java
Store store = new Store();  // raw type — no <T> specified
```

This is essentially the `Object`-based approach we started with. It compiles, but you lose all type safety.

### ⚠️ Why raw types are dangerous

Raw types exist for backward compatibility with pre-Java-5 code. In modern Java, **never use raw types**. They give you the worst of both worlds — no compile-time checks, and potential runtime crashes.

---

## Concept 5: What Happens Under the Hood — Type Erasure (Preview)

### 💡 Insight

Here's a surprising fact: **the compiled bytecode contains no generic type information**. Java replaces all generic types with `Object` (or the upper bound) during compilation. This process is called **type erasure**.

So why bother with generics if they disappear at runtime?

Because generics give you **compile-time type checking**. The compiler verifies everything is type-safe before the generic types are erased. You get the safety of strong typing during development, and the flexibility of `Object` at runtime.

---

## ⚠️ Common Mistakes

- Using raw types (`Store store = new Store()`) — always specify the type parameter
- Forgetting that the diamond operator goes on the **class declaration** and the **instantiation**
- Thinking you need to specify the type on both sides — `new Store<>()` with empty diamond is sufficient
- Confusing the diamond operator `<>` with the less-than/greater-than operators

## ✅ Key Takeaways

- `Object`-based storage compiles but fails at runtime with `ClassCastException`
- The diamond operator `<T>` declares a type parameter on a class
- Generic types enforce **type safety** — wrong types cause compile-time errors, not runtime crashes
- No type casting is needed when using generics
- Raw types bypass all generic safety checks — avoid them
- Under the hood, generics use type erasure — generic types are removed at compile time

## 💡 Pro Tip

After Java 10, you can use `var` for local variable type inference:

```java
var store = new Store<String>();
```

Java infers that `store` is of type `Store<String>`. This works nicely with generics to reduce verbosity while maintaining full type safety.
