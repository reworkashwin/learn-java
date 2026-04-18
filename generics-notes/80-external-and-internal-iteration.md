# External and Internal Iteration

## Introduction

Before the Stream API, the only way to process a collection was to write a loop — you, the programmer, controlled the iteration step by step. This is called **external iteration**. Streams introduced a fundamentally different approach: **internal iteration**, where you declare *what* to do and the library handles the *how*. Understanding this distinction is key to understanding why streams exist and when to use them.

---

## Concept 1: External Iteration — You Control the Loop

### 🧠 What is it?

External iteration means **you** explicitly write the loop, manage the iterator, and decide how to traverse the collection. The most common forms are the `for` loop, enhanced `for-each` loop, and explicit `Iterator`.

### ⚙️ How it works

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "David");

// Classic for loop
for (int i = 0; i < names.size(); i++) {
    System.out.println(names.get(i));
}

// Enhanced for-each loop
for (String name : names) {
    System.out.println(name);
}

// Explicit iterator
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    System.out.println(it.next());
}
```

### ❓ What's the problem?

External iteration has several drawbacks:

1. **Sequential by default** — you'd need to rewrite the code entirely for parallel execution
2. **Imperative** — you describe *how* to iterate, mixing traversal logic with business logic
3. **Error-prone** — off-by-one errors, forgetting `hasNext()`, concurrent modification issues
4. **Hard to optimize** — the JVM can't optimize your hand-written loop as well as a library-managed one

---

## Concept 2: Internal Iteration — The Collection Controls the Loop

### 🧠 What is it?

Internal iteration means you tell the collection *what* to do with each element, and the **collection itself** decides *how* to iterate. You give up control of the loop mechanics.

### ⚙️ How it works

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "David");

// Internal iteration with forEach
names.forEach(name -> System.out.println(name));

// Internal iteration with streams
names.stream()
    .filter(name -> name.length() > 3)
    .map(String::toUpperCase)
    .forEach(System.out::println);
```

### 💡 Insight

Think of it like this:
- **External iteration** = You walk through a library, pulling books off shelves one by one
- **Internal iteration** = You give the librarian a list of criteria, and they bring you the matching books

You don't care *how* the librarian searches — they might check multiple shelves simultaneously, skip irrelevant sections, or use an index. That's their optimization to make.

---

## Concept 3: Side-by-Side Comparison

### 🧠 What is it?

Let's solve the same problem both ways to see the difference clearly.

**Task:** Find all names longer than 3 characters, convert to uppercase, and collect into a list.

### ⚙️ External iteration

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "David");
List<String> result = new ArrayList<>();

for (String name : names) {
    if (name.length() > 3) {
        result.add(name.toUpperCase());
    }
}
System.out.println(result);  // [ALICE, CHARLIE, DAVID]
```

### ⚙️ Internal iteration (Stream)

```java
List<String> result = names.stream()
    .filter(name -> name.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
System.out.println(result);  // [ALICE, CHARLIE, DAVID]
```

### Key Differences

| Aspect | External | Internal |
|--------|----------|----------|
| Who controls iteration? | You (the programmer) | The library/framework |
| Style | Imperative (how) | Declarative (what) |
| Parallelism | Manual rewrite needed | `.parallelStream()` — one word change |
| Optimization | Limited | Library can short-circuit, fuse operations |
| Readability | Loops can get nested and messy | Pipeline reads like a sentence |

---

## Concept 4: Why Internal Iteration Enables Parallelism

### 🧠 What is it?

The biggest advantage of internal iteration isn't cleaner code — it's that the library can **parallelize** the work without you changing your logic.

### ⚙️ How it works

```java
// Sequential — processes elements one by one
names.stream()
    .filter(name -> name.length() > 3)
    .forEach(System.out::println);

// Parallel — may process elements concurrently
names.parallelStream()
    .filter(name -> name.length() > 3)
    .forEach(System.out::println);
```

With external iteration, switching to parallel processing would require manually splitting the list, creating threads, synchronizing results — a complete rewrite. With internal iteration, it's a one-word change.

### ⚠️ Common Mistake

Don't blindly use `parallelStream()` for everything. For small collections or simple operations, the overhead of thread management outweighs the benefits. Parallel streams shine with **large datasets** and **CPU-intensive operations**.

---

## Concept 5: The forEach() Method — Bridge Between Both Worlds

### 🧠 What is it?

`Iterable.forEach()` (added in Java 8) is a simple form of internal iteration — it's not a stream, but it follows the same principle of letting the collection control the loop.

### ⚙️ How it works

```java
List<String> names = List.of("Alice", "Bob", "Charlie");

// forEach with lambda
names.forEach(name -> System.out.println(name));

// forEach with method reference
names.forEach(System.out::println);

// Works on Map too
Map<String, Integer> scores = Map.of("Alice", 90, "Bob", 85);
scores.forEach((name, score) -> 
    System.out.println(name + ": " + score)
);
```

### 💡 Insight

`forEach()` is great for **side effects** (printing, logging, sending events). But if you need to transform data, filter, or collect results, use the full stream pipeline instead — `forEach()` alone can't chain operations.

---

## ✅ Key Takeaways

- **External iteration**: you control the loop (`for`, `while`, `Iterator`) — imperative style
- **Internal iteration**: the collection controls traversal (`stream()`, `forEach()`) — declarative style
- Internal iteration enables **easy parallelism** — switch from `.stream()` to `.parallelStream()`
- Streams can **optimize** internally — fusing operations, short-circuiting, lazy evaluation
- `forEach()` is the simplest form of internal iteration — useful for side effects
- Use external iteration when you need fine-grained loop control (break, index access, modifying the collection during iteration)
