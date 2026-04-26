# Why Can't Primitive Types Be Generic?

## Introduction

If you've been working with generics, you've probably noticed something odd: you can write `List<Integer>` but NOT `List<int>`. Why can't we use primitive types like `int`, `double`, or `boolean` as generic type arguments? The answer lies in type erasure and how the JVM handles primitives.

---

## Concept 1: The Rule

### 🧠 What is it?

Java generics only work with **reference types** (objects). Primitive types (`int`, `double`, `char`, `boolean`, `float`, `long`, `short`, `byte`) cannot be used as type arguments.

```java
List<int> numbers = new ArrayList<>();       // ❌ COMPILE ERROR
List<Integer> numbers = new ArrayList<>();   // ✅ works
```

### ❓ Why does this restriction exist?

It comes down to **type erasure**. Remember: after compilation, all generic types are replaced with `Object` (or the bound). And `Object` can only hold **reference types** — not primitives.

```java
// After type erasure, List<T> becomes:
public class List {
    private Object[] items;  // Object cannot hold int or double
}
```

Since `int` is not an `Object`, you can't store it in an `Object` reference. Primitives live on the stack with a fixed memory layout; objects live on the heap as references. They're fundamentally different things in the JVM.

---

## Concept 2: The Solution — Wrapper Classes (Autoboxing)

### 🧠 What is it?

Java provides **wrapper classes** for every primitive type:

| Primitive | Wrapper |
|-----------|---------|
| `int` | `Integer` |
| `double` | `Double` |
| `float` | `Float` |
| `long` | `Long` |
| `boolean` | `Boolean` |
| `char` | `Character` |
| `byte` | `Byte` |
| `short` | `Short` |

### ⚙️ How it works — Autoboxing and Unboxing

Java automatically converts between primitives and wrappers:

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(42);           // autoboxing: int → Integer
int value = numbers.get(0); // unboxing: Integer → int
```

**Autoboxing**: primitive → wrapper (automatic)  
**Unboxing**: wrapper → primitive (automatic)

### 💡 Insight

Autoboxing makes it *feel* like you're using primitives with generics — but under the hood, you're always using wrapper objects.

---

## Concept 3: The Performance Cost

### ⚠️ Why this matters

Every time autoboxing happens, Java creates a new object on the heap. For small-scale use, this is negligible. But in performance-critical code with millions of operations, it adds up.

```java
List<Integer> numbers = new ArrayList<>();
for (int i = 0; i < 1_000_000; i++) {
    numbers.add(i);  // 1 million Integer objects created!
}
```

Each `Integer` object takes about 16 bytes on a 64-bit JVM, compared to 4 bytes for a plain `int`. That's 4x the memory.

**Worked example:** For the 1 million items above: `1,000,000 × 16 bytes = ~16 MB` with `Integer` wrappers, versus `1,000,000 × 4 bytes = ~4 MB` with raw `int`. That's 12 MB of overhead purely from autoboxing — plus additional GC pressure from 1 million short-lived objects.

### 🧪 Null-pointer danger

Wrapper types can be `null`, but primitives can't. Unboxing a `null` throws a `NullPointerException`:

```java
Integer wrapped = null;
int value = wrapped;  // NullPointerException!
```

This is a common source of bugs when working with collections.

---

## Concept 4: Specialized Collections (Alternatives)

### 🧠 What is it?

For performance-sensitive code, there are libraries that provide **primitive-specialized collections** — they store actual primitives without boxing:

- **Eclipse Collections**: `IntArrayList`, `DoubleHashSet`
- **HPPC**: High Performance Primitive Collections
- **Koloboke**: High-performance maps and sets for primitives

```java
// Eclipse Collections example
IntArrayList numbers = new IntArrayList();
numbers.add(42);     // no boxing — stores the raw int
numbers.add(100);
int sum = numbers.sum(); // direct primitive operations
```

### 💡 Insight

Java's standard library doesn't provide these because generics can't work with primitives. These third-party libraries use code generation or manual specialization to offer primitive-friendly collections.

---

## Concept 5: Will This Ever Change?

### 🧠 Looking ahead — Project Valhalla

Java's **Project Valhalla** aims to introduce **value types** and **primitive generics** to Java. This would allow:

```java
// Future Java (Project Valhalla)
List<int> numbers = new ArrayList<>();  // direct primitive, no boxing
```

This is one of the most anticipated changes in Java's evolution. Until then, autoboxing with wrapper classes remains the standard approach.

---

## ✅ Key Takeaways

- Primitive types can't be generic because type erasure replaces `T` with `Object`, and `Object` can't hold primitives
- Use **wrapper classes** (`Integer`, `Double`, etc.) as the type argument
- **Autoboxing/unboxing** makes conversion automatic but has a performance cost
- Watch out for `NullPointerException` when unboxing `null` wrapper values
- For performance-critical code, consider primitive-specialized collection libraries

## ⚠️ Common Mistakes

- Trying to use `List<int>` instead of `List<Integer>`
- Ignoring the performance impact of autoboxing in tight loops
- Unboxing a `null` `Integer` to `int` — causes `NullPointerException`
- Comparing wrapper objects with `==` instead of `.equals()` — Java caches `Integer` values from -128 to 127, so `==` works by coincidence in that range (both references point to the same cached object). Outside that range, `new Integer(200) == new Integer(200)` is `false` because they are different heap objects, even though `.equals()` returns `true`
