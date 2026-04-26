# 📘 Map Collection Hierarchy

## 📌 Introduction

In the previous lesson, we explored the Collections Framework hierarchy — the interfaces and classes that make up `List`, `Set`, and `Queue`. But there's one major player we left out: **Map**.

Map is a bit of an odd one. It's part of the Java Collections Framework, but it doesn't actually extend the `Collection` interface. So is it a collection or not? And what does its hierarchy look like?

That's exactly what we'll uncover in this lesson. By the end, you'll have a clear picture of the Map hierarchy — every interface, every class, and how they all connect.

---

## 🧩 Concept 1: Is Map Really a Collection?

### 🧠 What is it?

The `Map` interface in Java is a **completely separate interface** — it does **not** extend the `Collection` interface. It lives in `java.util.Map`, but it stands on its own at the top of its own hierarchy.

### ❓ Why isn't it part of the Collection interface?

This is one of those subtle but important distinctions in Java.

Collections like `List`, `Set`, and `Queue` all deal with **individual elements**. You add an element, remove an element, iterate over elements. They all extend the `Collection` interface because they share this common behavior.

But `Map` is different. A Map doesn't store individual elements — it stores **key-value pairs**. You don't just "add an item" to a Map; you associate a **key** with a **value**. The operations and behaviors are fundamentally different from those of other collections.

Because of this structural difference, the Java designers decided that Map should **not** extend `Collection`. It gets its own interface with its own contract.

### ⚙️ How it works

Think of it this way:

- `Collection` → deals with **single elements** → `List`, `Set`, `Queue`
- `Map` → deals with **key-value pairs** → `HashMap`, `TreeMap`, `LinkedHashMap`

They're conceptually both "collections of data," but their internal structure and behavior are different enough to warrant separate hierarchies.

### 💡 Insight

Even though `Map` doesn't extend `Collection`, it is still **officially part of the Java Collections Framework**. The Java documentation is clear about this. When people say "Java Collections," they mean Lists, Sets, Queues, **and** Maps. So don't be confused when someone calls Map a collection — in the broader sense, it is. It just doesn't follow the same interface contract as the others.

---

## 🧩 Concept 2: The Map Hierarchy

### 🧠 What is it?

Just like the `Collection` side has its own tree of interfaces and classes, the `Map` side has its own hierarchy. Let's walk through it step by step.

### ⚙️ How it works

Here's the complete Map hierarchy:

```
Map (interface)
├── HashMap (class)
│   └── LinkedHashMap (class)
└── SortedMap (interface)
    └── NavigableMap (interface)
        └── TreeMap (class)
```

Let's break down each piece:

#### 1. `Map` — The Root Interface

```java
import java.util.Map;
```

`Map` is the root of the entire Map hierarchy. It defines the basic contract for storing and retrieving key-value pairs. It doesn't extend any other interface — it's the top-level parent.

#### 2. `HashMap` — Implements `Map`

```java
import java.util.HashMap;
```

`HashMap` is a **class** that directly implements the `Map` interface (via `AbstractMap`). It's the most commonly used Map implementation. It stores key-value pairs using a hash table internally.

```java
public class HashMap<K,V> extends AbstractMap<K,V> implements Map<K,V>, ...
```

Notice that `HashMap` also extends `AbstractMap`, which itself implements `Map`. This is a common pattern in Java — an abstract class provides default implementations of interface methods so that concrete classes don't have to implement everything from scratch.

#### 3. `LinkedHashMap` — Extends `HashMap`

```java
import java.util.LinkedHashMap;
```

`LinkedHashMap` is a **class** that extends `HashMap`. It maintains the **insertion order** of entries, which regular `HashMap` does not guarantee.

```java
public class LinkedHashMap<K,V> extends HashMap<K,V> ...
```

Since it extends `HashMap`, it inherits all of `HashMap`'s functionality but adds ordering on top.

#### 4. `SortedMap` — Extends `Map`

```java
import java.util.SortedMap;
```

`SortedMap` is an **interface** that extends `Map`. It adds the guarantee that keys are maintained in **sorted order**.

```java
public interface SortedMap<K,V> extends Map<K,V>
```

#### 5. `NavigableMap` — Extends `SortedMap`

```java
import java.util.NavigableMap;
```

`NavigableMap` is an **interface** that extends `SortedMap`. It adds navigation methods — things like finding the closest key greater than or less than a given key.

```java
public interface NavigableMap<K,V> extends SortedMap<K,V>
```

