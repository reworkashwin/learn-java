# Type Inference in Practice

## Introduction

In the previous lecture, we explored the theory behind type inference—how Java's compiler determines generic types automatically using clues from arguments, assignments, and return types. Now it's time to see type inference in action with a hands-on example.

We'll build a generic `Bucket` class, create a method that adds items to a list of buckets, and observe how Java infers the types at every step—so we never have to spell them out explicitly. We'll also look at the `var` keyword introduced in Java 10, which takes type inference beyond generics into everyday variable declarations.

---

## Concept 1: Setting Up a Generic Bucket Class

### 🧠 What is it?

A `Bucket` is a simple generic container—a class that can hold one item of any type. Think of it like a box with a label: you decide what goes in when you create it.

### ⚙️ How it works

```java
public class Bucket<T> {
    private T item;

    public Bucket(T item) {
        this.item = item;
    }

    public T getItem() {
        return this.item;
    }
}
```

Here's what's happening:
1. `<T>` declares a type parameter—`T` is a placeholder for whatever type you choose
2. `private T item` stores a value of that type
3. The constructor accepts an item of type `T` and assigns it
4. `getItem()` returns the stored item

### 🧪 Example

```java
Bucket<String> nameBucket = new Bucket<>("Alice");
Bucket<Integer> ageBucket = new Bucket<>(30);
```

A `Bucket<String>` holds strings. A `Bucket<Integer>` holds integers. The class is the same—only the type changes.

### 💡 Insight

This is the beauty of generics: you write the class once, and it works for every type. No casting, no `Object` tricks, no duplicate code.

---

## Concept 2: Building the `addStore` Method

### 🧠 What is it?

We want a method that takes a generic item, wraps it in a `Bucket`, and adds that bucket to a list of buckets. This is where type inference starts doing the heavy lifting.

### ❓ Why is this method interesting?

Because it involves **multiple layers** of generics:
- A generic item `T`
- A `Bucket<T>` wrapping that item
- A `List<Bucket<T>>` collecting those buckets

Java has to infer the type at every step—and it does, flawlessly.

### ⚙️ How it works

```java
public class GenericApplication {

    public static <T> void addStore(T item, List<Bucket<T>> list) {
        Bucket<T> bucket = new Bucket<>(item);
        list.add(bucket);
        System.out.println("Item is added successfully: " + item);
    }
}
```

Let's break this down step by step:

**Step 1:** The method is declared as `static` because we'll call it from `main`. It's also generic—`<T>` before `void` means this method has its own type parameter.

**Step 2:** The method takes two arguments:
- `T item` — the actual value we want to store
- `List<Bucket<T>> list` — a list that holds buckets of the same type

**Step 3:** Inside the method, we create a new `Bucket`:
```java
Bucket<T> bucket = new Bucket<>(item);
```

Notice the **diamond operator** `<>` on the right side. We wrote `new Bucket<>(item)` — not `new Bucket<T>(item)`. Why? Because of type inference! Java sees that the left side is `Bucket<T>`, so it infers that the right side must also be `Bucket<T>`. No need to repeat yourself.

**Step 4:** We add the bucket to the list and print a confirmation.

### 💡 Insight

The diamond operator `<>` in `new Bucket<>(item)` is a perfect example of type inference at the instantiation level. The compiler already knows `T` from the method signature—why would you need to tell it again?

---

## Concept 3: Calling the Method — Inference in Action

### 🧠 What happens when we call `addStore`?

Here's where the magic becomes visible. Watch how Java infers everything:

### ⚙️ How it works

```java
public static void main(String[] args) {
    List<Bucket<String>> list = new ArrayList<>();
    GenericApplication.addStore("Adam", list);
}
```

Let's trace the inference:

**1. Creating the list:**
```java
List<Bucket<String>> list = new ArrayList<>();
```
The left side says `List<Bucket<String>>`. The right side uses `<>`. Java infers: `new ArrayList<Bucket<String>>()`. You don't write it—Java knows.

**2. Calling the method:**
```java
GenericApplication.addStore("Adam", list);
```
- The first argument `"Adam"` is a `String`
- Java sees the method signature: `addStore(T item, List<Bucket<T>> list)`
- From `"Adam"`, Java infers `T = String`
- It then checks: is `list` a `List<Bucket<String>>`? Yes! ✓
- Everything matches—no explicit type needed

**3. Output:**
```
Item is added successfully: Adam
```

### 🧪 Example: Switching to Integer

What happens if we use integers instead?

```java
List<Bucket<Integer>> list = new ArrayList<>();
GenericApplication.addStore(42, list);
```

Output:
```
Item is added successfully: 42
```

Java infers `T = Integer` from the value `42`. The list holds `Bucket<Integer>` objects. Everything aligns automatically.

### ❓ What if types don't match?

```java
List<Bucket<Integer>> list = new ArrayList<>();
GenericApplication.addStore("Adam", list);  // ❌ Compile error!
```

This fails at compile time. Java infers `T = String` from `"Adam"`, but the list is `List<Bucket<Integer>>`. The types conflict, and the compiler catches it immediately. This is the safety net generics provide.

### 💡 Insight

Type inference doesn't just make code shorter—it makes the **compiler work for you**. Java traces the type from your arguments through the method signature, across object creations, and into collections. If anything is inconsistent, you get a compile-time error, not a runtime crash.

