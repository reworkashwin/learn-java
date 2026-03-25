# Summing Generic Types with Bounded Parameters

## Introduction

In the previous lecture, we built a `minimum()` method using `Comparable`. Now let's tackle a different challenge: **adding numbers together**. This might seem straightforward—just use `+`, right? But as we've seen, operators don't work on generic types.

In this section, we'll build a generic `sum()` method that adds two numbers of any type, then extend it to sum an entire list of numbers. Along the way, we'll learn how the `Number` class provides the tools we need, and why the return type isn't always what you'd expect.

---

## Concept 1: The Problem - Adding Generic Types

### 🧠 What are we trying to do?

We want a method that adds two numbers together, regardless of whether they're integers, doubles, or floats.

### ⚙️ The naive attempt

```java
public class NumberUtils {
    public static <T> T sum(T item1, T item2) {
        return item1 + item2;  // ❌ Compile error!
    }
}
```

### ❓ Why does this fail?

The `+` operator is **not defined** for generic types. Java has no idea what `T` is at compile time—it could be a `String`, a `Person`, or a `Car`. You can't add two cars together!

Even if we bound it to `Number`:

```java
public static <T extends Number> T sum(T item1, T item2) {
    return item1 + item2;  // ❌ Still won't work!
}
```

Still fails! The `+` operator works with primitives (`int`, `double`, `float`), not with objects (`Integer`, `Double`, `Float`). Even though `Number` is the parent of all numeric wrapper classes, Java can't apply `+` to `Number` objects directly.

### 💡 Insight

This is a key difference between primitives and objects in Java. The `+` operator works with `int + int`, but not with `Number + Number`. We need a different approach.

---

## Concept 2: The Number Class and Its Methods

### 🧠 What is the Number class?

`Number` is an abstract class that's the parent of all numeric wrapper classes. Let's look at its hierarchy:

```
Number (abstract)
├── Integer
├── Double
├── Float
├── Long
├── Short
└── Byte
```

### ⚙️ What methods does Number provide?

The `Number` class defines several conversion methods:

```java
public abstract int intValue();
public abstract long longValue();
public abstract float floatValue();
public abstract double doubleValue();
public byte byteValue();
public short shortValue();
```

**Every** subclass of `Number` implements these methods. So whether you have an `Integer`, a `Float`, or a `Double`, you can always call:
- `doubleValue()` – Get the value as a double
- `intValue()` – Get the value as an int
- `floatValue()` – Get the value as a float
- And so on...

### ❓ Why is this useful for us?

If we bound `T` to `Number`, we can call `doubleValue()` on any item. This converts any numeric type to a `double`, and then we can use the `+` operator on the resulting primitive doubles!

### 💡 Insight

`double` provides the **highest general-purpose precision** among Java's numeric primitives. By converting everything to `double`, we can handle integers, floats, longs, and doubles uniformly—sacrificing nothing for most practical purposes.

---

## Concept 3: Implementing the Sum Method

### ⚙️ The solution

```java
public class NumberUtils {
    public static <T extends Number> double sum(T item1, T item2) {
        return item1.doubleValue() + item2.doubleValue();
    }
}
```

### 📝 Breaking it down

```java
public static <T extends Number> double sum(T item1, T item2)
```

1. **`<T extends Number>`** – T must be a subclass of Number
2. **`double`** – The return type is `double`, NOT `T`
3. **`item1.doubleValue()`** – Converts the first item to a primitive double
4. **`item2.doubleValue()`** – Converts the second item to a primitive double
5. **`+`** – Now we can use the operator on primitive doubles!

### ❓ Why return double instead of T?

This is an important design decision. We can't return `T` because:
- We're adding two `doubleValue()` results, which gives us a primitive `double`
- There's no easy way to convert a `double` back to an arbitrary `T`
- If someone passes two `Integer` values, the result of `doubleValue() + doubleValue()` is a `double`, not an `Integer`

