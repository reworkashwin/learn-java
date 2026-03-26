# Upper Bounded Wildcards — Reading Safely with `? extends T`

## Introduction

We've seen that unbounded wildcards (`?`) solve the problem of accepting any parameterized collection, but they force us to treat elements as `Object` — losing access to type-specific methods. What if we want to accept any collection whose elements are **subtypes of a particular type**, while still being able to use that type's methods?

This is exactly what **upper bounded wildcards** are for. They let us say: *"I'll accept a list of anything, as long as it extends (or implements) this specific type."*

---

## Concept 1: The Motivation — Why Upper Bounded Wildcards?

### 🧠 What is the problem?

Recall the shapes example from the previous lecture. We had a `Shape` interface with `Rectangle` and `Circle` implementing it. We wanted a method that could accept a `List<Rectangle>`, a `List<Circle>`, or any `List` of shape subtypes.

We tried two approaches:
- `List<Shape>` — rejected `List<Rectangle>` (generic invariance)
- `List<?>` — accepted `List<Rectangle>`, but treated elements as `Object` (couldn't call `draw()`)

What we really want is a middle ground: accept any list whose elements are shapes (or subtypes of shapes), **and** still be able to treat those elements as `Shape` inside the method.

### ❓ When do we need this?

Whenever you're working with a parent-child relationship and want to write a method that:
- Accepts a list of **any subtype** of the parent
- Can **read** elements and use the parent type's methods on them

---

## Concept 2: The Syntax — `? extends T`

### 🧠 What is it?

An upper bounded wildcard uses the `extends` keyword right after the question mark:

```java
List<? extends T>
```

This means: *"A list of some unknown type, but that type is guaranteed to be `T` or a subclass of `T`."*

### ⚙️ How does this solve the shapes problem?

```java
public static void drawAll(List<? extends Shape> shapes) {
    for (Shape s : shapes) {
        s.draw();  // ✅ Works — every element is guaranteed to be a Shape
    }
}
```

Now we can call it with any list of shape subtypes:

```java
List<Rectangle> rectangles = new ArrayList<>();
rectangles.add(new Rectangle());

List<Circle> circles = new ArrayList<>();
circles.add(new Circle());

drawAll(rectangles);  // ✅ Works — Rectangle extends Shape
drawAll(circles);     // ✅ Works — Circle extends Shape
```

### 💡 Insight

The `extends` keyword tells the compiler: *"Whatever type is in this list, it IS a Shape (or a subtype of Shape)."* This guarantee lets Java safely treat every element as a `Shape` — so you can call `draw()`, or any other method defined in the `Shape` interface.

This is the middle ground we were looking for: more flexible than `List<Shape>` (accepts subtypes), more useful than `List<?>` (preserves type information).

---

## Concept 3: The Critical Restriction — You Can Read, But You Cannot Write

### 🧠 What happens if we try to add elements?

Here's the most important rule about upper bounded wildcards:

> **You can READ from a `List<? extends T>`, but you CANNOT WRITE to it.**

Let's see why. Consider a method that tries to add an element:

```java
public static void addNumber(List<? extends Number> list) {
    list.add(10);    // ❌ Compile error!
    list.add(3.14);  // ❌ Compile error!
}
```

### ❓ Why can't we add anything?

Because the compiler doesn't know the **actual type** of the list. `List<? extends Number>` could be:

- A `List<Integer>` — adding a `Double` would corrupt it
- A `List<Double>` — adding an `Integer` would corrupt it
- A `List<Float>` — adding either would corrupt it

The compiler sees `? extends Number` and thinks: *"This is a list of SOME subtype of Number, but I don't know which one. I can't let you add anything because I might be putting the wrong type in."*

### 🧪 Walking through the danger

Imagine if Java *did* allow adding:

```java
List<Integer> integers = new ArrayList<>();
List<? extends Number> numbers = integers;  // This assignment is fine

numbers.add(3.14);  // If this were allowed...
Integer value = integers.get(0);  // 💥 ClassCastException! 3.14 is not an Integer!
```

By refusing to let you add, Java prevents this entire category of bugs at compile time.

### ⚙️ But reading works perfectly

While you can't write, you **can** read from the list — and the elements come back as the upper bound type:

```java
public static void readNumbers(List<? extends Number> list) {
    for (Number n : list) {
        System.out.println(n.doubleValue());  // ✅ Safe — every element IS a Number
    }
}
```

You can call this with any list of number subtypes:

```java
readNumbers(List.of(1, 2, 3));          // List<Integer> ✅
readNumbers(List.of(1.1, 2.2, 3.3));    // List<Double> ✅
readNumbers(List.of(1.0f, 2.0f));       // List<Float> ✅
```

### 💡 Insight

Think of `List<? extends Number>` as a **producer** — it produces (gives you) elements of type `Number`. It's a source you can read from, but not a destination you can write to. This mental model becomes very important when we compare upper and lower bounded wildcards later.

---

## Concept 4: Upper Bounded Wildcards vs Bounded Type Parameters

### 🧠 How is `? extends T` different from `<T extends Shape>`?

At first glance, these two look very similar:

```java
// Upper bounded wildcard
public static void drawAll(List<? extends Shape> shapes) { ... }

// Bounded type parameter
public static <T extends Shape> void drawAll(List<T> shapes) { ... }
```

Both accept a `List<Rectangle>` or a `List<Circle>`. Both let you treat elements as `Shape` inside the method. So what's the difference?

The fundamental difference is what we established earlier:

- **`T` gives the unknown type a name** — the compiler resolves it and tracks it. You can use `T` across multiple parameters to enforce they share the same type.
- **`?` keeps the type anonymous** — the compiler intentionally doesn't track it. Each `?` is independent.

With wildcards, you **cannot** relate the types of two parameters:

```java
// These two wildcards are independent — no guarantee they're the same type
public static void copy(List<? extends Shape> src, List<? extends Shape> dest) { ... }
```

With type parameters, you **can**:

```java
// T is the same type in both parameters
public static <T extends Shape> void copy(List<T> src, List<T> dest) { ... }
```

### 💡 Insight

Use upper bounded wildcards when you just need to **read** from a collection of subtypes and don't need to relate types across parameters. Use bounded type parameters when you need to **track** the type or enforce consistency between multiple parameters. We'll dive deeper into this comparison in a dedicated lecture.

---

## Concept 5: Summary — The Two Operations

### 🧠 The mental model for upper bounded wildcards

When working with `List<? extends T>`, always remember these two rules:

| Operation | Allowed? | Why? |
|-----------|----------|------|
| **Read** items from the list | ✅ Yes — as type `T` | Every element is guaranteed to be `T` or a subtype of `T` |
| **Write** items to the list | ❌ No | The actual subtype is unknown — adding any specific type could corrupt the list |

This is the defining characteristic of upper bounded wildcards: they are **read-only** views of a collection. You can safely consume elements from them, but you cannot produce elements into them.

In the next lectures, we'll see concrete code examples of upper bounded wildcards in action, and then we'll explore **lower bounded wildcards** (`? super T`) — which flip this rule on its head, allowing writes but restricting reads.

---

## ✅ Key Takeaways

1. **Upper bounded wildcards use `? extends T`** — They accept a list of any type that is `T` or a subtype of `T`, solving the generic invariance problem while preserving type information.

2. **You can read from `List<? extends T>` but not write to it** — Reading is safe because every element is guaranteed to be at least `T`. Writing is forbidden because the actual subtype is unknown and adding the wrong type would break type safety.

3. **The compiler can't guarantee which subtype the list holds** — A `List<? extends Number>` might be `List<Integer>`, `List<Double>`, or `List<Float>`. Since the compiler doesn't know which, it refuses to let you add any specific type.

4. **Upper bounded wildcards are producers** — Think of them as sources you read from. This "producer" concept will become clearer when contrasted with lower bounded wildcards (consumers) in upcoming lectures.

5. **Use wildcards for reading, type parameters for tracking** — If you just need to iterate over a collection of subtypes, `? extends T` is clean and simple. If you need to relate types across parameters or write back to the collection, use `<T extends ...>` instead.
