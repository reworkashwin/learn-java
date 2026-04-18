# Comparator Interface

## Introduction

`Comparable` lets a class define its **own** natural ordering. But what if you want to sort the same class in **different ways** at different times — by author name now, by page count later? You can't keep changing the `compareTo()` method. This is where `Comparator` provides a more elegant and flexible solution.

---

## Concept 1: Comparable vs Comparator

### 🧠 The key difference

| Aspect | Comparable | Comparator |
|--------|-----------|------------|
| **Where defined** | Inside the class being sorted | In a **separate** class |
| **Method** | `compareTo(T other)` | `compare(T o1, T o2)` |
| **Number of orderings** | One per class | Unlimited — create as many as you want |
| **Modifies original class?** | Yes | No |

`Comparator` follows the principle of **separation of concerns** — the sorting logic is extracted from the data class into its own class.

---

## Concept 2: Creating a Comparator

### 🧪 Example — Sort by number of pages

First, remove the `Comparable` implementation from `Book`. Then create a separate comparator:

```java
public class BookComparator implements Comparator<Book> {

    @Override
    public int compare(Book b1, Book b2) {
        return Integer.compare(b1.getNumberOfPages(), b2.getNumberOfPages());
    }
}
```

### ⚙️ Using the comparator

```java
List<Book> books = new ArrayList<>();
books.add(new Book("Albert Camus", "Title One", 223));
books.add(new Book("Heidegger", "Being and Time", 891));
books.add(new Book("Michio Kaku", "Quantum Physics", 34));

Collections.sort(books, new BookComparator());
```

The second argument to `Collections.sort()` is the comparator that defines the sorting strategy.

**Output:** `34, 223, 891` — sorted by page count ascending.

---

## Concept 3: Reversing the Order

### ⚙️ Using `.reversed()`

Instead of manually flipping the comparison logic, call `.reversed()` on the comparator:

```java
Collections.sort(books, new BookComparator().reversed());
```

**Output:** `891, 223, 34` — descending order.

This is much more **consistent and readable** than manually negating values or swapping arguments inside `compare()`.

---

## Concept 4: Sorting by Different Fields

### 🧪 Sort by author name

Simply change what you compare inside the comparator:

```java
public class BookComparator implements Comparator<Book> {

    @Override
    public int compare(Book b1, Book b2) {
        return b1.getAuthorName().compareTo(b2.getAuthorName());
    }
}
```

**Output:** `Albert Camus, Heidegger, Michio Kaku` — alphabetical by author.

### 💡 Multiple comparators

You can create **as many comparators as you need**:

```java
class PageCountComparator implements Comparator<Book> { ... }
class AuthorNameComparator implements Comparator<Book> { ... }
class TitleLengthComparator implements Comparator<Book> { ... }
```

Each one encapsulates a different sorting strategy. Just pass the appropriate one to `Collections.sort()`.

---

## Concept 5: Why Comparator is Preferred

### 🧠 Separation of concerns

With `Comparable`, you're mixing **data** (author, title, pages) and **behavior** (how to sort) in the same class. With `Comparator`, the sorting logic lives in its own class.

Benefits:
- **Open/Closed Principle** — you can add new sorting strategies without modifying the `Book` class
- **Flexibility** — create multiple comparators for different contexts
- **Reusability** — comparators can be shared across different parts of your application

---

## ✅ Key Takeaways

- `Comparator` is an interface with a `compare(T o1, T o2)` method
- It defines sorting logic **outside** the class being sorted
- You can create **multiple** comparators for the same class
- Pass the comparator as the second argument to `Collections.sort(list, comparator)`
- Use `.reversed()` for descending order — much cleaner than manual negation

## ⚠️ Common Mistakes

- Saying "comparator **class**" — `Comparator` is an **interface**, not a class
- Modifying the original class to add sorting logic when a comparator would be more appropriate
- Implementing both `Comparable` and `Comparator` for the same field — pick one approach

## 💡 Pro Tips

- Prefer `Comparator` over `Comparable` when a class might need to be sorted in multiple ways
- In modern Java, you can use lambda expressions instead of separate classes: `Collections.sort(books, (b1, b2) -> Integer.compare(b1.getPages(), b2.getPages()))`
- Or even simpler: `books.sort(Comparator.comparingInt(Book::getNumberOfPages))`
