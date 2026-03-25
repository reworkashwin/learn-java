# Bounded Generic Types: Restricting Type Parameters

## Introduction

So far, we've been using generics in their most flexible form—any type could be used as a type argument. Want to use `String`? Sure! `Integer`? No problem! `Car`, `Banana`, or `RandomClass`? All work fine!

But sometimes, this unlimited flexibility is too much. What if you're writing a method that performs mathematical calculations? You can't do math on strings! What if you need to compare objects? Not every class can be compared!

In this section, we'll learn about **bounded generic types**—a way to put restrictions on what types can be used with generics. We'll discover why these restrictions are sometimes necessary, how to implement them using the `extends` keyword, and how to define multiple bounds for even finer control.

This is where generics become more sophisticated and powerful.

---

## Concept 1: The Motivation Behind Bounded Types

### 🧠 What problem are we solving?

Imagine you want to write a generic method that calculates the average of numbers:

```java
public <T> double average(T num1, T num2) {
    return (num1 + num2) / 2.0;  // ❌ Compile error!
}
```

**Problem**: You can't use the `+` operator on generic type `T`. Why? Because `T` could be anything—a `String`, a `Person`, a `Car`! These don't support mathematical operations.

### ❓ What do we really want?

We want to say: "Accept any type `T`, **but only if it's a number**."

In other words, we want to **restrict** (or **bound**) the generic type to a specific category of types.

### 🧪 Another example: Comparing objects

```java
public <T> T findMax(T first, T second) {
    if (first > second) {  // ❌ Compile error!
        return first;
    }
    return second;
}
```

**Problem**: Not all objects can be compared using `>`. How does Java know if one `T` is greater than another?

We need `T` to be **comparable**—it needs to implement a comparison interface.

### 💡 Insight

Think of unbounded generics like a party where anyone can enter. Bounded generics are like a VIP section—only certain types (those meeting specific criteria) are allowed. This restriction isn't limiting; it's empowering because it lets you safely use specific operations on those types.

---

## Concept 2: Understanding Bounded Type Parameters

### 🧠 What is a bounded type parameter?

A **bounded type parameter** restricts the types that can be used as type arguments. Instead of accepting any type, you specify that the type must:
- Extend a specific class, OR
- Implement a specific interface, OR
- Both (multiple bounds)

### ⚙️ The syntax: Using `extends`

```java
public <T extends SomeClass> void method(T item) {
    // T must be SomeClass or a subclass of SomeClass
}
```

The keyword is **`extends`**, and it's used for both classes and interfaces.

### 📝 Key syntax rules

**For a class bound:**
```java
public <T extends Number> void process(T number) {
    // T must be Number or a subclass (Integer, Double, Float, etc.)
}
```

**For an interface bound:**
```java
public <T extends Comparable<T>> void compare(T item) {
    // T must implement the Comparable interface
}
```

### 💡 Insight

**Important quirk**: You use `extends` even for interfaces! Normally in Java, you `implement` an interface and `extend` a class. But in the context of bounded types, **always use `extends`** regardless of whether it's a class or interface.

This can be confusing at first, but it's just how Java generics syntax works. Think of `extends` here as meaning "is a subtype of" rather than literally inheriting from a class.

---

## Concept 3: Bounding to a Class - The Number Example

### 🧠 What is the Number class?

Java has an abstract class called `Number` that's the superclass of all numeric wrapper classes:
- `Integer` extends `Number`
- `Double` extends `Number`
- `Float` extends `Number`
- `Long` extends `Number`
- `Short` extends `Number`
- `Byte` extends `Number`

### ⚙️ Creating a method bounded to Number

```java
public class Calculator {
    public <T extends Number> double sum(T num1, T num2) {
        return num1.doubleValue() + num2.doubleValue();
    }
}
```

### 📝 Breaking it down

```java
public <T extends Number> double sum(T num1, T num2)
```

- **`<T extends Number>`** – T must be Number or any subclass of Number
- **`double`** – The return type (a primitive double)
- **`num1.doubleValue()`** – We can safely call this method because Number defines it

### 🧪 Example: Using the bounded method

```java
Calculator calc = new Calculator();

// ✅ Works - Integer is a subclass of Number
double result1 = calc.sum(10, 20);
System.out.println(result1);  // 30.0

// ✅ Works - Double is a subclass of Number
double result2 = calc.sum(10.5, 20.3);
System.out.println(result2);  // 30.8

// ✅ Works - Float is a subclass of Number
double result3 = calc.sum(5.5f, 4.5f);
System.out.println(result3);  // 10.0

// ❌ Doesn't work - String is NOT a subclass of Number
double result4 = calc.sum("10", "20");  // Compile error!
```

### ❓ Why can we call doubleValue()?

