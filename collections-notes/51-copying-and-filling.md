# 📘 Copying and Filling in Collections

## 📌 Introduction

When working with lists, two operations come up surprisingly often:
1. **Copying** — creating a duplicate of a list without touching the original
2. **Filling** — replacing every element in a list with the same value

You could do both manually with loops and `set()` calls, but Java's `Collections` class provides dedicated methods — `copy()` and `fill()` — that do this cleanly in a single line. Let's explore how they work and, more importantly, the gotchas you need to watch out for.

---

## 🧩 Concept 1: Copying Collections with `Collections.copy()`

### 🧠 What is it?

`Collections.copy()` copies all elements from a **source list** into a **destination list**. After the operation, the destination list contains the same elements at the same indices as the source.

Think of it as creating a **backup** — you get an exact replica to work with while the original stays untouched.

### ❓ Why do we need it?

Imagine you have a list of data that you need to process, but you also want to keep the original intact. Instead of risking accidental modifications, you copy the data into a separate list and work on the copy.

### ⚙️ How it works

```java
Collections.copy(destination, source);
```

Two parameters:
1. **Destination list** — where the elements will be copied **into**
2. **Source list** — where the elements come **from**

**Critical rule:** The destination list must be **at least as large** as the source list. If it's smaller, you'll get an `IndexOutOfBoundsException`.

### 🧪 Example

```java
List<String> sourceList = Arrays.asList("Java", "Python", "C++");

// Destination must have enough capacity — fill with empty placeholders
List<String> destList = new ArrayList<>(Arrays.asList("", "", ""));

Collections.copy(destList, sourceList);

System.out.println("Copied list: " + destList); // [Java, Python, C++]
```

### ⚠️ The Size Trap

This is the most common mistake with `Collections.copy()`. You might think you can just create an empty list:

```java
List<String> destList = new ArrayList<>();  // Size is 0!
Collections.copy(destList, sourceList);     // 💥 IndexOutOfBoundsException!
```

**This throws an exception.** The destination list's **size** (not capacity) must be >= the source list's size. An empty `ArrayList` has size 0, even if you set an initial capacity.

### 🧪 What happens when destination is larger?

```java
List<String> sourceList = Arrays.asList("Java", "Python", "C++");
List<String> destList = new ArrayList<>(Arrays.asList("", "", "", "Extra1", "Extra2"));

Collections.copy(destList, sourceList);

System.out.println(destList); // [Java, Python, C++, Extra1, Extra2]
```

The first three elements get overwritten, but the extra elements remain. The copy works, but the lists aren't identical clones anymore.

### 💡 Insight

For a **true clone**, the destination size should exactly match the source size. That's when you can say the destination is a proper clone — same elements, same size, same order.

```java
// This is the correct pattern for a true clone
List<String> destList = new ArrayList<>(Arrays.asList("", "", ""));
Collections.copy(destList, sourceList);
// destList is now a proper clone of sourceList
```

Alternatively, if you just want a copy without the hassle:

```java
List<String> copy = new ArrayList<>(sourceList);  // Much simpler!
```

The `Collections.copy()` method is more useful when you already have a pre-existing destination list that you want to overwrite.

---

## 🧩 Concept 2: Filling Collections with `Collections.fill()`

### 🧠 What is it?

`Collections.fill()` replaces **every element** in a list with a specified value. Every. Single. Element. Gets the same value.

### ❓ Why do we need it?

- **Initializing** a list with default values
- **Resetting** a list to a baseline state
- **Preparing placeholders** before populating with real data

### ⚙️ How it works

```java
Collections.fill(list, value);
```

Two parameters:
1. The **list** to fill
2. The **value** to fill every position with

### 🧪 Example — Filling with a Value

```java
List<String> myList = new ArrayList<>(Arrays.asList("Python", "C++", "Rust"));

Collections.fill(myList, "Java");

System.out.println(myList); // [Java, Java, Java]
```

Every element — regardless of what it was before — is now `"Java"`.

### 🧪 Equivalent Manual Approach

Without `fill()`, you'd need to do this:

```java
myList.set(0, "Java");
myList.set(1, "Java");
myList.set(2, "Java");
```

Or with a loop:

```java
for (int i = 0; i < myList.size(); i++) {
    myList.set(i, "Java");
}
```

`Collections.fill()` does all of this in one clean line.

### 💡 Insight

`fill()` is particularly useful when combined with creating a list of a specific size:

```java
List<Integer> scores = new ArrayList<>(Collections.nCopies(10, 0));
// Creates [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

Though for this specific case, `Collections.nCopies()` is actually a better fit. Use `fill()` when you want to **reset** an existing list.

---

## 🧩 Concept 3: When to Use Copy vs Fill

### 🧠 Practical Use Cases

| Method | Use Case |
|--------|----------|
| `Collections.copy()` | Backing up data before processing |
| `Collections.copy()` | Working on a different version of a list |
| `Collections.copy()` | Overwriting a pre-allocated destination list |
| `Collections.fill()` | Initializing a list with default/placeholder values |
| `Collections.fill()` | Resetting a list to a baseline state |
| `Collections.fill()` | Prepping a list before populating with real data |

---

## ✅ Key Takeaways

- `Collections.copy(dest, src)` copies all elements from source to destination
- The destination list's **size** must be >= source list's size (not just capacity!)
- `Collections.fill(list, value)` replaces every element with the given value
- Both methods modify the list **in-place** — they don't return new lists
- For simple list cloning, `new ArrayList<>(sourceList)` is often easier than `Collections.copy()`

## ⚠️ Common Mistakes

- Creating an empty destination list for `Collections.copy()` — this throws `IndexOutOfBoundsException`
- Confusing `ArrayList` **capacity** with **size** — `new ArrayList<>(10)` has capacity 10 but size 0
- Assuming `Collections.copy()` creates a deep copy — it's a **shallow copy** (object references are copied, not the objects themselves)
- Expecting `fill()` to increase the list size — it only replaces existing elements, it doesn't add new ones

## 💡 Pro Tips

- For a quick clone, prefer `new ArrayList<>(originalList)` over `Collections.copy()`
- Use `Collections.copy()` when you need to overwrite a pre-existing list with specific size constraints
- `Collections.fill()` paired with `Collections.nCopies()` is a powerful combo for creating initialized lists
- Remember: both methods work on `List` only, not on `Set` or other collection types
