# Lower Bounded Wildcards — Inserting into Generic Collections

## Introduction

We've seen that upper bounded wildcards (`? extends T`) let you **read** from collections but block writing. What if you need the opposite — you want to **insert** items into a generic collection? That's where **lower bounded wildcards** (`? super T`) come in. They're the mirror image of upper bounded wildcards.

---

## Concept 1: What Are Lower Bounded Wildcards?

### 🧠 What is it?

A lower bounded wildcard restricts the unknown type to a specific type **or any of its supertypes (parent classes)**:

```java
List<? super Integer> list;
```

This list can be:
- `List<Integer>` ✅ (Integer itself)
- `List<Number>` ✅ (Number is a supertype of Integer)
- `List<Object>` ✅ (Object is a supertype of everything)

### ❓ Why does this exist?

When you **insert** an `Integer` into a list, the list can safely hold it as long as the list's type is `Integer` or something more general (a supertype). An `Integer` can always fit into a box labeled `Number` or `Object`.

---

## Concept 2: The Golden Rule — You Can Write, But Cannot Read (Meaningfully)

### ⚙️ Writing works

```java
List<? super Integer> list = new ArrayList<Number>();
list.add(10);    // ✅ Integer fits into a Number list
list.add(20);    // ✅ Also fine
```

This is safe because:
- If the list is `List<Integer>` → adding `Integer` is fine
- If the list is `List<Number>` → adding `Integer` (a Number subtype) is fine
- If the list is `List<Object>` → adding `Integer` (an Object subtype) is fine

### ⚠️ Reading is limited

```java
List<? super Integer> list = new ArrayList<Number>();
Object item = list.get(0);  // ✅ Only as Object
Integer item = list.get(0); // ❌ Compile error
```

Why? Because the list could be a `List<Object>` or `List<Number>`. Java can't guarantee what's actually stored, so it only lets you read elements as `Object`.

### 💡 Analogy

Think of `? super Integer` as a box labeled "can accept integers." You can **put integers in** safely. But when you **take something out**, you can only treat it as a generic object — you've lost track of the exact type.

---

## Concept 3: Upper vs. Lower — The Complete Picture

| Feature | `? extends T` (Upper) | `? super T` (Lower) |
|---------|----------------------|---------------------|
| **Keyword** | `extends` | `super` |
| **Accepts** | T and its subtypes | T and its supertypes |
| **Read** | ✅ Yes (as type T) | ⚠️ Only as Object |
| **Write** | ❌ No | ✅ Yes (subtypes of T) |
| **Use when** | You **get** values out | You **put** values in |

### 💡 The Decision Framework

Ask yourself:
- "Do I need to **read** from this collection?" → Use `? extends T`
- "Do I need to **write** to this collection?" → Use `? super T`
- "Do I need **both**?" → Use bounded type parameters (`<T extends X>`)

---

## ✅ Key Takeaways

- `? super T` means "any supertype of T" — it's a **lower bound**
- You can **write** subtypes of T into lower bounded wildcard lists
- You can only **read** elements as `Object` (you lose type specificity)
- Lower bounded wildcards are the complement of upper bounded wildcards

## ⚠️ Common Mistakes

- Trying to read specific types from a `List<? super T>` — you'll only get `Object`
- Confusing `super` with `extends` — they serve opposite purposes
- Forgetting that `super` means **supertypes** (parents), not subtypes

## 💡 Pro Tip

**Memory trick:** `extends` = **E**xtract (read). `super` = **S**tore (write). Or use the famous **PECS** principle: **P**roducer **E**xtends, **C**onsumer **S**uper. If the collection produces data for you, use `extends`. If it consumes data from you, use `super`.
