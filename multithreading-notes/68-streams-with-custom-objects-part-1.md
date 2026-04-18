# Streams with Custom Objects — Part 1

## Introduction

So far we've used streams with primitive numbers and strings. The real power of streams shines when working with **custom objects** — filtering, sorting by any field, and transforming results. Let's build a dataset of books and explore what streams can do.

---

## Setting Up the Data Model

### The Book class

```java
public class Book {
    private String author;
    private String title;
    private int pages;
    private Type type;

    // constructor, getters, setters, toString
}
```

### The Type enum

```java
public enum Type {
    NOVEL, FICTION, HISTORY, THRILLER, PHILOSOPHY
}
```

### The dataset

```java
List<Book> books = new ArrayList<>();
books.add(new Book("Heidegger", "Being and Time", 560, Type.PHILOSOPHY));
books.add(new Book("Franz Kafka", "The Trial", 240, Type.NOVEL));
books.add(new Book("Agatha Christie", "Death on the Nile", 320, Type.THRILLER));
books.add(new Book("Author", "Ancient Greece", 670, Type.HISTORY));
books.add(new Book("Author", "Ancient Rome", 860, Type.HISTORY));
books.add(new Book("Hermann Broch", "Death of Virgil", 590, Type.NOVEL));
books.add(new Book("Albert Camus", "The Stranger", 520, Type.NOVEL));
```

---

## Converting a List to a Stream

```java
books.stream().forEach(System.out::println);
```

Unlike arrays (which use `Arrays.stream()`), collections have a built-in `.stream()` method.

---

## Filtering Custom Objects

### 🧠 What is it?

`filter()` works the same way with custom objects — you provide a predicate that accesses the object's fields.

### 🧪 Finding all novels

```java
List<Book> novels = books.stream()
    .filter(b -> b.getType() == Type.NOVEL)
    .collect(Collectors.toList());
```

**Step-by-step:**
1. Convert `books` list to a stream
2. For each book `b`, check if its type equals `NOVEL`
3. Collect matching books into a new list

Result: The Trial, Death of Virgil, The Stranger

---

## Sorting Custom Objects

### ⚙️ Sorting by a specific field

Unlike strings or numbers, custom objects need you to **specify which field to sort by**:

```java
books.stream()
    .filter(b -> b.getType() == Type.NOVEL)
    .sorted(Comparator.comparing(Book::getAuthor))
    .forEach(System.out::println);
```

`Comparator.comparing(Book::getAuthor)` tells Java to extract the author string from each book and sort by that.

### 🧪 Sort by different fields

```java
// Sort by title
.sorted(Comparator.comparing(Book::getTitle))

// Sort by number of pages
.sorted(Comparator.comparing(Book::getPages))
```

The same pattern works for any field — pass a method reference to `Comparator.comparing()`.

---

## Transforming with map()

### 🧠 What is it?

`map()` transforms each element in the stream. Crucially, it can **change the type** of the stream.

### ❓ Why do we need it?

Sometimes you want a list of authors (strings) instead of a list of books (objects). `map()` extracts and transforms.

### 🧪 Getting just book titles

```java
List<String> titles = books.stream()
    .filter(b -> b.getType() == Type.NOVEL)
    .sorted(Comparator.comparing(Book::getPages))
    .map(Book::getTitle)
    .collect(Collectors.toList());
```

**What happens:**
1. Start with `Stream<Book>`
2. `filter()` → still `Stream<Book>` (only novels)
3. `sorted()` → still `Stream<Book>` (sorted by pages)
4. `map(Book::getTitle)` → now `Stream<String>` ← **type changes here**
5. `collect()` → `List<String>`

### 💡 Insight

The `map()` operation is the key to type transformation. Before `map()`, you're working with books. After `map(Book::getTitle)`, you're working with strings. The return type of your pipeline changes accordingly.

---

## The Collect Terminal Operation

### 🧠 What is it?

`collect(Collectors.toList())` is a terminal operation that gathers all stream elements into a `List`. It's the most common way to "materialize" a stream back into a collection.

```java
// Stream → List
.collect(Collectors.toList())
```

---

## Putting It All Together

```java
// Get titles of novels, sorted by page count
List<String> novelTitles = books.stream()
    .filter(b -> b.getType() == Type.NOVEL)     // keep novels
    .sorted(Comparator.comparing(Book::getPages)) // sort by pages
    .map(Book::getTitle)                          // extract titles
    .collect(Collectors.toList());                // collect into list
```

This single pipeline replaces what would be multiple loops, conditionals, and list operations in traditional code.

---

## ✅ Key Takeaways

- Collections have a built-in `.stream()` method
- `filter()` with lambda predicates works on any object field
- `Comparator.comparing(Book::getField)` lets you sort by any field
- `map()` transforms elements and can **change the stream's type** (e.g., `Stream<Book>` → `Stream<String>`)
- `collect(Collectors.toList())` materializes a stream into a list

## ⚠️ Common Mistake

- Forgetting to use `Comparator.comparing()` when sorting custom objects — `sorted()` alone won't work unless the class implements `Comparable`
- Confusing `filter()` (keeps/removes elements) with `map()` (transforms elements)

## 💡 Pro Tip

Method references like `Book::getTitle` are cleaner than `b -> b.getTitle()`. Use them whenever the lambda simply calls a single method.
