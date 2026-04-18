# Parallelization — Example #2

## Introduction

In the previous parallelization example, we saw how parallel streams can speed up numeric computations. This example digs deeper into a more realistic scenario — processing a large collection of custom objects. We'll benchmark sequential vs parallel performance and explore the gotchas that can make parallel streams **slower** than sequential ones.

---

## Concept 1: The Setup — Processing Custom Objects

### 🧠 The scenario

Imagine we have a list of `Employee` objects and we need to compute the **total salary** of all employees whose salary exceeds a certain threshold. This is a typical data-processing pipeline that mimics real-world business logic.

### 🧪 The Employee class

```java
public class Employee {
    private String name;
    private int salary;

    public Employee(String name, int salary) {
        this.name = name;
        this.salary = salary;
    }

    public String getName() { return name; }
    public int getSalary() { return salary; }
}
```

### 🧪 Generating test data

```java
List<Employee> employees = new ArrayList<>();
Random random = new Random();

for (int i = 0; i < 10_000_000; i++) {
    employees.add(new Employee("Emp" + i, random.nextInt(100_000)));
}
```

---

## Concept 2: Sequential vs Parallel Processing

### ⚙️ Sequential approach

```java
long start = System.currentTimeMillis();

long totalSalary = employees.stream()
    .filter(e -> e.getSalary() > 50_000)
    .mapToLong(Employee::getSalary)
    .sum();

long seqTime = System.currentTimeMillis() - start;
System.out.println("Sequential: " + totalSalary + " in " + seqTime + "ms");
```

### ⚙️ Parallel approach

```java
long start = System.currentTimeMillis();

long totalSalary = employees.parallelStream()
    .filter(e -> e.getSalary() > 50_000)
    .mapToLong(Employee::getSalary)
    .sum();

long parTime = System.currentTimeMillis() - start;
System.out.println("Parallel: " + totalSalary + " in " + parTime + "ms");
```

### 📊 Typical results (8-core machine)

| Approach | 10 million employees | 100 million employees |
|----------|---------------------|----------------------|
| Sequential | ~200ms | ~2000ms |
| Parallel | ~60ms | ~500ms |
| Speedup | ~3.3× | ~4× |

---

## Concept 3: When Parallel Streams Are Slower

### ⚠️ Scenario 1: Small datasets

```java
List<Employee> small = employees.subList(0, 100);

// Sequential: ~0ms
// Parallel:   ~5ms  ← SLOWER due to thread pool overhead
```

For small datasets, the cost of splitting data, distributing to threads, and merging results **exceeds** the computation itself.

### ⚠️ Scenario 2: Non-splittable sources

```java
// LinkedList is hard to split — poor parallel performance
LinkedList<Employee> linked = new LinkedList<>(employees);

linked.parallelStream()
    .filter(e -> e.getSalary() > 50_000)
    .count();
```

`ArrayList` splits in O(1) — just divide the backing array. `LinkedList` requires O(N) traversal to find the midpoint. This makes parallel splitting expensive.

### ⚙️ Data structure splitability

| Source | Splitability | Parallel Performance |
|--------|-------------|---------------------|
| `ArrayList` | Excellent | Very good |
| `IntStream.range()` | Excellent | Very good |
| `Arrays` | Excellent | Very good |
| `HashSet` | Good | Good |
| `TreeSet` | Good | Good |
| `LinkedList` | Poor | Often slower |
| `Stream.iterate()` | Very poor | Avoid parallel |

### ⚠️ Scenario 3: Shared mutable state

```java
// WRONG — race condition!
List<Employee> result = new ArrayList<>();
employees.parallelStream()
    .filter(e -> e.getSalary() > 50_000)
    .forEach(result::add);    // ArrayList is NOT thread-safe!
```

Multiple threads adding to a non-thread-safe `ArrayList` causes data corruption. Use `collect()` instead:

```java
// CORRECT
List<Employee> result = employees.parallelStream()
    .filter(e -> e.getSalary() > 50_000)
    .collect(Collectors.toList());
```

---

## Concept 4: Reduce Operations and Associativity

### 🧠 Why associativity matters

For parallel `reduce()` to work correctly, the combining function must be **associative**:

```
(a + b) + c == a + (b + c)    ✅ Associative — works in parallel
```

If the operation isn't associative, parallel execution produces **wrong results**:

```java
// WRONG — subtraction is NOT associative
int result = numbers.parallelStream()
    .reduce(0, (a, b) -> a - b);
// Different results depending on how chunks are split!
```

### ✅ Safe operations for parallel reduce

- Addition: `(a, b) -> a + b`
- Multiplication: `(a, b) -> a * b`
- Max: `Math::max`
- Min: `Math::min`
- String concatenation: `String::concat` (works but slow — use `Collectors.joining()`)

---

## Concept 5: Best Practices for Parallel Streams

### 💡 Guidelines

1. **Measure first**: Always benchmark sequential vs parallel. Don't assume parallel is faster.
2. **Use splittable sources**: Prefer `ArrayList`, arrays, and `IntStream.range()` over `LinkedList` and `Stream.iterate()`.
3. **Avoid shared mutable state**: Use `collect()` instead of `forEach()` with external collections.
4. **Ensure associativity**: `reduce()` and `collect()` operations must be associative and stateless.
5. **Large datasets**: Parallel streams shine with **millions of elements** and computationally expensive operations.
6. **Avoid boxing**: Use `IntStream`, `LongStream`, `DoubleStream` instead of `Stream<Integer>` to avoid autoboxing overhead.

```java
// BAD — boxing/unboxing overhead
Stream<Integer> boxed = employees.stream().map(Employee::getSalary);

// GOOD — primitive stream, no boxing
IntStream primitive = employees.stream().mapToInt(Employee::getSalary);
```

---

## ✅ Key Takeaways

- Parallel streams significantly speed up processing on **large datasets** with **splittable sources**
- For small datasets or `LinkedList`, sequential is often faster
- Never use shared mutable state with parallel streams — use `collect()` instead
- Parallel `reduce()` requires **associative** operations to produce correct results
- Always benchmark — parallelization overhead can outweigh benefits
- Prefer primitive streams (`IntStream`, `LongStream`) to avoid boxing costs
