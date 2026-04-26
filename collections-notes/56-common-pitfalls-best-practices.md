# 📘 Common Pitfalls and Best Practices in Java Collections

## 📌 Introduction

You've learned the theory, built practical applications, and explored all the major collection types. But knowing *how* to use collections isn't enough — you also need to know **what can go wrong** and how to avoid it.

This section covers three critical areas that trip up even experienced developers:
1. **ConcurrentModificationException** — the most common collections exception
2. **Properly implementing `hashCode()` and `equals()`** — crucial for hash-based collections
3. **Handling null values** — a subtle source of bugs

Master these, and you'll avoid hours of debugging.

---

## 🧩 Concept 1: Avoiding ConcurrentModificationException

### 🧠 What is it?

`ConcurrentModificationException` is thrown when you **modify a collection while iterating over it** using a standard loop. This is one of the most frequently encountered exceptions when working with collections.

### ❓ Why does it happen?

Java's iterators are **fail-fast** — they detect when the underlying collection has been structurally modified (elements added or removed) since the iterator was created, and immediately throw an exception rather than risking unpredictable behavior.

```java
// ❌ This will throw ConcurrentModificationException
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
for (String item : list) {
    if (item.equals("B")) {
        list.remove(item); // Modifying the list during iteration!
    }
}
```

The enhanced for-loop (`for-each`) uses an iterator internally. When `list.remove()` is called, the list's internal modification count changes, but the iterator doesn't know about it — so it throws the exception.

### ⚙️ The Fix: Use `Iterator.remove()`

The safe way to remove elements during iteration is through the **iterator's own `remove()` method**:

```java
// ✅ Safe removal using Iterator
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String item = it.next();
    if (item.equals("B")) {
        it.remove(); // Safe — the iterator knows about this removal
    }
}
System.out.println(list); // [A, C]
```

### 💡 Insight

Why does `it.remove()` work but `list.remove()` doesn't? Because `it.remove()` updates the iterator's internal state **in sync** with the collection's state. The iterator knows the modification happened and adjusts accordingly.

### Other Alternatives

| Approach | Use case |
|----------|----------|
| `Iterator.remove()` | Single-threaded, remove during iteration |
| `CopyOnWriteArrayList` | Multi-threaded reads with rare writes |
| `ConcurrentHashMap` | Multi-threaded map operations |
| `removeIf(predicate)` | Java 8+ — clean one-liner for conditional removal |

The Java 8 approach is the cleanest:

```java
list.removeIf(item -> item.equals("B"));
```

---

## 🧩 Concept 2: Properly Implementing `hashCode()` and `equals()`

### 🧠 What is it?

When you use custom objects as keys in a `HashMap` or elements in a `HashSet`, these collections rely on two methods to determine **equality and placement**:

- **`equals()`** — Determines if two objects are logically equal
- **`hashCode()`** — Returns an integer used to place the object in the correct **bucket** in the hash table

### ❓ Why do we need both?

Hash-based collections use a two-step process:
1. **`hashCode()`** → finds which bucket the object belongs in (fast, O(1))
2. **`equals()`** → checks if the object matches an existing entry in that bucket

If you override one but not the other, things break:

| Scenario | Problem |
|----------|---------|
| Override `equals()` only | Two "equal" objects may land in different buckets → `HashSet` stores duplicates |
| Override `hashCode()` only | Two objects in the same bucket aren't recognized as equal → `contains()` returns `false` |
| Override both correctly | Everything works as expected ✅ |

### ⚙️ How to implement them

```java
class Employee {
    private String name;
    private int id;

    public Employee(String name, int id) {
        this.name = name;
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                          // Same reference
        if (o == null || getClass() != o.getClass()) return false; // Null or different class
        Employee employee = (Employee) o;
        return id == employee.id && Objects.equals(name, employee.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, id);
    }

    @Override
    public String toString() {
        return "Employee{name='" + name + "', id=" + id + "}";
    }
}
```

### 🧪 Example — Proving It Works

```java
Employee emp1 = new Employee("John Doe", 123);
Employee emp2 = new Employee("John Doe", 123);

// Different objects, but logically equal
System.out.println(emp1.equals(emp2));       // true
System.out.println(emp1.hashCode());          // 562773047
System.out.println(emp2.hashCode());          // 562773047 (same!)

Set<Employee> employees = new HashSet<>();
employees.add(emp1);
System.out.println(employees.contains(emp2)); // true — recognized as the same employee
```

