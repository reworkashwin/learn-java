# What is the Stream API?

## Introduction

Starting with Java 8, the **Stream API** brought functional programming to Java. Streams give us a powerful, declarative way to process data — and the best part for our multithreading journey? Making computations parallel becomes almost trivial. No more manual thread management, no Fork-Join boilerplate. Let's understand what streams are and why they matter.

---

## Streams — The Big Picture

### 🧠 What is it?

A **stream** is a sequence of elements from a source that supports data processing operations. Think of it as a pipeline: data flows in, gets transformed through a series of operations, and a result comes out.

### ❓ Why do we need it?

Data structures (arrays, lists, maps) are about **storing data**. Streams are about **computing on data**. They let us express complex data transformations in a clean, readable way — similar to SQL queries or operations in functional programming languages.

### 💡 Real-world analogy

Think of an assembly line in a factory:
- **Source**: raw materials arrive (your collection or array)
- **Intermediate steps**: cutting, painting, assembling (filter, sort, map)
- **Final step**: packaging the finished product (collect, reduce)

---

## Functional Programming in Java

### 🧠 What is it?

Functional programming is a paradigm where programs are built by **applying and composing functions**. Instead of telling the computer *how* to do something step by step (imperative), you tell it *what* you want (declarative).

Streams rely heavily on **lambda expressions** — anonymous functions that can be passed as arguments:

```java
// Imperative (traditional)
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}

// Declarative (streams + lambda)
list.stream().forEach(item -> System.out.println(item));
```

---

## Stream Pipeline Structure

Every stream operation follows a three-part pipeline:

### 1. Source
Where the data comes from — a collection, an array, a file, etc.

### 2. Intermediate Operations
Transform the stream. They return **another stream**, so you can chain them. Examples:
- `filter()` — keep elements matching a condition
- `sorted()` — sort elements
- `map()` — transform each element

### 3. Terminal Operation
Produces a **result** (a value, a collection, or nothing). This triggers the actual processing. Examples:
- `collect()` — gather results into a collection
- `reduce()` — combine elements into a single value
- `forEach()` — perform an action on each element

```
Source → filter() → sorted() → map() → collect()
         ^^^^^^^^^^^^^^^^^^^^^^^^       ^^^^^^^^^
         Intermediate operations        Terminal
         (return streams)               (return result)
```

---

## Sequential and Parallel Execution

### 🧠 Why this matters for multithreading

One of the biggest advantages of streams: **you can switch between sequential and parallel execution with a single method call**.

- No manual thread management
- No dealing with thread synchronization
- No Fork-Join pool setup
- The Stream API handles all of it internally

We'll explore parallel streams in detail in coming lectures.

---

## Internal vs. External Iteration

### External iteration (traditional)
You explicitly use an iterator or for-loop to traverse elements one by one.

### Internal iteration (streams)
The Stream API handles iteration internally. You just say *what* you want, and Java decides *how* to iterate — potentially optimizing memory access patterns and enabling parallelism.

---

## ✅ Key Takeaways

- Streams were introduced in **Java 8** and bring functional programming to Java
- Data structures are for **storing** data; streams are for **computing** on data
- A stream pipeline has three parts: **source → intermediate operations → terminal operation**
- Intermediate operations (filter, sort, map) return streams and can be chained
- Terminal operations (collect, reduce, forEach) produce a final result
- Streams make **parallel execution** trivially easy
- Streams use **internal iteration**, which can be more efficient than explicit loops

## ⚠️ Common Mistake

- Confusing streams with collections — streams don't store data, they process it
- A stream can only be consumed **once** — you can't reuse a stream after a terminal operation

## 💡 Pro Tip

Think of streams as **lazy** — intermediate operations don't execute until a terminal operation is called. This allows Java to optimize the entire pipeline before processing begins.
