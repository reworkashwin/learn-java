# Collections and Streams

## Introduction

Before diving deeper into the Stream API, we need to understand the relationship between **collections** and **streams**. They're related but fundamentally different. Collections are about **storing data**; streams are about **processing data**. Confusing the two is one of the most common mistakes Java developers make. Let's clear this up once and for all.

---

## Concept 1: Collections — Data at Rest

### 🧠 What are collections?

A collection is a data structure that **holds elements in memory**. You can add, remove, search, and iterate over elements. The data is there, waiting to be used.

Java's Collections Framework includes:
- `ArrayList` — dynamic array
- `LinkedList` — doubly linked list
- `HashSet` — unique elements, no order
- `HashMap` — key-value pairs
- `TreeMap` — sorted key-value pairs

### ⚙️ Key properties

- **Eagerly populated** — all elements exist in memory
- **Mutable** — you can add and remove elements
- **Reusable** — iterate over a collection as many times as you want
- **Focused on storage** — the primary question is: "Where does this element go?"

---

## Concept 2: Streams — Data in Motion

### 🧠 What are streams?

A stream is a **pipeline of operations** that processes data from a source. It doesn't store data — it computes results on-the-fly as elements flow through the pipeline.

### ⚙️ Key properties

- **Lazily evaluated** — nothing happens until a terminal operation is called
- **Immutable** — you never modify the source collection
- **One-shot** — a stream can only be consumed **once**
- **Focused on computation** — the primary question is: "What do I do with each element?"

### 💡 Real-World Analogy

- **Collection** = A water tank. The water (data) sits there. You can measure it, add more, or drain some.
- **Stream** = A pipe connected to a tank. Water flows through, gets filtered, heated, measured — but the pipe itself doesn't hold any water.

---

## Concept 3: Creating Streams from Collections

### ⚙️ The bridge

Every collection in Java can produce a stream:

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "Diana");

// Create a sequential stream
Stream<String> stream = names.stream();

// Create a parallel stream
Stream<String> parallelStream = names.parallelStream();
```

### 🧪 Other stream sources

```java
// From an array
int[] numbers = {1, 2, 3, 4, 5};
IntStream arrStream = Arrays.stream(numbers);

// From values directly
Stream<String> valueStream = Stream.of("A", "B", "C");

// Infinite stream (must limit!)
Stream<Integer> infinite = Stream.iterate(0, n -> n + 1);

// From a file
Stream<String> lines = Files.lines(Paths.get("data.txt"));
```

---

## Concept 4: The Stream Pipeline

### ⚙️ Three stages

Every stream operation follows this structure:

```
Source → Intermediate Operations → Terminal Operation
```

**Source**: Where data comes from (collection, array, file)

**Intermediate operations**: Transform the stream — return another stream. They're **lazy** — no processing happens yet.

```java
names.stream()
     .filter(n -> n.length() > 3)    // intermediate
     .map(String::toUpperCase)        // intermediate
     .sorted()                        // intermediate
```

**Terminal operation**: Triggers the actual processing and produces a result.

```java
names.stream()
     .filter(n -> n.length() > 3)
     .map(String::toUpperCase)
     .sorted()
     .collect(Collectors.toList());   // terminal — triggers everything
```

### ⚠️ Key Mistake: Streams are one-shot

```java
Stream<String> stream = names.stream().filter(n -> n.length() > 3);

stream.forEach(System.out::println);  // Works
stream.forEach(System.out::println);  // IllegalStateException!
```

Once consumed, a stream is gone. Create a new one if you need to process again.

---

## Concept 5: External vs Internal Iteration

### 🧠 External iteration (collections)

You control the iteration — **how** to loop and **what** to do:

```java
for (String name : names) {
    if (name.length() > 3) {
        System.out.println(name.toUpperCase());
    }
}
```

### 🧠 Internal iteration (streams)

You declare **what** you want — the stream handles **how** to iterate:

```java
names.stream()
     .filter(n -> n.length() > 3)
     .map(String::toUpperCase)
     .forEach(System.out::println);
```

### ❓ Why does this matter for multithreading?

With external iteration, **you** manage the loop — parallelizing it requires manual thread management. With internal iteration, the **stream** manages the loop — switching to parallel is trivial:

```java
names.parallelStream()          // One method call → parallel
     .filter(n -> n.length() > 3)
     .map(String::toUpperCase)
     .forEach(System.out::println);
```

The stream framework splits the data across multiple threads automatically (using the Fork-Join pool under the hood).

---

## Concept 6: Streams Don't Modify the Source

### ⚠️ Important guarantee

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));

List<String> filtered = names.stream()
    .filter(n -> n.length() > 3)
    .collect(Collectors.toList());

System.out.println(names);     // [Alice, Bob, Charlie] — unchanged
System.out.println(filtered);  // [Alice, Charlie] — new list
```

The original collection is **never modified** by stream operations. This is crucial for thread safety — if streams mutated the source, parallel streams would be unsafe.

---

## ✅ Key Takeaways

- Collections **store** data; streams **process** data
- Streams are lazy — nothing happens until a terminal operation is called
- Streams are **one-shot** — consume once, then create a new stream
- Internal iteration (streams) enables easy parallelization; external iteration (for loops) does not
- Stream operations never modify the source collection
- Every collection can produce a stream via `.stream()` or `.parallelStream()`
