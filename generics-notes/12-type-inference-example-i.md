# Type Inference Example — Practical Demonstration

## Introduction

We've learned what type inference is in theory. Now let's see it in action with a real example — a generic `Bucket` class and a method that adds items to a list of buckets. This example shows how type inference keeps code clean even with nested generics.

---

## Concept 1: Setting Up the Generic `Bucket` Class

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

A simple wrapper that stores one item of any type. Nothing new here — but watch how type inference simplifies usage.

---

## Concept 2: A Method with Nested Generics

### ⚙️ How it works

```java
public static <T> void addToStore(T item, List<Bucket<T>> list) {
    Bucket<T> bucket = new Bucket<>(item);   // type inference here!
    list.add(bucket);
    System.out.println("Item added successfully: " + item.toString());
}
```

### 💡 Where type inference is working

Look at this line:

```java
Bucket<T> bucket = new Bucket<>(item);
```

The `<>` on the right is empty. Java infers that `new Bucket<>()` should be `new Bucket<T>()` because the left side declares `Bucket<T>`.

Without type inference, you'd write:

```java
Bucket<T> bucket = new Bucket<T>(item);  // redundant — Java already knows T
```

---

## Concept 3: Type Inference at the Call Site

### 🧪 Example with Strings

```java
List<Bucket<String>> list = new ArrayList<>();   // inference: ArrayList<Bucket<String>>
addToStore("Hello", list);
// "Item added successfully: Hello"
```

What Java infers step by step:
1. `list` is declared as `List<Bucket<String>>` → so the `ArrayList` stores `Bucket<String>`
2. `"Hello"` is a `String` → so `T = String`
3. Inside `addToStore`, `new Bucket<>(item)` becomes `new Bucket<String>("Hello")`

All types resolved automatically. You never explicitly wrote `<String>` on any method call.

### 🧪 Example with Integers

```java
List<Bucket<Integer>> list = new ArrayList<>();
addToStore(42, list);
// "Item added successfully: 42"
```

Change `String` to `Integer`, and everything works. If you accidentally pass the wrong type:

```java
List<Bucket<Integer>> list = new ArrayList<>();
addToStore("oops", list);   // COMPILE ERROR — String ≠ Integer
```

Type inference doesn't compromise type safety — it enhances readability while the compiler still catches errors.

---

## Concept 4: Everyday Type Inference — `var`

### 🧠 What is it?

After Java 10, `var` provides local variable type inference:

```java
var number = 10;          // Java infers: int
var price = 3.14;         // Java infers: double
var name = "Anna";        // Java infers: String
var nums = new ArrayList<Integer>();  // Java infers: ArrayList<Integer>
```

### 💡 Insight

`var` is type inference for variable declarations. The diamond operator `<>` is type inference for generic instantiation. Same concept, different syntax:

```java
// Three flavors of type inference in one line:
var list = new ArrayList<String>();
//  ^^^                   ^^
//  var infers type       <> infers generic type
```

---

## Concept 5: When Type Inference Isn't Enough

### 🧠 What happens?

If the compiler doesn't have enough context to determine the type, you get a compile error or it falls back to `Object`. In those cases, you use a **type witness** — an explicit type hint.

```java
// When inference fails, specify the type explicitly:
GenericApp.<String>addToStore("Hello", list);
```

The `<String>` before the method name is the type witness. We'll cover this in the next lecture.

---

## ⚠️ Common Mistakes

- Specifying the type on both sides of an assignment — let inference handle the right side
- Forgetting that `var` is only for **local variables** — you can't use it for fields, parameters, or return types
- Thinking `var` makes Java dynamically typed — the type is still fixed at compile time, just inferred

## ✅ Key Takeaways

- Type inference resolves nested generic types automatically (`Bucket<T>` inside `List<Bucket<T>>`)
- The empty diamond `<>` in `new Bucket<>(item)` lets the compiler infer the type from context
- `var` (Java 10+) extends type inference to local variable declarations
- Type inference makes code cleaner without sacrificing any type safety
- When inference can't determine the type, use a **type witness**
- The compiler uses arguments, declarations, and return types as context for inference

## 💡 Pro Tip

Type inference works best when you maintain **clear type declarations** on the left side of assignments. The more context you give the compiler, the less you need to specify explicitly. It's a partnership — you declare the intent, Java handles the details.