Because we bounded `T` to `Number`, the compiler knows that `T` has all the methods defined in the `Number` class, including:
- `doubleValue()` – Returns the value as a double
- `intValue()` – Returns the value as an int
- `floatValue()` – Returns the value as a float
- And so on...

Without the bound, the compiler wouldn't know `T` has these methods!

### 💡 Insight

**This is the key benefit of bounded types**: You can safely invoke methods that are defined in the bound. With unbounded `<T>`, you can only call methods from `Object` (like `toString()`, `equals()`). With `<T extends Number>`, you can call all of `Number`'s methods!

---

## Concept 4: Bounding to an Interface - The Comparable Example

### 🧠 What is the Comparable interface?

`Comparable<T>` is a standard Java interface that defines one method:

```java
public interface Comparable<T> {
    int compareTo(T other);
}
```

Classes that implement `Comparable` can be compared to determine ordering (less than, equal to, greater than).

### ⚙️ Creating a method bounded to Comparable

```java
public class Comparator {
    public <T extends Comparable<T>> T findMax(T first, T second) {
        if (first.compareTo(second) > 0) {
            return first;
        }
        return second;
    }
}
```

### 📝 Understanding the syntax

```java
public <T extends Comparable<T>> T findMax(T first, T second)
```

- **`<T extends Comparable<T>>`** – T must implement Comparable<T>
- **`T`** – The return type (same as the input type)
- **`first.compareTo(second)`** – We can safely call this because T implements Comparable

### 🧪 Example: Finding the maximum

```java
Comparator comp = new Comparator();

// ✅ Works - Integer implements Comparable<Integer>
Integer maxNum = comp.findMax(10, 20);
System.out.println(maxNum);  // 20

// ✅ Works - String implements Comparable<String>
String maxStr = comp.findMax("Apple", "Banana");
System.out.println(maxStr);  // Banana (lexicographically)

// ❌ Doesn't work if a class doesn't implement Comparable
// MyCustomClass obj1 = new MyCustomClass();
// MyCustomClass obj2 = new MyCustomClass();
// comp.findMax(obj1, obj2);  // Compile error if MyCustomClass doesn't implement Comparble!
```

### ❓ How does compareTo work?

The `compareTo` method returns:
- **Negative number** if `first < second`
- **Zero** if `first == second`
- **Positive number** if `first > second`

So `first.compareTo(second) > 0` means "first is greater than second."

### 💡 Insight

Many built-in Java classes implement `Comparable`:
- `Integer`, `Double`, `Long`, etc. (numeric comparison)
- `String` (alphabetical/lexicographic comparison)
- `Date` (chronological comparison)

When you use `<T extends Comparable<T>>`, your method automatically works with all of these!

---

## Concept 5: Multiple Bounds

### 🧠 What if we need multiple constraints?

Sometimes one bound isn't enough. You might need a type that:
- Is a `Number` (for mathematical operations) **AND**
- Implements `Comparable` (for comparisons) **AND**
- Implements some other interface

Java lets you specify **multiple bounds** using the `&` operator.

### ⚙️ Syntax for multiple bounds

```java
public <T extends Number & Comparable<T>> void process(T item) {
    // T must be:
    // 1. A subclass of Number
    // 2. Implement Comparable<T>
}
```

### 📝 The rules for multiple bounds

