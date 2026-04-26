# 📘 Lambda Expressions

## 📌 Introduction

Lambda expressions are one of the **most exciting features** introduced in Java 8. They bring **functional programming** to Java, allowing you to write more concise, readable code by treating behavior as data. If you've been writing anonymous inner classes to pass behavior around, lambdas will feel like a massive upgrade.

At their core, lambdas are a way to represent instances of **functional interfaces** using a short, clean syntax. Let's break this down step by step.

---

## 🧩 Concept 1: What is a Lambda Expression?

### 🧠 What is it?

A lambda expression is essentially an **anonymous method** — a method without a name that can be passed around as if it were an object. It represents an instance of a **functional interface**.

### ❓ Why do we need it?

Before Java 8, if you wanted to pass behavior to a method (like a comparator or an action), you had to create an anonymous inner class — verbose and cluttered. Lambdas condense that into a single line.

### ⚙️ Syntax

A lambda expression has three parts:

```
(parameters) -> body
```

| Part | Description |
|------|-------------|
| **Parameters** | Enclosed in parentheses. Can be empty `()`, single `n`, or multiple `(a, b)` |
| **Arrow (`->`)** | Separates the parameters from the body |
| **Body** | The code to execute — can be a single expression or a block `{ ... }` |

### 🧪 Examples of Lambda Syntax

```java
// No parameters
() -> System.out.println("Hello!")

// One parameter (parentheses optional)
n -> System.out.println(n)
(n) -> System.out.println(n)

// Multiple parameters
(a, b) -> a + b

// Block body (multiple statements)
(a, b) -> {
    int sum = a + b;
    return sum;
}
```

### 💡 Insight

When there's **exactly one parameter**, you can omit the parentheses: `n -> ...` instead of `(n) -> ...`. But if there are zero parameters or two+ parameters, parentheses are required.

---

## 🧩 Concept 2: What is a Functional Interface?

### 🧠 What is it?

A functional interface is any interface that contains **exactly one abstract method**. This is the foundation that makes lambda expressions possible — every lambda is an instance of some functional interface.

### ⚙️ How it works

Java already has many built-in functional interfaces:

| Interface | Abstract Method | Purpose |
|-----------|----------------|---------|
| `Consumer<T>` | `void accept(T t)` | Takes one input, returns nothing |
| `Predicate<T>` | `boolean test(T t)` | Takes one input, returns boolean |
| `Function<T, R>` | `R apply(T t)` | Takes one input, returns a result |
| `Supplier<T>` | `T get()` | Takes no input, returns a result |

### 🧪 Example: Why `forEach` Accepts a Lambda

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// forEach expects a Consumer<Integer>
// Consumer has one abstract method: void accept(Integer t)
// So a lambda with one parameter and no return works!
numbers.forEach(n -> System.out.println(n));
```

The `forEach` method signature requires a `Consumer`. Since `Consumer` has exactly one abstract method (`accept`), it's a functional interface, and we can pass a lambda in its place.

### 💡 Insight

Why does `forEach` throw an error if you try `(n1, n2) -> ...`? Because `Consumer.accept()` takes **one** parameter. Your lambda must match the functional interface's method signature — same number and types of parameters.

---

## 🧩 Concept 3: Lambda with Collections — Traditional vs. Lambda

### 🧪 Example: Side-by-Side

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// Traditional for-each loop (3 lines)
for (int n : numbers) {
    System.out.println(n);
}

// Lambda expression (1 line)
numbers.forEach(n -> System.out.println(n));

// Method reference (even shorter)
numbers.forEach(System.out::println);
```

### 🧠 Why lambdas win

| Aspect | Traditional Loop | Lambda |
|--------|-----------------|--------|
| **Conciseness** | 3+ lines | 1 line |
| **Readability** | Boilerplate code | Straight to the point |
| **Style** | Imperative | Functional |

---

## 🧩 Concept 4: Creating Your Own Functional Interface

### 🧠 What is it?

You're not limited to Java's built-in functional interfaces. You can create your own — any interface with exactly one abstract method qualifies.

### 🧪 Example

```java
// Define a functional interface
@FunctionalInterface
interface MyFunctionalInterface {
    void myMethod();
}

public class LambdaTest {
    public static void main(String[] args) {
        // Create an instance using a lambda
        MyFunctionalInterface instance = () -> System.out.println("Hello from my method!");

        // Call the method
        instance.myMethod(); // Output: Hello from my method!
    }
}
```

### ⚙️ How it works

1. `MyFunctionalInterface` has exactly one abstract method: `void myMethod()`
2. The lambda `() -> System.out.println("Hello from my method!")` provides the implementation
3. Calling `instance.myMethod()` executes the lambda body

