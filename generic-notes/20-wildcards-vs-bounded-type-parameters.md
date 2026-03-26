# Wildcards vs Bounded Type Parameters — When to Use Which

## Introduction

We've now covered both bounded type parameters (`<T extends Number>`) and all three wildcard types — unbounded (`?`), upper bounded (`? extends T`), and lower bounded (`? super T`). They often seem interchangeable, and it can be confusing to know which one to reach for. This lecture clarifies the fundamental differences and gives you a clear decision framework.

---

## Concept 1: The Get and Put Principle

### 🧠 What is it?

The most important rule for choosing between wildcards is the **Get and Put Principle** (also known as PECS — Producer Extends, Consumer Super):

| What you're doing | Use this | Why |
|-------------------|----------|-----|
| **Getting** values out of a collection (reading) | Upper bounded wildcard (`? extends T`) | Safe to read as `T` |
| **Putting** values into a collection (writing) | Lower bounded wildcard (`? super T`) | Safe to write `T` or subtypes |
| **Both** getting and putting | Bounded type parameter (`<T extends ...>`) or plain `List<T>` | Need full read/write access with type tracking |

### 💡 Insight

This is the decision tree you should follow every time:
1. *"Am I only reading?"* → `? extends T`
2. *"Am I only writing?"* → `? super T`
3. *"Am I doing both?"* → Don't use wildcards. Use a bounded type parameter (`<T>`) instead, because wildcards can't give you both read and write access with type safety.

---

## Concept 2: The Immutability Misconception

### 🧠 What's the misconception?

A common mistake is thinking that upper bounded wildcards (`? extends T`) provide **immutability** — that the list becomes completely unmodifiable. This is **not true**.

### ❓ Why isn't it immutable?

While you can't add typed elements to a `List<? extends T>`, you **can** still:

1. **Add `null`** — `null` is compatible with every type:

```java
public static <T> void process(List<? extends T> list) {
    list.add(null);  // ✅ This compiles! null fits any type.
}
```

2. **Sort the list** — sorting rearranges existing elements without adding new ones:

```java
public static void process(List<? extends Comparable> list) {
    Collections.sort(list);  // ✅ Modifies the list's order
}
```

3. **Remove elements** — you can clear or remove items:

```java
public static <T> void process(List<? extends T> list) {
    list.clear();    // ✅ Removes all elements
    list.remove(0);  // ✅ Removes by index
}
```

### ⚠️ Common Mistake

Don't rely on `? extends T` to protect a collection from modification. It only prevents adding **typed** elements. If you need true immutability, use `Collections.unmodifiableList()` or `List.of()`.

### 💡 Insight

Upper bounded wildcards restrict **what types you can insert**, not **all mutations**. The restriction exists for type safety, not for immutability. These are two completely different concerns.

---

## Concept 3: Where You Can Use Them

### 🧠 The scope difference

One of the most fundamental differences between wildcards and bounded type parameters is **where they can appear**:

**Bounded type parameters** — can only be declared on **methods** (and classes/interfaces):

```java
// ✅ Type parameter on a method declaration
public static <T extends Number> void process(List<T> list) { ... }

// ✅ Type parameter on a class declaration
public class Box<T extends Comparable<T>> { ... }
```

**Wildcards** — can be used **anywhere a type is expected**, including local variables:

```java
// ✅ Wildcard in a local variable declaration
List<? extends Number> numbers = new ArrayList<Integer>();

// ✅ Wildcard as a method parameter
public static void print(List<?> list) { ... }

// ✅ Wildcard in the main method — no generic declaration needed
public static void main(String[] args) {
    List<? extends Number> list = Arrays.asList(1, 2, 3);  // ✅ Works
    List<T> list2 = Arrays.asList(1, 2, 3);                // ❌ T is not defined here!
}
```

### ❓ Why can't `T` be used in `main`?

Because `T` is a **type parameter** — it must be declared somewhere (on a method or class). The `main` method has no `<T>` declaration, so `T` doesn't exist in that scope. Wildcards, on the other hand, don't need a declaration — `?` can appear anywhere.

### 💡 Insight

Wildcards are more **flexible in placement** — you can use them in local variables, fields, return types, and method parameters without any special declaration. Type parameters require a `<T>` declaration on the enclosing method or class.

