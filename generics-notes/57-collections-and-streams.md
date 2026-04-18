# Collections and Streams

## Introduction

Collections and streams are both about working with groups of data — but they take fundamentally different approaches. Understanding these differences is essential for knowing when to use each one and how they interact. In this lecture, we explore what makes streams "lazy," why they're faster in certain scenarios, and the critical rule that **a stream can only be traversed once**.

---

## Concept 1: Collections — Eager Data Structures

### 🧠 What defines a collection?

Collections are **in-memory data structures** that store elements. Think `ArrayList`, `LinkedList`, `HashMap`, `TreeSet`. They share a key property:

> Every element must be computed **before** it can be added to the collection.

If you want to build a list of 1 million items, all 1 million must be created and stored in memory. Collections are **eager** — they need all the data upfront.

### 🧪 The prime number problem

Imagine you want a list of *all* prime numbers:

```java
// With a collection — impossible!
List<Integer> allPrimes = new ArrayList<>();
for (int i = 2; /* infinite */ ; i++) {
    if (isPrime(i)) allPrimes.add(i); // runs forever
}
```

You'd be stuck in an infinite loop because a collection demands all the data before you can use it.

---

## Concept 2: Streams — Lazy Computation

### 🧠 What makes streams different?

Streams compute elements **on demand**. They don't store data — they describe a pipeline of operations that will be executed only when needed.

> Streams are essentially **lazy collections**.

### ❓ Why does laziness matter?

Because intermediate operations (like `filter()`, `sorted()`, `map()`) don't execute immediately. They're only evaluated when a **terminal operation** (like `collect()`, `forEach()`, `reduce()`) is called.

This has two massive benefits:
1. **Optimization** — Java can combine and optimize operations before executing them
2. **Infinite sequences** — You can work with potentially infinite data sources

### 🧪 The prime number problem — solved

```java
// With a stream — works!
Stream.iterate(2, n -> n + 1)
    .filter(n -> isPrime(n))
    .limit(10)
    .forEach(System.out::println);
```

This prints the first 10 prime numbers without computing all primes. Items are calculated on demand.

---

## Concept 3: A Stream Can Only Be Traversed Once

### ⚠️ The single-use rule

This is a critical difference from collections:

```java
List<String> names = Arrays.asList("Adam", "Kevin");

Stream<String> nameStream = names.stream();
nameStream.forEach(System.out::println); // Works fine

nameStream.forEach(System.out::println); // IllegalStateException!
```

**Error:** `java.lang.IllegalStateException: stream has already been operated upon or closed`

Once a terminal operation is called on a stream, the stream is **consumed** and cannot be reused.

### ✅ The correct approach

If you need to process the data again, create a **new stream**:

```java
names.stream().forEach(System.out::println); // Stream 1
names.stream().forEach(System.out::println); // Stream 2 — a new, independent stream
```

Each call to `.stream()` creates a brand-new stream from the collection.

---

## Concept 4: Collections vs. Streams — Summary

| Aspect | Collection | Stream |
|--------|-----------|--------|
| Storage | Stores all elements in memory | No storage — computes on demand |
| Data | Needs all data upfront (eager) | Computes elements lazily |
| Traversal | Can be traversed **many times** | Can be traversed **only once** |
| Speed | Slower for large/infinite datasets | Faster due to lazy evaluation |
| Use case | When you need to store and access data | When you need to process/transform data |

---

## ✅ Key Takeaways

- Collections are eager — they require all data upfront and store it in memory
- Streams are lazy — elements are computed on demand, only when needed
- Intermediate operations don't execute until a terminal operation is called
- A stream can only be traversed **once** — reusing it throws `IllegalStateException`
- To process data again, create a new stream from the source collection

## ⚠️ Common Mistakes

- Trying to reuse a consumed stream — always create a fresh stream from the source
- Assuming streams store data — they don't; they're pipelines, not containers
- Expecting streams to be slower because they "do more" — laziness often makes them *faster*

## 💡 Pro Tips

- Think of a stream like a YouTube video vs. a DVD. A collection (DVD) has all the data stored. A stream (YouTube) delivers frames on demand — you don't need the entire video downloaded before you start watching
- Use streams for data processing pipelines; use collections when you need random access or repeated traversal
- The laziness of streams is what enables Java to optimize execution — it can fuse multiple operations into a single pass
