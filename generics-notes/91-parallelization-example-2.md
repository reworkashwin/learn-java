# Parallelization — Example #2

## Introduction

In the previous section, we saw how parallel streams speed up CPU-intensive tasks like prime number checking. Now let's explore more nuanced scenarios — **reduction operations**, **order sensitivity**, and the critical concept of **splittable data sources**. Understanding these determines whether your parallel stream is a performance win or a hidden bug.

---

## Concept 1: Parallel Reduction — Sum and Collect

### 🧠 What is it?

Reduction operations (`reduce()`, `collect()`) in parallel streams must be **associative** — meaning the grouping of operations doesn't affect the result. Addition is associative: `(a+b)+c = a+(b+c)`. Subtraction is not.

### ⚙️ How it works

```java
// Safe: sum is associative
int sum = IntStream.rangeClosed(1, 1_000_000)
    .parallel()
    .sum();
System.out.println(sum);  // Always correct: 500000500000

// Safe: reduce with associative operation
int total = IntStream.rangeClosed(1, 1_000_000)
    .parallel()
    .reduce(0, Integer::sum);
```

### ⚠️ Common Mistake — Non-Associative Reduction

```java
// DANGEROUS: subtraction is NOT associative
int result = IntStream.of(1, 2, 3, 4)
    .parallel()
    .reduce(0, (a, b) -> a - b);
// Sequential: ((((0-1)-2)-3)-4) = -10
// Parallel: unpredictable! depends on how chunks are split
```

### 💡 Insight

The `reduce()` identity value must also be a true identity for the operation. For addition, it's `0`. For multiplication, it's `1`. For string concatenation, it's `""`. Getting this wrong produces different results in parallel vs. sequential.

---

## Concept 2: Data Source Matters — Splittability

### 🧠 What is it?

Not all data sources split equally well. The efficiency of parallelism depends heavily on how easily the source can be divided into balanced chunks.

### ⚙️ Splittability Ranking

| Source | Splittability | Why |
|--------|--------------|-----|
| `ArrayList` | Excellent | Array-backed, split at any index |
| `int[]` / arrays | Excellent | Direct index access |
| `IntStream.range()` | Excellent | Known size, trivially splittable |
| `HashSet` | Good | Can split buckets |
| `TreeSet` | Good | Can split subtrees |
| `LinkedList` | Poor | Must traverse to find midpoint |
| `Stream.iterate()` | Poor | Each element depends on the previous |
| `Stream.generate()` | Poor | No natural split point |
| `BufferedReader.lines()` | Poor | Sequential I/O source |

### 🧪 Example: ArrayList vs LinkedList

```java
List<Integer> arrayList = new ArrayList<>(IntStream.rangeClosed(1, 10_000_000)
    .boxed().collect(Collectors.toList()));

List<Integer> linkedList = new LinkedList<>(arrayList);

// ArrayList parallel — fast, excellent splitting
long start = System.currentTimeMillis();
long sum1 = arrayList.parallelStream().mapToLong(i -> i).sum();
System.out.println("ArrayList parallel: " + (System.currentTimeMillis() - start) + "ms");

// LinkedList parallel — slower, poor splitting
start = System.currentTimeMillis();
long sum2 = linkedList.parallelStream().mapToLong(i -> i).sum();
System.out.println("LinkedList parallel: " + (System.currentTimeMillis() - start) + "ms");
```

The `LinkedList` version might be **slower than sequential** because splitting a linked list requires traversing half the list to find the midpoint — O(n/2) per split.

---

## Concept 3: Parallel collect() — The Combiner Function

### 🧠 What is it?

When collecting results in parallel, the `collect()` operation uses a **combiner** to merge partial results from different threads.

### ⚙️ How it works