### 💡 Insight

Since `myMethod()` takes **no parameters**, the lambda uses empty parentheses `()`. If the method accepted a `String`, you'd write `(s) -> System.out.println(s)`.

---

## 🧩 Concept 5: The @FunctionalInterface Annotation

### 🧠 What is it?

The `@FunctionalInterface` annotation is optional but highly recommended. It tells the compiler to **enforce the single-abstract-method rule** — if you accidentally add a second abstract method, you'll get a compile error.

### 🧪 Example: The Compiler Protects You

```java
@FunctionalInterface
interface MyFunctionalInterface {
    void myMethod();
    void work();     // ❌ Compile error! Not a functional interface anymore
}
```

**Error:** `Invalid @FunctionalInterface annotation; MyFunctionalInterface is not a functional interface`

### ⚙️ How it works

- Without the annotation, adding a second method would still break lambda usage, but the error would appear where you try to use the lambda — potentially far from the interface definition
- With the annotation, the error appears **right at the interface declaration**, making it immediately clear

### 💡 Insight

The annotation is informational. It doesn't make an interface functional — having exactly one abstract method does. But it **documents your intent** and catches mistakes early. Always use it when designing functional interfaces.

Note: **Default methods** (with implementation) don't count as abstract methods. A functional interface can have multiple default methods alongside its single abstract method.

---

## 🧩 Concept 6: Lambdas with Built-in Functional Interfaces

### 🧠 What is it?

Java's Stream API and collection methods use built-in functional interfaces extensively. Understanding which interface each method expects helps you write correct lambdas.

### 🧪 Examples

**Predicate** — used in `filter()`:
```java
// Predicate<String> — takes a String, returns boolean
names.stream()
    .filter(name -> name.startsWith("A"))  // Predicate
    .collect(Collectors.toList());
```

**Consumer** — used in `forEach()`:
```java
// Consumer<String> — takes a String, returns nothing
names.forEach(name -> System.out.println(name));  // Consumer
```

**Function** — used in `map()`:
```java
// Function<String, String> — takes a String, returns a String
names.stream()
    .map(name -> name.toUpperCase())  // Function
    .collect(Collectors.toList());
```

### 💡 Insight

When you see `partitioningBy(name -> name.startsWith("C"))`, it works because `partitioningBy` expects a `Predicate` — a functional interface. The lambda provides the `boolean test(T t)` implementation inline.

---

## 🧩 Concept 7: Why Lambda Expressions Matter

### 🧠 Three Key Reasons

1. **Conciseness** — Reduce boilerplate code. What took 5 lines with anonymous classes takes 1 line with lambdas.

2. **Readability** — Code reads like intent: "filter names starting with A" is immediately clear from the lambda.

3. **Functional Programming** — Lambdas let you treat **behavior as data** — pass actions as parameters, store them in variables, return them from methods. This is the foundation of functional programming in Java.

### 💡 Insight

Lambdas, functional interfaces, streams, and method references are all designed to work together. They form a cohesive **functional programming toolkit** in Java 8. Mastering one helps you understand all the others.

---

## ✅ Key Takeaways

- Lambda expressions are **anonymous functions** with syntax: `(parameters) -> body`
- They represent instances of **functional interfaces** — interfaces with exactly one abstract method
- Use `@FunctionalInterface` annotation to enforce and document single-method interfaces
- Built-in functional interfaces: `Consumer` (accept), `Predicate` (test), `Function` (apply), `Supplier` (get)
- Lambdas replace verbose anonymous inner classes with **concise one-liners**
- You can create **custom functional interfaces** for your own lambda use cases
- The lambda's parameter list must match the functional interface's abstract method signature

---

## ⚠️ Common Mistakes

- **Passing wrong number of parameters** — the lambda must match the functional interface's method signature
- **Forgetting that lambdas need a functional interface target** — you can't assign a lambda to `Object` or a regular interface with multiple abstract methods
- **Adding multiple abstract methods** to an interface and expecting lambdas to work — use `@FunctionalInterface` to catch this early
- **Confusing method references with lambdas** — `System.out::println` is a method reference (shorthand), `n -> System.out.println(n)` is a lambda

---

## 💡 Pro Tips

- Omit parentheses for single-parameter lambdas: `n -> ...` instead of `(n) -> ...`
- Use method references (`String::toUpperCase`) when the lambda simply delegates to an existing method
- Know the big four: `Consumer`, `Predicate`, `Function`, `Supplier` — they appear everywhere in Java 8+
- Default methods in interfaces **don't** count as abstract methods — a functional interface can have many default methods
- Lambdas are not just syntactic sugar for anonymous classes — they're implemented using `invokedynamic` for better performance
