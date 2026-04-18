# What Are Wildcards?

## Introduction

You've mastered generic classes, generic methods, and bounded type parameters. But there's a subtle problem lurking: generics are **invariant**. A `List<Dog>` is NOT a subtype of `List<Animal>`, even though `Dog` extends `Animal`. This creates real headaches when writing flexible methods. **Wildcards** (`?`) are Java's solution to this problem.

---

## Concept 1: The Invariance Problem

### 🧠 What is it?

In normal Java inheritance, if `Dog extends Animal`, then a `Dog` variable can be assigned to an `Animal` reference:

```java
Animal a = new Dog();  // perfectly fine — polymorphism
```

You'd naturally expect the same to work with generics:

```java
List<Dog> dogs = new ArrayList<>();
List<Animal> animals = dogs;  // COMPILE-TIME ERROR!
```

But it doesn't. **Generics are invariant** — `List<Dog>` has no relationship to `List<Animal>`.

### ❓ Why is this a problem?

Suppose you want a method that prints all animals:

```java
public static void printAll(List<Animal> animals) {
    for (Animal a : animals) {
        System.out.println(a);
    }
}
```

```java
List<Dog> dogs = List.of(new Dog("Rex"), new Dog("Buddy"));
printAll(dogs);  // COMPILE-TIME ERROR! List<Dog> is not List<Animal>
```

Even though every `Dog` IS an `Animal`, the compiler won't allow it.

---

## Concept 2: Why Generics Are Invariant

### 🧠 What is it?

This restriction exists for **type safety**. If `List<Dog>` were a subtype of `List<Animal>`, you could do this:

```java
List<Dog> dogs = new ArrayList<>();
List<Animal> animals = dogs;       // hypothetically allowed
animals.add(new Cat());            // adding a Cat to a "Dog" list!
Dog d = dogs.get(0);               // ClassCastException — it's actually a Cat!
```

The compiler prevents this entire category of bugs by making generics invariant. But this is too restrictive for read-only operations — and that's where wildcards come in.

### 💡 Insight

Arrays in Java ARE covariant (`Dog[]` is a subtype of `Animal[]`), which means the bug above can actually happen with arrays — it throws `ArrayStoreException` at runtime. Generics were designed to be safer than arrays by catching these problems at compile time.

---

## Concept 3: The Wildcard — `?`

### 🧠 What is it?

The wildcard `?` represents an **unknown type**. It's used when you don't care about the specific type — you just want flexibility.

### ⚙️ How it works

```java
public static void printAll(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}
```

Now this method accepts `List<Dog>`, `List<String>`, `List<Integer>` — anything.

```java
List<Dog> dogs = List.of(new Dog("Rex"));
List<String> names = List.of("Alice", "Bob");

printAll(dogs);   // works!
printAll(names);  // works!
```

### ❓ What's the catch?

With an unbounded wildcard (`?`), you can **read** from the list (as `Object`), but you **cannot add** to it:

```java
public static void addItem(List<?> list) {
    list.add("hello");  // COMPILE-TIME ERROR!
    list.add(42);       // COMPILE-TIME ERROR!
}
```

Why? Because the compiler doesn't know what type the list actually holds. It could be `List<Integer>`, `List<Dog>`, or anything else. Adding any specific type might violate type safety.

The only thing you can add is `null` (since `null` is compatible with every reference type).

---

## Concept 4: Three Flavors of Wildcards

### 🧠 What are they?

Java provides three wildcard variants, each with different powers:

| Wildcard | Syntax | Meaning |
|----------|--------|---------|
| **Unbounded** | `List<?>` | "List of unknown type" — maximum flexibility, read-only |
| **Upper bounded** | `List<? extends Animal>` | "List of Animal or any subtype" — safe to read as Animal |
| **Lower bounded** | `List<? super Dog>` | "List of Dog or any supertype" — safe to add Dog |

We'll dive deep into upper and lower bounded wildcards in the next topics. For now, understand that:
- **Unbounded (`?`)** = "I don't care about the type at all"
- **Upper bounded (`? extends X`)** = "I want to **read** items as type X"
- **Lower bounded (`? super X`)** = "I want to **write** items of type X"

---

## Concept 5: Real-World Analogy

Imagine a vending machine. A `VendingMachine<Coke>` only dispenses Coke. A `VendingMachine<Pepsi>` only dispenses Pepsi. Even though both are sodas, you can't use a `VendingMachine<Coke>` wherever a `VendingMachine<Soda>` is expected — because someone might try to load Pepsi into it through the `Soda` interface.

A wildcard (`VendingMachine<?>`) says: "I'll accept any vending machine — I just want to observe what comes out, not load anything in."

---

## ✅ Key Takeaways

- Generics are **invariant**: `List<Dog>` is NOT a subtype of `List<Animal>`
- This is intentional — it prevents type-safety violations
- Wildcards (`?`) introduce flexibility by representing an unknown type
- Unbounded wildcards (`List<?>`) allow reading (as `Object`) but not writing
- Three flavors: unbounded (`?`), upper bounded (`? extends`), lower bounded (`? super`)

## ⚠️ Common Mistakes

- Assuming `List<Dog>` can be passed to a method expecting `List<Animal>` — it can't
- Trying to add elements to a `List<?>` — only `null` is allowed
- Confusing wildcards with type parameters — `?` is used at the **call site**, `T` is used at the **declaration site**

## 💡 Pro Tip

Use `List<?>` when your method only needs to call type-independent methods like `size()`, `isEmpty()`, `clear()`, or iterate with `Object`. The moment you need to add elements or use type-specific operations, switch to bounded wildcards or type parameters.
