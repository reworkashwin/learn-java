# What Are Sets?

## Introduction

We've mastered maps — now it's time for **sets**. The `Set` interface is one of the core collection types in Java. If you understand how `HashMap`, `LinkedHashMap`, and `TreeMap` work, you'll find sets very familiar — because sets are essentially built **on top of** maps internally.

---

## Concept 1: The Set Interface

### 🧠 What is it?

A `Set` is a collection that:

1. Stores values with **no particular order** (in general)
2. Does **not allow duplicates**

This is the fundamental difference between `List` and `Set`:

| Feature | List | Set |
|---------|------|-----|
| Order | Maintains insertion order | No guaranteed order (in general) |
| Duplicates | ✅ Allowed | ❌ Not allowed |

Think of a mathematical set — `{1, 3, 5}` is a set. Adding `3` again doesn't change it; it's still `{1, 3, 5}`.

### ❓ Why do we need sets?

Whenever you need a collection of **unique** elements:

- Tracking unique visitors
- Storing unique tags
- Eliminating duplicates from data
- Checking membership efficiently: "Is this item already in the collection?"

---

## Concept 2: Set Implementations

### 🧠 Three main implementations

| Implementation | Internal Structure | Characteristics |
|---------------|-------------------|-----------------|
| **HashSet** | HashMap | No order, fastest O(1) average |
| **LinkedHashSet** | LinkedHashMap | Maintains insertion order |
| **TreeSet** | Red-black tree (TreeMap) | Sorted order, O(log n) |

Notice the pattern? Each set implementation mirrors a map implementation:
- `HashSet` → `HashMap`
- `LinkedHashSet` → `LinkedHashMap`
- `TreeSet` → `TreeMap`

---

## Concept 3: How Sets Use Maps Internally

### ❓ How can a map (key-value pairs) power a set (single values)?

Here's the clever trick: the **value you store in the set becomes the key** in the underlying map. The map's value is just a **dummy object** (a constant placeholder).

```
Set.add("hello")  →  internalMap.put("hello", DUMMY_OBJECT)
Set.add("world")  →  internalMap.put("world", DUMMY_OBJECT)
```

We only care about the **keys**. The values are irrelevant — they're just there because `Map` requires key-value pairs.

### 💡 Why does this matter?

This is why duplicate detection is so fast:

1. You call `set.add("hello")`
2. Internally, it calls `map.put("hello", DUMMY)`
3. The hash function checks if `"hello"` already exists as a key
4. If it does → reject the insertion (duplicate!)
5. If it doesn't → store it

This duplicate check happens in **O(1)** average time — the same as any HashMap lookup.

---

## Concept 4: Set Operations with Venn Diagrams

### 🧠 Classic set operations

Given:
- Set A = `{A, C, B, D}`
- Set B = `{A, F, D}`

| Operation | Result | Description |
|-----------|--------|-------------|
| **Intersection** | `{A, D}` | Items in **both** sets |
| **Union** | `{A, B, C, D, F}` | Items in **either** set |
| **Relative complement** (A - B) | `{B, C}` | Items in A but **not** in B |

These operations are commonly visualized using **Venn diagrams** — two overlapping circles where the overlap represents the intersection.

---

## Concept 5: List vs Set — A Common Interview Question

### ❓ What is the difference between List and Set?

| Aspect | List | Set |
|--------|------|-----|
| **Duplicates** | Allowed | Not allowed |
| **Order** | Maintains insertion order | Depends on implementation |
| **Index access** | Yes (`list.get(i)`) | No |
| **Implementations** | ArrayList, LinkedList, Stack, Vector | HashSet, LinkedHashSet, TreeSet |
| **Use case** | Ordered sequences | Unique collections |

---

## ✅ Key Takeaways

- A `Set` stores **unique** values — no duplicates allowed
- Internally, sets are built on top of maps (the value becomes the key, with a dummy map value)
- Three implementations: `HashSet` (unordered, fastest), `LinkedHashSet` (insertion order), `TreeSet` (sorted)
- Duplicate detection is **O(1)** with hash-based sets — the hash function immediately identifies existing keys
- `Set` extends `Collection`, which extends `Iterable` — you can use for-each loops

## ⚠️ Common Mistakes

- Trying to access items by index in a set — sets have no `get(index)` method
- Assuming `HashSet` preserves insertion order — it does **not** (use `LinkedHashSet` for that)
- Adding mutable objects to a `HashSet` and then modifying them — this can corrupt the set because the hash code changes

## 💡 Pro Tips

- Need to remove duplicates from a list? Just pass it to a `HashSet`: `new HashSet<>(myList)`
- Use `Set` when you need fast `contains()` checks — O(1) vs O(n) for lists
- The `retainAll()` method performs intersection, `addAll()` performs union, `removeAll()` performs difference
