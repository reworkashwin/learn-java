# Combining Upper and Lower Bounded Wildcards — The Copy Method

## Introduction

We've learned that upper bounded wildcards (`? extends T`) are for **reading** and lower bounded wildcards (`? super T`) are for **writing**. But what happens when you need to do both in the same method — read from one collection and write to another?

This is exactly the scenario a `copy` method faces. It needs to **read** items from a source list and **insert** them into a destination list. This lecture brings both wildcard types together in a single, practical example that demonstrates why choosing the right wildcard for each parameter matters.

---

## Concept 1: The Problem — Copying Between Lists

### 🧠 What do we need?

We want a generic `copy` method that:
- Takes a **source** list and a **destination** list
- Reads every item from the source
- Inserts each item into the destination
- Works with any type — strings, integers, doubles, whatever

### ❓ Which wildcard goes where?

Think about what each list needs to do:
- **Source list** → we **read** from it → needs an upper bounded wildcard (`? extends T`)
- **Destination list** → we **write** to it → needs a lower bounded wildcard (`? super T`)

This is the PECS principle in its purest form: the source is a **P**roducer (we read from it → **E**xtends), and the destination is a **C**onsumer (we write to it → **S**uper).

---

## Concept 2: The Solution — The Complete Copy Method

### ⚙️ Implementation

```java
public static <T> void copy(List<? extends T> source, List<? super T> destination) {
    for (int i = 0; i < source.size(); i++) {
        destination.add(source.get(i));
    }
}
```

Let's break this down:

1. **`<T>`** — the method is generic, so it works with any type
2. **`List<? extends T> source`** — upper bounded wildcard. We're reading from the source, so we use `extends`. Each `source.get(i)` returns a value of type `T` (or a subtype)
3. **`List<? super T> destination`** — lower bounded wildcard. We're writing to the destination, so we use `super`. Each `destination.add(...)` accepts a value of type `T` (or a subtype)
4. **The loop** — iterates through every item in the source and adds it to the destination, one by one

### 🧪 Using it with strings

```java
List<String> list1 = Arrays.asList("Adam", "Anna", "Kevin");
List<String> list2 = new ArrayList<>();

copy(list1, list2);

System.out.println(list2);  // [Adam, Anna, Kevin]
```

The items from `list1` are copied into `list2`. The compiler resolves `T = String`, confirms that `List<String>` satisfies both `? extends String` and `? super String`, and everything works.

### 🧪 Using it with integers

```java
List<Integer> nums1 = Arrays.asList(3, 1, 2, 4);
List<Integer> nums2 = new ArrayList<>();

copy(nums1, nums2);

System.out.println(nums2);  // [3, 1, 2, 4]
```

Same method, different type. The compiler resolves `T = Integer` and the copy proceeds without issues.

### 💡 Insight

One method handles strings, integers, doubles — any type. The combination of `? extends T` for reading and `? super T` for writing is what makes this possible. Each wildcard does exactly what it's designed for.

---

## Concept 3: Why the Wildcards Must Be This Way

### ❓ What if we remove both wildcards?

```java
public static <T> void copy(List<T> source, List<T> destination) {
    for (int i = 0; i < source.size(); i++) {
        destination.add(source.get(i));
    }
}
```

This actually compiles and works for simple cases where both lists have the **exact same type**. But it's less flexible — you couldn't copy from a `List<Integer>` to a `List<Number>`, for example. The wildcard version allows more flexibility in the type relationships between source and destination.

### ❓ What if we swap `extends` and `super`?

```java
// ❌ WRONG — swapped wildcards
public static <T> void copy(List<? super T> source, List<? extends T> destination) {
    for (int i = 0; i < source.size(); i++) {
        destination.add(source.get(i));  // ❌ Compile error!
    }
}
```

This fails because:
- `source` now has `? super T` — we can only read as `Object`, not as `T`
- `destination` now has `? extends T` — we **cannot write** to it at all

We've given the source the "write" wildcard and the destination the "read" wildcard — exactly backwards. The compiler catches this immediately.

### ❓ What if we use plain wildcards (no bounds)?

```java
// ❌ WRONG — no bounds
public static void copy(List<?> source, List<?> destination) {
    for (int i = 0; i < source.size(); i++) {
        destination.add(source.get(i));  // ❌ Compile error!
    }
}
```

This fails too. With unbounded wildcards, each `?` is independent and anonymous. The compiler can't guarantee that what you read from the source is compatible with the destination. And you can't add anything to a `List<?>` regardless.

### 💡 Insight

The wildcards aren't interchangeable. There is exactly **one correct configuration** for this method:

| Parameter | Role | Wildcard | Why |
|-----------|------|----------|-----|
| Source | Read from it | `? extends T` | Guarantees elements are at least `T` — safe to read |
| Destination | Write to it | `? super T` | Guarantees container accepts `T` — safe to write |

Swapping, removing, or using unbounded wildcards all break the method. The correct choice follows directly from what each parameter needs to **do**.

---

## Concept 4: PECS in Action

### 🧠 The principle crystallized

This `copy` method is the textbook example of the **PECS principle** — **P**roducer **E**xtends, **C**onsumer **S**uper:

```java
public static <T> void copy(
    List<? extends T> source,       // PRODUCER → EXTENDS (we get items FROM it)
    List<? super T> destination     // CONSUMER → SUPER (we put items INTO it)
)
```

- The **source** list *produces* data — it gives us items to work with → use `extends`
- The **destination** list *consumes* data — it receives items we give it → use `super`

Whenever you're designing a method with generic collection parameters, ask yourself for each parameter:
- *"Am I reading from this?"* → Producer → `extends`
- *"Am I writing to this?"* → Consumer → `super`
- *"Both?"* → You may need a concrete type parameter (`List<T>`) instead of a wildcard

---

## ✅ Key Takeaways

1. **Use `? extends T` for source (reading) and `? super T` for destination (writing)** — this is the only correct wildcard configuration for a copy operation.

2. **Swapping the wildcards breaks the method** — putting `super` on the source and `extends` on the destination reverses the read/write capabilities, causing compile errors.

3. **Removing the wildcards reduces flexibility** — plain `List<T>` works but restricts both lists to the exact same type, losing the flexibility that wildcards provide.

4. **This is PECS in its purest form** — Producer Extends, Consumer Super. The source produces data (extends), the destination consumes data (super).

5. **The next topic: wildcards vs type parameters** — now that we understand all wildcard types, we'll explore the fundamental difference between using `?` and `T`, and when to choose one over the other.
