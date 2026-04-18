# Wildcards Solution — Combining Upper and Lower Bounds

## Introduction

Now that we understand upper bounded wildcards (`? extends T`) for reading and lower bounded wildcards (`? super T`) for writing, let's put them together in a real-world scenario: **copying items from one list to another**. This is where the power of wildcards truly shines.

---

## Concept 1: The Copy Problem

### ❓ What do we need?

A generic `copy()` method that:
1. **Reads** items from a source list
2. **Writes** those items into a destination list
3. Works with any type — strings, integers, doubles, etc.

### 🧠 Which wildcards do we use?

- **Source list:** We're reading from it → use `? extends T` (upper bounded)
- **Destination list:** We're writing to it → use `? super T` (lower bounded)

---

## Concept 2: Implementing the Copy Method

### ⚙️ How it works

```java
public static <T> void copy(List<? extends T> source, List<? super T> destination) {
    for (int i = 0; i < source.size(); i++) {
        destination.add(source.get(i));
    }
}
```

Let's break this down:

1. `<T>` — The method is generic, working with any type
2. `List<? extends T> source` — We can read `T` items from the source
3. `List<? super T> destination` — We can write `T` items into the destination
4. `source.get(i)` returns a `T` → `destination.add(...)` accepts a `T` ✅

---

## Concept 3: Using the Copy Method

### 🧪 Example with Strings

```java
List<String> source = Arrays.asList("Adam", "Anna", "Kevin");
List<String> destination = new ArrayList<>();

copy(source, destination);
System.out.println(destination);  // [Adam, Anna, Kevin]
```

### 🧪 Example with Integers

```java
List<Integer> source = Arrays.asList(3, 1, 2, 4);
List<Integer> destination = new ArrayList<>();

copy(source, destination);
System.out.println(destination);  // [3, 1, 2, 4]
```

Both work because the method is generic — `T` adapts to whatever type you use.

---

## Concept 4: Why Both Bounds Are Necessary

### ❌ What if we drop the wildcards?

```java
public static <T> void copy(List<T> source, List<T> destination) { ... }
```

This works, but it's less flexible — both lists must have the exact same type parameter.

### ❌ What if we swap extends and super?

```java
// WRONG: extends on destination, super on source
public static <T> void copy(List<? super T> source, List<? extends T> destination) { ... }
```

This fails:
- `source` with `super` → we can write to it but can only read `Object`
- `destination` with `extends` → we can read from it but can't write to it
- We need the exact **opposite**: read from source, write to destination

### 💡 Insight

The correct configuration is the only one that makes logical sense:

| List | Role | Wildcard | Why |
|------|------|----------|-----|
| Source | Read from | `? extends T` | Guarantees elements are at least `T` |
| Destination | Write to | `? super T` | Guarantees `T` items are accepted |

---

## ✅ Key Takeaways

- Use `? extends T` for **source/input** collections (reading)
- Use `? super T` for **destination/output** collections (writing)
- Combining both in a single method gives maximum flexibility
- Swapping them breaks the logic — always think about data flow direction

## ⚠️ Common Mistakes

- Swapping `extends` and `super` on source and destination
- Forgetting to make the method generic (`<T>`) — the wildcards need a type to reference
- Trying to both read and write on the same wildcard-parameterized list

## 💡 Pro Tip

The `copy()` pattern appears everywhere in Java's standard library. `Collections.copy()` uses exactly this signature. Whenever you're moving data between two generic collections, think: **PECS** — Producer `extends`, Consumer `super`.
