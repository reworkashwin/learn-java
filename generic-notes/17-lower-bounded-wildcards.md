# Lower Bounded Wildcards — Writing Safely with `? super T`

## Introduction

We've now covered unbounded wildcards (`?`) and upper bounded wildcards (`? extends T`). Upper bounded wildcards let us **read** from a collection of subtypes, but they block us from **writing** to it. What if we need the opposite — a method that **inserts** items into a generic collection?

This is where **lower bounded wildcards** come in. They flip the rules: you can write, but reading becomes restricted. Together with upper bounded wildcards, they form a complete picture of how to safely interact with generic collections.

---

## Concept 1: What Are Lower Bounded Wildcards?

### 🧠 What is it?

A lower bounded wildcard uses the `super` keyword after the question mark:

```java
List<? super T>
```

This means: *"A list of some unknown type, but that type is guaranteed to be `T` or a **super class** of `T`."*

While upper bounded wildcards work with **child classes** (subtypes), lower bounded wildcards work with **parent classes** (super types). The `super` keyword sets a **floor** — the type can be `T` itself or anything above it in the hierarchy.

### ⚙️ Example with Integer

```java
List<? super Integer> list;
```

This list can be:
- A `List<Integer>` — `Integer` itself
- A `List<Number>` — `Number` is a super class of `Integer`
- A `List<Object>` — `Object` is a super class of `Integer`

All three are valid because `Integer`, `Number`, and `Object` form a chain going **upward** in the type hierarchy, and the lower bound (`Integer`) sets the minimum.

---

## Concept 2: The Key Difference — You Can Write!

### 🧠 Why can we add items?

With upper bounded wildcards (`? extends T`), we couldn't add anything because the actual subtype was unknown. Lower bounded wildcards flip this:

> **You CAN add items to a `List<? super T>`.**

Specifically, you can add `T` or any **subtype** of `T`.

### ⚙️ How does this work?

Consider:

```java
List<? super Integer> list = new ArrayList<Number>();
list.add(10);   // ✅ Works — Integer IS an Integer (or subtype)
list.add(23);   // ✅ Works — same reason
```

Why is this safe? Because `? super Integer` guarantees the list holds `Integer` or a super class of `Integer`. Whether the actual list is `List<Integer>`, `List<Number>`, or `List<Object>`:

- Adding an `Integer` to a `List<Integer>` → safe
- Adding an `Integer` to a `List<Number>` → safe (Integer is a Number)
- Adding an `Integer` to a `List<Object>` → safe (Integer is an Object)

No matter which super type the list actually holds, an `Integer` fits in. That's why the compiler allows it.

### 💡 Insight

The logic is elegant: if the list holds `T` or any **parent** of `T`, then `T` is guaranteed to be compatible — because a child can always be stored in a container designed for its parent. This is basic polymorphism, and lower bounded wildcards leverage it for safe writes.

---

## Concept 3: The Read Restriction — The Other Side of the Coin

### 🧠 What happens when we try to read?

Just as upper bounded wildcards restrict writing, lower bounded wildcards restrict **reading**:

> **You can only read items as `Object` from a `List<? super T>`.**

### ❓ Why can't we read as `T`?

Because the list might hold a super type of `T`. Consider:

```java
List<? super Integer> list = new ArrayList<Number>();
```

What type should `list.get(0)` return? The compiler sees `? super Integer`, which could be:
- `List<Integer>` → elements are `Integer`
- `List<Number>` → elements are `Number` (could be `Double`, `Float`, etc.)
- `List<Object>` → elements are `Object` (could be literally anything)

Since the compiler can't guarantee the elements are `Integer`, it defaults to the only type it **can** guarantee — `Object`. Every type in Java is an `Object`, so reading as `Object` is always safe.

```java
Object item = list.get(0);  // ✅ Only safe option — returns Object
Integer num = list.get(0);  // ❌ Unsafe — might not be an Integer
```

### 💡 Insight

Lower bounded wildcards sacrifice **type-specific reads** in exchange for **safe writes**. You know you can put things *in*, but when you take things *out*, you only get an `Object` — you've lost the specific type information.

---

## Concept 4: Upper vs Lower — The Complete Picture

### 🧠 How do they compare?

Now we can see the full symmetry between upper and lower bounded wildcards:

| Feature | Upper Bounded (`? extends T`) | Lower Bounded (`? super T`) |
|---------|-------------------------------|------------------------------|
| **Keyword** | `extends` | `super` |
| **Accepts** | `T` and its **subtypes** (children) | `T` and its **super types** (parents) |
| **Read items?** | ✅ Yes — as type `T` | ⚠️ Only as `Object` |
| **Write items?** | ❌ No — actual subtype unknown | ✅ Yes — can add `T` or subtypes of `T` |
| **Role** | **Producer** — produces data for you to consume | **Consumer** — consumes data you provide |
| **Use when** | You want to **read** from the collection | You want to **write** to the collection |

### 💡 Insight

This is the foundation of the **PECS principle** — **Producer Extends, Consumer Super**:
- If a collection **produces** data (you read from it) → use `? extends T`
- If a collection **consumes** data (you write to it) → use `? super T`

Choosing the right wildcard depends entirely on what your method needs to **do** with the collection. Reading? Use `extends`. Inserting? Use `super`. In the next lecture, we'll see lower bounded wildcards in concrete code examples.

---

## ✅ Key Takeaways

1. **Lower bounded wildcards use `? super T`** — They accept a list of `T` or any super class of `T`, setting a floor in the type hierarchy.

2. **You CAN add items to `List<? super T>`** — Adding `T` or any subtype of `T` is safe because the list is guaranteed to hold `T` or a parent of `T`, and children always fit into parent containers.

3. **Reading is restricted to `Object`** — Since the actual super type is unknown, you can only read elements as `Object`, losing type-specific information.

4. **Upper bounded = reading, Lower bounded = writing** — `? extends T` is for consuming data from a collection; `? super T` is for producing data into a collection. This is the PECS principle: Producer Extends, Consumer Super.

5. **The choice depends on your method's purpose** — Ask yourself: *"Am I reading from this collection or writing to it?"* The answer tells you which wildcard to use.
