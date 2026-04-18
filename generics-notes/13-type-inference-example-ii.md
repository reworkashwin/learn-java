# Type Inference Example II — Lists and Automatic Type Detection

## Introduction

We've seen type inference with simple generic classes. Now let's see how Java handles type inference with **collections** — specifically `ArrayList` and `List`. This example proves that Java can figure out what type a list stores just by looking at the items you add to it.

---

## Concept 1: A Generic Method That Builds a List

### 🧠 What is it?

A method that accepts any two items and a list, adds both items to the list, and returns it — all without explicitly stating the type.

### ⚙️ How it works

```java
public static <T> List<T> add(List<T> list, T first, T second) {
    list.add(first);
    list.add(second);
    return list;
}
```

This method is generic — `T` could be `Integer`, `String`, `Double`, or anything. The caller never needs to specify `T` explicitly.

---

## Concept 2: Type Inference with Integer Lists

### 🧪 Example

```java
List<Integer> list = add(new ArrayList<>(), 1, 2);
System.out.println(list);  // [1, 2]
```

### 💡 What Java infers step by step

1. We pass `1` and `2` — both are `Integer` values
2. Java infers `T = Integer`
3. `new ArrayList<>()` becomes `new ArrayList<Integer>()`
4. The return type becomes `List<Integer>`

We never wrote `<Integer>` anywhere on the method call — Java figured it all out.

> **Quick note:** `ArrayList` implements the `List` interface. That's why passing `new ArrayList<>()` where a `List<T>` is expected works perfectly.

---

## Concept 3: Type Inference with Strings

### 🧪 Example

```java
List<String> names = add(new ArrayList<>(), "Adam", "Kevin");
System.out.println(names);  // [Adam, Kevin]
```

Java sees `"Adam"` and `"Kevin"` — both `String` — and infers `T = String`. The list automatically becomes a `List<String>`.

---

## Concept 4: Using `var` (Java 10+)

### ⚙️ How it works

Starting with Java 10, you can use `var` to let the compiler infer the variable type too:

```java
var list = add(new ArrayList<>(), 1, 2);
```

Java infers:
- `T = Integer` from the arguments
- The variable type = `List<Integer>` from the return type

This is **double type inference** — both the generic type parameter and the variable type are inferred automatically.

---

## ✅ Key Takeaways

- Java infers generic types from the **arguments you pass**, not from explicit declarations
- Works seamlessly with collections like `ArrayList` and `List`
- `var` (Java 10+) adds another layer of inference on top of generics
- You almost never need to specify generic types explicitly in modern Java

## ⚠️ Common Mistakes

- Adding items of **different types** to the same generic list — if you pass an `Integer` and a `String`, Java can't infer a single type `T`
- Forgetting that `ArrayList` implements `List` — they're compatible, not separate types

## 💡 Pro Tip

Type inference makes code cleaner, but if you ever find the compiler can't figure out the types (especially with complex nested generics), you can always add explicit type arguments. We'll see how in the next lecture on **type witnesses**.
