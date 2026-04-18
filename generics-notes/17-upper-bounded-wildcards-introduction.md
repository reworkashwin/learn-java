# Upper Bounded Wildcards — Introduction

## Introduction

We've seen that `List<?>` is too restrictive — you can read elements only as `Object`. But often you want to read elements as a **specific type or its subtypes**. For example, you want a method that works with any `List` of `Number` — whether it's `List<Integer>`, `List<Double>`, or `List<Number>` itself. That's exactly what **upper bounded wildcards** provide.

---

## Concept 1: The Problem with Unbounded Wildcards

### 🧠 What is it?

With `List<?>`, every element is read as `Object`. If you want to do numeric operations, you'd need to cast — and that's unsafe.

```java
public static double sum(List<?> list) {
    double total = 0;
    for (Object item : list) {
        total += ((Number) item).doubleValue();  // unsafe cast!
    }
    return total;
}
```

This compiles, but it will crash at runtime if the list contains non-numeric types. We need a way to tell the compiler: "This list contains Numbers or subtypes of Number."

---

## Concept 2: The `? extends` Syntax

### 🧠 What is it?

An upper bounded wildcard uses `? extends Type` to say: "The unknown type is `Type` **or any subclass** of `Type`."

### ⚙️ How it works

```java
public static double sum(List<? extends Number> list) {
    double total = 0;
    for (Number num : list) {        // safe — every element IS a Number
        total += num.doubleValue();
    }
    return total;
}
```

Now the compiler guarantees that every element in the list is at least a `Number`, so calling `doubleValue()` is perfectly safe.

### 🧪 Example

```java
List<Integer> integers = List.of(1, 2, 3);
List<Double> doubles = List.of(1.5, 2.5, 3.5);
List<Number> numbers = List.of(1, 2.5, 3L);

System.out.println(sum(integers));  // 6.0
System.out.println(sum(doubles));   // 7.5
System.out.println(sum(numbers));   // 6.5
```

All three work because `Integer`, `Double`, and `Number` all satisfy `? extends Number`.

```java
List<String> strings = List.of("hello");
sum(strings);  // COMPILE-TIME ERROR — String is not a Number
```

---

## Concept 3: Reading vs. Writing with Upper Bounds

### 🧠 What is it?

Upper bounded wildcards are designed for **reading** (producing values). You can safely read elements as the upper bound type. But you **cannot add** elements.

### ❓ Why can't you add?

```java
List<? extends Number> list = new ArrayList<Integer>();
list.add(3.14);  // COMPILE-TIME ERROR!
list.add(42);    // COMPILE-TIME ERROR!
```

The compiler doesn't know the actual type. The list might be `List<Integer>`, so adding a `Double` would be wrong. Or it might be `List<Double>`, so adding an `Integer` would be wrong. The compiler plays it safe and blocks all additions.

### 💡 Insight

Think of `? extends Number` as a **producer** — it produces values of type `Number` (or subtypes) for you to consume. But you can't put values back in because you don't know the exact type.

---

## Concept 4: Using Upper Bounds with Custom Hierarchies

### 🧠 What is it?

Upper bounded wildcards work with any class hierarchy, not just `Number`.

### ⚙️ How it works

```java
class Animal {
    String name;
    Animal(String name) { this.name = name; }
}
class Dog extends Animal {
    Dog(String name) { super(name); }
}
class Cat extends Animal {
    Cat(String name) { super(name); }
}
```

```java
public static void printNames(List<? extends Animal> animals) {
    for (Animal a : animals) {
        System.out.println(a.name);
    }
}
```

```java
List<Dog> dogs = List.of(new Dog("Rex"), new Dog("Buddy"));
List<Cat> cats = List.of(new Cat("Whiskers"));

printNames(dogs);  // Rex, Buddy
printNames(cats);  // Whiskers
```

Without upper bounded wildcards, you'd need separate methods for `List<Dog>`, `List<Cat>`, etc.

---

## Concept 5: Real-World Analogy

Imagine a fruit inspector who examines any basket of fruit — apples, oranges, bananas. They can **look at** and **inspect** any type of fruit (reading). But they can't **add** fruit to the basket because they don't know what type of basket it is — putting an orange in an apple-only basket would be wrong.

`? extends Fruit` = "I can inspect any fruit, but I won't add to the basket."

---

## ✅ Key Takeaways

- `? extends Type` means "Type or any subclass of Type"
- It enables methods that accept `List<Integer>`, `List<Double>`, etc. where `List<Number>` is expected
- You can **read** elements as the upper bound type
- You **cannot add** elements (except `null`)
- Upper bounded wildcards make your code flexible for read-only operations

## ⚠️ Common Mistakes

- Trying to add elements to a `List<? extends X>` — it's read-only
- Confusing `<T extends Number>` (type parameter) with `<? extends Number>` (wildcard) — they serve different purposes
- Using upper bounded wildcards when you need to write — use lower bounded wildcards (`? super`) instead

## 💡 Pro Tip

Remember the mnemonic: **`extends` = read / produce**. When you use `? extends`, you're saying "I want to read from this structure." This is the "Producer" side of the PECS principle (Producer Extends, Consumer Super).
