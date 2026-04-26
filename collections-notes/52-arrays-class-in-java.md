# 📘 Arrays Class in Java

## 📌 Introduction

Arrays are at the core of almost every Java program. They're the most basic form of collection — simple, fast, and indexed for direct access. But working with arrays isn't just about storing elements. You need to sort them, search through them, fill them, copy them, and convert them to other data structures.

This is where the `java.util.Arrays` class comes in. It's a utility class packed with static methods that make array manipulation a breeze. In this lesson, we'll explore sorting, searching, filling, and — perhaps most practically — how to convert between arrays and collections.

---

## 🧩 Concept 1: Sorting Arrays with `Arrays.sort()`

### 🧠 What is it?

`Arrays.sort()` sorts an array in ascending order. It works on all primitive types (`int`, `double`, `char`, etc.) and objects.

### ❓ Why do we need it?

Writing your own sorting algorithm is error-prone and almost certainly slower than Java's built-in implementation. Java uses **Dual-Pivot Quicksort** (for primitives) — an algorithm that offers O(n log n) performance and is typically faster than traditional quicksort.

### ⚙️ How it works

```java
Arrays.sort(array);
```

That's it. One line. The array is sorted in-place.

### 🧪 Example — Sorting Primitives

```java
int[] numbers = {5, 2, 8, 1, 3, 9};

Arrays.sort(numbers);

for (int n : numbers) {
    System.out.print(n + ", ");
}
// Output: 1, 2, 3, 5, 8, 9,
```

### 🧪 Example — Sorting Objects with Comparator

Java doesn't just sort primitive types. You can sort arrays of objects using a `Comparator`:

```java
class Employee {
    String name;
    double salary;

    Employee(String name, double salary) {
        this.name = name;
        this.salary = salary;
    }

    @Override
    public String toString() {
        return "Employee{name=" + name + ", salary=" + salary + "}";
    }

    // Getters
    String getName() { return name; }
    double getSalary() { return salary; }
}
```

Sort by salary:

```java
Employee[] employees = {
    new Employee("John", 50000),
    new Employee("Jane", 60000),
    new Employee("Jack", 40000)
};

Arrays.sort(employees, Comparator.comparing(Employee::getSalary));

for (Employee e : employees) {
    System.out.println(e);
}
// Jack - 40000, John - 50000, Jane - 60000
```

Sort by name instead? Just swap the method reference:

```java
Arrays.sort(employees, Comparator.comparing(Employee::getName));
// Alice, John, Martin (alphabetical)
```

### 💡 Insight

One line of code sorts complex objects by any field of your choice. That's the power of combining `Arrays.sort()` with `Comparator.comparing()`. No need to implement `Comparable` on the class itself if you use comparators.

---

## 🧩 Concept 2: Searching Arrays with `Arrays.binarySearch()`

### 🧠 What is it?

`Arrays.binarySearch()` performs a binary search on a **sorted** array. It returns the index of the target element if found, or a negative value if not found.

### ❓ Why do we need it?

Binary search is O(log n) — dramatically faster than scanning every element. For an array of 1 million elements, that's ~20 comparisons instead of 1 million.

### ⚙️ How it works

```java
int index = Arrays.binarySearch(array, target);
```

**Prerequisite:** The array **must be sorted** before calling this method. If it's not sorted, the result is undefined.

### 🧪 Example

```java
int[] numbers = {1, 2, 3, 5, 8, 9};  // Already sorted
int target = 5;

int index = Arrays.binarySearch(numbers, target);

if (index >= 0) {
    System.out.println("Element found at index: " + index); // Index: 3
} else {
    System.out.println("Element not found");
}
```

If the target doesn't exist:

```java
int index = Arrays.binarySearch(numbers, 67);
// Returns a negative value → element not found
```

### 💡 Insight

The negative return value isn't random — it encodes the **insertion point**. If the return value is `-6`, the element would be inserted at index `5` to maintain sorted order. The formula: `insertionPoint = -(returnValue) - 1`.

---

## 🧩 Concept 3: Filling Arrays with `Arrays.fill()`

### 🧠 What is it?

`Arrays.fill()` sets every element in an array to a specified value. It's the array equivalent of `Collections.fill()`.

### ⚙️ How it works

```java
int[] nums = new int[10];
Arrays.fill(nums, 7);
```

### 🧪 Example

```java
int[] nums = new int[10];
Arrays.fill(nums, 7);

for (int n : nums) {
    System.out.print(n + ", ");
}
// Output: 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
```

All 10 elements are now `7`. No loops needed.

### 💡 Insight

`Arrays.fill()` is great for initializing arrays with a default value. Common use cases include filling boolean arrays with `true`, initializing distance arrays with `Integer.MAX_VALUE` for graph algorithms, or resetting an array between test runs.

---