```java
// The three-argument collect:
// 1. Supplier — create empty container
// 2. Accumulator — add element to container
// 3. Combiner — merge two containers (used in parallel)

StringBuilder result = IntStream.rangeClosed(1, 100)
    .parallel()
    .collect(
        StringBuilder::new,              // supplier
        (sb, i) -> sb.append(i).append(","),  // accumulator
        StringBuilder::append            // combiner — merges partial StringBuilders
    );
```

With `Collectors.toList()`, the combiner is built in — it uses `List::addAll` to merge partial lists.

### ⚠️ Common Mistake

If you use `collect()` with three arguments but the combiner is wrong or missing, parallel execution produces incorrect results. The combiner is **only used in parallel** — sequential streams skip it. This means bugs hide until you switch to parallel.

---

## Concept 4: Ordering Guarantees — forEachOrdered vs forEach

### 🧠 What is it?

Parallel streams process elements concurrently. If order matters — like writing to a file or building an ordered list — you need to be explicit about it.

### ⚙️ How it works

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// forEach — no order guarantee in parallel
System.out.println("Unordered:");
numbers.parallelStream().forEach(n -> System.out.print(n + " "));
// Might print: 6 7 8 9 10 1 2 3 4 5

// forEachOrdered — preserves encounter order but reduces parallelism
System.out.println("\nOrdered:");
numbers.parallelStream().forEachOrdered(n -> System.out.print(n + " "));
// Always prints: 1 2 3 4 5 6 7 8 9 10
```

### 💡 Insight

Operations like `collect(Collectors.toList())` and `toArray()` **preserve order** even in parallel — the framework handles the merging. It's mainly `forEach` that shows unordered behavior.

```java
// This is safe and ordered even in parallel
List<Integer> sorted = numbers.parallelStream()
    .sorted()
    .collect(Collectors.toList());
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] — guaranteed
```

---

## Concept 5: A Complete Benchmark Example

### 🧠 What is it?

Let's compare sequential vs. parallel with a realistic workload — computing expensive transformations on a large dataset.

### ⚙️ How it works

```java
public static double expensiveComputation(int n) {
    // Simulate CPU-intensive work
    double result = 0;
    for (int i = 0; i < 1000; i++) {
        result += Math.sin(n * i) * Math.cos(n * i);
    }
    return result;
}

public static void main(String[] args) {
    List<Integer> data = IntStream.rangeClosed(1, 100_000)
        .boxed()
        .collect(Collectors.toList());

    // Sequential
    long start = System.nanoTime();
    double seqSum = data.stream()
        .mapToDouble(Main::expensiveComputation)
        .sum();
    long seqTime = (System.nanoTime() - start) / 1_000_000;

    // Parallel
    start = System.nanoTime();
    double parSum = data.parallelStream()
        .mapToDouble(Main::expensiveComputation)
        .sum();
    long parTime = (System.nanoTime() - start) / 1_000_000;

    System.out.printf("Sequential: %dms (sum=%.2f)%n", seqTime, seqSum);
    System.out.printf("Parallel:   %dms (sum=%.2f)%n", parTime, parSum);
    System.out.printf("Speedup:    %.1fx%n", (double) seqTime / parTime);
}
```

Typical output on a 4-core machine:
```
Sequential: 4200ms (sum=-1234.56)
Parallel:   1100ms (sum=-1234.56)
Speedup:    3.8x
```

The results are identical, but the parallel version uses all available cores.

---

## ✅ Key Takeaways

- Parallel reduction operations must be **associative** — `+`, `*`, `min`, `max` are safe; `-` is not
- **Data source splittability** matters: `ArrayList` and arrays parallelize well; `LinkedList` does not
- The **combiner** function in `collect()` is only used during parallel execution — test both modes
- Use `forEachOrdered()` when element order matters — `forEach()` gives no order guarantee
- `collect(Collectors.toList())` and `sorted()` preserve order even in parallel
- Always **benchmark** — don't assume parallel is faster without measuring
- Best results: large data + CPU-intensive per-element work + splittable source
