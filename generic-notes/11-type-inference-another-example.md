# Type Inference — Another Example

## Introduction

We've already explored type inference in the previous lectures — how Java's compiler figures out generic types from context so you don't have to spell everything out. But the concept is powerful enough to deserve one more example.

In this lecture, we'll build a generic method that accepts a list and two items, adds both items to the list, and returns it. Then we'll watch Java infer types seamlessly — whether we're working with integers, strings, or using the `var` keyword. By the end, you'll see just how smart Java's type inference really is.

---

## Concept 1: Building a Generic `add` Method

### 🧠 What is it?

We want a generic method that takes a `List`, two items of any type, adds both items to the list, and returns the updated list. This is a clean, self-contained example that showcases multiple levels of type inference working together.

### ⚙️ How it works

```java
public static <T> List<T> add(List<T> list, T first, T second) {
    list.add(first);
    list.add(second);
    return list;
}
```

Let's walk through this:

**Step 1:** The method is `static` because we'll call it from `main`. It's generic — `<T>` before the return type declares a type parameter.

**Step 2:** The return type is `List<T>`, not `void`. We return the list after adding both items.

**Step 3:** The method takes three parameters:
- `List<T> list` — the list we're adding items to
- `T first` — the first item to add
- `T second` — the second item to add

**Step 4:** Inside the method, we add both items to the list and return it.

### 💡 Insight

Notice that `List` here is an **interface**, not a concrete class. When we call this method, we'll pass an `ArrayList` — which *implements* the `List` interface. This is a common Java pattern: program to the interface, pass the implementation. We'll explore `List` and `ArrayList` in more detail in upcoming lectures, but the key idea is that `ArrayList` is a data structure for storing multiple items.

---

## Concept 2: Calling the Method with Integers

### 🧠 What happens when we call `add` with integer values?

This is where type inference shines. We never tell Java "this is an `ArrayList` of integers" — Java figures it out on its own.

### ⚙️ How it works

```java
public static void main(String[] args) {
    List<Integer> list = add(new ArrayList<>(), 1, 2);
    System.out.println(list);
}
```

Let's trace the inference step by step:

**1. The `new ArrayList<>()`:**
We pass `new ArrayList<>()` as the first argument. Notice the diamond operator `<>` — we're not specifying what type this `ArrayList` holds. Java has to figure it out.

**2. The integer arguments `1` and `2`:**
The second and third arguments are integer values. Java autoboxes them to `Integer`.

**3. The inference chain:**
- Java sees `1` and `2` as `Integer` values
- From the method signature `add(List<T> list, T first, T second)`, it infers `T = Integer`
- Therefore, the first parameter must be `List<Integer>`, so `new ArrayList<>()` becomes `new ArrayList<Integer>()`
- The return type becomes `List<Integer>`

**4. Output:**
```
[1, 2]
```

Everything matches — and we never explicitly stated `Integer` anywhere in the method call.

### ❓ Why is this impressive?

Think about what Java just did. We created an `ArrayList` with no type specified, passed in two plain numbers, and Java connected all the dots:
- The numbers are `Integer`
- The list must hold `Integer` values
- The return type is `List<Integer>`

That's type inference working across **three parameters and a return type** simultaneously.

### 💡 Insight

This is a typical example of type inference. We do not specify explicitly that we want an `ArrayList` for storing integer values — Java is smart enough to figure out that the items being added are integers, so the list must be a list of integers. There is no need to spell it out.

---

## Concept 3: Using `var` — Let Java Handle the Variable Type Too

### 🧠 What is it?

Starting with Java 10, we can use the `var` keyword for local variable type inference. Instead of writing `List<Integer> list = ...`, we can simply write `var list = ...` and let Java infer the variable's type from the right-hand side.

### ⚙️ How it works

```java
var list = add(new ArrayList<>(), 1, 2);
System.out.println(list);
```

Here, we don't even declare the type of `list` on the left side. Java determines:
1. The `add` method returns `List<T>`
2. `T` is inferred as `Integer` from the arguments `1` and `2`
3. So the return type is `List<Integer>`
4. Therefore, `list` is of type `List<Integer>`

The output is the same:
```
[1, 2]
```

### 💡 Insight

With `var`, type inference goes one step further — it's not just the generic type parameter `T` being inferred, but the entire variable type. The compiler has all the context it needs from the method call on the right side.

---

## Concept 4: Switching to Strings — Inference Adapts Automatically

### 🧠 What happens if we use strings instead of integers?

Nothing special — we just change the arguments, and Java re-infers everything.

### ⚙️ How it works

```java
var list = add(new ArrayList<>(), "Adam", "Kevin");
System.out.println(list);
```

Let's trace it again:

**1.** Java sees `"Adam"` and `"Kevin"` — both are `String` values.

**2.** From the method signature, Java infers `T = String`.

**3.** The `new ArrayList<>()` becomes `new ArrayList<String>()`.

**4.** The return type becomes `List<String>`.

**5.** The variable `list` is inferred as `List<String>`.

**Output:**
```
[Adam, Kevin]
```

### ❓ Why does this matter?

Despite the fact that we never specified `String` anywhere — not on the `ArrayList`, not on the variable, not on the method call — Java figured it all out. The same method works for `Integer`, `String`, or any other type, and inference adapts automatically each time.

### 🧪 Full Example

```java
public class App {

    public static <T> List<T> add(List<T> list, T first, T second) {
        list.add(first);
        list.add(second);
        return list;
    }

    public static void main(String[] args) {
        // With integers
        var intList = add(new ArrayList<>(), 1, 2);
        System.out.println(intList);   // [1, 2]

        // With strings
        var strList = add(new ArrayList<>(), "Adam", "Kevin");
        System.out.println(strList);   // [Adam, Kevin]
    }
}
```

In both cases, Java infers the types entirely from context — no explicit type annotations needed.

---

## ✅ Key Takeaways

1. **Java infers generic types from method arguments** — When you pass `1` and `2`, Java knows `T = Integer`. When you pass `"Adam"` and `"Kevin"`, Java knows `T = String`.

2. **The diamond operator `<>` works with inference** — `new ArrayList<>()` doesn't need a type because Java infers it from surrounding context (the other arguments and the return type).

3. **`var` lets you skip the variable type** — Combined with generic inference, `var` means you can write extremely concise code while Java handles all the type resolution behind the scenes.

4. **`List` is an interface, `ArrayList` is an implementation** — You can pass an `ArrayList` wherever a `List` is expected because `ArrayList` implements the `List` interface.

5. **The same generic method works for any type** — That's the power of generics combined with type inference. Write the method once, and Java adapts it to whatever types you pass.

---

## ⚠️ Common Mistakes

- **Adding the same item twice** — A simple copy-paste bug! Make sure you're adding `first` *and* `second`, not `first` twice. Always double-check method logic before running.

- **Confusing `List` and `ArrayList`** — `List` is an interface (a contract). `ArrayList` is a concrete implementation. You can't instantiate `List` directly — you create an `ArrayList` (or another implementation) and assign it to a `List` reference.

---

## 💡 Pro Tips

- **Trust type inference** — Don't write `add(new ArrayList<Integer>(), 1, 2)` when `add(new ArrayList<>(), 1, 2)` works perfectly. Let the compiler do its job.

- **Use `var` when the type is obvious** — If the right-hand side makes the type clear, `var` reduces noise. But avoid it when the inferred type isn't obvious to a human reader.

- **This is what makes Java powerful** — Type inference keeps generic code concise without sacrificing type safety. You get the best of both worlds: clean code and compile-time guarantees.
