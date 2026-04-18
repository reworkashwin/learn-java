# Parallelization — Example #3 (Parallel File I/O)

## Introduction

In the previous parallelization example, we dealt with CPU-bound computation (summing numbers). But parallelism truly shines with **I/O-bound operations** — tasks that spend most of their time waiting for disk or network. Saving thousands of files to disk is a perfect use case, and this example demonstrates the dramatic speedup parallel streams can achieve.

---

## Concept 1: The Setup — Saving 100,000 Files

### 🧠 What are we doing?

We'll create 100,000 `Person` objects and serialize each one to a file. Then we'll compare how long it takes using a **sequential stream** vs a **parallel stream**.

### ⚙️ The Person class

```java
public class Person implements Serializable {
    private static final long serialVersionUID = 1L;
    private int personId;
    
    public Person(int personId) {
        this.personId = personId;
    }
    
    // getters and setters
}
```

The class implements `Serializable` so objects can be written to files.

---

## Concept 2: Generating People with Streams

### 🧠 What is it?

Instead of using a for-loop, we use `Stream.iterate()` to generate 100,000 `Person` objects — each with a unique ID from 0 to 99,999.

### 🧪 Example

```java
private List<Person> generatePeople(int count) {
    return Stream.iterate(0, n -> n + 1)
                 .limit(count)
                 .map(Person::new)
                 .collect(Collectors.toList());
}
```

How it works:
1. `iterate(0, n -> n + 1)` — generates an infinite stream: 0, 1, 2, 3, ...
2. `.limit(count)` — takes only the first `count` values
3. `.map(Person::new)` — creates a `Person` with each integer as the ID
4. `.collect(Collectors.toList())` — collects into a `List<Person>`

---

## Concept 3: The Save Operation

### ⚙️ How it works

Each person is saved to an individual file using `FileOutputStream`:

```java
private static void save(Person person) {
    try (FileOutputStream fos = new FileOutputStream(
            new File(DIRECTORY + "/" + person.getPersonId() + ".txt"))) {
        // file is created (content would be serialized data)
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

Key details:
- Files are named by the person's ID: `0.txt`, `1.txt`, ..., `99999.txt`
- The `try-with-resources` ensures the stream is automatically closed
- All files are saved to a `test/` directory

---

## Concept 4: Sequential vs Parallel — The Comparison

### 🧪 Sequential approach

```java
long start = System.currentTimeMillis();

people.stream()
      .forEach(ParallelSaveOperation::save);

System.out.println("Sequential: " + (System.currentTimeMillis() - start) + "ms");
```

### 🧪 Parallel approach

```java
start = System.currentTimeMillis();

people.parallelStream()
      .forEach(ParallelSaveOperation::save);

System.out.println("Parallel: " + (System.currentTimeMillis() - start) + "ms");
```

The only difference: `.stream()` vs `.parallelStream()`.

### 📊 Results

| Approach | Time (100,000 files) |
|----------|---------------------|
| Sequential | ~7,000ms (7 seconds) |
| Parallel | ~680ms (0.7 seconds) |

The parallel approach is approximately **10× faster**.

### 💡 Why is the speedup even greater for I/O?

With CPU-bound work, you're limited by the number of CPU cores (typically 4-8×). But with **I/O-bound work**, threads spend most of their time **waiting** for disk operations. While one thread waits for a file write to complete, other threads can start their own writes. The disk controller can often handle multiple concurrent operations, and the operating system buffers help too. This is why I/O parallelism can achieve **10× or greater** speedups.

---

## Concept 5: stream() vs parallelStream()

### 🧠 Two ways to create parallel streams

There are two equivalent ways:

```java
// Method 1: Create a stream, then make it parallel
people.stream().parallel().forEach(...);

// Method 2: Create a parallel stream directly
people.parallelStream().forEach(...);
```

Both produce the same result. `.parallelStream()` is just a convenience method on collections.

---

## Key Takeaways

✅ I/O-bound operations (file saving, network calls) benefit **enormously** from parallel streams — often 10× or more speedup

✅ `.parallelStream()` is a shorthand for `.stream().parallel()`

✅ `Stream.iterate()` with `.limit()` is an elegant way to generate numbered sequences

✅ Use `try-with-resources` with `FileOutputStream` to ensure proper resource cleanup

⚠️ Parallel file operations may struggle if the disk becomes a bottleneck — SSDs handle concurrent I/O much better than HDDs

💡 The general rule: **CPU-bound** tasks see ~4-8× speedup (limited by cores), **I/O-bound** tasks can see 10×+ speedup (limited by I/O throughput, not CPU)
