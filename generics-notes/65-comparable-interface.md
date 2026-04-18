# Comparable Interface

## Introduction

Sorting integers and strings is easy — Java already knows how to compare them. But what about **custom objects**? If you have a `Book` class with author, title, and page count, how does Java know which book comes "first"? It doesn't — **you** have to tell it. That's what the `Comparable` interface is for.

---

## Concept 1: The Problem

### ❓ Why can't we just sort custom objects?

```java
public class Book {
    private String authorName;
    private String title;
    private int numberOfPages;
    // constructor, getters, setters, toString...
}
```

```java
List<Book> books = new ArrayList<>();
books.add(new Book("Albert Camus", "Title One", 223));
books.add(new Book("Heidegger", "Being and Time", 891));
books.add(new Book("Michio Kaku", "Quantum Physics", 34));

Collections.sort(books);  // ❌ Compile error!
```

Java doesn't know **what to compare** — should it sort by author name? By title? By page count? You must define the comparison logic explicitly.

---

## Concept 2: The Comparable Interface

### 🧠 What is it?

`Comparable<T>` is an interface with a single method:

```java
int compareTo(T other);
```

By implementing this interface on your class, you define the **natural ordering** of your objects.

### ⚙️ How `compareTo()` works

The return value tells Java the relative order:

| Return Value | Meaning |
|-------------|---------|
| **Negative** (e.g., -1) | `this` comes **before** `other` |
| **Zero** (0) | `this` and `other` are **equal** |
| **Positive** (e.g., +1) | `this` comes **after** `other` |

---

## Concept 3: Implementing Comparable

### 🧪 Sort by author name

```java
public class Book implements Comparable<Book> {
    private String authorName;
    private String title;
    private int numberOfPages;

    @Override
    public int compareTo(Book other) {
        return this.authorName.compareTo(other.getAuthorName());
    }
}
```

Now `Collections.sort(books)` works — it sorts books alphabetically by author name.

### 🧪 Sort by title

Just change the `compareTo()` method:

```java
@Override
public int compareTo(Book other) {
    return this.title.compareTo(other.getTitle());
}
```

### 🧪 Sort by number of pages (ascending)

```java
@Override
public int compareTo(Book other) {
    return Integer.compare(this.numberOfPages, other.getNumberOfPages());
}
```

**Output:** `34, 223, 891` — ascending order by page count.

---

## Concept 4: Descending Order

### ⚠️ The wrong way

You might be tempted to negate the result:

```java
return -Integer.compare(this.numberOfPages, other.getNumberOfPages());
```

This works **most of the time** but is **not consistent** — it can fail in edge cases with integer overflow.

### ✅ The correct way

Use explicit conditional logic:

```java
@Override
public int compareTo(Book other) {
    if (this.numberOfPages > other.getNumberOfPages()) return -1;
    if (this.numberOfPages == other.getNumberOfPages()) return 0;
    return 1;
}
```

Or simply **swap the arguments**:

```java
return Integer.compare(other.getNumberOfPages(), this.numberOfPages);
```

---

## ✅ Key Takeaways

- `Comparable<T>` defines the **natural ordering** of a class
- Implement `compareTo()` to tell Java how to compare two instances
- Return negative → `this` first; zero → equal; positive → `other` first
- For strings, delegate to `String.compareTo()`
- For numbers, use `Integer.compare()` (safer than manual subtraction)
- A class can only have **one** natural ordering via `Comparable`

## ⚠️ Common Mistakes

- Negating the result for reverse order — can cause overflow issues with `Integer.MIN_VALUE`
- Using subtraction (`this.pages - other.pages`) instead of `Integer.compare()` — subtraction can overflow for large values
- Forgetting that `Comparable` defines **one** ordering — if you need multiple sort criteria, use `Comparator`

## 💡 Pro Tips

- `Comparable` should be used for the **most natural** ordering of a class (e.g., strings by alphabetical order, dates by chronology)
- Most Java built-in types already implement `Comparable` — `String`, `Integer`, `Double`, `LocalDate`, etc.
- If you need to sort the same class by different fields at different times, use `Comparator` instead (covered in the next note)
