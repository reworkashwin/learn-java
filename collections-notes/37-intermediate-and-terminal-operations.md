# 📘 Intermediate and Terminal Operations

## 📌 Introduction

Now that we know what streams are, it's time to **go deeper** into the two types of operations that make stream pipelines work: **intermediate** and **terminal** operations. These are the core building blocks — understanding them is essential to unlocking the full power of the Stream API.

Think of intermediate operations as the **assembly stations** on a production line, and terminal operations as the **final collection point** where the finished product comes out.

---

## 🧩 Concept 1: Intermediate Operations

### 🧠 What is it?

Intermediate operations are operations that **transform a stream into another stream**. They define *what* should happen to the data — filtering, mapping, sorting — but they don't actually *do* anything yet.

Why? Because intermediate operations are **lazy**. They build up a description of the pipeline, but nothing executes until a terminal operation is invoked.

### ❓ Why do we need them?

They let you build powerful transformation pipelines in a readable, chainable way. Because they're lazy, the stream can optimize execution — processing only what's necessary.

### ⚙️ Common Intermediate Operations

| Operation | What it does |
|-----------|-------------|
| `filter(predicate)` | Keeps elements that match a condition |
| `map(function)` | Transforms each element into another form |
| `sorted()` | Sorts elements by natural order (or custom comparator) |
| `distinct()` | Removes duplicate elements |
| `limit(n)` | Restricts the stream to at most `n` elements |

### 🧪 Example: Chaining Intermediate Operations

```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class IntermediateOpsDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Bob");

        List<String> result = names.stream()
            .filter(name -> name.startsWith("B"))   // Keep names starting with "B"
            .map(String::toUpperCase)                // Convert to uppercase
            .distinct()                              // Remove duplicates
            .sorted()                                // Sort alphabetically
            .collect(Collectors.toList());           // Collect into a list

        System.out.println(result); // [BOB]
    }
}
```

### ⚙️ How it works (step by step)

1. **filter** — From `[Alice, Bob, Charlie, David, Bob]`, keeps only elements starting with "B" → `[Bob, Bob]`
2. **map** — Converts to uppercase → `[BOB, BOB]`
3. **distinct** — Removes duplicates → `[BOB]`
4. **sorted** — Sorts (already sorted with one element) → `[BOB]`
5. **collect** — Terminal operation gathers the result into a `List`

### 💡 Insight

Adding more "B" names to the list (like "Bahram", "Bobby", "Boat") would show the full pipeline in action — all would be filtered, uppercased, deduplicated, and sorted alphabetically.

---

## 🧩 Concept 2: Terminal Operations

### 🧠 What is it?

Terminal operations are the operations that **trigger the execution** of the entire stream pipeline and **produce a result**. Once a terminal operation is called, the pipeline runs from start to finish.

Unlike intermediate operations, terminal operations are **eager** — they execute immediately and consume the stream.

### ❓ Why do we need them?

Without a terminal operation, nothing happens. The intermediate operations just sit there, waiting. The terminal operation is the "go" button.

### ⚙️ Common Terminal Operations

| Operation | What it does | Return type |
|-----------|-------------|-------------|
| `forEach(action)` | Performs an action on each element | `void` |
| `collect(collector)` | Collects elements into a collection | `Collection` |
| `reduce(identity, accumulator)` | Reduces elements to a single result | `T` |
| `count()` | Counts the number of elements | `long` |
| `findFirst()` | Returns the first element | `Optional<T>` |

---

## 🧩 Concept 3: Terminal Operation — `count()`

### 🧪 Example

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Bob");

long count = names.stream()
    .filter(name -> name.startsWith("B"))
    .distinct()
    .count();

System.out.println("Count: " + count); // Count: 1
```

### ⚙️ How it works

The pipeline filters for names starting with "B", removes duplicates, and then `count()` returns the number of remaining elements as a `long`.

---

## 🧩 Concept 4: Terminal Operation — `forEach()`

### 🧪 Example

```java
names.stream()
    .filter(name -> name.startsWith("B"))
    .map(String::toUpperCase)
    .distinct()
    .sorted()
    .forEach(System.out::println);

