# Upper Bounded Wildcards in Practice — Concrete Examples

## Introduction

In the previous lecture, we established the theory behind upper bounded wildcards: `? extends T` accepts any subtype of `T`, allows reading, but forbids writing. Now let's actually write the code — seeing it in action makes the rules concrete and intuitive.

We'll walk through creating upper bounded wildcard lists, understanding what can and cannot be assigned to them, reading items with generic methods, and building a practical `sumAll` method.

---

## Concept 1: Creating Upper Bounded Wildcard Lists

### 🧠 What can we assign to `List<? extends Number>`?

When we declare a variable with an upper bounded wildcard:

```java
List<? extends Number> list1 = new ArrayList<>();
```

This compiles without issues. But the real power shows when we assign **specific subtypes** to it:

```java
List<? extends Number> list1 = new ArrayList<Integer>();  // ✅ Integer extends Number
List<? extends Number> list2 = new ArrayList<Double>();   // ✅ Double extends Number
List<? extends Number> list3 = new ArrayList<Float>();    // ✅ Float extends Number
```

All three work because `Integer`, `Double`, and `Float` are all subtypes of `Number`. The upper bound (`Number`) acts as a ceiling — any type at or below that ceiling is accepted.

### ❓ What about types that don't extend `Number`?

```java
List<? extends Number> list4 = new ArrayList<String>();  // ❌ Compile error!
```

`String` is **not** a subtype of `Number`, so the compiler rejects it. The upper bound enforces that only number types are allowed.

### 💡 Insight

The `extends` keyword in the wildcard creates a contract: *"Whatever type is in this list, I guarantee it's a `Number` or something more specific."* This is what makes reading safe — you always know you're getting at least a `Number`.

---

## Concept 2: The Write Restriction — Confirmed in Code

### 🧠 What happens when we try to add?

Let's confirm what we learned in theory:

```java
List<? extends Number> list1 = new ArrayList<Integer>();
list1.add(23);    // ❌ Compile error!
list1.add(3.14);  // ❌ Compile error!
```

Even though `list1` was assigned an `ArrayList<Integer>`, and `23` is an `Integer`, the compiler still refuses. Why? Because the **declared type** is `List<? extends Number>` — and the compiler works with declared types, not runtime types.

From the compiler's perspective, `list1` could be pointing to:
- An `ArrayList<Integer>` — adding a `Double` would corrupt it
- An `ArrayList<Double>` — adding an `Integer` would corrupt it
- An `ArrayList<Float>` — adding either would corrupt it

Since the compiler can't guarantee safety, it blocks **all** additions.

### 💡 Insight

This is a key principle: with upper bounded wildcards, it doesn't matter what you assigned to the variable. The compiler sees `? extends Number` and says: *"I don't know the actual type, so I won't let you add anything."* This restriction applies to **every** specific type — integers, doubles, floats — none of them can be added.

---

## Concept 3: Reading Items — The `showAll` Method

### 🧠 What is it?

The primary use case for upper bounded wildcards is **reading** from a collection. Let's write a method that prints all items from any list of number subtypes:

```java
public static void showAll(List<? extends Number> list) {
    for (Number n : list) {
        System.out.println(n);
    }
}
```

### ⚙️ How does it work?

The parameter `List<? extends Number>` tells Java: *"Give me a list of anything that extends Number."* Inside the method, we can safely treat each element as a `Number` — because that's the guaranteed upper bound.

### 🧪 Calling it with different types

```java
// With integers
List<Integer> integers = Arrays.asList(1, 2, 3);
showAll(integers);  // ✅ Works — Integer extends Number

// With doubles
List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);
showAll(doubles);   // ✅ Works — Double extends Number

// With floats
List<Float> floats = Arrays.asList(1.0f, 2.0f, 3.0f);
showAll(floats);    // ✅ Works — Float extends Number
```

Output:
```
1
2
3
1.1
2.2
3.3
1.0
2.0
3.0
```

