# Wildcards vs Bounded Type Parameters — When to Use Which

## Introduction

We've now learned both **wildcards** (`?`) and **bounded type parameters** (`<T extends X>`). They seem to solve similar problems, so when should you use one over the other? This lecture draws a clear line between the two and introduces the **Get and Put Principle**.

---

## Concept 1: The Get and Put Principle

### 🧠 What is it?

A simple decision framework:

| You want to... | Use | Keyword |
|----------------|-----|---------|
| **Get** (read) values from a structure | Upper bounded wildcard | `? extends T` |
| **Put** (write) values into a structure | Lower bounded wildcard | `? super T` |
| **Both** read and write | Bounded type parameter | `<T extends X>` |

### 💡 Why this matters

Wildcards are powerful but come with a trade-off: you either read OR write, never both. If your method needs to do both, wildcards alone won't work — you need bounded type parameters.

---

## Concept 2: The Immutability Misconception

### ⚠️ Common mistake

Many developers think: "Since I can't add items to a `List<? extends T>`, it must be immutable."

**This is wrong.**

### ❓ Why?

You can still:
- Add `null` values to the list
- Sort the list
- Remove items from the list
- Clear the list

```java
public static void process(List<? extends Number> list) {
    list.add(null);           // ✅ Allowed!
    Collections.sort(list);   // ✅ Allowed (if Comparable)
    list.clear();             // ✅ Allowed!
    list.add(42);             // ❌ Not allowed
}
```

```java
// Demonstration: upper bounded wildcard is NOT immutable
List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1));
List<? extends Number> ref = nums;

// ref.add(10);      // ❌ Won't compile — can't add typed values
ref.clear();          // ✅ Compiles and runs — list is now empty!
System.out.println(nums); // [] — the original list was modified!
```

Upper bounded wildcards prevent adding **typed** items, but they don't make the list immutable. Operations like `clear()`, `remove()`, and `sort()` work because they don't introduce new typed elements into the collection — they only remove or rearrange existing elements, which is safe regardless of the unknown actual type. Adding `null` works because `null` is compatible with every reference type. Only inserting a new *typed* value is blocked, since the compiler can't verify it matches the list's actual type.

---

## Concept 3: Where Can You Use Each?

### Wildcards — Anywhere

Wildcards can be used in:
- Method parameters
- Local variables
- Fields
- Return types

```java
// In a variable declaration
List<?> anyList = new ArrayList<String>();

// In the main method
List<? extends Number> numbers = Arrays.asList(1, 2, 3);
```

### Bounded Type Parameters — Methods and Classes Only

Type parameters can only be declared on methods and classes:

```java
// On a method ✅
public static <T extends Comparable<T>> T findMin(List<T> list) { ... }

// On a class ✅
public class Box<T extends Serializable> { ... }

// In a local variable ❌
T item = ...;  // Not valid outside a generic context
```

---

## Concept 4: Single vs Multiple Bounds

### Wildcards — Single bound only

```java
List<? extends Number> list;          // ✅ One bound
List<? extends Number & Serializable> // ❌ Cannot do multiple bounds
List<? extends Number super Integer>  // ❌ Cannot combine extends + super
```

### Bounded Type Parameters — Multiple bounds

```java
public static <T extends Comparable<T> & Serializable> void process(T item) {
    // T must implement BOTH Comparable AND Serializable
}
```

This is a significant advantage of bounded type parameters — you can enforce that a type satisfies **multiple contracts**.

---

## Concept 5: Access to the Actual Type

### Wildcards — No access

With `?`, the type is truly unknown. You can't reference it or use it elsewhere:

```java
public static void print(List<?> list) {
    // Can't declare: ? item = list.get(0);  — ? is not a type name
    Object item = list.get(0);  // Only Object
}
```

### Bounded Type Parameters — Full access

With `T`, you have a named type you can use throughout the method:

```java
public static <T> T getFirst(List<T> list) {
    T item = list.get(0);   // T is a usable type
    return item;             // Can return T
}
```

---

## Concept 6: Decision Summary

| Criteria | Wildcards | Bounded Type Params |
|----------|-----------|-------------------|
| Read only | `? extends T` ✅ | Works but overkill |
| Write only | `? super T` ✅ | Works but overkill |
| Read + Write | ❌ | `<T extends X>` ✅ |
| Multiple bounds | ❌ | ✅ |
| Access to type | ❌ (unknown) | ✅ (named `T`) |
| Usable anywhere | ✅ | Methods/classes only |
| Prefer when | Possible | Necessary |

### 💡 Rule of thumb

> **Use wildcards whenever possible.** Fall back to bounded type parameters only when you need read+write access, multiple bounds, or a named type reference.

---

## ✅ Key Takeaways

- **Get and Put Principle:** `extends` for reading, `super` for writing, type parameters for both
- Upper bounded wildcards do **NOT** provide immutability
- Wildcards can be used anywhere; type parameters only on methods/classes
- Bounded type parameters support **multiple bounds**; wildcards support only **one**
- Prefer wildcards for simplicity; use type parameters when wildcards aren't enough

## ⚠️ Common Mistakes

- Assuming `? extends T` makes a list immutable — it doesn't
- Using bounded type parameters when a simple wildcard would suffice
- Trying to use `extends` and `super` together on the same wildcard

## 💡 Pro Tip

When designing an API, prefer wildcards in method parameters — they make your API more flexible for callers. Use bounded type parameters internally when your implementation needs to correlate types across multiple parameters or return values.
