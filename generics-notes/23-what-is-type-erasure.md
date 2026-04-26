# What Is Type Erasure? — How Java Implements Generics Under the Hood

## Introduction

Everything we've learned about generics — type parameters, wildcards, bounds — exists only at **compile time**. At runtime, all of it disappears. This process is called **type erasure**, and understanding it reveals why generics work the way they do, what their limitations are, and why certain things (like generic arrays) are problematic.

---

## Concept 1: What Is Type Erasure?

### 🧠 What is it?

Type erasure is the process by which the Java compiler **removes all generic type information** during compilation. The resulting bytecode contains only raw types, casts, and plain `Object` references.

### ❓ Why does Java do this?

**Backward compatibility.** Generics were added in Java 5, but the JVM needed to remain compatible with pre-generics code. By erasing types at compile time, generic code and legacy code can coexist seamlessly.

### ⚙️ The rules

1. **Bounded type parameters** → replaced by their bound
2. **Unbounded type parameters** → replaced by `Object`
3. **Wildcards** → replaced by their bound (or `Object` for unbounded)

---

## Concept 2: Type Erasure in Action

### 🧪 Example 1 — Bounded type parameter

**What you write:**
```java
public static <T extends Comparable<T>> T findMin(T a, T b) {
    return a.compareTo(b) < 0 ? a : b;
}
```

**What the bytecode becomes (after type erasure):**
```java
public static Comparable findMin(Comparable a, Comparable b) {
    return a.compareTo(b) < 0 ? a : b;
}
```

`T` is replaced by `Comparable` because that's the bound.

### 🧪 Example 2 — Unbounded type parameter

**What you write:**
```java
public static <T> void print(T item) {
    System.out.println(item);
}
```

**After type erasure:**
```java
public static void print(Object item) {
    System.out.println(item);
}
```

No bound → `T` becomes `Object`.

### 🧪 Example 3 — Wildcards

**What you write:**
```java
public static void showAll(List<? extends Number> list) { ... }
```

**After type erasure:**
```java
public static void showAll(List list) { ... }
// Elements accessed as Number (the bound)
```

---

## Concept 3: Type Erasure with Collections

### 🧪 Before type erasure (what you write)

```java
List<Integer> list = new ArrayList<>();
list.add(3);
Integer value = list.get(0);
```

### 🧪 After type erasure (what the bytecode looks like)

```java
List list = new ArrayList();     // Raw type — no generics
list.add(3);
Integer value = (Integer) list.get(0);  // Explicit cast inserted
```

The compiler:
1. Removes `<Integer>` from the list declaration
2. Inserts a **(Integer)** cast when reading from the list
3. The runtime only sees raw types and casts

---

## Concept 4: The Performance Question

### ❓ Is generic code faster than non-generic code?

This is a classic interview question. The answer: **No — they're identical.**

```java
// Generic version
List<Integer> list = new ArrayList<>();
list.add(3);
Integer val = list.get(0);

// Non-generic version (raw type)
List list = new ArrayList();
list.add(3);
Integer val = (Integer) list.get(0);
```

After type erasure, both produce **exactly the same bytecode**. Runtime performance is identical.

### 💡 So why use generics?

Not for performance — for **safety**. Generics transform potential **runtime exceptions** (`ClassCastException`) into **compile-time errors**. You catch bugs before the code ever runs.

---

## Concept 5: What Type Erasure Means for You

| Aspect | With Generics | After Type Erasure |
|--------|--------------|-------------------|
| Type info | `List<Integer>` | `List` (raw) |
| Type safety | Compile-time checks | Casts inserted |
| Performance | Same | Same |
| Bytecode | No generics | Raw types + casts |

### 💡 Insight

Type erasure also explains many "weird" generic behaviors:
- You can't do `new T()` — `T` doesn't exist at runtime
- You can't do `instanceof List<Integer>` — type is erased
- You can't create generic arrays — type is unknown at runtime (see [Note 26](26-generic-arrays-problematic.md))

We'll explore these in upcoming lectures — generic arrays in [Note 26](26-generic-arrays-problematic.md) and why primitives can't be generic in [Note 27](27-why-cant-primitive-types-be-generic.md).

---

## ✅ Key Takeaways

- **Type erasure** removes all generic type information at compile time
- Bounded types are replaced by their bound; unbounded types become `Object`
- The final bytecode contains only raw types, casting, and plain objects
- Generic and non-generic code have **identical runtime performance**
- Generics exist for **compile-time safety**, not runtime performance

## ⚠️ Common Mistakes

- Assuming generics make code faster — they don't; performance is identical after erasure
- Trying to use generic type info at runtime (`instanceof`, reflection) — it's been erased
- Thinking `List<Integer>` and `List<String>` are different classes at runtime — they're both just `List`

## 💡 Pro Tip

When someone asks "Are generics just syntactic sugar?" — the answer is nuanced. They're erased at compile time (like sugar), but they provide **real compile-time type checking** that prevents bugs. The safety is real; only the runtime representation is erased.
