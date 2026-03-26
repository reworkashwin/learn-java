# The PECS Principle — Producer Extends, Consumer Super

## Introduction

Throughout the wildcard lectures, we've been building toward one unifying rule that ties everything together. The **PECS principle** is a mnemonic that captures exactly when to use `? extends T` and `? super T`. If you remember nothing else about wildcards, remember this: **Producer Extends, Consumer Super**.

---

## Concept 1: What is PECS?

### 🧠 The rule

**P**roducer **E**xtends, **C**onsumer **S**uper — PECS.

- **Producer Extends** → If a collection **produces** values for you (you **read** from it), use `? extends T`
- **Consumer Super** → If a collection **consumes** values from you (you **write** to it), use `? super T`

That's it. Two rules. Every wildcard decision in Java flows from this principle.

---

## Concept 2: Producer Extends — `? extends T`

### 🧠 When to use it

Use `? extends T` when the generic collection is a **producer** of `T` — meaning your code **gets** values out of it.

### ⚙️ What you can and can't do

- ✅ **Read items safely as `T`** — every element is guaranteed to be `T` or a subtype
- ❌ **Cannot add items** (except `null`) — the list could be of a more specific type, and adding the wrong subtype would corrupt it

### 🧪 Example

```java
List<? extends Number> numbers = List.of(1, 2.5, 3);

Number n = numbers.get(0);  // ✅ Safe to read as Number
double d = numbers.get(1).doubleValue();  // ✅ Can call Number methods

numbers.add(4);    // ❌ Compile error — can't add
numbers.add(2.5);  // ❌ Compile error — can't add
```

### ❓ Why can't we add?

Because `List<? extends Number>` could be a `List<Integer>`, a `List<Double>`, or a `List<Float>`. If it's actually a `List<Integer>` and you try to add a `Double`, you'd corrupt the list. The compiler prevents this by blocking all typed additions.

### 💡 Insight

Think of it as a **read-only view** of the collection (with the caveat that it's not truly immutable — `null`, `remove`, and `sort` still work). The collection *produces* data for you to consume.

---

## Concept 3: Consumer Super — `? super T`

### 🧠 When to use it

Use `? super T` when the generic collection is a **consumer** of `T` — meaning your code **puts** values into it.

### ⚙️ What you can and can't do

- ✅ **Add `T` and its subtypes safely** — the container is guaranteed to hold `T` or a parent of `T`, so `T` always fits
- ❌ **Cannot read items as `T`** — the actual super type is unknown, so you can only read as `Object`

### 🧪 Example

```java
List<? super Integer> list = new ArrayList<Number>();

list.add(10);   // ✅ Safe to write — Integer fits into Number
list.add(20);   // ✅ Safe to write

Object obj = list.get(0);   // ✅ Only safe to read as Object
Integer i = list.get(0);    // ❌ Compile error — might not be Integer
```

### ❓ Why can't we read as `T`?

Because `List<? super Integer>` could be a `List<Integer>`, a `List<Number>`, or a `List<Object>`. If it's a `List<Number>`, the elements might be `Double` or `Float` — not necessarily `Integer`. The compiler can only guarantee the elements are `Object`.

### 💡 Insight

Think of it as a **write-only sink** for the collection. The collection *consumes* data you provide. You can pour things in, but when you look at what's inside, you only see `Object`.

---

## Concept 4: PECS in Practice — The Copy Method

### 🧠 The textbook example

The `copy` method we built earlier is the perfect illustration of PECS:

```java
public static <T> void copy(List<? extends T> source, List<? super T> destination) {
    for (int i = 0; i < source.size(); i++) {
        destination.add(source.get(i));
    }
}
```

| Parameter | Role | PECS Rule | Wildcard |
|-----------|------|-----------|----------|
| `source` | **Produces** items (we read from it) | Producer → Extends | `? extends T` |
| `destination` | **Consumes** items (we write to it) | Consumer → Super | `? super T` |

### 🧪 Usage

```java
List<Integer> src = List.of(1, 2, 3);
List<Number> dest = new ArrayList<>();

copy(src, dest);  // ✅ Integer extends Number — both wildcards satisfied

System.out.println(dest);  // [1, 2, 3]
```

---

## Concept 5: Quick Decision Guide

### 🧠 How to decide in practice

When you're writing a method that takes a generic collection, ask yourself one question about each parameter:

```
"Am I reading from this collection, writing to it, or both?"
```

Then follow this flowchart:

| Your answer | Use | Mnemonic |
|-------------|-----|----------|
| Only **reading** (getting values out) | `? extends T` | **P**roducer **E**xtends |
| Only **writing** (putting values in) | `? super T` | **C**onsumer **S**uper |
| **Both** reading and writing | `List<T>` (no wildcard) | Need full type access |
| Don't care about the type at all | `List<?>` | Unbounded wildcard |

### 💡 Insight

PECS isn't just a rule to memorize — it reflects a deeper truth about type safety. `extends` guarantees what comes **out** of a collection (safe reads). `super` guarantees what goes **into** a collection (safe writes). You can have one guarantee or the other, but not both — that's the fundamental trade-off of wildcards.

---

## ✅ Key Takeaways

1. **PECS = Producer Extends, Consumer Super** — the single most important rule for using wildcards correctly.

2. **Producer (`? extends T`)** — the collection produces data for you. Read safely as `T`, cannot write.

3. **Consumer (`? super T`)** — the collection consumes data from you. Write `T` or subtypes safely, can only read as `Object`.

4. **Both read and write? Skip wildcards** — use a concrete type parameter (`<T>`) when you need full access.

5. **Every wildcard decision is a PECS decision** — ask *"producer or consumer?"* and the answer tells you which wildcard to use.
