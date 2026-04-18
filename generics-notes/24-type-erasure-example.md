# Type Erasure — Example

## Introduction

Here's one of Java's best-kept secrets: **generics don't actually exist at runtime**. The JVM has no concept of `List<String>` or `List<Integer>` — it just sees `List`. This process of removing generic type information during compilation is called **type erasure**. Understanding it explains many of Java's generics quirks.

---

## Concept 1: What Is Type Erasure?

### 🧠 What is it?

Type erasure is the process by which the Java compiler **removes all generic type information** after verifying type safety. The compiled bytecode contains no trace of your type parameters.

### ❓ Why does Java do this?

**Backward compatibility**. Generics were added in Java 5, but the JVM had to remain compatible with code written before generics existed. The solution: enforce generics at compile time, then erase them so the bytecode looks the same as pre-generics Java.

### 💡 Insight

Think of it this way: generics are like scaffolding on a building. The scaffolding (type checks) is essential during construction (compilation), but it's removed once the building (bytecode) is complete. The building still works fine — the scaffolding just ensured everything was put together correctly.

---

## Concept 2: How Type Erasure Works — Unbounded Types

### ⚙️ How it works

For unbounded type parameters, the compiler replaces `T` with `Object`:

**Before erasure (your source code):**
```java
public class Box<T> {
    private T item;

    public void setItem(T item) { this.item = item; }
    public T getItem() { return item; }
}
```

**After erasure (what the JVM sees):**
```java
public class Box {
    private Object item;

    public void setItem(Object item) { this.item = item; }
    public Object getItem() { return item; }
}
```

The compiler also inserts **casts** wherever you use the generic type:

```java
// Your code
Box<String> box = new Box<>();
box.setItem("Hello");
String value = box.getItem();

// After erasure (approximately)
Box box = new Box();
box.setItem("Hello");
String value = (String) box.getItem();  // compiler inserts this cast
```

---

## Concept 3: Type Erasure with Bounded Types

### ⚙️ How it works

When a type parameter has a bound, the compiler replaces it with the **bound** instead of `Object`:

**Before erasure:**
```java
public class NumberBox<T extends Number> {
    private T item;

    public double getDoubleValue() {
        return item.doubleValue();
    }
}
```

**After erasure:**
```java
public class NumberBox {
    private Number item;           // replaced with the bound

    public double getDoubleValue() {
        return item.doubleValue(); // works because Number has doubleValue()
    }
}
```

### 💡 Insight

This is why bounds work! After erasure, `T` becomes the bound type, and all method calls on the bound are valid in the erased code.

---

## Concept 4: Type Erasure in Generic Methods

### ⚙️ How it works

The same rules apply to generic methods:

**Before erasure:**
```java
public static <T> T firstElement(List<T> list) {
    return list.get(0);
}
```

**After erasure:**
```java
public static Object firstElement(List list) {
    return list.get(0);
}
```

And at the call site:
```java
// Your code
String first = firstElement(List.of("a", "b"));

// After erasure
String first = (String) firstElement(List.of("a", "b"));
```

---

## Concept 5: Consequences of Type Erasure

### ⚠️ Things you cannot do because of type erasure

**1. Cannot use `instanceof` with generic types:**
```java
if (list instanceof List<String>) { }  // ❌ COMPILE ERROR
if (list instanceof List<?>) { }       // ✅ unbounded wildcard is OK
```

**2. Cannot create generic arrays:**
```java
T[] array = new T[10];  // ❌ COMPILE ERROR
```

**3. Cannot call `new T()`:**
```java
T obj = new T();  // ❌ COMPILE ERROR — type is erased
```

**4. All generic instantiations share the same class:**
```java
List<String> strings = new ArrayList<>();
List<Integer> integers = new ArrayList<>();

System.out.println(strings.getClass() == integers.getClass()); // true!
// Both are just ArrayList at runtime
```

### 💡 Insight

At runtime, `List<String>` and `List<Integer>` are the **same class**. There's only one `ArrayList.class` — not separate versions for each type argument. This is fundamentally different from templates in C++, which generate separate compiled code for each type.

---

## ✅ Key Takeaways

- Type erasure removes all generic type information during compilation
- Unbounded `T` is replaced with `Object`; bounded `T extends X` is replaced with `X`
- The compiler inserts casts where needed to maintain type correctness
- At runtime, all generic types are the same raw type
- This exists for backward compatibility with pre-Java-5 code

## ⚠️ Common Mistakes

- Assuming generics provide runtime type information — they don't
- Trying to use `instanceof` with parameterized types
- Expecting `List<String>.class` to be different from `List<Integer>.class`
- Trying to create instances of type parameters with `new T()`
