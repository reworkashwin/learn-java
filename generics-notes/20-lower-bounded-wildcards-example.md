# Lower Bounded Wildcards — Example

## Introduction

We've seen upper bounded wildcards (`? extends`) for reading. Now let's look at the other side: **lower bounded wildcards** (`? super`). These are used when you want to **write** into a generic structure. If upper bounds make things producers, lower bounds make things **consumers**.

---

## Concept 1: The Problem — Adding Elements Safely

### 🧠 What is it?

Suppose you want a method that adds integers to a list. You'd like it to accept `List<Integer>`, but also `List<Number>` and `List<Object>` — because all of these can safely hold an `Integer`.

```java
public static void addNumbers(List<Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}
```

This only works with `List<Integer>`:

```java
List<Number> numbers = new ArrayList<>();
addNumbers(numbers);  // COMPILE-TIME ERROR! List<Number> != List<Integer>
```

But logically, adding an `Integer` to a `List<Number>` is perfectly safe. How do we express this?

---

## Concept 2: The `? super` Syntax

### 🧠 What is it?

A lower bounded wildcard `? super Type` means: "The unknown type is `Type` **or any superclass** of `Type`."

### ⚙️ How it works

```java
public static void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}
```

Now this method accepts:
- `List<Integer>` — Integer is Integer ✅
- `List<Number>` — Number is a supertype of Integer ✅
- `List<Object>` — Object is a supertype of Integer ✅

### 🧪 Example

```java
List<Integer> integers = new ArrayList<>();
List<Number> numbers = new ArrayList<>();
List<Object> objects = new ArrayList<>();

addNumbers(integers);  // works!
addNumbers(numbers);   // works!
addNumbers(objects);    // works!

System.out.println(integers);  // [1, 2, 3]
System.out.println(numbers);   // [1, 2, 3]
System.out.println(objects);   // [1, 2, 3]
```

```java
List<Double> doubles = new ArrayList<>();
addNumbers(doubles);  // COMPILE-TIME ERROR — Double is NOT a supertype of Integer
```

---

## Concept 3: Reading from `? super` — The Trade-Off

### 🧠 What is it?

With lower bounded wildcards, you can **write** freely, but **reading** becomes limited. When you read from a `List<? super Integer>`, you can only get `Object`:

```java
public static void inspect(List<? super Integer> list) {
    Object item = list.get(0);  // only Object — not Integer!
    // Integer i = list.get(0); // COMPILE-TIME ERROR
}
```

### ❓ Why?

The list could be `List<Object>`, `List<Number>`, or `List<Integer>`. The only type guaranteed to cover all possibilities is `Object`.

### 💡 Insight

This is the trade-off:
- `? extends` = great for reading, can't write
- `? super` = great for writing, reading returns `Object`

---

## Concept 4: Practical Example — Copy Method

### 🧠 What is it?

A classic use of `? super` combined with `? extends` is a copy operation: read from a source, write to a destination.

### ⚙️ How it works

```java
public static <T> void copy(List<? extends T> source, List<? super T> dest) {
    for (T item : source) {
        dest.add(item);
    }
}
```

```java
List<Integer> src = List.of(1, 2, 3);
List<Number> dst = new ArrayList<>();

copy(src, dst);
System.out.println(dst);  // [1, 2, 3]
```

- `source` uses `? extends T` — we read from it (producer)
- `dest` uses `? super T` — we write to it (consumer)

This is the **PECS principle** in action: Producer Extends, Consumer Super.

---

## Concept 5: Real-World Analogy

Think of a recycling bin. A bin labeled "Plastic or above" (`? super Plastic`) can accept plastic bottles, because plastic **is** plastic. It can also be a general "recyclables" bin (supertype), which also accepts plastic. But a "glass-only" bin (a more specific type) would NOT accept plastic.

Lower bounds work the same way: you can add a specific item to any container that is typed for that item **or something more general**.

---

## ✅ Key Takeaways

- `? super Type` means "Type or any supertype of Type"
- Lower bounded wildcards allow you to **safely add** elements of the specified type
- Reading from `? super` returns `Object` — you lose specific type information
- Combine with `? extends` for copy/transfer operations
- This is the "Consumer" side of PECS: **Consumer Super**

## ⚠️ Common Mistakes

- Expecting to read specific types from `List<? super Integer>` — you only get `Object`
- Using `? super` when you need to read typed values — use `? extends` instead
- Confusing the direction: `super` goes UP the hierarchy (to supertypes), `extends` goes DOWN (to subtypes)

## 💡 Pro Tip

When designing a method:
- If the parameter is a **data source** (you read from it) → use `? extends`
- If the parameter is a **data sink** (you write to it) → use `? super`
- If you both read and write → use a concrete type parameter `<T>`