---

## Concept 4: The `var` Keyword — Type Inference Beyond Generics

### 🧠 What is it?

Starting with **Java 10** (and enhanced further in later versions), Java introduced the `var` keyword for **local variable type inference**. Instead of declaring the type explicitly, you let the compiler figure it out from the value on the right side.

### ❓ Why do we need it?

Sometimes type declarations get long and redundant:

```java
Map<String, List<Map<Integer, String>>> data = new HashMap<>();
```

The left side is massive—and the compiler already knows the type from the right side. Why make the developer write it?

### ⚙️ How it works

```java
var number = 10;          // Inferred as int
var price = 9.99f;        // Inferred as float
var ratio = 3.14;         // Inferred as double
var name = "Anna";        // Inferred as String
```

Java looks at the right side and determines the type:
- `10` → `int`
- `9.99f` → `float`
- `3.14` → `double`
- `"Anna"` → `String`

You don't specify the type—Java infers it.

### 🧪 Example: `var` with generics

```java
var nums = new ArrayList<Integer>();
```

Java sees `new ArrayList<Integer>()` on the right and infers that `nums` is of type `ArrayList<Integer>`. No need to write it on the left side.

Compare:
```java
// Without var
List<Integer> nums = new ArrayList<>();

// With var
var nums = new ArrayList<Integer>();
```

Notice an important difference: with `var`, the type information **must** appear on the right side (the initializer), because that's where inference gets its clue. With explicit typing, the left side provides the clue and the right side uses `<>`.

### ⚠️ Common Mistake

Don't confuse `var` with dynamic typing. Java is still **statically typed**—the type is determined at compile time and cannot change:

```java
var name = "Anna";
name = 42;      // ❌ Compile error! name is a String, not a number.
```

### 💡 Insight

`var` is essentially the same type inference mechanism we've been discussing, but applied to local variables instead of generic type parameters. The principle is identical: the compiler has enough context to determine the type, so you don't have to state it explicitly.

---

## Concept 5: The Full Picture — Inference Working Everywhere

### 🧠 Tying it all together

Let's look at a complete example where type inference is active at multiple levels simultaneously:

```java
public class GenericApplication {

    public static <T> void addStore(T item, List<Bucket<T>> list) {
        Bucket<T> bucket = new Bucket<>(item);   // Inference: Bucket<T>
        list.add(bucket);
        System.out.println("Item is added successfully: " + item);
    }

    public static void main(String[] args) {
        List<Bucket<String>> list = new ArrayList<>();           // Inference: ArrayList<Bucket<String>>
        GenericApplication.addStore("Adam", list);               // Inference: T = String

        List<Bucket<Integer>> intList = new ArrayList<>();       // Inference: ArrayList<Bucket<Integer>>
        GenericApplication.addStore(42, intList);                 // Inference: T = Integer
    }
}
```

Count the inference points:
1. `new ArrayList<>()` — inferred from declared type on the left
2. `addStore("Adam", list)` — `T` inferred as `String` from the argument
3. `new Bucket<>(item)` — diamond operator, inferred from variable type
4. All the same for the `Integer` version

That's **four** places where the compiler deduces types automatically, keeping your code clean and readable.

### ⚙️ The conditions for inference to work

Type inference works **as long as the compiler has enough context to infer the type**. This context comes from:
- The arguments you pass
- The variable you assign to
- The method signature

But what if the compiler **doesn't** have enough information? That's when you might need a **type witness**—an explicit type hint. We'll explore type witnesses in an upcoming lecture.

---

## ✅ Key Takeaways

1. **The diamond operator `<>` is type inference at work** — Java infers the generic type from the left side of the assignment, so you don't repeat it on the right

2. **Generic method calls infer `T` from arguments** — When you pass `"Adam"`, Java knows `T = String` without you writing `<String>`

3. **Type mismatches cause compile-time errors** — If you pass a `String` argument but provide a `List<Bucket<Integer>>`, Java catches it immediately

4. **`var` extends inference to local variables** — Instead of declaring the type, let the compiler infer it from the initializer (Java 10+)

5. **Inference needs context** — It works only when the compiler has enough clues; without them, you may need a type witness

---

## ⚠️ Common Mistakes

- **Omitting type information entirely** — With `var`, the right side must carry the full type: `var list = new ArrayList<>()` infers `ArrayList<Object>`, not what you probably intended. Use `var list = new ArrayList<Integer>()` instead.

- **Confusing `var` with dynamic typing** — `var` doesn't make Java dynamically typed. The type is fixed at compile time and never changes.

- **Forgetting the diamond operator** — Writing `new Bucket(item)` without `<>` creates a raw type, which bypasses generic safety and produces warnings.

---

## 💡 Pro Tips

- **Let inference do its job** — Don't write `GenericApplication.<String>addStore("Adam", list)` unless there's genuine ambiguity. Trust the compiler.

- **Use `var` for readability**, not laziness — `var` shines when the type is obvious from context (`var name = "Anna"`). Avoid it when the type isn't clear from the right side.

- **Watch for `var` with diamonds** — `var list = new ArrayList<>()` gives you `ArrayList<Object>`. If you use `var`, put the type in the constructor: `var list = new ArrayList<String>()`.

- **If inference fails, use a type witness** — Sometimes you need to explicitly tell Java the type. We'll cover this technique in the next lecture.
