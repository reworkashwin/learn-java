# HashMap Example

## Introduction

Now that we understand how hash tables work, let's put it into practice with Java's `HashMap`. It's the most used `Map` implementation — fast, flexible, and incredibly useful for key-value lookups. Let's explore every essential operation with clear examples.

---

## Concept 1: Creating and Populating a HashMap

### ⚙️ How it works

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> ages = new HashMap<>();

// Put key-value pairs
ages.put("Alice", 30);
ages.put("Bob", 25);
ages.put("Charlie", 35);

System.out.println(ages); // {Alice=30, Bob=25, Charlie=35}
```

### 💡 Key behaviors

- Keys are **unique** — putting a duplicate key **overwrites** the old value:

```java
ages.put("Alice", 31); // updates Alice's age from 30 to 31
```

- `put()` returns the **previous value** (or `null` if the key was new):

```java
Integer old = ages.put("Alice", 32); // returns 31
Integer first = ages.put("Diana", 28); // returns null (new key)
```

---

## Concept 2: Accessing Values

### ⚙️ How it works

```java
// Get value by key — O(1)
int aliceAge = ages.get("Alice"); // 32

// Get with default value (if key doesn't exist)
int unknownAge = ages.getOrDefault("Eve", -1); // -1

// Check if key exists
boolean hasAlice = ages.containsKey("Alice"); // true

// Check if value exists
boolean has25 = ages.containsValue(25); // true

// Size
int size = ages.size(); // 4

// Check if empty
boolean empty = ages.isEmpty(); // false
```

### ⚠️ Watch out for null

```java
Integer age = ages.get("NonExistent"); // returns null
int value = ages.get("NonExistent");   // NullPointerException! (auto-unboxing null)
```

Always use `getOrDefault()` or check with `containsKey()` before unboxing.

---

## Concept 3: Removing and Updating

### ⚙️ How it works

```java
// Remove by key
ages.remove("Bob"); // removes Bob, returns 25

// Remove only if key maps to specific value
ages.remove("Alice", 99); // does nothing — Alice's age isn't 99

// Replace value
ages.replace("Charlie", 36); // updates Charlie to 36

// Replace only if current value matches
ages.replace("Charlie", 36, 37); // updates only if current value is 36

// Compute if absent — useful for default values
ages.computeIfAbsent("Eve", key -> 20); // adds Eve=20 only if Eve doesn't exist

// Merge — combine old and new values
ages.merge("Charlie", 1, Integer::sum); // adds 1 to Charlie's current value
```

---

## Concept 4: Iterating Over a HashMap

### ⚙️ Multiple approaches

```java
Map<String, Integer> ages = new HashMap<>();
ages.put("Alice", 30);
ages.put("Bob", 25);
ages.put("Charlie", 35);

// 1. Iterate over entries (most common and efficient)
for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + " is " + entry.getValue());
}

// 2. Iterate over keys only
for (String name : ages.keySet()) {
    System.out.println(name);
}

// 3. Iterate over values only
for (int age : ages.values()) {
    System.out.println(age);
}

// 4. forEach with lambda
ages.forEach((name, age) -> System.out.println(name + " → " + age));
```

### 💡 Insight

Always prefer `entrySet()` over iterating `keySet()` and calling `get()` for each key. The entry set gives you both key and value without an extra lookup.

---

## Concept 5: Practical Example — Word Frequency Counter

### 🧪 Example

One of the most classic `HashMap` use cases:

```java
public static Map<String, Integer> countWords(String text) {
    Map<String, Integer> frequency = new HashMap<>();

    for (String word : text.toLowerCase().split("\\s+")) {
        frequency.merge(word, 1, Integer::sum);
    }

    return frequency;
}
```

```java
String text = "the cat sat on the mat the cat";
Map<String, Integer> freq = countWords(text);

freq.forEach((word, count) -> System.out.println(word + ": " + count));
// the: 3
// cat: 2
// sat: 1
// on: 1
// mat: 1
```

### 💡 Insight

The `merge()` method is perfect for counters. It says: "If the key exists, apply this function to combine old and new values. If not, just insert the new value."

---

## Concept 6: Using Custom Objects as Keys

### ⚠️ Critical rule

If you use custom objects as keys, you **must** override both `hashCode()` and `equals()`:

```java
public class Employee {
    private int id;
    private String name;

    // constructor, getters...

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Employee)) return false;
        Employee e = (Employee) o;
        return id == e.id && Objects.equals(name, e.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}
```

Without these overrides, two "equal" objects would hash to different buckets, and `get()` would fail to find entries.

---

## ✅ Key Takeaways

- `HashMap` provides O(1) average time for `put`, `get`, `remove`, and `containsKey`
- Keys must be unique; putting a duplicate key overwrites the value
- Use `getOrDefault()` to avoid `NullPointerException` on missing keys
- Use `entrySet()` for efficient iteration over both keys and values
- Always override `hashCode()` and `equals()` for custom key classes

## ⚠️ Common Mistakes

- Auto-unboxing `null` from `get()` when the key doesn't exist
- Not overriding `hashCode()` and `equals()` for custom key objects
- Modifying a key object after inserting it into the map
- Relying on iteration order — `HashMap` has no guaranteed order (use `LinkedHashMap`)
