# Streams with Custom Objects — Part 1

## Introduction

So far we've used streams with simple types like strings and integers. But the real power of streams shines when you work with **custom objects**. In this lecture, we define a `Book` class and explore how to filter, sort, map, and collect using streams — turning complex data processing into clean, readable pipelines.

---

## Concept 1: Setting Up the Data Model

### 🧠 The `Type` enum

```java
public enum Type {
    NOVEL, FICTION, HISTORY, THRILLER, PHILOSOPHY
}
```

### 🧠 The `Book` class

```java
public class Book {
    private String author;
    private String title;
    private int pages;
    private Type type;

    public Book(String author, String title, int pages, Type type) {
        this.author = author;
        this.title = title;
        this.pages = pages;
        this.type = type;
    }

    // Getters, setters, and toString() generated
}
```

### 🧪 Sample data

```java
List<Book> books = new ArrayList<>();
books.add(new Book("Heidegger", "Being and Time", 562, Type.PHILOSOPHY));
books.add(new Book("Kafka", "The Trial", 240, Type.NOVEL));
books.add(new Book("Agatha Christie", "Death on the Nile", 400, Type.THRILLER));
books.add(new Book("Various", "Ancient Greece", 600, Type.HISTORY));
books.add(new Book("Various", "Ancient Rome", 700, Type.HISTORY));
books.add(new Book("Hermann Broch", "Death of Virgil", 590, Type.NOVEL));
books.add(new Book("Albert Camus", "The Stranger", 560, Type.NOVEL));
```

---

## Concept 2: Filtering Custom Objects

### ⚙️ How to filter

Use `filter()` with a lambda that accesses the object's properties:

```java
List<Book> novels = books.stream()
    .filter(b -> b.getType() == Type.NOVEL)
    .collect(Collectors.toList());
```

This keeps only books where the type is `NOVEL`. The result is a new `List<Book>` containing:
- The Trial
- Death of Virgil
- The Stranger

### 💡 Insight

The lambda `b -> b.getType() == Type.NOVEL` is a **predicate** — it receives a `Book` and returns `true` or `false`. Only books that return `true` make it through.

---

## Concept 3: Sorting Custom Objects

### ⚙️ Sorting by a specific field

Use `sorted()` with `Comparator.comparing()` and a method reference:

```java
books.stream()
    .filter(b -> b.getType() == Type.NOVEL)
    .sorted(Comparator.comparing(Book::getAuthor))
    .forEach(System.out::println);
```

This filters for novels, then sorts them by author name alphabetically.

You can sort by any field:

```java
// Sort by title
.sorted(Comparator.comparing(Book::getTitle))

// Sort by number of pages
.sorted(Comparator.comparing(Book::getPages))
```

### 💡 Insight

`Comparator.comparing()` takes a **key extractor** function — it tells Java which field to use for comparison. Method references like `Book::getTitle` make this clean and readable.

---

## Concept 4: The `map()` Operation — Transforming Types

### 🧠 What is `map()`?

The `map()` method applies a function to each element and **transforms** it into a different type. This is one of the most powerful stream operations.

### ❓ Why use it?

Sometimes you don't want the full object — you just want one field. For example, instead of a `List<Book>`, you want a `List<String>` of just the titles.

### 🧪 Example — Extracting titles

```java
List<String> titles = books.stream()
    .filter(b -> b.getType() == Type.NOVEL)
    .sorted(Comparator.comparing(Book::getPages))
    .map(Book::getTitle)
    .collect(Collectors.toList());
```

**What happens step by step:**

1. `Stream<Book>` — all books
2. `filter` → `Stream<Book>` — only novels
3. `sorted` → `Stream<Book>` — novels sorted by pages
4. `map` → `Stream<String>` — only the titles (type changed!)
5. `collect` → `List<String>` — final result

### ⚙️ Extracting authors instead

```java
List<String> authors = books.stream()
    .filter(b -> b.getType() == Type.NOVEL)
    .map(Book::getAuthor)
    .collect(Collectors.toList());
```

### 💡 Insight

`map()` **changes the type** of the stream. Before `map()`, you have `Stream<Book>`. After `map(Book::getTitle)`, you have `Stream<String>`. This is what makes `map()` so powerful — it lets you extract, transform, and reshape data.

---

## Concept 5: Chaining It All Together

### 🧪 Complete pipeline

```java
books.stream()
    .filter(b -> b.getType() == Type.NOVEL)        // Keep novels
    .sorted(Comparator.comparing(Book::getPages))   // Sort by pages
    .map(Book::getTitle)                             // Extract titles
    .forEach(System.out::println);                   // Print each
```

This reads like English: *"From all books, keep the novels, sort them by page count, get their titles, and print each one."*

---

## ✅ Key Takeaways

- Streams work seamlessly with custom objects — use lambdas and method references to access fields
- `filter()` selects elements based on a condition (predicate)
- `sorted(Comparator.comparing(...))` sorts by any field using a method reference
- `map()` transforms elements — it can change the stream's type (e.g., `Stream<Book>` → `Stream<String>`)
- `collect(Collectors.toList())` gathers results into a `List`

## ⚠️ Common Mistakes

- Using `==` to compare strings in filters — use `.equals()` for string comparison (but `==` is fine for enums)
- Forgetting that `map()` changes the stream type — operations after `map()` work on the new type
- Putting `collect()` before all intermediate operations — `collect()` is terminal; nothing can come after it

## 💡 Pro Tips

- `Comparator.comparing()` with method references is the cleanest way to sort custom objects
- You can chain `sorted()` with `.reversed()` for descending order: `Comparator.comparing(Book::getPages).reversed()`
- Use `map()` whenever you need to extract a single property or transform objects into a different shape
