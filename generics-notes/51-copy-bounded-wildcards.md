# Copy and Bounded Type Wildcards

## Introduction

We've already explored bounded type wildcards (`? extends T` and `? super T`) in earlier chapters. Now let's see how these concepts show up in real Java code — specifically in the `Collections` utility class. By examining methods like `Collections.copy()`, we can solidify our understanding of **when to use `extends` vs `super`** and **why bounded wildcards are so powerful**.

---

## Concept 1: Revisiting Bounded Type Wildcards

### 🧠 What are they?

Bounded type wildcards let us restrict the types a generic can accept:

- `? extends T` — accepts `T` or any **subtype** of `T` (upper bound)
- `? super T` — accepts `T` or any **supertype** of `T` (lower bound)

### ❓ Why do they matter here?

The `Collections` class is full of generic methods that read from or write to collections. The choice between `extends` and `super` determines whether a collection is used as a **source** (read) or a **destination** (write).

---

## Concept 2: The `Collections.copy()` Method

### 🧠 What does it do?

`Collections.copy()` copies all elements from a **source list** into a **destination list**. Its signature reveals a beautiful application of bounded wildcards:

```java
public static <T> void copy(List<? super T> dest, List<? extends T> src)
```

### ⚙️ How it works

- **Destination** uses `? super T` — because we **write** to it
- **Source** uses `? extends T` — because we **read** from it

This is the PECS principle in action:
- **P**roducer → **E**xtends (the source *produces* items)
- **C**onsumer → **S**uper (the destination *consumes* items)

### 🧪 Example

```java
List<Number> destination = new ArrayList<>(Arrays.asList(0, 0, 0));
List<Integer> source = Arrays.asList(1, 2, 3);

Collections.copy(destination, source);
// destination is now [1, 2, 3]
```

Here:
- `destination` is `List<Number>` — `Number` is a supertype of `Integer`, so `? super T` is satisfied
- `source` is `List<Integer>` — `Integer` extends `Number`, so `? extends T` is satisfied

### 💡 Insight

This pattern appears throughout the `Collections` class. Whenever a method needs to **write** to a collection, you'll see `? super T`. Whenever it needs to **read** from a collection, you'll see `? extends T`.

---

## Concept 3: The General Rule

### ⚙️ Pattern across the `Collections` class

| Operation | Wildcard | Keyword | Role |
|-----------|----------|---------|------|
| Read from a collection | `? extends T` | `extends` | Producer |
| Write to a collection | `? super T` | `super` | Consumer |

This isn't an arbitrary rule — it's driven by type safety:
- When **reading**, you know items are *at least* of type `T` (could be subtypes)
- When **writing**, you need a container that can *accept* `T` (could hold supertypes)

---

## ✅ Key Takeaways

- `? extends T` → **read** from a collection (producer)
- `? super T` → **write** to a collection (consumer)
- The `Collections.copy()` method is a textbook example of PECS
- Studying the `Collections` utility class is one of the best ways to understand bounded wildcards in real-world Java

## ⚠️ Common Mistakes

- Confusing `extends` and `super` — remember: you **extend** to read, you use **super** to write
- Trying to add items to a `? extends T` collection — the compiler won't allow it because it doesn't know the exact subtype

## 💡 Pro Tips

- Whenever you design a method that reads from one collection and writes to another, use the PECS pattern
- Browse the source code of `java.util.Collections` — it's a masterclass in bounded wildcard usage
