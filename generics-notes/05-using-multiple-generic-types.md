# Using Multiple Generic Types

## Introduction

So far, we've seen generic classes with a single type parameter — like `Store<T>`. But what if a class needs to work with **two or more** types at the same time? Think of a key-value pair, a database row, or a function that maps one type to another. This is where **multiple generic type parameters** come in.

---

## Concept 1: Why a Single Type Parameter Isn't Always Enough

### 🧠 What is it?

A single type parameter works great when a class deals with one kind of data. But many real-world structures are inherently multi-typed.

### ❓ Why do we need it?

Consider a simple key-value pair. The key might be a `String`, but the value might be an `Integer`. With a single `<T>`, you'd be forced to make both the same type — which defeats the purpose.

```java
// This won't work for a key-value pair
public class Pair<T> {
    private T key;
    private T value;  // forced to be the same type as key!
}
```

If you create `Pair<String>`, both `key` and `value` must be `String`. You can't have a `String` key with an `Integer` value.

---

## Concept 2: Declaring Multiple Type Parameters

### 🧠 What is it?

Java lets you declare **multiple type parameters** by separating them with commas inside the angle brackets: `<T, U>`, `<K, V>`, `<T, U, V>`, and so on.

### ⚙️ How it works

```java
public class Pair<K, V> {
    private K key;
    private V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() {
        return key;
    }

    public V getValue() {
        return value;
    }

    @Override
    public String toString() {
        return "(" + key + ", " + value + ")";
    }
}
```

### 🧪 Example

```java
Pair<String, Integer> age = new Pair<>("Alice", 30);
System.out.println(age.getKey());    // Alice
System.out.println(age.getValue());  // 30

Pair<Integer, Boolean> result = new Pair<>(200, true);
System.out.println(result);          // (200, true)
```

Each type parameter is independent — `K` and `V` can be the same type or completely different types.

### 💡 Insight

By convention, common names for type parameters are:
- **T** — Type (general purpose)
- **K** — Key
- **V** — Value
- **E** — Element (used in collections)
- **U, S** — Second and third types

These are just conventions — you could use any valid identifier — but following them makes your code instantly readable to other Java developers.

---

## Concept 3: Three or More Type Parameters

### 🧠 What is it?

There's no hard limit on how many type parameters you can declare. You can have three, four, or more.

### ⚙️ How it works

```java
public class Triple<A, B, C> {
    private A first;
    private B second;
    private C third;

    public Triple(A first, B second, C third) {
        this.first = first;
        this.second = second;
        this.third = third;
    }

    public A getFirst()  { return first; }
    public B getSecond() { return second; }
    public C getThird()  { return third; }
}
```

```java
Triple<String, Integer, Double> record = new Triple<>("Alice", 30, 85.5);
System.out.println(record.getFirst());   // Alice
System.out.println(record.getSecond());  // 30
System.out.println(record.getThird());   // 85.5
```

### ⚠️ Common Mistake

Having too many type parameters makes a class hard to use and understand. If you find yourself needing `<A, B, C, D, E>`, it's a sign that your class is doing too much. Consider breaking it into smaller, focused classes.

---

## Concept 4: Generic Methods with Multiple Type Parameters

### 🧠 What is it?

Just like classes, **methods** can also declare multiple type parameters — independently of any class-level type parameters.

### ⚙️ How it works

```java
public class Util {
    public static <K, V> boolean compare(Pair<K, V> p1, Pair<K, V> p2) {
        return p1.getKey().equals(p2.getKey()) &&
               p1.getValue().equals(p2.getValue());
    }
}
```

```java
Pair<String, Integer> p1 = new Pair<>("Alice", 30);
Pair<String, Integer> p2 = new Pair<>("Alice", 30);

boolean same = Util.compare(p1, p2);  // true — type inference handles K and V
```

The compiler infers both `K = String` and `V = Integer` from the arguments — no explicit type witness needed.

---

## Concept 5: Real-World Analogy

Think of a shipping label. It has two distinct pieces of information: the **sender** (one type of person/company) and the **receiver** (another). You wouldn't force both to be the same type — you need two independent slots.

Multiple type parameters give your classes the same flexibility: independent slots for different types of data that need to coexist in one structure.

---

## ✅ Key Takeaways

- Use multiple type parameters (`<K, V>`, `<A, B, C>`) when a class or method needs to work with more than one independent type
- Each parameter is resolved independently at instantiation
- Follow naming conventions: `T`, `K`, `V`, `E` for readability
- Both classes and methods can declare multiple type parameters
- Keep the number of type parameters small — more than three is a code smell

## ⚠️ Common Mistakes

- Using a single type parameter and casting internally — defeats the purpose of generics
- Using raw types with multi-parameter classes — you lose **all** type safety, not just one parameter
- Declaring excessive type parameters instead of refactoring into smaller classes

## 💡 Pro Tip

Java's `Map<K, V>` interface is the most famous example of multiple type parameters. When you write `Map<String, List<Integer>>`, both `K` and `V` are fully type-checked at compile time — and `V` itself can be a generic type.
