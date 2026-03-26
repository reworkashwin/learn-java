# Wildcards in Practice — Seeing the Problem and Solution in Code

## Introduction

In the previous lecture, we explored the *theory* behind why wildcards are needed — generic type invariance means `List<Integer>` is not a subtype of `List<Object>`, even though `Integer` is a subtype of `Object`. Now it's time to see this play out in actual code.

This lecture walks through two concrete examples that demonstrate exactly where things break down without wildcards, and how the simple `?` (question mark) fixes the problem. We'll also see a case where the unbounded wildcard isn't quite enough — setting the stage for bounded wildcards in the next lectures.

---

## Concept 1: Object vs Integer — Inheritance Works Normally

### 🧠 What is it?

Before diving into the collection problem, let's confirm that regular inheritance works exactly as expected. If a method accepts an `Object`, you can pass an `Integer` because `Integer extends Object`.

### 🧪 Example

```java
public static void print(Object o) {
    System.out.println(o.toString());
}
```

Now we create an `Integer` (the reference type, not the primitive `int`) and pass it to this method:

```java
Integer i = 23;
print(i);  // ✅ Works perfectly — Integer IS an Object
```

Output:
```
23
```

No surprises here. `Integer` extends `Object`, so anywhere an `Object` is expected, an `Integer` fits right in. This is basic polymorphism at work.

### 💡 Insight

This works because we're dealing with **single values**, not collections. The moment we wrap these types inside a generic container like `List`, the rules change completely.

---

## Concept 2: List of Objects vs List of Integers — The Wall

### 🧠 What is the problem?

Now let's write a method that accepts a `List<Object>` and prints every element:

```java
public static void print(List<Object> list) {
    for (Object o : list) {
        System.out.println(o);
    }
}
```

You might think: *"I can pass a `List<Integer>` to this, just like I passed an `Integer` to the `Object` parameter."* Let's try:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3);
print(numbers);  // ❌ Compile error!
```

### ❓ What is the error?

```
The method print(List<Object>) is not applicable for the argument (List<Integer>)
```

And there it is — the exact problem we discussed in theory. Despite the fact that `Integer` is an `Object`, `List<Integer>` is **not** a subtype of `List<Object>`.

### 💡 Insight

This is the wall that generic type invariance creates. With single values, inheritance flows naturally up the hierarchy. With parameterized collections, that flow is completely blocked. The compiler treats `List<Integer>` and `List<Object>` as entirely unrelated types.

---

## Concept 3: The Wildcard Fixes It

### 🧠 How do we solve this?

Replace `List<Object>` with `List<?>` — the unbounded wildcard:

```java
public static void print(List<?> list) {
    for (Object o : list) {
        System.out.println(o);
    }
}
```

Now we can pass **any** list:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3);
print(numbers);  // ✅ Works!

List<String> names = Arrays.asList("Adam", "Kevin", "Joe");
print(names);    // ✅ Works!
```

Output:
```
1
2
3
Adam
Kevin
Joe
```

### ⚙️ Why does this work?

Because `List<?>` is the **super type of all parameterized Lists**. Every `List<Something>` is a subtype of `List<?>`. The wildcard says: *"I accept a list of anything — I don't care what the type parameter is."*

### 💡 Insight

This is the first practical use of wildcards — when you want to write a method that **reads** from a collection without caring about the element type. Printing, counting, checking emptiness — any read-only operation on a collection is a perfect candidate for `List<?>`.

---

## Concept 4: A Real-World Example — Shapes and Drawing

### 🧠 Setting up the scenario

Let's look at a more realistic example. Suppose we have a `Shape` interface and classes that implement it:

```java
public interface Shape {
    void draw();
}
```

```java
public class Rectangle implements Shape {
    @Override
    public void draw() {
        System.out.println("Drawing rectangle on the canvas");
    }
}
```

```java
public class Circle implements Shape {
    @Override
    public void draw() {
        System.out.println("Drawing circle on the canvas");
    }
}
```

Now we want a method that takes a list of shapes and draws them all:

```java
public static void drawAll(List<Shape> shapes) {
    for (Shape s : shapes) {
        s.draw();
    }
}
```

### ❓ Does this work with a list of rectangles?

```java
List<Rectangle> rectangles = new ArrayList<>();
rectangles.add(new Rectangle());

drawAll(rectangles);  // ❌ Compile error!
```

```
The method drawAll(List<Shape>) is not applicable for the argument (List<Rectangle>)
```