Returning `double` is the practical solution—it works correctly for all numeric types.

### 💡 Insight

This is a real-world trade-off in generics. Sometimes you can't maintain the exact generic return type. Returning `double` provides accuracy for all numeric types, even if it means the result type doesn't exactly match the input types.

---

## Concept 4: Using the Sum Method

### 🧪 Example 1: Summing integers

```java
double result = NumberUtils.sum(10, 20);
System.out.println(result);  // Output: 30.0
```

Note: Even though we passed integers, the result is `30.0` (a double).

### 🧪 Example 2: Summing floats

```java
double result = NumberUtils.sum(10.5f, 20.3f);
System.out.println(result);  // Output: 30.8 (approximately)
```

### 🧪 Example 3: Summing doubles

```java
double result = NumberUtils.sum(10.5, 20.3);
System.out.println(result);  // Output: 30.8
```

### ⚙️ What's happening under the hood?

For `sum(10, 20)`:
1. Java autoboxes `10` → `Integer(10)` and `20` → `Integer(20)`
2. `T` is inferred as `Integer`
3. `Integer` extends `Number` ✓
4. `item1.doubleValue()` → `10.0`
5. `item2.doubleValue()` → `20.0`
6. Returns `30.0`

### 💡 Insight

The result is always a `double`, regardless of input types. If you need the result as an `int`, you'd have to cast it: `(int) NumberUtils.sum(10, 20)`. This is a small inconvenience, but it makes the method universally applicable.

---

## Concept 5: Summing a List of Generic Values

### 🧠 What if we want to sum more than two numbers?

What if we have a list of numbers—10, 20, 30, 40—and want their total? Let's extend our approach to handle a `List` of values.

### ⚙️ Implementing sum for a List

```java
public static <T extends Number> double sum(List<T> list) {
    double result = 0.0;
    for (T item : list) {
        result += item.doubleValue();
    }
    return result;
}
```

### 📝 Breaking it down

```java
public static <T extends Number> double sum(List<T> list)
```

1. **`List<T>`** – The parameter is a List of type T
2. **`T extends Number`** – Each element must be a Number subclass
3. **`double result = 0.0`** – Initialize an accumulator
4. **Loop** – Iterate through each item in the list
5. **`item.doubleValue()`** – Convert each item to double
6. **`result +=`** – Add to the running total
7. **Return the total**

### 🧪 Example: Summing a list of integers

```java
List<Integer> numbers = List.of(10, 20, 30, 40);
double total = NumberUtils.sum(numbers);
System.out.println(total);  // Output: 100.0
```

### 🧪 Example: Summing a list of doubles

```java
List<Double> prices = List.of(9.99, 14.50, 3.75);
double total = NumberUtils.sum(prices);
System.out.println(total);  // Output: 28.24
```

### 🧪 Example: Summing a list of mixed types won't work

```java
// ❌ You can't mix types in a generic list
List<Number> mixed = List.of(10, 20.5, 30.0f);
// This works because they're all Numbers, but the list type is Number
double total = NumberUtils.sum(mixed);
System.out.println(total);  // Output: 60.5
```

### 💡 Insight

The `List` interface is part of Java's Collections Framework (which we'll explore in a future chapter). For now, think of it as a flexible, resizable array that can hold objects. `List.of()` creates an immutable list from the given values.

---

## Concept 6: Method Overloading with Generics

### 🧠 How do both sum methods coexist?

We now have two `sum` methods:

```java
// Sum two values
public static <T extends Number> double sum(T item1, T item2) {
    return item1.doubleValue() + item2.doubleValue();
}

// Sum a list of values
public static <T extends Number> double sum(List<T> list) {
    double result = 0.0;
    for (T item : list) {
        result += item.doubleValue();
    }
    return result;
}
```

These work together through **method overloading**! Java distinguishes them by their parameters:
- Two individual items → calls the first version
- A List → calls the second version

### 💡 Insight