All three calls work perfectly. A `List<Integer>` is compatible with `List<? extends Number>` because `Integer` is a subtype of `Number`. The same logic applies to `Double` and `Float`.

### 💡 Insight

Notice how we wrote **one** method that handles lists of integers, doubles, and floats. Without the upper bounded wildcard, we'd need separate methods for each type — or fall back to `List<?>` and lose the ability to call `Number`-specific methods like `doubleValue()` or `intValue()`.

---

## Concept 4: A Practical Example — Summing Numbers

### 🧠 The problem

Let's build something more useful: a method that sums up all the values in a list, regardless of whether they're integers, doubles, or floats.

### ⚙️ The implementation

```java
public static double sumAll(List<? extends Number> list) {
    double sum = 0;
    for (Number n : list) {
        sum += n.doubleValue();
    }
    return sum;
}
```

Step by step:
1. We declare the return type as `double` — since we're summing potentially mixed number types, `double` gives us the precision we need
2. We iterate through the list — each element is treated as a `Number` (the upper bound)
3. We call `doubleValue()` on each element — this is a method defined in `Number`, so it's available for all subtypes
4. We accumulate and return the sum

### 🧪 Testing it

```java
// Summing integers
System.out.println("Sum: " + sumAll(Arrays.asList(1, 2, 3)));
// Output: Sum: 6.0

// Summing doubles
System.out.println("Sum: " + sumAll(Arrays.asList(1.5, 2.4, 3.0)));
// Output: Sum: 6.9
```

Both calls work with the exact same method. Whether the list contains integers or doubles, the upper bounded wildcard accepts it, and `doubleValue()` converts each element to a `double` for summation.

### 💡 Insight

This is a textbook use case for upper bounded wildcards — you need to **read** values from a collection and **process** them using methods from the upper bound type (`Number` in this case). You're not adding anything to the list, just consuming its contents. This is precisely where `? extends T` shines.

---

## Concept 5: The Pattern — When to Use Upper Bounded Wildcards

### 🧠 What's the rule of thumb?

After these examples, a clear pattern emerges:

| What you want to do | Use this | Why |
|---------------------|----------|-----|
| **Read** items from a collection of subtypes | `List<? extends T>` | Safe — every element is at least `T` |
| **Write** items to a collection | ❌ Not with upper bounded wildcards | Unsafe — actual subtype is unknown |
| **Iterate and print** | `List<? extends T>` | Just reading, no writing needed |
| **Compute a result** (sum, max, min) | `List<? extends T>` | Consuming values without modifying the list |

The methods we built — `showAll` and `sumAll` — both follow the same pattern: they **consume** data from the collection without trying to **produce** data into it.

### ❓ What if we need to add items?

That's exactly what **lower bounded wildcards** (`? super T`) are for. They flip the rule: you can write, but reading becomes restricted. We'll explore this in the next lecture.

### 💡 Insight

Think of upper bounded wildcards as **producers**: the collection *produces* data for you to consume. You read from it, process it, compute with it — but you never put anything back. This "producer" role is one half of the famous **PECS principle** (Producer Extends, Consumer Super) that we'll formalize later.

---

## ✅ Key Takeaways

1. **`List<? extends Number>` can hold `ArrayList<Integer>`, `ArrayList<Double>`, `ArrayList<Float>`** — any list whose element type is a subtype of `Number` is compatible.

2. **You cannot add to an upper bounded wildcard list** — even if you assigned it an `ArrayList<Integer>`, the compiler sees `? extends Number` and refuses all additions because the actual type is unknown.

3. **Reading is safe and practical** — inside a method with `List<? extends Number>`, every element is guaranteed to be a `Number`, so you can call any `Number` method like `doubleValue()`, `intValue()`, etc.

4. **One method handles all subtypes** — `showAll` and `sumAll` each work with lists of integers, doubles, and floats without duplication. This is the power of upper bounded wildcards.

5. **Upper bounded wildcards are for reading, not writing** — if you need to insert items into a collection, you need lower bounded wildcards (`? super T`), which is the topic of the next lecture.
