# Lower Bounded Wildcards in Practice — Concrete Examples

## Introduction

In the previous lecture, we established the theory behind lower bounded wildcards: `? super T` accepts any super type of `T`, allows writing, but restricts reading to `Object`. Now let's see this play out in real code — creating lower bounded wildcard lists, confirming the read restriction, and demonstrating safe insertion.

---

## Concept 1: Creating Lower Bounded Wildcard Lists

### 🧠 What can we assign to `List<? super Integer>`?

When we declare a variable with a lower bounded wildcard:

```java
List<? super Integer> list1 = new ArrayList<Integer>();  // ✅ Integer itself
List<? super Integer> list2 = new ArrayList<Number>();   // ✅ Number is a super class of Integer
List<? super Integer> list3 = new ArrayList<Object>();   // ✅ Object is a super class of Integer
```

All three compile without issues. The lower bound (`Integer`) sets a **floor** — the list can hold `Integer` or anything **above** it in the inheritance chain.

### ⚙️ Why do these work?

It comes down to inheritance:
- `Integer` is `Integer` — the type itself satisfies `? super Integer`
- `Integer extends Number` — so `Number` is a super class of `Integer`
- `Object` is the parent of every class in Java — it's always a valid super type

The `super` keyword walks **up** the type hierarchy, accepting every ancestor along the way.

### 💡 Insight

Compare this with upper bounded wildcards where we walked **down** the hierarchy (subtypes). Lower bounded wildcards go the opposite direction — up toward `Object`. The direction determines what operations are safe.

---

## Concept 2: The Read Restriction — Confirmed in Code

### 🧠 What happens when we try to read?

Let's write a method that tries to iterate over a lower bounded wildcard list:

```java
public static void showAll(List<? super Number> list) {
    for (Number n : list) {       // ❌ Compile error!
        System.out.println(n);
    }
}
```

This fails. The compiler won't let us treat elements as `Number`. Why? Because `? super Number` means the list could be:
- A `List<Number>` — elements are `Number`
- A `List<Serializable>` — elements could be anything `Serializable` (strings, dates, etc.)
- A `List<Object>` — elements could be literally anything

Java can't guarantee the elements are `Number`, so it refuses to let us use that type.

### ⚙️ The fix — use `Object`

The only type Java can guarantee for every element is `Object`:

```java
public static void showAll(List<? super Number> list) {
    for (Object o : list) {       // ✅ Works — everything is an Object
        System.out.println(o);
    }
}
```

No matter what the actual list type is — `List<Number>`, `List<Serializable>`, or `List<Object>` — every element is guaranteed to be an `Object`. It's the only universally safe read type.

### 🧪 Calling it with a Serializable list

Here's an interesting example. The `Number` class implements the `Serializable` interface, which means `Serializable` is a super type of `Number`. So we can do this:

```java
List<Serializable> list = new ArrayList<>();
list.add("Adam");
list.add("Kevin");
list.add("Anna");

showAll(list);  // ✅ Works — Serializable is a super type of Number
```

Output:
```
Adam
Kevin
Anna
```

This works because `Serializable` satisfies `? super Number` — it's a super type of `Number`. Inside `showAll`, the elements are read as `Object`, so printing works fine regardless of the actual types.

### 💡 Insight

A useful habit: check Oracle's documentation to understand the inheritance hierarchy. For example, looking up the `Number` class reveals it implements `Serializable`. This confirms that `Serializable` is a valid super type of `Number` and explains why `List<Serializable>` is compatible with `List<? super Number>`.

---

## Concept 3: Writing Items — Where Lower Bounded Wildcards Shine

### 🧠 Can we add items?

This is the primary use case for lower bounded wildcards. Let's create a list and insert items:

```java
List<? super Number> nums = new ArrayList<>();

nums.add(10);          // ✅ Works — Integer is a subtype of Number
nums.add(new Integer(23));  // ✅ Works — same as above, explicit wrapper
nums.add(33.3);        // ✅ Works — Double is a subtype of Number
nums.add(1.5f);        // ✅ Works — Float is a subtype of Number
```

All insertions succeed. We can add integers, doubles, and floats to a `List<? super Number>` without any compile errors.