1. **Class must come first** (if there's a class bound)
2. **Interfaces come after** (separated by `&`)
3. **At most one class** (but multiple interfaces)

**Valid examples:**
```java
<T extends Number & Comparable<T>>                    // ✅ Class + Interface
<T extends Number & Comparable<T> & Serializable>    // ✅ Class + Multiple Interfaces
<T extends Comparable<T> & Serializable>             // ✅ Multiple Interfaces (no class)
```

**Invalid examples:**
```java
<T extends Comparable<T> & Number>                   // ❌ Class must come first
<T extends Number & Integer>                         // ❌ Can't have two classes
```

### 🧪 Example: Using multiple bounds

```java
public class MathProcessor {
    public <T extends Number & Comparable<T>> T findLarger(T first, T second) {
        // We can use Number methods
        double sum = first.doubleValue() + second.doubleValue();
        System.out.println("Sum: " + sum);
        
        // We can use Comparable methods
        if (first.compareTo(second) > 0) {
            return first;
        }
        return second;
    }
}
```

Usage:
```java
MathProcessor processor = new MathProcessor();

// ✅ Works - Integer extends Number and implements Comparable
Integer result = processor.findLarger(10, 20);
// Output: Sum: 30.0
// Returns: 20

// ✅ Works - Double extends Number and implements Comparable
Double result2 = processor.findLarger(15.5, 10.2);
// Output: Sum: 25.7
// Returns: 15.5
```

### ❓ Why would we need multiple bounds?

**Real-world scenario**: Imagine you're writing a method that:
1. Needs to perform math operations (requires `Number`)
2. Needs to sort items (requires `Comparable`)
3. Needs to serialize objects (requires `Serializable`)

Multiple bounds let you express all these requirements at once!

### 💡 Insight

Multiple bounds are like requiring multiple qualifications for a job. Instead of "must have a driver's license," you're saying "must have a driver's license AND CPR certification AND a college degree." Each bound adds another constraint, ensuring the type has all the capabilities you need.

---

## Concept 6: Practical Applications

### 🧪 Example 1: Find minimum

```java
public <T extends Comparable<T>> T findMin(T[] array) {
    if (array.length == 0) {
        return null;
    }
    
    T min = array[0];
    for (T element : array) {
        if (element.compareTo(min) < 0) {
            min = element;
        }
    }
    return min;
}

// Usage
Integer[] numbers = {5, 2, 8, 1, 9};
Integer min = findMin(numbers);  // Returns 1

String[] words = {"zebra", "apple", "mango"};
String minWord = findMin(words);  // Returns "apple"
```

### 🧪 Example 2: Calculate average

```java
public <T extends Number> double average(T[] array) {
    double sum = 0;
    for (T element : array) {
        sum += element.doubleValue();
    }
    return sum / array.length;
}

// Usage
Integer[] numbers = {10, 20, 30, 40};
double avg = average(numbers);  // Returns 25.0

Double[] decimals = {1.5, 2.5, 3.5};
double avg2 = average(decimals);  // Returns 2.5
```

### 🧪 Example 3: In-range check

```java
public <T extends Number & Comparable<T>> boolean isInRange(
    T value, T min, T max) {
    
    return value.compareTo(min) >= 0 && value.compareTo(max) <= 0;
}

// Usage
boolean result1 = isInRange(5, 1, 10);      // true
boolean result2 = isInRange(15, 1, 10);     // false
boolean result3 = isInRange(5.5, 1.0, 10.0); // true
```

### 💡 Insight

Bounded types are everywhere in Java libraries:
- `Collections.sort(List<T> list)` requires `T extends Comparable<T>`
- `Collections.max(Collection<T> coll)` requires `T extends Comparable<T>`
- Many mathematical utilities require `T extends Number`

Understanding bounded types helps you use these APIs effectively and create your own powerful generic utilities.

---

## ✅ Key Takeaways

1. **Bounded types restrict type arguments** – Not all types are allowed, only those meeting specific criteria

2. **Use `extends` for both classes and interfaces** – This is a quirk of generics syntax; always use `extends`, never `implements`

3. **Bounds enable method calls** – Bounding to a type lets you safely call that type's methods

4. **Number is perfect for math operations** – `<T extends Number>` restricts to numeric types

5. **Comparable enables comparisons** – `<T extends Comparable<T>>` restricts to comparable types

6. **Multiple bounds use `&`** – Combine multiple constraints: `<T extends Number & Comparable<T>>`

7. **Class comes first in multiple bounds** – Always list the class before interfaces

---

## ⚠️ Common Mistakes

- **Using `implements` instead of `extends`** – Always use `extends` in bounded type parameters, even for interfaces

- **Forgetting the bounds when calling methods** – If you call `compareTo()`, you need `extends Comparable<T>`

- **Putting interfaces before classes** – In `<T extends A & B>`, if A is a class, it must come first

- **Trying to use multiple class bounds** – You can only extend one class, but multiple interfaces

---

## 💡 Pro Tips

- **Check the Java documentation** – See what interfaces common classes implement (most numeric types implement `Comparable`)

- **Upper bound vs lower bound** – What we've learned is "upper bound" (using `extends`). There's also "lower bound" using `super`, which we'll cover later

- **Keep bounds simple when possible** – Don't add constraints you don't need; unbounded is simpler when it works

- **Test with multiple types** – Make sure your bounded generic method works with different types that meet the bounds

---

## 🎯 Visual Summary

**Unbounded (accept anything):**
```
<T>  →  Any type at all
```

**Bounded to a class:**
```
<T extends Number>  →  Number, Integer, Double, Float, Long, etc.
```

**Bounded to an interface:**
```
<T extends Comparable<T>>  →  Any type that's comparable
```

**Multiple bounds:**
```
<T extends Number & Comparable<T>>  →  Must be BOTH
```

---

## 🎯 What's Next?

We've now covered:
- ✅ Unbounded generic types
- ✅ Generic methods
- ✅ Generic arrays (and their limitations)
- ✅ Bounded generic types (upper bounds)

Coming up:
- **Wildcards** (`?`, `? extends`, `? super`) – Even more flexible bounds
- **Lower bounds** (`? super T`) – The flip side of upper bounds
- **Type erasure in depth** – How it all works under the hood
- **Generic class hierarchies** – Inheritance with generics

Bounded types give you the best of both worlds—the flexibility of generics with the safety of type constraints. This makes your code both reusable and safe!