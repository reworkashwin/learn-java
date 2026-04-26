# Vector

## Introduction

We've been exploring list implementations in Java — primarily `ArrayList` and `LinkedList`. But there's another list implementation lurking in the Java Collections Framework: `Vector`. While it's largely considered a **legacy class**, understanding it helps you appreciate why modern alternatives exist and when (if ever) you might encounter it.

---

## Concept 1: What is a Vector?

### 🧠 What is it?

`Vector` is a generic, growable array of objects — very similar to `ArrayList`. Under the hood, it uses a **one-dimensional array** to store elements.

```java
Vector<String> vector = new Vector<>();
vector.add("Adam");
vector.add("Anna");
vector.add("Joe");

for (String s : vector) {
    System.out.println(s);
}
// Output: Adam, Anna, Joe
```

It implements `Serializable`, `Cloneable`, `Iterable`, `Collection`, `List`, and `RandomAccess` interfaces — meaning you get **random indexing** with O(1) access time when you know the index.

### ❓ Why does it exist?

`Vector` was part of Java from the very beginning (JDK 1.0), before the Collections Framework was introduced. It was the original "resizable array" implementation.

---

## Concept 2: Vector vs ArrayList — The Thread Safety Difference

### ⚙️ How it works

The critical distinction is that **every single operation on a Vector is synchronized** — meaning it is **thread-safe**.

Whether you:
- Add an item
- Get an item by index
- Check if it contains a value
- Remove an item

...each operation acquires a lock before executing and releases it afterward.

### 💡 Why does this matter?

Synchronization adds overhead. Every time a thread accesses the Vector, it must:
1. **Acquire** the lock
2. Perform the operation
3. **Release** the lock

This makes `Vector` **slower than `ArrayList`** in single-threaded scenarios — which is the majority of applications.

### ⚠️ Common Mistakes

- **Using Vector "just to be safe"** — If you're not dealing with multiple threads, `ArrayList` is always the better choice.
- **Assuming Vector is the best thread-safe option** — Even in multi-threaded environments, there are better alternatives like `Collections.synchronizedList()` or `CopyOnWriteArrayList`.

---

## Concept 3: The Capacity Increment Feature

### 🧠 What is it?

When an `ArrayList` runs out of space, Java **doubles** the size of the underlying array. With `Vector`, you can **control the resize behavior** by specifying a **capacity increment**.

```java
// Initial capacity of 5, increment by 3 when full
Vector<String> vector = new Vector<>(5, 3);
```

### ⚙️ How it works

1. You create a Vector with initial capacity `5` and capacity increment `3`
2. You can store up to **5 items** without resizing
3. When the 6th item is inserted, Java resizes the array to `5 + 3 = 8`
4. The next resize would go to `8 + 3 = 11`, and so on

```java
Vector<String> vector = new Vector<>(5, 3);
System.out.println("Capacity: " + vector.capacity()); // 5

for (int i = 0; i < 6; i++) vector.add("item" + i);
System.out.println("Capacity: " + vector.capacity()); // 8 (5 + 3)

for (int i = 6; i < 9; i++) vector.add("item" + i);
System.out.println("Capacity: " + vector.capacity()); // 11 (8 + 3)
```

Compare with `ArrayList`, which has no `capacity()` method and always grows by ~50% (factor of 1.5x).

This gives you finer control over memory allocation compared to the doubling strategy of `ArrayList`.

### 💡 Insight

While this is an interesting feature, it's rarely a compelling reason to choose Vector over ArrayList. The performance penalty from synchronization far outweighs this benefit in most real-world applications.

---

## ✅ Key Takeaways

- `Vector` is a **legacy, thread-safe** list implementation backed by a one-dimensional array
- Every operation is **synchronized**, making it slower than `ArrayList` in single-threaded contexts
- Unlike `ArrayList` (which doubles), Vector supports a **custom capacity increment** for resizing
- **Don't use Vector** in new code — prefer `ArrayList` (single-threaded) or `CopyOnWriteArrayList` / `Collections.synchronizedList()` (multi-threaded)

## ⚠️ Common Mistakes

- Using `Vector` when `ArrayList` would suffice — unnecessary synchronization overhead
- Choosing `Vector` for thread safety when better concurrent collections exist

## 💡 Pro Tips

- If you see `Vector` in legacy code, consider refactoring to `ArrayList` if thread safety isn't needed
- For thread-safe lists in modern Java, look at `java.util.concurrent` package