Same problem as before. `Rectangle` implements `Shape`, but `List<Rectangle>` is **not** a subtype of `List<Shape>`.

---

## Concept 5: Unbounded Wildcard — Partial Fix, New Problem

### 🧠 Can we use `?` here?

Yes, but it introduces a new challenge. If we change the parameter to `List<?>`:

```java
public static void drawAll(List<?> shapes) {
    for (Object o : shapes) {
        // o.draw();  // ❌ Can't call draw() — Object doesn't have it!
        System.out.println(o);
    }
}
```

The method now **accepts** `List<Rectangle>`, but there's a catch: with `List<?>`, the elements are treated as `Object` inside the method. And `Object` doesn't have a `draw()` method!

We can print the objects (since every object has `toString()`), but we can't call shape-specific methods on them. The wildcard solved the *acceptance* problem but created a *usability* problem.

### ❓ Why does this happen?

Because `?` means "some unknown type." Java has no way to know that the elements are shapes, so it defaults to the safest assumption — they're `Object`. You lose access to any type-specific behavior.

### 💡 Insight

The unbounded wildcard is great when you only need `Object`-level operations (printing, checking equality, etc.). But when you need to call methods specific to a type — like `draw()` on a `Shape` — you need something more.

---

## Concept 6: Bounded Type Parameters — The Alternative

### 🧠 How do we solve the shapes problem?

One approach is to use a **bounded type parameter** instead of a wildcard:

```java
public static <T extends Shape> void drawAll(List<T> shapes) {
    for (T s : shapes) {
        s.draw();  // ✅ Works — T is guaranteed to be a Shape
    }
}
```

Now we can call it with any list of shapes:

```java
List<Rectangle> rectangles = new ArrayList<>();
rectangles.add(new Rectangle());

drawAll(rectangles);  // ✅ Works!
```

Output:
```
Drawing rectangle on the canvas
```

### ⚙️ Why does this work?

The `<T extends Shape>` tells Java: *"T can be any type, as long as it extends Shape."* When we pass `List<Rectangle>`, the compiler resolves `T = Rectangle`. Since `Rectangle extends Shape`, the bound is satisfied, and we can safely call `draw()` on each element.

### ❓ Wait — couldn't we use `List<? extends Shape>` instead?

Absolutely! And that's exactly what upper bounded wildcards are for. The choice between `<T extends Shape>` and `<? extends Shape>` is a nuanced one — and understanding that difference is the topic of an upcoming lecture.

### 💡 Insight

This example perfectly sets up the question we'll answer in the next lectures: when should you use a bounded type parameter (`<T extends Shape>`) versus a bounded wildcard (`<? extends Shape>`)? They look similar, but they have different strengths and different use cases.

---

## Concept 7: The Big Picture — Where We Stand

### 🧠 What have we learned?

Through these concrete examples, we've confirmed an important principle:

> **Parent-child relationships in inheritance do NOT carry over to parameterized collections.**

- `Integer` is an `Object` → ✅ inheritance works
- `List<Integer>` is a `List<Object>` → ❌ does NOT work
- `Rectangle` implements `Shape` → ✅ inheritance works
- `List<Rectangle>` is a `List<Shape>` → ❌ does NOT work

This is why wildcards exist. The unbounded wildcard (`?`) solves the acceptance problem — it lets a method receive any parameterized collection. But for type-specific operations, we need more tools:

- **Upper bounded wildcards** (`? extends Shape`) — coming next
- **Lower bounded wildcards** (`? super Shape`) — coming soon after
- **Comparison with bounded type parameters** — the final piece of the puzzle

---

## ✅ Key Takeaways

1. **Regular inheritance works with single values** — You can pass an `Integer` wherever an `Object` is expected. No issues.

2. **Generic collections break this rule** — `List<Integer>` cannot be passed where `List<Object>` is expected, despite `Integer` being a subtype of `Object`.

3. **The unbounded wildcard (`?`) solves the acceptance problem** — `List<?>` accepts any `List<Something>`, making methods truly generic across collection types.

4. **The unbounded wildcard limits you to `Object` operations** — You can read and print elements, but you can't call type-specific methods like `draw()` on a `Shape`.

5. **Bounded type parameters offer a workaround** — `<T extends Shape>` preserves type information inside the method, letting you call shape-specific methods while still accepting `List<Rectangle>`, `List<Circle>`, etc.

6. **Upper and lower bounded wildcards are the next step** — They provide finer control over what you can read from and write to collections, bridging the gap between unbounded wildcards and bounded type parameters.
