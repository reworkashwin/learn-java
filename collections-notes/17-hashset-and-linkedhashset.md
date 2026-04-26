# 📘 HashSet and LinkedHashSet

## 📌 Introduction

So far in our collections journey, we've worked with `List` implementations like `ArrayList` and `LinkedList`. Now we step into a different branch of the Collection Framework — the **Set interface**. In this note, we explore two important `Set` implementations: `HashSet` and `LinkedHashSet`. Both store **unique elements** (no duplicates), but they differ in one critical way — how they handle **ordering**.

Understanding when to use `HashSet` vs `LinkedHashSet` is a common interview question and an essential skill for writing efficient Java code.

---

## 🧩 Concept 1: HashSet

### 🧠 What is it?

`HashSet` is the most commonly used implementation of the `Set` interface. It stores elements using a **hash table** internally, where each element's position is determined by its **hash code**.

The key characteristics:
- **No duplicates** — Adding the same element twice has no effect.
- **No guaranteed order** — Elements may appear in any order when iterated.
- **Super fast access** — Constant-time O(1) performance for basic operations.

### ❓ Why do we need it?

When you care about **uniqueness** and **speed** but don't care about the order of elements, `HashSet` is your best friend. It's the go-to choice for scenarios like:
- Removing duplicates from a dataset
- Fast membership checks ("Is this element in the set?")
- Storing unique identifiers

### ⚙️ How it works

Internally, `HashSet` is backed by a `HashMap`. When you add an element:
1. The element's `hashCode()` is computed.
2. The hash code determines which "bucket" the element goes into.
3. If an element with the same hash and value already exists, the addition is ignored.

Because elements are placed based on hash codes (not insertion order), the iteration order is **unpredictable**.

### 🧪 Example

```java
import java.util.HashSet;
import java.util.Set;

public class HashSetExample {
    public static void main(String[] args) {
        Set<String> fruits = new HashSet<>();

        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");
        fruits.add("Apple");  // Duplicate — will be ignored

        System.out.println(fruits);
        // Output might be: [Banana, Apple, Cherry]
        // Order is NOT guaranteed!
    }
}
```

Notice: We added "Apple" twice, but it only appears **once** in the output. That's the `Set` contract — no duplicates. Also, the output order (`Banana, Apple, Cherry`) doesn't match the insertion order (`Apple, Banana, Cherry`) — that's `HashSet` behavior.

### 💡 Insight

The "randomness" of `HashSet`'s ordering isn't truly random — it's determined by hash codes. But from a developer's perspective, you should treat it as **unpredictable** and never rely on any particular order.

---

## 🧩 Concept 2: LinkedHashSet

### 🧠 What is it?

`LinkedHashSet` is an extension of `HashSet` with one crucial difference — it **maintains insertion order**. It uses a hash table for storage (like `HashSet`) but also maintains a **doubly-linked list** running through all entries, which preserves the order in which elements were added.

### ❓ Why do we need it?

Sometimes you want the **uniqueness guarantee** of a `Set` but also need **predictable iteration order**. For example:
- Displaying unique items in the order they were first encountered
- Maintaining a history of unique events
- Building ordered unique collections from user input

### ⚙️ How it works

`LinkedHashSet` extends `HashSet` and uses `LinkedHashMap` internally. For every element:
1. It's hashed and placed into a bucket (same as `HashSet`).
2. Additionally, a **linked list pointer** connects it to the previously added element.

This linked list is what gives you insertion-order iteration. The tradeoff is a small amount of extra memory and slightly slower performance compared to `HashSet`.

### 🧪 Example

```java
import java.util.LinkedHashSet;
import java.util.Set;

public class LinkedHashSetExample {
    public static void main(String[] args) {
        Set<String> fruits = new LinkedHashSet<>();

        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");
        fruits.add("Apple");  // Duplicate — will be ignored

        System.out.println(fruits);
        // Output: [Apple, Banana, Cherry]
        // Order IS preserved!
    }
}
```

