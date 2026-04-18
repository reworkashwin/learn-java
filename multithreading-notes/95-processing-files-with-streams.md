# Processing Files with Streams

## Introduction

So far we've used Java Streams on in-memory collections like `ArrayList` and `List`. But streams can do much more — they can also **read and process files** line by line. This makes file handling incredibly clean and expressive compared to traditional `BufferedReader` loops.

In this section, we'll see how to use the Stream API to read files, filter content, and collect results — all in just a few lines of code.

---

## Concept 1: Reading a File as a Stream

### 🧠 What is it?

Java provides `Files.lines(Path)` — a method that reads all lines from a file and returns them as a `Stream<String>`. Each line in the file becomes one element in the stream.

### ❓ Why do we need it?

Traditional file reading involves verbose boilerplate: opening a `BufferedReader`, looping through lines, catching exceptions, and closing resources. With `Files.lines()`, you get a **lazy, clean, one-liner** that integrates directly into the Stream API pipeline.

### ⚙️ How it works

1. Define the file path as a `String`
2. Use `Files.lines(Path.get(pathString))` to create a `Stream<String>`
3. Process the stream using any intermediate or terminal operations

### 🧪 Example

Suppose we have a file called `names` with the following content:

```
Adam
Kevin
Joe
Susan
Martha
Bill
Danielle
Michael
```

We read and print every line:

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.util.stream.Stream;

public class App {
    public static void main(String[] args) throws IOException {
        String filePath = "/path/to/names";

        Stream<String> namesStream = Files.lines(Path.of(filePath));
        namesStream.forEach(System.out::println);
    }
}
```

Each line of the file is printed — one name per line.

### 💡 Insight

`Files.lines()` returns a **lazy stream**. It doesn't load the entire file into memory at once — lines are read on demand. This makes it memory-efficient for large files.

---

## Concept 2: Collecting File Lines into a List

### 🧠 What is it?

Instead of just printing, we often want to store the file's contents in a `List<String>` for further processing. We do this with `.collect(Collectors.toList())`.

### ⚙️ How it works

```java
List<String> names = Files.lines(Path.of(filePath))
                          .collect(Collectors.toList());

names.forEach(System.out::println);
```

The `collect()` method is a **terminal operation** that performs a mutable reduction — it gathers all stream elements into a concrete data structure (here, a `List`).

### 💡 Insight

Once you have a `List<String>`, you can iterate, search, sort, or pass it to other methods. The stream is consumed after `collect()`, so you'd need to create a new stream from the list if you want to process it again.

---

## Concept 3: Filtering File Content

### 🧠 What is it?

Because file lines are just stream elements, you can apply **intermediate operations** like `filter()` before collecting.

### ⚙️ How it works

Want only names starting with "S"?

```java
List<String> names = Files.lines(Path.of(filePath))
                          .filter(name -> name.startsWith("S"))
                          .collect(Collectors.toList());

names.forEach(System.out::println);
// Output: Susan
```

Want names starting with "A"?

```java
.filter(name -> name.startsWith("A"))
// Output: Adam
```

### 💡 Insight

You can chain any number of intermediate operations — `filter()`, `map()`, `sorted()`, `distinct()` — before the terminal `collect()`. The entire pipeline reads from the file, transforms data, and produces a result in one fluid expression.

---

## Key Takeaways

✅ `Files.lines(Path)` reads a file and returns a `Stream<String>` — one element per line

✅ You can use all standard stream operations (`filter`, `map`, `collect`, etc.) on file streams

✅ `collect(Collectors.toList())` converts the stream into a `List<String>` for further use

✅ The stream is **lazy** — lines are read on demand, making it memory-efficient

⚠️ Always handle `IOException` — either with a `throws` declaration or a try-catch block

⚠️ The stream from `Files.lines()` should ideally be used inside a try-with-resources block to ensure the file handle is closed

💡 This approach replaces dozens of lines of traditional `BufferedReader` code with a single, readable pipeline
