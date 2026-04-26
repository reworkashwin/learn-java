# Generics Homework Solution

## Introduction

In this lesson, we bring together everything we've learned about generics — interfaces, bounded type parameters, and `ArrayList` — to build a **generic library** that can store and execute different types of algorithms.

This is a practical exercise that shows why generics exist: to write **flexible, type-safe, reusable code**.

---

## The Problem

We want to build a `Library` class that can store different algorithm types — search algorithms, sorting algorithms, graph algorithms — and execute them.

Without generics, we'd need separate libraries for each algorithm type, or lose type safety by using raw `Object` references. With generics and bounded type parameters, we get the best of both worlds.

---

## Step 1: Define the Algorithm Interface

First, we create a common contract that all algorithms must follow:

```java
public interface Algorithm {
    void execute();
}
```

Every algorithm — whether it's a search, sort, or graph algorithm — must implement `execute()`. This gives us a **uniform way** to run any algorithm.

---

## Step 2: Create Concrete Algorithm Classes

Each algorithm implements the `Algorithm` interface:

```java
public class SearchAlgorithm implements Algorithm {
    @Override
    public void execute() {
        System.out.println("Running the search algorithm");
    }
}

public class SortingAlgorithm implements Algorithm {
    @Override
    public void execute() {
        System.out.println("Running the sorting algorithm");
    }
}

public class GraphAlgorithm implements Algorithm {
    @Override
    public void execute() {
        System.out.println("Running graph algorithm");
    }
}
```

Because all three implement `Algorithm`, they share a common type — and this is the key to making generics work here.

---

## Step 3: Build the Generic Library

Here's where generics shine. We use a **bounded type parameter** to ensure the library only accepts types that implement `Algorithm`:

```java
import java.util.ArrayList;
import java.util.List;

public class Library<T extends Algorithm> {

    private List<T> algorithms;

    public Library() {
        this.algorithms = new ArrayList<>();
    }

    public void add(T algorithm) {
        algorithms.add(algorithm);
    }

    public T getLast() {
        if (algorithms.size() <= 0) {
            return null;
        }
        return algorithms.remove(algorithms.size() - 1);
    }
}
```

### Why `T extends Algorithm`?

This is the bounded type parameter. It tells the compiler:

> "T can be any type, **as long as** it implements the `Algorithm` interface."

This means:
- `Library<SearchAlgorithm>` ✅
- `Library<SortingAlgorithm>` ✅
- `Library<String>` ❌ — `String` doesn't implement `Algorithm`

### The `getLast()` Method

- Returns `null` if the list is empty
- Otherwise, **removes and returns** the last item using `algorithms.remove(algorithms.size() - 1)`
- `remove()` both deletes the element at the given index and returns it

---

## Step 4: Putting It All Together

```java
public class App {
    public static void main(String[] args) {
        Library<Algorithm> library = new Library<>();

        library.add(new SearchAlgorithm());
        library.add(new SortingAlgorithm());
        library.add(new GraphAlgorithm());

        Algorithm item = library.getLast();

        while (item != null) {
            item.execute();
            item = library.getLast();
        }
    }
}
```

**Output:**
```
Running graph algorithm
Running the sorting algorithm
Running the search algorithm
```

Notice the order is reversed — we're pulling from the end (LIFO — Last In, First Out — behavior), so the last item added is the first one executed.

### Why `Library<Algorithm>`?

Because `Algorithm` is the interface type, the library can hold **any** class that implements `Algorithm`. We don't need `Library<SearchAlgorithm>` separately — using the interface type gives us maximum flexibility.

---

## ✅ Key Takeaways

- **Bounded type parameters** (`T extends Algorithm`) restrict generics to specific type hierarchies
- This approach combines **type safety** with **flexibility** — only valid algorithm types are accepted
- The `Library` class is fully reusable for any new algorithm type that implements `Algorithm`
- Using the interface as the type argument (`Library<Algorithm>`) allows mixing different algorithm implementations

## ⚠️ Common Mistakes

- Forgetting that `algorithms.size() - 1` gives the last index (indices start at 0)
- Not checking for empty list before calling `remove()` — this would throw `IndexOutOfBoundsException`
- Trying to store non-Algorithm types in the library — the compiler prevents this thanks to bounded types

## 💡 Pro Tip

This pattern — **interface + bounded generics + collection** — is extremely common in real-world Java. Think of plugin systems, strategy patterns, or command queues. Whenever you have a family of related types that share a contract, this is the approach to use.
