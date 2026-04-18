# Upper Bounded Wildcards — Reading from Generic Collections

## Introduction

Unbounded wildcards (`?`) accept any type but treat everything as `Object`. That's too loose for many use cases. What if you want to accept any `Number` subtype — `Integer`, `Double`, `Float` — but still work with them as numbers? That's exactly what **upper bounded wildcards** (`? extends T`) are for.

---

## Concept 1: Declaring Upper Bounded Wildcards

### 🧠 What is it?

An upper bounded wildcard restricts the unknown type to a specific type **or any of its subtypes**:

```java
List<? extends Number> list;
```

This list can hold:
- `List<Integer>` ✅ (Integer extends Number)
- `List<Double>` ✅ (Double extends Number)
- `List<Float>` ✅ (Float extends Number)
- `List<String>` ❌ (String does NOT extend Number)

### 🧪 Example — Valid instantiations

```java
List<? extends Number> list1 = new ArrayList<Integer>();   // ✅
List<? extends Number> list2 = new ArrayList<Double>();    // ✅
List<? extends Number> list3 = new ArrayList<Float>();     // ✅
List<? extends Number> list4 = new ArrayList<String>();    // ❌ Compile error
```

---

## Concept 2: The Golden Rule — You Can Read, But Cannot Write

### ❓ Why can't you add items?

```java
List<? extends Number> list = new ArrayList<Integer>();
list.add(23);    // ❌ Compile error!
list.add(2.5);   // ❌ Compile error!
```

This seems counterintuitive, but think about it:

- `list` could point to a `List<Integer>`, `List<Double>`, or `List<Float>`
- If it's actually a `List<Double>`, adding an `Integer` would corrupt it
- Java can't guarantee safety, so it **forbids all additions**

### 💡 Analogy

Imagine a box labeled "contains some kind of number." You can **look inside** and see what's there (read). But you can't **put something in** because you don't know if your item matches what's already inside.

### ✅ But reading works perfectly

```java
List<? extends Number> list = Arrays.asList(1, 2, 3);
for (Number n : list) {
    System.out.println(n);  // ✅ Every element IS-A Number
}
```

---

## Concept 3: Practical Example — `showAll()`

### ⚙️ How it works

```java
public static void showAll(List<? extends Number> list) {
    for (Number n : list) {
        System.out.println(n);
    }
}
```

This method reads and prints any list of numbers:

```java
showAll(Arrays.asList(1, 2, 3));           // Integer list ✅
showAll(Arrays.asList(1.1, 2.2, 3.3));     // Double list  ✅
showAll(Arrays.asList(1.0f, 2.0f, 3.0f));  // Float list   ✅
```

All three calls work because `Integer`, `Double`, and `Float` all extend `Number`.

---

## Concept 4: Practical Example — `sumAll()`

### ⚙️ How it works

```java
public static double sumAll(List<? extends Number> list) {
    double sum = 0;
    for (Number n : list) {
        sum += n.doubleValue();
    }
    return sum;
}
```

### 🧪 Example

```java
System.out.println(sumAll(Arrays.asList(1, 2, 3)));         // 6.0
System.out.println(sumAll(Arrays.asList(1.5, 2.4, 3.0)));   // 6.9
```

We can call `doubleValue()` because every element is guaranteed to be a `Number`. The method works with integers, doubles, floats — anything extending `Number`.

---

## Concept 5: Why Adding to Upper Bounded Lists Fails (Deeper Look)

### 🧪 Example

```java
public static void showAll(List<? extends Number> list) {
    list.add(2.4);  // ❌ Compile error
}
```

Even though `2.4` is a `Number`, you can't add it because:

| If the list is actually... | Then adding `2.4` (Double) would... |
|---|---|
| `List<Integer>` | Corrupt the list ❌ |
| `List<Float>` | Corrupt the list ❌ |
| `List<Double>` | Be fine ✅ |

Since Java can't guarantee it's safe in all cases, it blocks the operation entirely.

---

## ✅ Key Takeaways

- `? extends T` means "any subtype of T" — it's an **upper bound**
- You can **read** from upper bounded wildcard lists (elements are at least type `T`)
- You **cannot write** to them (Java can't guarantee type safety)
- Use upper bounded wildcards when your method only needs to **consume/read** data

## ⚠️ Common Mistakes

- Trying to add items to a `List<? extends T>` — this will always fail
- Forgetting to use `doubleValue()`, `intValue()`, etc. when working with `Number`
- Confusing `extends` in wildcards (upper bound) with `extends` in class inheritance

## 💡 Pro Tip

**Remember this rule:** `extends` = **read-only**. If you see `? extends`, think "I can look but I can't touch." Need to add items? That's what **lower bounded wildcards** (`? super T`) are for — coming up next.
