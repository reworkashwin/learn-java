# Short-Circuiting and Loop Fusion

## Introduction

Streams don't just process elements linearly like a for loop — they have two powerful optimizations that most developers don't know about: **short-circuiting** and **loop fusion**. These optimizations can dramatically reduce the amount of work a stream pipeline does, making them far more efficient than their imperative equivalents in many cases.

---

## Concept 1: What Is Short-Circuiting?

### 🧠 The idea

Short-circuiting means the stream pipeline **stops processing as soon as it has enough information** to produce its result. It doesn't need to process every element.

### 💡 Real-World Analogy

You're searching for a red ball in a bag of 1000 balls. You don't need to look at all 1000 — the moment you find a red one, you stop. That's short-circuiting.

### ⚙️ Short-circuiting operations

| Operation | What it does | Why it short-circuits |
|-----------|-------------|----------------------|
| `findFirst()` | Returns the first matching element | Only needs one element |
| `findAny()` | Returns any matching element | Only needs one element |
| `anyMatch()` | Returns `true` if any element matches | Stops at first match |
| `allMatch()` | Returns `true` if all elements match | Stops at first non-match |
| `noneMatch()` | Returns `true` if no elements match | Stops at first match |
| `limit(n)` | Takes the first `n` elements | Stops after `n` |

### 🧪 Example

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

Optional<Integer> first = numbers.stream()
    .filter(n -> {
        System.out.println("Filtering: " + n);
        return n > 5;
    })
    .findFirst();

System.out.println("Result: " + first.get());
```

**Output:**
```
Filtering: 1
Filtering: 2
Filtering: 3
Filtering: 4
Filtering: 5
Filtering: 6
Result: 6
```

The stream stopped at `6` — it never processed 7, 8, 9, or 10. Once `findFirst()` got its answer, the pipeline shut down.

### ⚠️ Without short-circuiting (imperative equivalent)

```java
List<Integer> filtered = new ArrayList<>();
for (int n : numbers) {
    if (n > 5) filtered.add(n);
}
// This processes ALL elements, even though we only need the first
```

---

## Concept 2: What Is Loop Fusion?

### 🧠 The idea

Loop fusion means the stream framework **combines multiple intermediate operations into a single pass** over the data, instead of doing separate passes for each operation.

### 💡 Real-World Analogy

Imagine inspecting items on a conveyor belt. Without fusion, you'd have one person checking weight, then put items back on the belt, then another person checking color, then put them back again. With fusion, **one person checks both weight AND color** in a single inspection.

### 🧪 Example — What you might expect

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "Diana");

names.stream()
    .filter(n -> {
        System.out.println("filter: " + n);
        return n.length() > 3;
    })
    .map(n -> {
        System.out.println("map: " + n);
        return n.toUpperCase();
    })
    .forEach(n -> System.out.println("forEach: " + n));
```

**Expected without fusion** (two separate passes):
```
filter: Alice, Bob, Charlie, Diana    ← first pass
map: Alice, Charlie, Diana            ← second pass
```

**Actual output with fusion** (single pass):
```
filter: Alice
map: Alice
forEach: ALICE
filter: Bob
filter: Charlie
map: Charlie
forEach: CHARLIE
filter: Diana
map: Diana
forEach: DIANA
```

Each element flows through the **entire pipeline** before the next element starts. The `filter`, `map`, and `forEach` operations are fused into one traversal.

### ❓ Why does this matter?

1. **Memory**: No intermediate collections are created between stages
2. **Cache performance**: Each element is processed while it's still in CPU cache
3. **Efficiency**: With `N` elements and `K` operations, you get `N × 1` cache loads instead of `N × K`

---

## Concept 3: Fusion + Short-Circuiting Together

### 🧠 The power combo

When loop fusion and short-circuiting work together, the stream can process **far fewer elements** than the source contains:

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "Diana", "Eve", "Frank");

names.stream()
    .filter(n -> {
        System.out.println("filter: " + n);
        return n.length() > 3;
    })
    .map(n -> {
        System.out.println("map: " + n);
        return n.toUpperCase();
    })
    .findFirst();
```

**Output:**
```
filter: Alice
map: Alice
```

Only **one element** was processed! The stream:
1. Took "Alice"
2. Filtered it (passes — length 5 > 3)
3. Mapped it to "ALICE"
4. `findFirst()` short-circuited — done

"Bob", "Charlie", "Diana", "Eve", and "Frank" were never touched.

---

## Concept 4: Operations That Break Fusion

### ⚠️ Stateful operations

Not all intermediate operations can be fused. **Stateful** operations need to see all elements before producing output:

| Operation | Stateful? | Breaks fusion? |
|-----------|-----------|---------------|
| `filter()` | No | No |
| `map()` | No | No |
| `sorted()` | **Yes** | **Yes** — must collect all elements |
| `distinct()` | **Yes** | **Yes** — must track seen elements |
| `limit()` | Partially | No — it short-circuits |

### 🧪 Example with sorted()

```java
names.stream()
    .filter(n -> n.length() > 3)
    .sorted()                        // ← must wait for ALL filtered elements
    .findFirst();
```

Even though `findFirst()` only needs one element, `sorted()` must process **every** element that passes the filter. The short-circuiting happens **after** `sorted()`, not before it.

### 💡 Pro Tip

Place `sorted()` as late as possible in the pipeline. Filtering first reduces the number of elements that need sorting:

```java
// GOOD: filter first, then sort fewer elements
stream.filter(predicate).sorted().collect(toList());

// BAD: sort everything first, then filter
stream.sorted().filter(predicate).collect(toList());
```

---

## ✅ Key Takeaways

- **Short-circuiting**: Stream stops processing once the answer is known (e.g., `findFirst`, `anyMatch`, `limit`)
- **Loop fusion**: Multiple operations are combined into a single pass — each element flows through the entire pipeline
- Together, they can process just a fraction of the source data
- **Stateful operations** (`sorted()`, `distinct()`) break fusion because they need to see all elements
- Place stateful operations as late in the pipeline as possible
- Stream optimizations are one reason functional-style code can be **faster** than naive imperative loops