### ❓ Why does this work?

Because `? super Number` guarantees that the list holds `Number` or a **parent** of `Number`. Whether the actual list is `List<Number>`, `List<Serializable>`, or `List<Object>`:

- Adding an `Integer` to `List<Number>` → safe (Integer is a Number)
- Adding an `Integer` to `List<Object>` → safe (Integer is an Object)
- Adding a `Double` to `List<Number>` → safe (Double is a Number)
- Adding a `Double` to `List<Object>` → safe (Double is an Object)

A subtype of `Number` always fits into a container designed for `Number` **or anything above it**. This is basic polymorphism — and it's why the compiler allows these additions.

### ⚙️ What about upper bounded wildcards?

Let's confirm that `extends` would block these same insertions:

```java
List<? extends Number> extendsList = new ArrayList<>();
extendsList.add(10);    // ❌ Compile error!
extendsList.add(33.3);  // ❌ Compile error!
```

With `extends`, you can't add anything. With `super`, you can. This is the fundamental difference in action.

### 💡 Insight

Java automatically converts primitive values to their wrapper types (autoboxing). When you write `nums.add(10)`, Java converts the `int` literal `10` into an `Integer` object under the hood. Whether you write `nums.add(10)` or `nums.add(new Integer(10))`, the result is the same.

---

## Concept 4: The Complete Contrast — `extends` vs `super`

### 🧠 Putting it all together

After working through concrete examples of both wildcard types, the rules crystallize:

| Operation | `? extends T` (Upper Bounded) | `? super T` (Lower Bounded) |
|-----------|-------------------------------|------------------------------|
| **Read as `T`** | ✅ Yes | ❌ No — only as `Object` |
| **Write `T` or subtypes** | ❌ No | ✅ Yes |
| **Use case** | Iterating, printing, computing | Inserting, collecting, accumulating |

### 🧪 Side by side

```java
// UPPER bounded — can READ, cannot WRITE
List<? extends Number> upper = List.of(1, 2, 3);
Number n = upper.get(0);   // ✅ Read as Number
upper.add(10);             // ❌ Cannot add

// LOWER bounded — can WRITE, cannot READ as specific type
List<? super Number> lower = new ArrayList<>();
lower.add(10);             // ✅ Add Integer
lower.add(3.14);           // ✅ Add Double
Object o = lower.get(0);   // ⚠️ Can only read as Object
```

### 💡 Insight

This is the **PECS principle** in action — **P**roducer **E**xtends, **C**onsumer **S**uper:
- If the collection **produces** data for you (you read from it) → `extends`
- If the collection **consumes** data from you (you write to it) → `super`

---

## Concept 5: What's Coming Next

### 🧠 The remaining questions

We've now covered all three wildcard types — unbounded (`?`), upper bounded (`? extends T`), and lower bounded (`? super T`). But two important questions remain:

1. **A direct comparison example** — In the next lecture, we'll look at a simple, focused example that demonstrates the difference between upper and lower bounded wildcards side by side, making the contrast crystal clear.

2. **Wildcards vs bounded type parameters** — When should you use `?` (wildcard) versus `T` (type parameter)? They seem similar in many cases, but there's a fundamental difference. We'll clarify exactly when to reach for each one.

---

## ✅ Key Takeaways

1. **`List<? super Integer>` accepts `ArrayList<Integer>`, `ArrayList<Number>`, `ArrayList<Object>`** — any list whose element type is `Integer` or a super class of `Integer`.

2. **Reading from a lower bounded wildcard list returns `Object`** — you cannot read as the specific type because the actual super type is unknown. `Object` is the only universally safe option.

3. **Writing to a lower bounded wildcard list works for `T` and its subtypes** — you can add `Integer`, `Double`, `Float` to `List<? super Number>` because all of them are subtypes of `Number`, and the list is guaranteed to hold `Number` or a parent of it.

4. **`extends` = read, `super` = write** — upper bounded wildcards are for consuming data from a collection; lower bounded wildcards are for producing data into a collection. This is the PECS principle.

5. **Check the inheritance hierarchy** — understanding which classes implement which interfaces (like `Number implements Serializable`) helps you reason about what types satisfy a given wildcard bound.