> **Note:** In modern Java (Java 6+), `NavigableMap` sits between `SortedMap` and `TreeMap`. If you're using older Java versions, you might see `TreeMap` directly implementing `SortedMap`.

#### 6. `TreeMap` — Implements `NavigableMap`

```java
import java.util.TreeMap;
```

`TreeMap` is a **class** that implements `NavigableMap` (and by extension, `SortedMap` and `Map`). It stores keys in a **sorted, tree-based structure** (specifically, a Red-Black tree).

```java
public class TreeMap<K,V> ... implements NavigableMap<K,V>, ...
```

### 🧪 Quick Reference Table

| Type | Name | Kind | Parent |
|------|------|------|--------|
| Interface | `Map` | Root interface | — |
| Interface | `SortedMap` | Extends `Map` | `Map` |
| Interface | `NavigableMap` | Extends `SortedMap` | `SortedMap` |
| Class | `HashMap` | Implements `Map` | `AbstractMap` |
| Class | `LinkedHashMap` | Extends `HashMap` | `HashMap` |
| Class | `TreeMap` | Implements `NavigableMap` | `AbstractMap` |

### 💡 Insight

Notice the pattern here — it mirrors the `Collection` side closely. Just as `Collection` has `List`, `Set`, and `Queue` branching off from it, `Map` has `SortedMap` and `HashMap` branching off. And just like `SortedSet` leads to `TreeSet`, `SortedMap` (through `NavigableMap`) leads to `TreeMap`. Once you see the parallel, the whole framework becomes much easier to remember.

---

## 🧩 Concept 3: Verifying the Hierarchy in Code

### 🧠 What is it?

You don't have to take anyone's word for it — you can verify the entire Map hierarchy yourself by looking at the source declarations in Java.

### ⚙️ How it works

Here's what the actual Java source reveals:

```java
// Map — the root, extends nothing
public interface Map<K,V> { ... }

// SortedMap — extends Map
public interface SortedMap<K,V> extends Map<K,V> { ... }

// NavigableMap — extends SortedMap
public interface NavigableMap<K,V> extends SortedMap<K,V> { ... }

// HashMap — implements Map (via AbstractMap)
public class HashMap<K,V> extends AbstractMap<K,V> implements Map<K,V>, ... { ... }

// LinkedHashMap — extends HashMap
public class LinkedHashMap<K,V> extends HashMap<K,V> ... { ... }

// TreeMap — implements NavigableMap
public class TreeMap<K,V> extends AbstractMap<K,V> implements NavigableMap<K,V>, ... { ... }
```

Each declaration confirms the hierarchy we discussed. This is a great habit — whenever you're unsure about a class hierarchy in Java, open its source and check the `extends` and `implements` clauses.

### 💡 Insight

The video used Java 11 (LTS) for this demonstration. The `NavigableMap` interface was introduced in Java 6, so if you're working with anything Java 6 or later (which you almost certainly are), the hierarchy shown here is accurate.

---

## ✅ Key Takeaways

1. **Map is part of the Collections Framework** but does **not** extend the `Collection` interface — it's a separate hierarchy
2. Map deals with **key-value pairs**, whereas `Collection` deals with **individual elements** — that's why they're separate
3. The Map hierarchy: `Map` → `SortedMap` → `NavigableMap` → `TreeMap` (the sorted branch) and `Map` → `HashMap` → `LinkedHashMap` (the hash-based branch)
4. `NavigableMap` sits between `SortedMap` and `TreeMap`, adding navigation capabilities
5. You can always verify class hierarchies by checking the `extends`/`implements` declarations in Java source

## ⚠️ Common Mistakes

- **Thinking Map extends Collection** — It does not. They are completely separate interfaces. Don't assume all "collections" share the same parent
- **Forgetting NavigableMap** — Many beginners draw `TreeMap` directly under `SortedMap`. In modern Java, `NavigableMap` sits in between
- **Confusing "part of Collections Framework" with "extends Collection"** — These are two different things. Map is part of the framework without extending the interface

## 💡 Pro Tips

- When studying any Java class, use your IDE to inspect the class declaration — the `extends` and `implements` clauses tell you exactly where it fits in the hierarchy
- The Map hierarchy mirrors the Collection hierarchy in structure: both have sorted variants (`SortedMap`/`SortedSet`), both have hash-based implementations (`HashMap`/`HashSet`), and both have linked variants (`LinkedHashMap`/`LinkedHashSet`). Use this parallel to remember both hierarchies easily
- All Map interfaces and classes live in `java.util` — the same package as the rest of the Collections Framework