Without overriding `equals()` and `hashCode()`, `emp1` and `emp2` would be treated as **different objects** (since they're different references), and `contains(emp2)` would return `false`.

### 💡 Insight — The Contract

The golden rule: **if two objects are equal according to `equals()`, they MUST have the same `hashCode()`**. The reverse isn't required — two unequal objects can share a hash code (that's a hash collision, and it's handled gracefully).

`Objects.hash(name, id)` is the easiest way to generate a proper hash code from multiple fields. It handles nulls and combines the hash values correctly.

---

## 🧩 Concept 3: Dealing with Null Values in Collections

### 🧠 What is it?

Many Java collections — `HashMap`, `ArrayList`, `HashSet` — **allow null values**. This can lead to subtle bugs if you're not careful.

### ⚙️ Null Keys and Values in HashMap

```java
Map<String, String> map = new HashMap<>();

// Null as a key — allowed, but only ONE null key
map.put(null, "value1");
map.put(null, "value2"); // Overwrites! Only one null key allowed.
System.out.println(map); // {null=value2}

// Null as a value — allowed, MULTIPLE null values are fine
map.put("key1", null);
map.put("key2", null);
System.out.println(map); // {null=value2, key1=null, key2=null}
```

### Rules at a glance:

| Collection | Null keys | Null values |
|-----------|-----------|-------------|
| `HashMap` | 1 allowed | Multiple allowed |
| `TreeMap` | ❌ Not allowed (throws `NullPointerException`) | Allowed |
| `Hashtable` | ❌ Not allowed | ❌ Not allowed |
| `HashSet` | 1 null element | N/A |
| `ArrayList` | N/A | Multiple allowed |

### Checking for Nulls

```java
// Check if map contains a null key
if (map.containsKey(null)) {
    System.out.println("Map contains a null key");
}

// Check if map contains a null value
if (map.containsValue(null)) {
    System.out.println("Map contains a null value");
}
```

### ⚙️ Using Optional to Handle Nulls Safely

Instead of letting null values sneak into your code and cause `NullPointerException` down the line, use `Optional` to handle them explicitly:

```java
import java.util.Optional;

String value = map.get("key1"); // Could be null!

Optional<String> optionalValue = Optional.ofNullable(value);

optionalValue.ifPresentOrElse(
    v -> System.out.println("Value for key1: " + v),
    () -> System.out.println("No value found for key1")
);
```

- If `value` is non-null → prints the value
- If `value` is null → executes the fallback action

This is far safer than:
```java
// ❌ Risky — NPE if value is null and you call methods on it
System.out.println(value.toUpperCase());
```

### 💡 Insight

`Optional.ofNullable()` wraps a potentially null value. It doesn't magically remove nulls — it forces you to **explicitly handle both cases** (present and absent). This makes your code's intention clear and prevents accidental `NullPointerException`.

---

## ✅ Key Takeaways

- **Never modify a collection while iterating with a for-each loop** — use `Iterator.remove()` or `removeIf()` instead
- **Always override both `hashCode()` and `equals()`** when using custom objects in hash-based collections — overriding just one breaks the contract
- **Use `Objects.hash()` and `Objects.equals()`** for clean, null-safe implementations
- **Be mindful of null values** — `HashMap` allows one null key and multiple null values; `TreeMap` and `Hashtable` do not
- **Use `Optional`** to safely handle potentially null values from collections

## ⚠️ Common Mistakes

- Calling `list.remove()` inside a for-each loop → `ConcurrentModificationException`
- Overriding `equals()` without `hashCode()` → `HashSet` and `HashMap` behave unpredictably
- Assuming all collections handle nulls the same way → `TreeMap.put(null, value)` throws `NullPointerException`
- Ignoring the return value of `map.get()` → could be null even if the key exists (if the value is null)

## 💡 Pro Tips

- Use `removeIf(predicate)` (Java 8+) as a cleaner alternative to manual iterator removal
- Use your IDE's "Generate `hashCode()` and `equals()`" feature — it produces correct implementations automatically
- In Java 16+, consider using `record` types — they auto-generate `equals()`, `hashCode()`, and `toString()`
- When in doubt about nulls, prefer `Map.getOrDefault(key, defaultValue)` over `Map.get(key)` to avoid null returns entirely
- Consider using `@NonNull` / `@Nullable` annotations to document null expectations in your API