Generics and method overloading work together beautifully. You get the flexibility of generics (any numeric type) combined with the convenience of overloading (different parameter structures).

---

## Concept 7: The Complete NumberUtils Class

### 🧪 Putting it all together

```java
import java.util.List;

public class NumberUtils {
    
    // Find the minimum of two comparable items
    public static <T extends Comparable<T>> T minimum(T item1, T item2) {
        if (item1.compareTo(item2) < 0) {
            return item1;
        }
        return item2;
    }
    
    // Sum two numbers
    public static <T extends Number> double sum(T item1, T item2) {
        return item1.doubleValue() + item2.doubleValue();
    }
    
    // Sum a list of numbers
    public static <T extends Number> double sum(List<T> list) {
        double result = 0.0;
        for (T item : list) {
            result += item.doubleValue();
        }
        return result;
    }
}
```

### 🧪 Usage examples

```java
public static void main(String[] args) {
    // Minimum
    System.out.println(NumberUtils.minimum(10, 34));  // 10
    
    // Sum of two values
    System.out.println(NumberUtils.sum(10, 20));       // 30.0
    System.out.println(NumberUtils.sum(10.5f, 20.3f)); // 30.8
    System.out.println(NumberUtils.sum(10.5, 20.3));   // 30.8
    
    // Sum of a list
    List<Integer> numbers = List.of(10, 20, 30, 40);
    System.out.println(NumberUtils.sum(numbers));       // 100.0
}
```

### 💡 Insight

Notice the different bounded types:
- `minimum()` uses `<T extends Comparable<T>>` – because it needs to compare values
- `sum()` uses `<T extends Number>` – because it needs numeric operations

**The bound matches the operation**: Comparison needs `Comparable`, math needs `Number`. Always choose the bound that provides the methods you actually need.

---

## ✅ Key Takeaways

1. **The `+` operator doesn't work on generic types** – Even with `Number` as a bound

2. **Use `doubleValue()` for numeric operations** – It converts any Number to a primitive double

3. **Return type may differ from generic type** – Sometimes returning `double` is more practical than returning `T`

4. **Number is the parent of all numeric wrappers** – It provides conversion methods like `intValue()`, `doubleValue()`, etc.

5. **Lists enhance generic methods** – Accept `List<T>` to work with collections of values

6. **Choose bounds based on what you need** – `Comparable` for comparisons, `Number` for arithmetic

---

## ⚠️ Common Mistakes

- **Trying to use `+` on generic objects** – Always convert to primitives first using `doubleValue()`, `intValue()`, etc.

- **Expecting the return type to match T** – When converting to `double`, the return type must be `double`

- **Forgetting to import List** – `java.util.List` must be imported to use the List interface

- **Using `int` instead of `double` as return type** – Using `intValue()` would lose precision for floats and doubles; `doubleValue()` is safer

---

## 💡 Pro Tips

- **Why double and not float?** – `double` has 64-bit precision vs `float`'s 32-bit, making it the safer choice for general-purpose numeric operations

- **BigDecimal for financial calculations** – For money or precision-critical math, `double` isn't enough; use `BigDecimal` instead

- **The Number class is abstract** – You can't instantiate `Number` directly, but you can use it as a bound or variable type

- **Method overloading evolves** – As your utility grows, you can add overloaded versions for different parameter combinations, all sharing the same method name

---

## 🎯 What's Next?

We've now built practical utility methods using two different bounds:
- ✅ `<T extends Comparable<T>>` for finding minimum/maximum
- ✅ `<T extends Number>` for summing numeric values
- ✅ Working with both individual values and lists

Coming up:
- **Wildcards** (`?`, `? extends`, `? super`) – Even more flexible type parameters
- **Type erasure** – Understanding how generics work under the hood
- **Collections Framework** – Deep dive into List, Set, Map, and more

Each bounded type serves a purpose: `Comparable` enables ordering, `Number` enables arithmetic. Choosing the right bound for the right operation is a fundamental skill in writing effective generic code!