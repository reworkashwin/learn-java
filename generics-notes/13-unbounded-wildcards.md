# Unbounded Wildcards — Why `List<Object>` ≠ `List<Integer>`

## Introduction

Here's an intuition trap: `Integer` extends `Object`, so surely `List<Integer>` is a subtype of `List<Object>`, right? **Wrong.** This single misunderstanding is what makes wildcards essential in Java generics. Let's see why, and how the `?` wildcard solves the problem.

---

## Concept 1: The Inheritance Trap with Collections

### 🧠 What is it?

In regular Java, inheritance works as expected:

```java
public static void print(Object o) {
    System.out.println(o.toString());
}

Integer i = 23;
print(i);  // ✅ Works — Integer IS-A Object
```

An `Integer` is an `Object`, so passing it where `Object` is expected works perfectly.

### ❓ But what about lists?

```java
public static void print(List<Object> list) {
    for (Object o : list) {
        System.out.println(o);
    }
}

List<Integer> numbers = Arrays.asList(1, 2, 3);
print(numbers);  // ❌ COMPILE ERROR!
```

**Error:** `The method print(List<Object>) is not applicable for the argument (List<Integer>)`

### 💡 Why doesn't this work?

Even though `Integer` extends `Object`, `List<Integer>` does **NOT** extend `List<Object>`. In the world of generics, **inheritance does not carry over to parameterized types**.

This is the fundamental reason wildcards exist.

---

## Concept 2: Unbounded Wildcards — The `?` Solution

### 🧠 What is it?

The **unbounded wildcard** `?` represents an **unknown type**. It tells Java: "I don't care what type this list holds."

### ⚙️ How it works

```java
public static void print(List<?> list) {
    for (Object o : list) {
        System.out.println(o);
    }
}
```

Now this method accepts:
- `List<Integer>` ✅
- `List<String>` ✅
- `List<Double>` ✅
- `List<AnythingAtAll>` ✅

```java
List<Integer> numbers = Arrays.asList(1, 2, 3);
print(numbers);  // Works!

List<String> names = Arrays.asList("Adam", "Kevin", "Joe");
print(names);    // Works!
```

### 💡 Insight

When you use `?`, Java doesn't know the actual type. Inside the method, you can only treat elements as `Object` — the most general type. That's fine for reading/printing, but it limits what operations you can perform.

---

## Concept 3: Real-World Example — Shapes

### ⚙️ Setting up the hierarchy

```java
public interface Shape {
    void draw();
}

public class Rectangle implements Shape {
    public void draw() {
        System.out.println("Drawing rectangle on the canvas");
    }
}

public class Circle implements Shape {
    public void draw() {
        System.out.println("Drawing circle on the canvas");
    }
}
```

### ❓ The problem

```java
public static void drawAll(List<Shape> shapes) {
    for (Shape s : shapes) {
        s.draw();
    }
}

List<Rectangle> rectangles = new ArrayList<>();
rectangles.add(new Rectangle());
drawAll(rectangles);  // ❌ COMPILE ERROR!
```

Same issue — `List<Rectangle>` is NOT a `List<Shape>`, despite `Rectangle` implementing `Shape`.

### ⚙️ Fix with unbounded wildcard

```java
public static void drawAll(List<?> shapes) {
    for (Object o : shapes) {
        // Problem: we can't call o.draw() — Object doesn't have draw()
    }
}
```

This compiles, but now we've lost access to the `draw()` method because Java only sees `Object`.

### ⚙️ Better fix with bounded type parameters

```java
public static <T extends Shape> void drawAll(List<T> shapes) {
    for (T s : shapes) {
        s.draw();  // ✅ T is guaranteed to be a Shape
    }
}
```

Now Java knows every element is a `Shape`, so calling `draw()` works.

---

## Concept 4: When to Use Unbounded Wildcards

Use `?` when you just need to **read** or **iterate** and you don't care about the specific type:

- Printing list contents
- Checking list size
- Checking if a list contains `null`

Don't use `?` when you need to call type-specific methods — use bounded wildcards or bounded type parameters instead.

---

## ✅ Key Takeaways

- `List<Integer>` is **NOT** a subtype of `List<Object>` — inheritance doesn't carry over to generics
- The unbounded wildcard `?` means "any type" and lets methods accept lists of any type
- With `?`, you can only treat elements as `Object` inside the method
- For type-specific operations, use bounded wildcards (`? extends T`) or bounded type parameters (`<T extends X>`)

## ⚠️ Common Mistakes

- Assuming `List<Child>` can be passed where `List<Parent>` is expected — it can't
- Using unbounded wildcards when you need to call methods specific to a type
- Confusing wildcards with bounded type parameters — they solve similar but different problems

## 💡 Pro Tip

Think of `?` as saying: "I accept any list, but I promise I won't assume anything about its element type." This is the trade-off — maximum flexibility for minimum type safety inside the method.
