# 📘 Java Stream Program to Reverse Each Word of a String

---

## 📌 Introduction

### 🧠 What is this about?

Given a string like `"Java is awesome"`, we need to reverse each individual word to produce `"avaJ si emosewa"`. Using Streams, we split the string into words, reverse each word using `StringBuilder.reverse()`, and join them back with `Collectors.joining()`.

### 🌍 Real-World Problem First

Word-level transformations are common in text processing — think about encrypting messages, generating word puzzles, or building simple cipher systems. This problem teaches you the split → transform → join pattern, which is useful for any word-level string manipulation.

### ❓ Why does it matter?

- This demonstrates **converting an array to a stream** using `Arrays.stream()` (or `Stream.of()`)
- You'll learn `map()` for transforming each element
- `Collectors.joining(" ")` is the clean way to concatenate stream elements with a delimiter
- `StringBuilder.reverse()` is the standard way to reverse a string in Java

### 🗺️ What we'll learn (Learning Map)

- How to split a string and convert the resulting array to a stream
- How `map()` transforms each word using `StringBuilder.reverse()`
- How `Collectors.joining()` reassembles the words
- Complete solution with verbose and compact versions

---

## 🧩 Problem Statement

**Given:** A string, e.g., `"Java is awesome"`

**Reverse:** Each word individually (not the entire string).

**Expected Output:**
```
avaJ si emosewa
```

> Note: "Java" → "avaJ", "is" → "si", "awesome" → "emosewa". The word **order** stays the same; only individual words are reversed.

---

## 🧩 Step-by-Step Approach

```mermaid
flowchart TD
    A["\"Java is awesome\""] -->|"split(\" \")"| B["String[]: [\"Java\", \"is\", \"awesome\"]"]
    B -->|"Arrays.stream()"| C["Stream﹤String﹥: \"Java\", \"is\", \"awesome\""]
    C -->|"map(word → reverse)"| D["Stream﹤String﹥: \"avaJ\", \"si\", \"emosewa\""]
    D -->|"Collectors.joining(\" \")"| E["\"avaJ si emosewa\""]
```

| Step | Operation | What happens |
|------|-----------|-------------|
| 1 | `split(" ")` | Splits `"Java is awesome"` into `["Java", "is", "awesome"]` |
| 2 | `Arrays.stream()` | Converts the array into `Stream<String>` |
| 3 | `map()` | Reverses each word: `"Java"` → `"avaJ"`, `"is"` → `"si"`, etc. |
| 4 | `Collectors.joining(" ")` | Joins reversed words with space: `"avaJ si emosewa"` |

---

## 🧩 Complete Code Solution

### Verbose Version (Step-by-Step)

```java
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ReverseEachWord {
    public static void main(String[] args) {
        String input = "Java is awesome";

        // Step 1: Split string into words
        String[] words = input.split(" ");
        // words: ["Java", "is", "awesome"]

        // Step 2: Convert array to stream
        Stream<String> stream = Arrays.stream(words);

        // Step 3: Reverse each word using map + StringBuilder
        // Step 4: Join reversed words with space
        String result = stream
                .map(word -> new StringBuilder(word).reverse().toString())
                .collect(Collectors.joining(" "));

        System.out.println(result);
        // Output: avaJ si emosewa
    }
}
```

### Compact Version (One Pipeline)

```java
public class ReverseEachWordCompact {
    public static void main(String[] args) {
        String input = "Java is awesome";

        String result = Arrays.stream(input.split(" "))                        // Split + stream
                .map(word -> new StringBuilder(word).reverse().toString())      // Reverse each word
                .collect(Collectors.joining(" "));                              // Join with space

        System.out.println(result);
        // Output: avaJ si emosewa
    }
}
```

**Output:**
```
avaJ si emosewa
```

---

## 🧩 How the Reversal Works

`StringBuilder` has a built-in `reverse()` method:

```java
String word = "Java";
StringBuilder sb = new StringBuilder(word);  // sb: "Java"
sb.reverse();                                 // sb: "avaJ"
String reversed = sb.toString();              // "avaJ"

// Chained in one line:
new StringBuilder("Java").reverse().toString()  // "avaJ"
```

**Why `StringBuilder` and not `String`?** `String` is immutable in Java — there's no `String.reverse()` method. `StringBuilder` is mutable and provides `reverse()` for in-place character reversal.

---

## 🧩 Understanding `Collectors.joining()`

`Collectors.joining()` concatenates stream elements into a single `String`:

```java
// Without delimiter — just concatenates
Stream.of("a", "b", "c").collect(Collectors.joining());
// Output: "abc"

// With delimiter — adds separator between elements
Stream.of("a", "b", "c").collect(Collectors.joining(", "));
// Output: "a, b, c"

// With delimiter, prefix, and suffix
Stream.of("a", "b", "c").collect(Collectors.joining(", ", "[", "]"));
// Output: "[a, b, c]"
```

In our solution, `Collectors.joining(" ")` joins reversed words with a space between them.

---

## 🧩 What About Multiple Spaces?

The basic `split(" ")` won't handle multiple consecutive spaces well:

```java
String input = "Java  is   awesome";  // Multiple spaces

// ❌ split(" ") creates empty strings for extra spaces
String[] words = input.split(" ");
// words: ["Java", "", "is", "", "", "awesome"]

// ✅ Use regex "\\s+" to split on one or more whitespace characters
String[] words = input.split("\\s+");
// words: ["Java", "is", "awesome"]
```

Robust version:
```java
String result = Arrays.stream(input.split("\\s+"))
        .map(word -> new StringBuilder(word).reverse().toString())
        .collect(Collectors.joining(" "));
```

---

## ⚠️ Common Mistakes

**Mistake 1: Reversing the entire string instead of each word**

```java
// ❌ This reverses the WHOLE string — word order changes!
String wrong = new StringBuilder("Java is awesome").reverse().toString();
System.out.println(wrong);  // Output: "emosewa si avaJ" ← word order is reversed too!
```

```java
// ✅ Reverse EACH WORD individually — word order stays the same
String correct = Arrays.stream("Java is awesome".split(" "))
        .map(word -> new StringBuilder(word).reverse().toString())
        .collect(Collectors.joining(" "));
System.out.println(correct);  // Output: "avaJ si emosewa" ✅
```

**Mistake 2: Forgetting `.toString()` after `StringBuilder.reverse()`**

```java
// ❌ map returns Stream<StringBuilder>, not Stream<String>
.map(word -> new StringBuilder(word).reverse())   // Returns StringBuilder!

// ✅ Convert back to String
.map(word -> new StringBuilder(word).reverse().toString())
```

---

## 💡 Pro Tips

**Tip 1:** You can also use `Stream.of()` instead of `Arrays.stream()`
```java
String result = Stream.of(input.split(" "))
        .map(word -> new StringBuilder(word).reverse().toString())
        .collect(Collectors.joining(" "));
```

Both `Arrays.stream(array)` and `Stream.of(array)` create a stream from an array. Use whichever reads better to you.

**Tip 2:** The split → map → join pattern works for any word-level transformation
```java
// Capitalize first letter of each word
String titleCase = Arrays.stream("hello world".split(" "))
        .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1))
        .collect(Collectors.joining(" "));
// Output: "Hello World"
```

---

## ✅ Key Takeaways

→ The pattern is: `split(" ")` → `Arrays.stream()` → `map(transform)` → `Collectors.joining(" ")`

→ `new StringBuilder(word).reverse().toString()` is the standard way to reverse a string in Java

→ `Collectors.joining(" ")` reassembles stream elements into a single string with a delimiter

→ Use `split("\\s+")` instead of `split(" ")` for robustness with multiple spaces

→ This split-map-join pattern generalizes to **any** word-level transformation — not just reversing

---

## 🔗 What's Next?

Next, we'll work with sorting — specifically, how to **sort a list of strings in both ascending and descending order** using `sorted()` and `Comparator.reverseOrder()`.