---

## Concept 4: Type Access — Named vs Anonymous

### 🧠 The core difference

This is the most important conceptual difference:

- **Bounded type parameters give you access to the type** — `T` is a name you can reference, use across parameters, and return:

```java
public static <T extends Number> T getFirst(List<T> list) {
    T item = list.get(0);  // ✅ Can use T as a variable type
    return item;           // ✅ Can return T
}
```

- **Wildcards keep the type anonymous** — you can't reference `?` by name, store it in a variable with its actual type, or use it across parameters:

```java
public static void process(List<? extends Number> list) {
    // ? item = list.get(0);  // ❌ Can't use ? as a type name
    Number item = list.get(0);  // ✅ Must use the bound instead
}
```

### 💡 Insight

This is the same distinction we established earlier: `T` is unknown **with identity** (you give it a name and track it), while `?` is unknown **without identity** (anonymous and untrackable). This difference drives everything — type parameters can relate types across parameters and return values, wildcards cannot.

---

## Concept 5: Multiple Bounds — Type Parameters Win

### 🧠 What if you need multiple bounds?

**Wildcards support only a single bound:**

```java
List<? extends Number>         // ✅ Single upper bound
List<? super Integer>          // ✅ Single lower bound
List<? extends Number & Serializable>  // ❌ Compile error — only one bound allowed
```

You also cannot combine `extends` and `super` on the same wildcard:

```java
List<? extends Number super Integer>  // ❌ Not valid syntax
```

**Bounded type parameters support multiple bounds:**

```java
public static <T extends Comparable<T> & Serializable> void process(List<T> list) {
    // ✅ T must implement BOTH Comparable and Serializable
}
```

The `&` operator lets you specify multiple interfaces (and at most one class) that `T` must satisfy. This is something wildcards simply cannot do.

### ❓ When does this matter?

When you need a type that satisfies multiple contracts simultaneously. For example, if you want to sort a list **and** serialize its elements, you need `T` to be both `Comparable` and `Serializable`. Only a bounded type parameter can express this constraint.

### 💡 Insight

If your constraint involves multiple interfaces or a class-plus-interface combination, bounded type parameters are your only option. Wildcards are limited to a single bound — one `extends` or one `super`, never both, never multiple.

---

## Concept 6: The Decision Framework

### 🧠 When to use what?

Here's a comprehensive guide for choosing between wildcards and bounded type parameters:

| Scenario | Use | Reason |
|----------|-----|--------|
| Only **reading** from a collection | `? extends T` | Don't need type tracking — just consume |
| Only **writing** to a collection | `? super T` | Don't need to read with specific type |
| **Reading and writing** to a collection | `<T>` or `<T extends ...>` | Need full type access for both operations |
| Need to **relate types** across parameters | `<T>` | Wildcards are independent per parameter |
| Need **multiple bounds** | `<T extends A & B>` | Wildcards support only one bound |
| **Local variable** with flexible type | `?` wildcard | Type parameters need a declaration scope |
| **Simple read-only** method | `?` wildcard | Simpler, more expressive — prefer wildcards |

### 💡 The golden rule

> **Use wildcards whenever possible. Fall back to bounded type parameters when wildcards aren't enough.**

Wildcards are simpler and more expressive for read-only or write-only scenarios. But when you need type identity (tracking the type across parameters, reading AND writing, multiple bounds), bounded type parameters are the right tool.

---

## ✅ Key Takeaways

1. **Get and Put Principle** — use `? extends T` for getting (reading), `? super T` for putting (writing), and bounded type parameters for both.

2. **Upper bounded wildcards do NOT provide immutability** — you can still add `null`, sort, and remove elements. Only typed insertions are blocked.

3. **Wildcards can be used anywhere; type parameters need a declaration** — `?` works in local variables, fields, and parameters. `T` requires a `<T>` declaration on a method or class.

4. **Type parameters give you a name; wildcards keep the type anonymous** — `T` can be referenced, returned, and used to relate parameters. `?` cannot.

5. **Multiple bounds require type parameters** — `<T extends Comparable & Serializable>` works; `? extends A & B` does not.

6. **Prefer wildcards; use type parameters when needed** — wildcards are simpler for single-operation scenarios. Reach for type parameters when you need type tracking, read+write, or multiple bounds.