## 🧩 Concept 4: Converting Arrays to Collections

### 🧠 What is it?

`Arrays.asList()` converts an array into a `List`. This bridges the gap between arrays (fixed-size, fast access) and collections (flexible, feature-rich).

### ❓ Why do we need it?

In real-world applications, APIs and libraries often expect `List` or `Collection` types, not raw arrays. You need a quick way to convert.

### ⚙️ How it works

```java
String[] names = {"Alice", "Bob", "Charlie"};
List<String> nameList = Arrays.asList(names);
```

### ⚠️ The Fixed-Size Caveat

The list returned by `Arrays.asList()` is **fixed-size**. It's a wrapper around the original array — you can't add or remove elements:

```java
List<String> nameList = Arrays.asList("Alice", "Bob", "Charlie");
nameList.add("Jack"); // 💥 UnsupportedOperationException!
```

### 🧪 Solution — Create a Modifiable List

Wrap the result in a new `ArrayList`:

```java
List<String> modifiableList = new ArrayList<>(Arrays.asList("Alice", "Bob", "Charlie"));
modifiableList.add("Jack"); // ✅ Works!
System.out.println(modifiableList); // [Alice, Bob, Charlie, Jack]
```

### 💡 Insight

`Arrays.asList()` is fine for read-only or fixed-size usage. But if you need to modify the list (add/remove elements), **always wrap it** in `new ArrayList<>()`. This is one of the most common pitfalls for Java beginners.

---

## 🧩 Concept 5: Converting Collections to Arrays

### 🧠 What is it?

The `toArray()` method on any `Collection` converts it back into an array. This is the reverse of `Arrays.asList()`.

### ❓ Why do we need it?

Sometimes you have data in a `List` or `Set`, but an API or library requires a plain array. `toArray()` handles this conversion.

### ⚙️ How it works

```java
List<String> list = new ArrayList<>(Arrays.asList("Alice", "Bob", "Charlie"));
String[] array = list.toArray(new String[0]);
```

Pass `new String[0]` (or `new Type[0]`) as the argument — Java will create an array of the correct size automatically.

### 🧪 Example

```java
List<String> modifiableList = new ArrayList<>(Arrays.asList("Alice", "Bob", "Charlie"));
modifiableList.add("Jack");

String[] namesArray = modifiableList.toArray(new String[0]);

for (String name : namesArray) {
    System.out.println(name);
}
// Alice, Bob, Charlie, Jack
```

### 💡 Insight

Passing `new String[0]` might look wasteful (creating a zero-length array), but modern JVMs optimize this pattern. It's actually the recommended approach — cleaner than `new String[list.size()]` and performs just as well.

---

## 🧩 Concept 6: Arrays vs Collections — Performance Trade-offs

### 🧠 When to use arrays vs collections?

| Feature | Arrays | Collections (ArrayList, etc.) |
|---------|--------|------------------------------|
| **Access speed** | O(1) — direct index access | O(1) for ArrayList |
| **Memory** | Less overhead | More overhead (object wrappers) |
| **Size** | Fixed — can't grow or shrink | Dynamic — grows automatically |
| **Flexibility** | Limited | Rich API (sort, search, stream) |
| **Type support** | Primitives + Objects | Objects only (autoboxing for primitives) |

### 💡 Insight

Even `ArrayList` is backed by an array internally. So when you master arrays, you're already understanding the foundation of many Java data structures. Choose arrays when you need raw performance and know the size upfront. Choose collections when you need flexibility.

---

## ✅ Key Takeaways

- `Arrays.sort()` uses Dual-Pivot Quicksort with O(n log n) performance
- `Arrays.binarySearch()` requires a sorted array and returns the index or a negative value
- `Arrays.fill()` sets every element to a specified value in one call
- `Arrays.asList()` converts an array to a **fixed-size** list — wrap in `new ArrayList<>()` for mutability
- `collection.toArray(new Type[0])` converts a collection back to an array
- Arrays are faster and leaner; collections are more flexible — choose based on your needs

## ⚠️ Common Mistakes

- Using `Arrays.binarySearch()` on an unsorted array — results are unpredictable
- Trying to add/remove elements from a list created by `Arrays.asList()` — it's fixed-size
- Confusing `Arrays` (utility class for arrays) with `Collections` (utility class for collections)
- Forgetting that arrays are fixed-size — you can't resize them after creation

## 💡 Pro Tips

- Explore the `Arrays` class source code (Ctrl+click in your IDE) — there are many more methods like `copyOfRange()`, `equals()`, `deepEquals()`, `hashCode()`, and `indexOf()`
- Use `Arrays.stream(array)` to get a `Stream` from an array for functional-style processing
- For sorting objects, `Comparator.comparing()` with method references is the cleanest approach
- When performance is critical and size is known, prefer arrays over collections
