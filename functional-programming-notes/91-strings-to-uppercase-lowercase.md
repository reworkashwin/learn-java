# 📘 Java Stream Program to Convert a List of Strings to Uppercase and Lowercase

---

## 📌 Introduction

### 🧠 What is this about?

Converting strings to uppercase or lowercase is a simple yet practical `map()` operation. This note shows how `map()` with method references (`String::toUpperCase` and `String::toLowerCase`) provides the cleanest, most readable approach.

### 🌍 Real-World Problem First

You're normalizing user input — email addresses should be lowercase, country codes uppercase. Or you're preparing search indexes where all text is stored in lowercase for case-insensitive matching. The `map()` operation handles these transformations in a single pipeline.

### ❓ Why does it matter?

- This is the simplest example of using **method references** with `map()`
- Understanding when to replace a lambda with a method reference is a key Java 8 skill
- String case conversion is used everywhere — search, validation, display formatting

### 🗺️ What we'll learn (Learning Map)

- How `map()` transforms each string element
- Lambda vs method reference for the same operation
- Converting to uppercase and lowercase
- Complete solution with output

---

## 🧩 Problem Statement

**Given:** A list of strings, e.g., `["Java", "Python", "JavaScript"]`

**Convert:**
- To **uppercase**: `["JAVA", "PYTHON", "JAVASCRIPT"]`
- To **lowercase**: `["java", "python", "javascript"]`

---

## 🧩 Complete Code Solution

### Convert to Uppercase

```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class StringCaseConversion {
    public static void main(String[] args) {
        List<String> words = Arrays.asList("Java", "Python", "JavaScript");

        // Convert to uppercase using method reference
        List<String> uppercase = words.stream()
                .map(String::toUpperCase)            // "Java" → "JAVA", etc.
                .collect(Collectors.toList());

        System.out.println("Uppercase: " + uppercase);
        // Output: Uppercase: [JAVA, PYTHON, JAVASCRIPT]
    }
}
```

### Convert to Lowercase

```java
// Convert to lowercase using method reference
List<String> lowercase = words.stream()
        .map(String::toLowerCase)                    // "Java" → "java", etc.
        .collect(Collectors.toList());

System.out.println("Lowercase: " + lowercase);
// Output: Lowercase: [java, python, javascript]
```

---

## 🧩 Lambda vs Method Reference

The transcript demonstrates the evolution from lambda to method reference:

```java
// Step 1: Lambda expression
.map(str -> str.toUpperCase())

// Step 2: Method reference (cleaner, recommended)
.map(String::toUpperCase)
```

**When can you use a method reference?** When the lambda just calls a single method on its parameter:

```java
// Lambda: parameter → parameter.method()
str -> str.toUpperCase()     →  String::toUpperCase    ✅ Instance method reference

// Lambda: parameter → SomeClass.method(parameter)
c -> Character.isLetter(c)   →  Character::isLetter    ✅ Static method reference
```

```mermaid
flowchart LR
    A["Stream: \"Java\", \"Python\", \"JavaScript\""]
    A -->|"map(String::toUpperCase)"| B["Stream: \"JAVA\", \"PYTHON\", \"JAVASCRIPT\""]
    A -->|"map(String::toLowerCase)"| C["Stream: \"java\", \"python\", \"javascript\""]
```

---

## 🧩 Understanding `String::toUpperCase` as a Method Reference

`String::toUpperCase` is an **instance method reference**. Here's how Java interprets it:

```java
// This method reference:
.map(String::toUpperCase)

// Is equivalent to this lambda:
.map(str -> str.toUpperCase())

// Which is equivalent to this anonymous inner class:
.map(new Function<String, String>() {
    @Override
    public String apply(String str) {
        return str.toUpperCase();
    }
})
```

All three produce identical results. The method reference is the most concise.

---

## 🧩 Bonus: Capitalize First Letter of Each Word

```java
List<String> words = Arrays.asList("hello", "world", "java");

List<String> capitalized = words.stream()
        .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
        .collect(Collectors.toList());

System.out.println(capitalized);
// Output: [Hello, World, Java]
```

> This can't be done with a simple method reference — the transformation is more complex, so a lambda is needed.

---

## ⚠️ Common Mistakes

**Mistake 1: Expecting `map()` to modify the original list**

```java
List<String> words = new ArrayList<>(Arrays.asList("Java", "Python"));

words.stream().map(String::toUpperCase);
// ❌ Original list is NOT modified! And no terminal operation = nothing happens!

System.out.println(words);  // Output: [Java, Python] ← unchanged!
```

```java
// ✅ Collect the result into a new list
List<String> upper = words.stream()
        .map(String::toUpperCase)
        .collect(Collectors.toList());
```

**Mistake 2: Confusing `String::toUpperCase` with `String.toUpperCase()`**

```java
// ❌ This is calling the method on nothing — syntax error
.map(String.toUpperCase())

// ✅ This is a method reference — tells map which method to call on each element
.map(String::toUpperCase)
```

---

## 💡 Pro Tips

**Tip 1:** Combine case conversion with other operations for data normalization
```java
List<String> emails = Arrays.asList("Alice@Gmail.COM", "BOB@yahoo.com", "  carol@test.com  ");

List<String> normalized = emails.stream()
        .map(String::trim)             // Remove whitespace
        .map(String::toLowerCase)      // Normalize case
        .collect(Collectors.toList());

System.out.println(normalized);
// Output: [alice@gmail.com, bob@yahoo.com, carol@test.com]
```

**Tip 2:** You can chain multiple `map()` calls — each transforms the output of the previous one
```java
.map(String::trim)            // " hello " → "hello"
.map(String::toLowerCase)     // "Hello" → "hello"
.map(s -> s + "!")            // "hello" → "hello!"
```

---

## ✅ Key Takeaways

→ `map(String::toUpperCase)` converts each string to uppercase; `map(String::toLowerCase)` converts to lowercase

→ Method references (`String::toUpperCase`) are preferred over lambdas (`str -> str.toUpperCase()`) when the lambda just calls one method

→ `map()` never modifies the original list — always collect the result

→ Chain multiple `map()` calls for multi-step transformations (trim → lowercase → format)

→ Method references work for any instance method: `String::length`, `String::trim`, `String::isEmpty`, etc.

---

## 🔗 What's Next?

We've covered transforming individual elements with `map()`. Next, let's tackle a more complex grouping problem — using `Collectors.groupingBy()` to **group employees by age**, a very popular interview question.
