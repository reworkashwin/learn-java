# LinkedHashSet Example

## Introduction

We know `HashSet` doesn't guarantee any particular order of its elements. But what if you need the uniqueness of a set **and** want to remember the order in which items were inserted? That's exactly what `LinkedHashSet` is for.

---

## Concept 1: HashSet — No Guaranteed Order

### 🧪 Example

```java
Set<String> set = new HashSet<>();

set.add("Adam");
set.add("Kevin");
set.add("Daniel");
set.add("Joe");
set.add("Anna");

for (String s : set) {
    System.out.println(s);
}
```

**Output (unpredictable):**
```
Adam
Kevin
Joe
Anna
Daniel
```

The order is **not** the same as insertion order. In fact, it may change between runs or after resize operations.

### ❓ Why is the order random?

When you iterate over a `HashSet`, Java walks through the underlying one-dimensional array from index 0 to the last index. The position of each item depends on the hash function — it has nothing to do with when you inserted it.

---

## Concept 2: LinkedHashSet — Preserving Insertion Order

### 🧠 What is it?

`LinkedHashSet` extends `HashSet` but adds a **doubly linked list** connecting all entries in the order they were inserted. When you iterate, Java follows this linked list instead of scanning the array.

### 🧪 Example

```java
Set<String> set = new LinkedHashSet<>();

set.add("Adam");
set.add("Kevin");
set.add("Daniel");
set.add("Joe");
set.add("Anna");

for (String s : set) {
    System.out.println(s);
}
```

**Output (guaranteed):**
```
Adam
Kevin
Daniel
Joe
Anna
```

The items come out in **exactly the order we inserted them**.

---

## Concept 3: Why HashSet Order Can Change Over Time

### ❓ A common interview question

Even if a `HashSet` appears to have a consistent order, that order can **change** when the set resizes.

Here's what happens during a resize:

1. The load factor threshold is reached (typically 75% full)
2. Java creates a **new, larger** array
3. Every item is **rehashed** — the hash function generates a new index for the new array size
4. Items end up in **different positions** in the new array

Since the array layout changes, the iteration order changes too. This is why `HashSet` order is never guaranteed.

`LinkedHashSet` doesn't have this problem because iteration follows the linked list, not the array positions.

---

## Concept 4: The Trade-Off

### ⚙️ Memory cost

`LinkedHashSet` uses **more memory** than `HashSet` because of the doubly linked list overhead. Each entry stores two extra references (previous and next pointers).

### 🧠 Rule of thumb

- **Don't need insertion order?** → Use `HashSet` (less memory)
- **Need insertion order preserved?** → Use `LinkedHashSet` (slightly more memory)

---

## ✅ Key Takeaways

- `HashSet` iterates in an **unpredictable** order determined by hash codes and array positions
- `LinkedHashSet` maintains **insertion order** using a doubly linked list
- HashSet order can change after resize operations — this is a classic interview question
- LinkedHashSet uses **more memory** than HashSet due to the linked list

## ⚠️ Common Mistakes

- Relying on `HashSet` iteration order — it's not guaranteed and can change unexpectedly
- Using `LinkedHashSet` when order doesn't matter — you're wasting memory on the linked list

## 💡 Pro Tips

- `LinkedHashSet` is great for maintaining a unique collection where insertion order matters (e.g., preserving the order of user selections while eliminating duplicates)
- If you need **sorted** order (not insertion order), use `TreeSet` instead
