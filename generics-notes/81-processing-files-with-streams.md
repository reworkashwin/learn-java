# Processing Files with Streams

## Introduction

One of the most convenient uses of the Stream API is **file processing**. Instead of reading files line by line with `BufferedReader` and manually parsing them, you can use `Files.lines()` to get a `Stream<String>` — one element per line — and then apply all the stream operations you already know: filter, sort, map, collect. It's clean, concise, and powerful.

---

## Concept 1: Reading a File as a Stream

### 🧠 What is `Files.lines()`?

`Files.lines()` reads all lines from a file and returns them as a `Stream<String>`. Each line in the file becomes one element in the stream.

### 🧪 Example — Reading and printing a file

Suppose you have a file called `names` with this content:

```
Adam
Kevin
Joe
Susan
Martha
Bill
Daniel
Michael
```

You can read and print it like this:

```java
Stream<String> namesStream = Files.lines(Path.of("/path/to/names"));
namesStream.forEach(System.out::println);
```

**Output:**
```
Adam
Kevin
Joe
Susan
Martha
Bill
Daniel
Michael
```

### ⚙️ Required imports and exception handling

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.util.stream.Stream;

public static void main(String[] args) throws IOException {
    Stream<String> namesStream = Files.lines(Path.of("/path/to/names"));
    namesStream.forEach(System.out::println);
}
```

The `main` method must declare `throws IOException` (or use a try-catch) because file operations can fail.

---

## Concept 2: Collecting File Lines into a List

### ⚙️ From stream to list

Instead of just printing, you can collect the lines into a `List<String>` for further processing:

```java
List<String> names = Files.lines(Path.of("/path/to/names"))
    .collect(Collectors.toList());

names.forEach(System.out::println);
```

The `collect(Collectors.toList())` terminal operation performs a **mutable reduction** — it gathers all stream elements into a concrete `List`.

---

## Concept 3: Filtering File Contents

### ⚙️ Apply intermediate operations

Once you have a stream from a file, you can filter, sort, and transform just like any other stream:

```java
List<String> names = Files.lines(Path.of("/path/to/names"))
    .filter(name -> name.startsWith("S"))
    .collect(Collectors.toList());

names.forEach(System.out::println);
```

**Output:**
```
Susan
```

### 🧪 Another filter example

```java
List<String> names = Files.lines(Path.of("/path/to/names"))
    .filter(name -> name.startsWith("A"))
    .collect(Collectors.toList());
```

**Output:**
```
Adam
```

### 💡 Insight

The beauty here is that **the same operations you use on in-memory collections work on files**. `filter()`, `sorted()`, `map()`, `collect()` — everything chains together seamlessly. The file is the source, and everything else is the same pipeline you already know.

---

## Concept 4: Combining Operations on File Data

### 🧪 Filter + Sort + Collect

```java
List<String> result = Files.lines(Path.of("/path/to/names"))
    .filter(name -> name.length() > 4)
    .sorted()
    .collect(Collectors.toList());

result.forEach(System.out::println);
```

**Output:**
```
Daniel
Kevin
Martha
Michael
Susan
```

### 🧪 Map lines to uppercase

```java
Files.lines(Path.of("/path/to/names"))
    .map(String::toUpperCase)
    .forEach(System.out::println);
```

**Output:**
```
ADAM
KEVIN
JOE
...
```

---

## Concept 5: The Complete Pattern

### ⚙️ Standard file-processing pipeline

```java
// 1. Open file as stream
// 2. Apply intermediate operations (filter, sort, map, etc.)
// 3. Terminal operation (collect, forEach, count, etc.)

List<String> filteredNames = Files.lines(Path.of("/path/to/file"))
    .filter(line -> line.startsWith("A"))
    .sorted()
    .collect(Collectors.toList());
```

This pattern replaces verbose `BufferedReader` + `while` loop code with a single, readable pipeline.

---

## ✅ Key Takeaways

- `Files.lines(Path.of(...))` reads a file and returns a `Stream<String>` — one element per line
- You must handle `IOException` (either `throws` or try-catch)
- All standard stream operations work on file streams: `filter()`, `sorted()`, `map()`, `collect()`
- `collect(Collectors.toList())` converts the stream into a concrete `List<String>`
- File processing with streams is significantly cleaner than traditional `BufferedReader` approaches

## ⚠️ Common Mistakes

- Forgetting to handle `IOException` — file operations always require exception handling
- Not closing the stream — `Files.lines()` returns a stream backed by a file handle; in production, use try-with-resources
- Hardcoding file paths — use `Path.of()` and relative paths or configuration for portability

## 💡 Pro Tips

- In production code, always wrap `Files.lines()` in a try-with-resources to properly close the file:
  ```java
  try (Stream<String> lines = Files.lines(Path.of("file.txt"))) {
      lines.filter(...).forEach(...);
  }
  ```
- Use `Files.readAllLines()` if you need a `List<String>` directly (but streams are more memory-efficient for large files)
- For processing CSV or structured files, chain `map(line -> line.split(","))` to parse each line