// Output:
// BOB
```

### 💡 Insight

Notice we're not storing the result in a variable here. `forEach` is a **void** terminal operation — it performs an action (printing) on each element but doesn't return anything. Use it when you want side effects, not a collected result.

You can also use a lambda instead of a method reference:
```java
.forEach(name -> System.out.println("Processed: " + name));
```

---

## 🧩 Concept 5: Terminal Operation — `reduce()`

### 🧠 What is it?

`reduce()` combines all elements of a stream into a **single result** by repeatedly applying an accumulator function.

### 🧪 Example: Concatenating Names

```java
String result = names.stream()
    .filter(name -> name.startsWith("B"))
    .map(String::toUpperCase)
    .distinct()
    .sorted()
    .reduce("", (partial, element) -> partial + " " + element);

System.out.println(result); // " BOB BOBBY BAHRAM"
```

### ⚙️ How it works

1. Start with an **initial value** (empty string `""`)
2. The **accumulator function** takes the partial result and the next element, concatenating them with a space
3. Each element is added to the growing string until all elements are processed

### 💡 Insight

The first argument to `reduce()` is the **identity value** — it's the starting point. If you use `"?"` as the identity, your result will start with `?`. If you use `""`, it starts with an empty string (though you'll get a leading space).

---

## 🧩 Concept 6: Lazy Evaluation in Action

### 🧠 What is it?

Laziness means that intermediate operations **only execute when triggered by a terminal operation**. Better yet, the stream processes only what's necessary.

### 🧪 Example: Proving Laziness with `limit()`

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

names.stream()
    .filter(name -> {
        System.out.println("Filtering: " + name);
        return name.startsWith("A") || name.startsWith("B");
    })
    .limit(2)
    .forEach(System.out::println);
```

**Output:**
```
Filtering: Alice
Alice
Filtering: Bob
Bob
```

### ⚙️ How it works

- The stream starts processing elements one by one
- "Alice" passes the filter → printed → count = 1
- "Bob" passes the filter → printed → count = 2
- `limit(2)` is satisfied — **processing stops immediately**
- "Charlie" and "David" are **never even checked**

### 💡 Insight

This is the magic of lazy evaluation. The stream didn't process the entire list — it stopped as soon as the `limit(2)` condition was met. This makes streams incredibly efficient, especially when working with large datasets. If you have a million elements but only need the first 3 matches, the stream won't waste time processing the rest.

---

## ✅ Key Takeaways

- **Intermediate operations** transform a stream and are **lazy** — they don't execute until a terminal operation is called
- **Terminal operations** trigger the pipeline and are **eager** — they execute immediately
- Common intermediate ops: `filter`, `map`, `sorted`, `distinct`, `limit`
- Common terminal ops: `forEach`, `collect`, `reduce`, `count`, `findFirst`
- **Lazy evaluation** means streams only process what's necessary, making them efficient
- `reduce()` collapses a stream into a single value using an accumulator
- `count()` returns a `long`, not an `int`

---

## ⚠️ Common Mistakes

- **Forgetting the terminal operation** — intermediate operations alone produce nothing
- **Assuming `count()` returns `int`** — it returns `long`
- **Using `forEach` when you need a result** — `forEach` is void; use `collect` to get a collection back
- **Not understanding laziness** — without a terminal operation, your filter/map/sort code never runs

---

## 💡 Pro Tips

- Use `limit()` with `filter()` for early termination on large datasets
- Prefer `collect(Collectors.toList())` over `forEach` when you need to build a result
- Use method references (`System.out::println`, `String::toUpperCase`) for cleaner code
- Chain operations thoughtfully — put `filter` early to reduce the number of elements processed downstream
