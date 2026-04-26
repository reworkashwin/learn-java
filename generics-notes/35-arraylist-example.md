# ArrayList Example

## Introduction

`ArrayList` is the **most commonly used collection** in Java. If you need a resizable, ordered list of elements with fast random access, `ArrayList` is your go-to. Let's walk through how it works, its key operations, and when to use it.

---

## Concept 1: What Is an ArrayList?

### 🧠 What is it?

`ArrayList` is a **resizable array** implementation of the `List` interface. Unlike a regular array, it can grow and shrink dynamically as you add or remove elements.

### ❓ How is it different from a plain array?

| Feature | Array | ArrayList |
|---------|-------|-----------|
| Size | Fixed at creation | Grows automatically |
| Type | Can hold primitives | Reference types only (uses generics) |
| Syntax | `int[] arr = new int[10]` | `List<Integer> list = new ArrayList<>()` |
| Methods | None (just `length`) | `add()`, `remove()`, `get()`, `contains()`, etc. |

### 💡 Insight

Under the hood, `ArrayList` uses a plain array. When the array fills up, `ArrayList` creates a **new, larger array** (typically 1.5x the size) and copies the elements over. This is called **dynamic resizing**.

---

## Concept 2: Creating and Populating an ArrayList

### ⚙️ How it works

```java
import java.util.ArrayList;
import java.util.List;

// Create an ArrayList
List<String> names = new ArrayList<>();

// Add elements
names.add("Alice");
names.add("Bob");
names.add("Charlie");

System.out.println(names); // [Alice, Bob, Charlie]
```

You can also add at a **specific index**:

```java
names.add(1, "Diana"); // insert at index 1
System.out.println(names); // [Alice, Diana, Bob, Charlie]
```

And initialize with values:

```java
List<String> fruits = new ArrayList<>(List.of("Apple", "Banana", "Cherry"));
```

---

## Concept 3: Accessing and Searching

### ⚙️ How it works

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));

// Access by index — O(1)
String first = names.get(0);        // "Alice"
String last = names.get(names.size() - 1); // "Charlie"

// Check if element exists — O(n)
boolean hasAlice = names.contains("Alice"); // true

// Find index of element — O(n)
int index = names.indexOf("Bob");           // 1

// Size
int size = names.size();                    // 3

// Check if empty
boolean empty = names.isEmpty();            // false
```

### 💡 Insight

`get(index)` is O(1) — that's the power of array-backed storage. But `contains()` and `indexOf()` are O(n) because they scan the entire list.

---

## Concept 4: Modifying and Removing

### ⚙️ How it works

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));

// Update by index
names.set(1, "Barbara");
System.out.println(names); // [Alice, Barbara, Charlie]

// Remove by index
names.remove(0);
System.out.println(names); // [Barbara, Charlie]

// Remove by value (first occurrence)
names.remove("Charlie");
System.out.println(names); // [Barbara]

// Clear all elements
names.clear();
System.out.println(names); // []
```

### ⚠️ Watch out — remove with integers

```java
List<Integer> numbers = new ArrayList<>(List.of(10, 20, 30));

numbers.remove(1);          // removes INDEX 1 → removes 20
numbers.remove(Integer.valueOf(10)); // removes VALUE 10
```

When the list holds `Integer`, `remove(int)` removes by **index**, while `remove(Integer)` removes by **value**. This is a classic gotcha.

---

## Concept 5: Iterating Over an ArrayList

### ⚙️ Multiple ways to iterate

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));

// 1. Enhanced for loop (most common)
for (String name : names) {
    System.out.println(name);
}

// 2. Traditional for loop (when you need the index)
for (int i = 0; i < names.size(); i++) {
    System.out.println(i + ": " + names.get(i));
}

// 3. forEach with lambda
names.forEach(name -> System.out.println(name));

// 4. Iterator (when you need to remove during iteration)
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    String name = it.next();
    if (name.startsWith("A")) {
        it.remove();  // safe removal during iteration
    }
}
```

### ⚠️ Never modify a list while iterating with a for-each loop

```java
for (String name : names) {
    names.remove(name);  // ❌ ConcurrentModificationException!
}
```

Why does this happen? The for-each loop is syntactic sugar for an `Iterator`. Internally, `ArrayList` maintains a `modCount` (modification counter) that increments on every structural change (`add`, `remove`, `clear`). When you call `names.remove()` directly, `modCount` increases — but the iterator doesn't know. On its next `hasNext()`/`next()` call, it compares its saved `expectedModCount` against the list's current `modCount`, detects the mismatch, and throws `ConcurrentModificationException`.

Use an `Iterator` or `removeIf()` instead:

```java
names.removeIf(name -> name.startsWith("A")); // ✅ safe
```

Why are these safe? `Iterator.remove()` updates **both** the list's `modCount` and the iterator's `expectedModCount`, keeping them in sync. `removeIf()` handles iteration internally, so there's no external iterator to get out of sync.

---

## Concept 6: Sorting and Other Operations

### ⚙️ How it works

```java
List<Integer> numbers = new ArrayList<>(List.of(5, 2, 8, 1, 9));

// Sort
Collections.sort(numbers);
System.out.println(numbers); // [1, 2, 5, 8, 9]

// Or using List.sort()
numbers.sort(Comparator.reverseOrder());
System.out.println(numbers); // [9, 8, 5, 2, 1]

// Convert to array
Integer[] array = numbers.toArray(new Integer[0]);

// Sublist (view, not a copy)
List<Integer> sub = numbers.subList(1, 3); // [8, 5]
```

---

## ✅ Key Takeaways

- `ArrayList` is a resizable array — dynamic size, fast random access O(1)
- Adding/removing at the **end** is O(1) amortized; at the **beginning/middle** is O(n)
- Use `List.of()` for immutable lists, `new ArrayList<>(List.of(...))` for mutable ones
- Always use `Iterator.remove()` or `removeIf()` to remove elements during iteration
- Most common collection in Java — use it as your default choice for ordered data

## ⚠️ Common Mistakes

- Removing elements during a for-each loop → `ConcurrentModificationException`
- Confusing `remove(int index)` with `remove(Object value)` for `List<Integer>`
- Forgetting that `ArrayList` is NOT thread-safe (use `Collections.synchronizedList()` or `CopyOnWriteArrayList` in multithreaded code). Internally, `add()` reads the current `size`, writes to `elementData[size]`, then increments `size` — none of these steps are atomic. Two threads calling `add()` simultaneously can both read the same `size`, write to the same index (one element silently lost), or trigger concurrent array resizing that throws `ArrayIndexOutOfBoundsException`
