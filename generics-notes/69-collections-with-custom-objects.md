# Collections with Custom Objects

## Introduction

The `Collections` utility class offers a treasure trove of static methods — sorting, searching, shuffling, finding min/max, and more. So far we've used these with simple types like `String` and `Integer`. But real applications work with **custom objects** — employees, products, students. Let's explore how to leverage `Collections` methods effectively with your own classes.

---

## Concept 1: The Collections Utility Class

### 🧠 What is it?

`java.util.Collections` is a utility class (all static methods) that operates on or returns collections. Think of it as a Swiss army knife for collection manipulation.

### ⚙️ Key methods

```java
Collections.sort(list);           // Sort in natural order
Collections.sort(list, comp);     // Sort with comparator
Collections.reverse(list);        // Reverse the order
Collections.shuffle(list);        // Random shuffle
Collections.min(collection);      // Find minimum element
Collections.max(collection);      // Find maximum element
Collections.frequency(coll, obj); // Count occurrences
Collections.binarySearch(list, key); // Binary search (list must be sorted)
Collections.unmodifiableList(list);  // Read-only wrapper
Collections.swap(list, i, j);       // Swap two elements
```

---

## Concept 2: Min and Max with Custom Objects

### 🧠 What is it?

`Collections.min()` and `Collections.max()` find the smallest and largest elements. For this to work with custom objects, they need to be comparable.

### ⚙️ How it works

```java
public class Product implements Comparable<Product> {
    private String name;
    private double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public int compareTo(Product other) {
        return Double.compare(this.price, other.price);
    }

    @Override
    public String toString() {
        return name + " ($" + price + ")";
    }

    // getters...
}
```

```java
List<Product> products = List.of(
    new Product("Laptop", 999.99),
    new Product("Mouse", 29.99),
    new Product("Keyboard", 79.99)
);

Product cheapest = Collections.min(products);
Product costliest = Collections.max(products);

System.out.println("Cheapest: " + cheapest);   // Mouse ($29.99)
System.out.println("Costliest: " + costliest); // Laptop ($999.99)
```

You can also pass a `Comparator` to find min/max by a different criterion:

```java
// Find product with longest name
Product longestName = Collections.max(products, 
    Comparator.comparingInt(p -> p.getName().length()));
System.out.println(longestName);  // Keyboard ($79.99)
```

---

## Concept 3: Binary Search with Custom Objects

### 🧠 What is it?

`Collections.binarySearch()` performs a fast O(log n) search on a **sorted** list. It returns the index of the element if found, or a negative value indicating where it would be inserted.

### ❓ Why do we need it?

Linear search is O(n). If your list is already sorted, binary search is much faster — especially for large datasets.

### ⚙️ How it works

```java
List<Product> products = new ArrayList<>(List.of(
    new Product("Mouse", 29.99),
    new Product("Keyboard", 79.99),
    new Product("Laptop", 999.99)
));

// List must be sorted by the same criteria used for searching
Collections.sort(products);

// Search for a product by price
Product searchKey = new Product("", 79.99);
int index = Collections.binarySearch(products, searchKey);
System.out.println("Found at index: " + index);  // 1
```

### ⚠️ Common Mistake

The list **must** be sorted before calling `binarySearch()`. If it's not sorted, the result is undefined — you'll get wrong answers without any error or exception.

---

## Concept 4: Frequency, Shuffle, and Swap

### 🧠 What is it?

These utility methods handle common collection operations that would otherwise require manual loops.

### ⚙️ How it works

```java
List<String> colors = new ArrayList<>(
    List.of("Red", "Blue", "Red", "Green", "Blue", "Red")
);

// Count occurrences
int redCount = Collections.frequency(colors, "Red");
System.out.println("Red appears: " + redCount + " times");  // 3

// Shuffle — randomize order
Collections.shuffle(colors);
System.out.println("Shuffled: " + colors);  // random order each time

// Swap two elements
Collections.swap(colors, 0, colors.size() - 1);
System.out.println("After swap: " + colors);

// Reverse
Collections.reverse(colors);
System.out.println("Reversed: " + colors);
```

### 🧪 Real-World Example

Building a card game? `Collections.shuffle(deck)` randomizes the deck. Need to count how many aces? `Collections.frequency(hand, ace)`. Shuffling a quiz question order? Same idea.

---

## Concept 5: Unmodifiable and Synchronized Collections

### 🧠 What is it?

`Collections` provides wrapper methods that add constraints to existing collections — making them read-only or thread-safe.

### ⚙️ How it works

```java
List<Product> products = new ArrayList<>();
products.add(new Product("Laptop", 999.99));
products.add(new Product("Mouse", 29.99));

// Unmodifiable — any modification throws UnsupportedOperationException
List<Product> readOnly = Collections.unmodifiableList(products);
// readOnly.add(new Product("Keyboard", 79.99));  // throws exception!

// Synchronized — thread-safe wrapper
List<Product> syncList = Collections.synchronizedList(products);
```

### ⚠️ Common Mistake

`Collections.unmodifiableList()` creates a **view** — not a copy. If you modify the original list, the "unmodifiable" view reflects those changes:

```java
products.add(new Product("Keyboard", 79.99));
System.out.println(readOnly.size());  // 3 — it changed!
```

To create a truly immutable copy, use `List.copyOf(products)` (Java 10+) or `Collections.unmodifiableList(new ArrayList<>(products))`.

---

## ✅ Key Takeaways

- `Collections` provides powerful static utility methods for lists and collections
- `min()` / `max()` work with `Comparable` objects or accept a `Comparator`
- `binarySearch()` is O(log n) but **requires a pre-sorted list**
- `frequency()`, `shuffle()`, `swap()`, `reverse()` eliminate common boilerplate
- `unmodifiableList()` creates a read-only **view** — not an independent copy
- For custom objects: implement `Comparable` or pass a `Comparator` to these methods