The output is `[Apple, Banana, Cherry]` — exactly the order in which elements were first added. The duplicate "Apple" is still ignored (it's a `Set`), and the insertion order is maintained.

### 💡 Insight

`LinkedHashSet` gives you the best of both worlds — the uniqueness of a `Set` and the ordering of a `List`. But if you don't need ordering, stick with `HashSet` for better performance.

---

## 🧩 Concept 3: HashSet vs LinkedHashSet — Side by Side

### ⚙️ Comparison Table

| Feature | HashSet | LinkedHashSet |
|---|---|---|
| **Duplicates** | Not allowed | Not allowed |
| **Ordering** | Unpredictable (random) | Preserves insertion order |
| **Performance** | Faster — O(1) for add/remove/contains | Slightly slower than HashSet |
| **Internal Structure** | Hash table (`HashMap`) | Hash table + linked list (`LinkedHashMap`) |
| **Memory** | Less memory | Slightly more memory (linked list overhead) |
| **Use When** | You need fast access, don't care about order | You need uniqueness + predictable iteration order |

### 🧪 Same Code, Different Behavior

```java
// Using HashSet
Set<String> hashSet = new HashSet<>();
hashSet.add("Apple");
hashSet.add("Banana");
hashSet.add("Cherry");
System.out.println(hashSet);  // [Banana, Apple, Cherry] — random order

// Using LinkedHashSet
Set<String> linkedHashSet = new LinkedHashSet<>();
linkedHashSet.add("Apple");
linkedHashSet.add("Banana");
linkedHashSet.add("Cherry");
System.out.println(linkedHashSet);  // [Apple, Banana, Cherry] — insertion order
```

The only change is the implementation class. The interface (`Set`) and operations are identical — but the behavior is fundamentally different.

### 💡 Insight

`HashSet` is **generally faster** because it doesn't maintain any ordering metadata. The linked list in `LinkedHashSet` adds overhead for insertion and iteration. Choose based on your actual requirements — don't pay for ordering you don't need.

---

## 🧩 Concept 4: Choosing the Right Set

### ⚙️ Decision Guide

Ask yourself these questions:

1. **Do I need uniqueness?** → Yes, use a `Set`. No → use a `List`.
2. **Do I care about order?**
   - **No** → Use `HashSet` (fastest).
   - **Yes, insertion order** → Use `LinkedHashSet`.
   - **Yes, sorted order** → Use `TreeSet` (covered in future notes).
3. **Is performance critical?** → Prefer `HashSet` unless you specifically need ordering.

---

## ✅ Key Takeaways

1. Both `HashSet` and `LinkedHashSet` implement the `Set` interface — **no duplicates allowed**.
2. `HashSet` uses a hash table, provides **O(1) performance**, but **does not guarantee order**.
3. `LinkedHashSet` extends `HashSet` and **preserves insertion order** using a linked list.
4. `HashSet` is faster and uses less memory; `LinkedHashSet` trades a bit of performance for predictable ordering.
5. Both are part of the `Set` interface — which one to use depends entirely on whether you need ordering.

---

## ⚠️ Common Mistakes

1. **Assuming HashSet maintains insertion order** — It doesn't. Even if it appears to in small tests, don't rely on it.
2. **Using LinkedHashSet when order doesn't matter** — You're paying for overhead you don't need. Use `HashSet` instead.
3. **Forgetting to override `hashCode()` and `equals()`** — For custom objects in a `Set`, both methods must be properly overridden, or duplicate detection won't work correctly.

---

## 💡 Pro Tips

- In interviews, always mention that `HashSet` is backed by `HashMap` and `LinkedHashSet` is backed by `LinkedHashMap` — it shows deep understanding.
- If you need a `Set` that sorts elements automatically, look into `TreeSet` (uses a Red-Black tree internally, O(log n) operations).
- When converting a `List` to remove duplicates while preserving order, use `new LinkedHashSet<>(list)` — not `new HashSet<>(list)`.
