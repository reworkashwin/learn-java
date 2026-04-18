# Parallelization in Streams

## Introduction

One of the most powerful features of the Stream API is the ability to **process data in parallel** with almost zero code changes. Instead of calling `stream()`, you call `parallelStream()`, and Java automatically splits the work across multiple CPU cores. But when does parallelization actually help? In this note, we'll explore a practical example — saving 100,000 files — and see the dramatic performance difference between sequential and parallel approaches.

---

## Concept 1: Sequential vs Parallel Streams

### 🧠 What's the difference?

- **Sequential stream** → processes elements one by one, in order, on a single thread
- **Parallel stream** → splits the work across multiple threads using the ForkJoinPool

### ⚙️ How to switch

```java
// Sequential
people.stream().forEach(App::save);

// Parallel — just one word changes!
people.parallelStream().forEach(App::save);
```

That's it. One method call difference. Java handles all the thread management, splitting, and merging behind the scenes.

---

## Concept 2: Practical Example — Saving 100,000 Files

### 🧪 Setup

We create a `Person` class with a `personId` field (implements `Serializable` for file storage):

```java
public class Person implements Serializable {
    private int personId;
    // constructor, getters, setters
}
```

Then we generate 100,000 person objects:

```java
private List<Person> generatePeople(int number) {
    return Stream.iterate(0, x -> x + 1)
        .limit(number)
        .map(Person::new)
        .collect(Collectors.toList());
}
```

This uses `Stream.iterate()` to generate numbers 0, 1, 2, ..., 99999, then maps each to a `Person` object.

### 🧪 The save operation

Each person is saved to a separate file using `FileOutputStream`:

```java
private static void save(Person person) {
    try (FileOutputStream fos = new FileOutputStream(
            new File(DIRECTORY + person.getPersonId() + ".txt"))) {
        ObjectOutputStream oos = new ObjectOutputStream(fos);
        oos.writeObject(person);
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

### 🧪 Measuring performance

```java
// Sequential
long start = System.currentTimeMillis();
people.stream().forEach(ParallelSaveOperation::save);
System.out.println("Sequential: " + (System.currentTimeMillis() - start) + "ms");

// Parallel
start = System.currentTimeMillis();
people.parallelStream().forEach(ParallelSaveOperation::save);
System.out.println("Parallel: " + (System.currentTimeMillis() - start) + "ms");
```

### 📊 Results

```
Sequential: ~7000ms (7 seconds)
Parallel:   ~680ms  (0.7 seconds)
```

The parallel approach is approximately **10x faster**! Each file gets saved independently, making this a perfect candidate for parallelization.

---

## Concept 3: When Does Parallelization Help?

### ✅ Good candidates for parallelization

- **I/O-bound operations**: File operations, network calls, database queries — where threads spend time waiting
- **CPU-bound operations on large datasets**: Heavy computations across millions of elements
- **Independent operations**: Each element can be processed without depending on other elements

### ❌ Poor candidates for parallelization

- **Small datasets**: Thread management overhead outweighs the benefit
- **Order-dependent operations**: When elements must be processed sequentially
- **Shared mutable state**: When multiple threads modify the same data (race conditions)
- **Operations with side effects**: Printing in order, maintaining counters

---

## Concept 4: Stream.iterate() for Data Generation

### 🧠 What is it?

`Stream.iterate()` creates an infinite sequential stream by repeatedly applying a function:

```java
Stream.iterate(seed, function)
```

### 🧪 Example

```java
Stream.iterate(0, x -> x + 1)  // 0, 1, 2, 3, 4, ...
    .limit(100000)               // Stop at 100,000
    .map(Person::new)            // Convert each int to a Person
    .collect(Collectors.toList());
```

- Seed: `0` (starting value)
- Function: `x -> x + 1` (increment by 1)
- `limit()`: Turns the infinite stream into a finite one

---

## ✅ Key Takeaways

- Switch from sequential to parallel with `parallelStream()` — no other code changes needed
- I/O-bound operations (file saves, network calls) benefit enormously from parallelization
- In our example, parallel processing was **~10x faster** for saving 100,000 files
- Java uses the **ForkJoinPool** under the hood to manage parallel threads
- `Stream.iterate()` is useful for generating sequences of data

## ⚠️ Common Mistakes

- Using parallel streams for tiny collections — the overhead of thread management makes it slower
- Assuming parallel streams preserve element order — use `forEachOrdered()` if order matters
- Modifying shared state inside `forEach()` on a parallel stream — leads to race conditions
- Using `findFirst()` with parallel streams — use `findAny()` instead for better performance

## 💡 Pro Tips

- Measure before parallelizing! Always benchmark sequential vs parallel — parallelism isn't always faster
- Use `parallelStream()` for I/O-heavy tasks like file operations, API calls, and database writes
- The default ForkJoinPool uses `Runtime.getRuntime().availableProcessors()` threads
- For CPU-bound tasks, parallel streams shine when the dataset has **thousands+ elements** and each operation takes meaningful time
